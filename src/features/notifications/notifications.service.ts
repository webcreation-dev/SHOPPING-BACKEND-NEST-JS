import { Injectable } from '@nestjs/common';
import * as firebase from 'firebase-admin';
import { mapLimit } from 'async';
import { BatchResponse } from 'firebase-admin/lib/messaging/messaging-api';
import { chunk } from 'lodash';
import { getMessaging } from 'firebase-admin/messaging';
import * as fs from 'fs';
import * as path from 'path';
import { NotificationsQueryDto } from './querying/notifications-query.dto';
import { User } from '../auth/users/entities/user.entity';
import { PaginationService } from '@app/common';
import { NotificationsRepository } from './notifications.repository';
import { StatusNotificationEnum } from './enums/status.notification.enum';
import { Notification } from './entities/notification.entity';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { TypeNotificationEnum } from './enums/type.notification.enum';

export interface ISendFirebaseMessages {
  token: string;
  title?: string;
  message: string;
}

export interface SendNotificationDto {
  message: string;
  title: string;
  token: string;
  user: User;
}

@Injectable()
export class NotificationsService {
  constructor(
    private readonly notificationsRepository: NotificationsRepository,
    private readonly paginationService: PaginationService,
  ) {
    const firebaseCredentialsPath = path.resolve(
      process.cwd(),
      'firebase-credentials.json',
    );

    // Vérifier si le fichier existe
    if (!fs.existsSync(firebaseCredentialsPath)) {
      throw new Error('Firebase credentials file not found');
    }

    // Lire le fichier JSON
    const firebaseCredentials = JSON.parse(
      fs.readFileSync(firebaseCredentialsPath, 'utf8'),
    );

    // Initialiser Firebase avec les credentials
    firebase.initializeApp({
      credential: firebase.credential.cert(firebaseCredentials),
    });
  }

  async findAll(notificationsQueryDto: NotificationsQueryDto, { id }: User) {
    const { status, type } = notificationsQueryDto;

    const [data] = await this.notificationsRepository.findAndCount(
      { user: { id }, status, type },
      { relations: {} },
    );
    return { data };
  }

  async create(createNotificationDto: CreateNotificationDto) {
    await this.notificationsRepository.create(
      new Notification(createNotificationDto),
    );
  }

  async findOne(id: number) {
    await this.isRead(id);
    return await this.notificationsRepository.findOne({ id });
  }

  async allRead(ids: number[]) {
    await Promise.all(
      ids.map(async (id) => {
        await this.notificationsRepository.findOneAndUpdate(
          { id },
          { status: StatusNotificationEnum.READ },
        );
      }),
    );
  }

  async isRead(id: number) {
    await this.notificationsRepository.findOneAndUpdate(
      { id },
      { status: StatusNotificationEnum.READ },
    );
  }

  public async sendAll(
    messages: firebase.messaging.TokenMessage[],
    dryRun?: boolean,
  ): Promise<BatchResponse> {
    // Nouvelle implémentation avec sendEachForMulticast
    const response = await getMessaging().sendEachForMulticast({
      tokens: messages.map((m) => m.token),
      notification: messages[0].notification, // Firebase n'accepte qu'une seule notification pour plusieurs tokens
    });

    return {
      responses: response.responses,
      successCount: response.successCount,
      failureCount: response.failureCount,
    };
  }

  public async sendFirebaseMessages(
    firebaseMessages: ISendFirebaseMessages[],
    dryRun?: boolean,
  ): Promise<BatchResponse> {
    const batchedFirebaseMessages = chunk(firebaseMessages, 500);

    const batchResponses = await mapLimit<
      ISendFirebaseMessages[],
      BatchResponse
    >(
      batchedFirebaseMessages,
      3, // 3 is a good place to start
      async (
        groupedFirebaseMessages: ISendFirebaseMessages[],
      ): Promise<BatchResponse> => {
        try {
          const tokenMessages: firebase.messaging.TokenMessage[] =
            groupedFirebaseMessages.map(({ message, title, token }) => ({
              notification: { body: message, title },
              token,
              apns: {
                payload: {
                  aps: {
                    'content-available': 1,
                  },
                },
              },
            }));

          return await this.sendAll(tokenMessages, dryRun);
        } catch (error) {
          return {
            responses: groupedFirebaseMessages.map(() => ({
              success: false,
              error,
            })),
            successCount: 0,
            failureCount: groupedFirebaseMessages.length,
          };
        }
      },
    );

    return batchResponses.reduce(
      ({ responses, successCount, failureCount }, currentResponse) => {
        return {
          responses: responses.concat(currentResponse.responses),
          successCount: successCount + currentResponse.successCount,
          failureCount: failureCount + currentResponse.failureCount,
        };
      },
      {
        responses: [],
        successCount: 0,
        failureCount: 0,
      } as unknown as BatchResponse,
    );
  }

  public async sendNotification({
    message,
    title,
    token,
    user,
  }: SendNotificationDto) {
    await this.create({
      content: message,
      title,
      user,
      type: TypeNotificationEnum.CONTRACT,
    });
    return await this.sendFirebaseMessages([{ message, title, token }]);
  }
}

import { Injectable } from '@nestjs/common';
import * as firebase from 'firebase-admin';
import { mapLimit } from 'async';
import { BatchResponse } from 'firebase-admin/lib/messaging/messaging-api';
import { chunk } from 'lodash';
import * as shell from 'shelljs';
import { getMessaging } from 'firebase-admin/messaging';
import * as fs from 'fs';
import * as path from 'path';

export interface ISendFirebaseMessages {
  token: string;
  title?: string;
  message: string;
}

@Injectable()
export class NotificationsService {
  constructor() {
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

  // public async sendAll(
  //   messages: firebase.messaging.TokenMessage[],
  //   dryRun?: boolean,
  // ): Promise<BatchResponse> {
  //   if (process.env.NODE_ENV === 'local') {
  //     for (const { notification, token } of messages) {
  //       shell.exec(
  //         `echo '{ "aps": { "alert": ${JSON.stringify(notification)}, "token": "${token}" } }' | xcrun simctl push booted com.company.appname -`,
  //       );
  //     }
  //   }
  //   return firebase.messaging().sendAll(messages, dryRun);
  // }

  public async sendAll(
    messages: firebase.messaging.TokenMessage[],
    dryRun?: boolean,
  ): Promise<BatchResponse> {
    // if (process.env.NODE_ENV === 'local') {
    //   for (const { notification, token } of messages) {
    //     shell.exec(
    //       `echo '{ "aps": { "alert": ${JSON.stringify(notification)}, "token": "${token}" } }' | xcrun simctl push booted com.company.appname -`,
    //     );
    //   }
    // }

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
}

import { Injectable, HttpException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { Buffer } from 'buffer';
import { CreateApiUserDto } from './dto/create-api-user.dto';
import { CreateApiKeyDto } from './dto/create-api-key.dto';
import { PayCallbackDto } from './dto/pay-callback.dto';
import { SendNotificationCallbackDto } from './dto/send-notification-callback.dto';
import { RequestToRefundDto } from './dto/request-to-refund.dto';
import { RefundCallbackDto } from './dto/refund-callback.dto';
import { RequestToPayDto } from './dto/request-to-pay.dto';

@Injectable()
export class MomoMtnService {
  constructor(private readonly httpService: HttpService) {}

  async createApiUser(createApiUserDto: CreateApiUserDto) {
    try {
      const response = await this.httpService
        .post(
          `${process.env.API_URL_MOMO_MTN}/v1_0/apiuser`,
          {
            providerCallbackHost: createApiUserDto.provider_callback_host,
          },
          {
            headers: {
              'X-Reference-Id': createApiUserDto.x_reference_id,
              'Ocp-Apim-Subscription-Key':
                process.env.OCP_APIM_SUBSCRIPTION_KEY_COLLECTION,
              'Content-Type': 'application/json',
              Accept: 'application/json',
            },
          },
        )
        .toPromise();

      return response;
    } catch (error) {
      throw new HttpException(error.response?.data, error.response?.status);
    }
  }

  async createApiKey(createApiKeyDto: CreateApiKeyDto) {
    try {
      const response = await this.httpService
        .post(
          `${process.env.SANDBOX_MOMO_MTN_DEVELOPER}/v1_0/apiuser/${createApiKeyDto.x_reference_id}`,
          {
            headers: {
              'Ocp-Apim-Subscription-Key':
                process.env.OCP_APIM_SUBSCRIPTION_KEY_COLLECTION,
              'Content-Type': 'application/json',
              Accept: 'application/json',
            },
          },
        )
        .toPromise();

      return response;
    } catch (error) {
      throw new HttpException(error.response?.data, error.response?.status);
    }
  }

  async createApiToken() {
    try {
      const basicAuth =
        'Basic ' +
        Buffer.from(
          `${process.env.API_USER_MOMO_MTN}:${process.env.API_KEY_MOMO_MTN}`,
        ).toString('base64');

      const response = await this.httpService
        .post(
          `${process.env.API_URL_MOMO_MTN}/collection/token/`,
          {}, // corps vide
          {
            headers: {
              Authorization: basicAuth,
              'Ocp-Apim-Subscription-Key':
                process.env.OCP_APIM_SUBSCRIPTION_KEY_COLLECTION,
              'Content-Type': 'application/json',
              Accept: 'application/json',
            },
          },
        )
        .toPromise();

      return response.data;
    } catch (error) {
      throw new HttpException(
        error.response?.data || 'Internal Server Error',
        error.response?.status || 500,
      );
    }
  }

  async requestToPay(requestToPayDto: RequestToPayDto) {
    try {
      const bearerToken = `Bearer ${requestToPayDto.api_token}`;

      const response = await this.httpService
        .post(
          `${process.env.API_URL_MOMO_MTN}/collection/v1_0/requesttopay`,
          requestToPayDto,
          {
            headers: {
              Authorization: bearerToken,
              'X-Reference-Id': requestToPayDto.x_reference_id,
              'X-Target-Environment': process.env.API_MODE_MOMO_MTN,
              'X-Callback-Url':
                'https://www.shopping-backend-nest-js-production.up.railway.app/billings/collections/callback',
              'Ocp-Apim-Subscription-Key':
                process.env.OCP_APIM_SUBSCRIPTION_KEY_COLLECTION,
              'Content-Type': 'application/json',
              Accept: 'application/json',
            },
          },
        )
        .toPromise();

      return response;
    } catch (error) {
      throw new HttpException(error.response?.data, error.response?.status);
    }
  }

  async payStatus(payCallbackDto: PayCallbackDto) {
    try {
      const bearerToken = `Bearer ${payCallbackDto.api_token}`;

      const response = await this.httpService
        .post(
          `${process.env.API_URL_MOMO_MTN}/collection/v1_0/requesttopay/${payCallbackDto.request_id_debit}`,
          {
            headers: {
              Authorization: bearerToken,
              'X-Target-Environment': process.env.API_MODE_MOMO_MTN,
              'Ocp-Apim-Subscription-Key':
                process.env.OCP_APIM_SUBSCRIPTION_KEY_COLLECTION,
              'Content-Type': 'application/json',
              Accept: 'application/json',
            },
          },
        )
        .toPromise();

      return response;
    } catch (error) {
      throw new HttpException(error.response?.data, error.response?.status);
    }
  }

  async sendNotification(sendNotificationDto: SendNotificationCallbackDto) {
    try {
      const bearerToken = `Bearer ${sendNotificationDto.api_token}`;

      const response = await this.httpService
        .post(
          `${process.env.API_URL_MOMO_MTN}/collection/v1_0/requesttopay/${sendNotificationDto.request_id_debit}/deliverynotification`,
          sendNotificationDto,
          {
            headers: {
              Authorization: bearerToken,
              'X-Target-Environment': process.env.API_MODE_MOMO_MTN,
              'Ocp-Apim-Subscription-Key':
                process.env.OCP_APIM_SUBSCRIPTION_KEY_COLLECTION,
              'Content-Type': 'application/json',
              Accept: 'application/json',
            },
          },
        )
        .toPromise();

      return response;
    } catch (error) {
      throw new HttpException(error.response?.data, error.response?.status);
    }
  }

  async requestToRefund(requestToRefundDto: RequestToRefundDto) {
    try {
      const bearerToken = `Bearer ${requestToRefundDto.api_token}`;

      const response = await this.httpService
        .post(
          `${process.env.API_URL_MOMO_MTN}/disbursement/v1_0/refund`,
          requestToRefundDto,
          {
            headers: {
              Authorization: bearerToken,
              'X-Reference-Id': requestToRefundDto.x_reference_id,
              'X-Target-Environment': process.env.API_MODE_MOMO_MTN,
              'Ocp-Apim-Subscription-Key':
                process.env.OCP_APIM_SUBSCRIPTION_KEY_DISBURSEMENTS,
              'Content-Type': 'application/json',
              Accept: 'application/json',
            },
          },
        )
        .toPromise();

      return response;
    } catch (error) {
      throw new HttpException(error.response?.data, error.response?.status);
    }
  }

  async refundStatus(refundCallbackDto: RefundCallbackDto) {
    try {
      const bearerToken = `Bearer ${refundCallbackDto.api_token}`;

      const response = await this.httpService
        .post(
          `${process.env.API_URL_MOMO_MTN}/disbursement/v1_0/refund/${refundCallbackDto.request_id_refund}`,
          {
            headers: {
              Authorization: bearerToken,
              'X-Target-Environment': process.env.API_MODE_MOMO_MTN,
              'Ocp-Apim-Subscription-Key':
                process.env.OCP_APIM_SUBSCRIPTION_KEY_DISBURSEMENTS,
              'Content-Type': 'application/json',
              Accept: 'application/json',
            },
          },
        )
        .toPromise();

      return response;
    } catch (error) {
      throw new HttpException(error.response?.data, error.response?.status);
    }
  }
}

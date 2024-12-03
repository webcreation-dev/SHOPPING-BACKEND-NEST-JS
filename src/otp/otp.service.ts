import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class OtpService {
  private readonly apiUrl: string;
  private readonly apiId: string;
  private readonly authHeader: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.apiUrl = this.configService.get<string>('OTP_API_URL');
    this.apiId = this.configService.get<string>('OTP_APP_ID');
    this.authHeader = `Bearer ${this.configService.get<string>('OTP_AUTH_KEY')}`;
  }

  async sendOtp(sendTo: string): Promise<any> {
    const response = await this.httpService
      .post(
        `${this.apiUrl}/send`,
        { send_to: sendTo, app_id: this.apiId },
        {
          headers: {
            Authorization: this.authHeader,
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
        },
      )
      .toPromise();
    return response.data;
  }

  async verifyOtp(code: string, sendTo: string): Promise<any> {
    const response = await this.httpService
      .post(
        `${this.apiUrl}/verify`,
        { code, send_to: sendTo, app_id: this.apiId },
        {
          headers: {
            Authorization: this.authHeader,
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
        },
      )
      .toPromise();
    return response.data;
  }
}

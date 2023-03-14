import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';
import { AxiosResponse } from 'axios';

@Injectable()
export class TelegramService {
  constructor(private readonly httpService: HttpService) {}

  notify(chatId: number, msg: string): Observable<AxiosResponse<any, any>> {
    return this.httpService.get(
      `https://api.telegram.org/bot${process.env.TOKEN}/sendMessage`,
      {
        params: {
          chat_id: chatId,
          text: msg,
          parse_mode: 'HTML',
        },
      },
    );
  }

  updateAdminStatus(
    messageId: number,
    status: string,
  ): Observable<AxiosResponse<any, any>> {
    return this.httpService.get(
      `https://api.telegram.org/bot${process.env.TOKEN}/editMessageReplyMarkup`,
      {
        params: {
          chat_id: process.env.MANAGER_GROUP,
          message_id: messageId,
          reply_markup: JSON.stringify({
            inline_keyboard: [[{ text: status, callback_data: 'ignore' }]],
          }),
        },
      },
    );
  }
}

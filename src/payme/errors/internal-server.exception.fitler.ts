import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { PaymeError } from './payme.error';

@Catch()
export default class InternalServerErrorExceptionFilter
  implements ExceptionFilter
{
  catch(exception: Error, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();
    const requestId = request.body?.id ?? null;

    console.error(exception.message);

    response.status(HttpStatus.OK).json({
      id: requestId,
      error: PaymeError.SYSTEM_ERROR,
    });
  }
}

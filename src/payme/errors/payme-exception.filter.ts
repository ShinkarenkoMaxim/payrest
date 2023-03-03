import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import { Request, Response } from 'express';
import { PaymeException } from './payme.exception';

@Catch(PaymeException)
export class PaymeExceptionFilter implements ExceptionFilter {
  catch(exception: PaymeException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();
    const requestId = request.body.id;

    response.status(status).json({
      id: requestId,
      error: exception.error,
    });
  }
}

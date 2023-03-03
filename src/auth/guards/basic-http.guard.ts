import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { PaymeError } from 'src/payme/errors/payme.error';
import { PaymeException } from 'src/payme/errors/payme.exception';

@Injectable()
export class BasicHttpAuthGuard extends AuthGuard('basic') {
  constructor() {
    super();
  }

  handleRequest(err: any, user: any) {
    if (err || !user) {
      throw new PaymeException(PaymeError.INVALID_ACCESS_DATA);
    }

    return user;
  }
}

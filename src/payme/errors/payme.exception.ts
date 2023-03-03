import { HttpException, HttpStatus } from '@nestjs/common';
import { PaymeError } from './payme.error';

export class PaymeException extends HttpException {
  private _error: PaymeError;

  constructor(error: PaymeError) {
    super(error.name, HttpStatus.OK);

    this._error = error;
  }

  get error() {
    return this._error;
  }
}

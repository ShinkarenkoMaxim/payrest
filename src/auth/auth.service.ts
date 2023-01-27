import { Injectable } from '@nestjs/common';

@Injectable()
export class AuthService {
  validatePaymeUser(login: string, password: string) {
    return (
      login === process.env.PAYME_LOGIN &&
      password === process.env.PAYME_PASSWORD
    );
  }
}

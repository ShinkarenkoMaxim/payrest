import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { BasicStrategy as Strategy } from 'passport-http';
import { AuthService } from '../auth.service';

@Injectable()
export class BasicHttpStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly authService: AuthService) {
    super();
  }

  async validate(login: string, password: string): Promise<any> {
    return this.authService.validatePaymeUser(login, password);
  }
}

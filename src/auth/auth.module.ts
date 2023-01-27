import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { BasicHttpStrategy } from './strategies/basic-http.strategy';

@Module({
  imports: [PassportModule],
  controllers: [],
  providers: [AuthService, BasicHttpStrategy],
})
export class AuthModule {}

import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { TelegramService } from './telegram.service';

@Module({
  providers: [TelegramService],
  imports: [HttpModule],
  exports: [HttpModule],
})
export class TelegramModule {}

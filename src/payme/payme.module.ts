import { Module } from '@nestjs/common';
import { PaymeController } from './payme.controller';

@Module({
  controllers: [PaymeController]
})
export class PaymeModule {}

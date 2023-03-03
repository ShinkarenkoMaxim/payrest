import { Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { PrismaService } from 'src/prisma.service';
import { PaymeService } from './payme.service';
import { PaymeController } from './payme.controller';
import InternalServerErrorExceptionFilter from './errors/internal-server.exception.fitler';

@Module({
  controllers: [PaymeController],
  providers: [
    PaymeService,
    PrismaService,
    {
      provide: APP_FILTER,
      useClass: InternalServerErrorExceptionFilter,
    },
  ],
})
export class PaymeModule {}

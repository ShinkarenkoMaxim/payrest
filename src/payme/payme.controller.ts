import {
  Controller,
  Post,
  RawBodyRequest,
  Req,
  UseGuards,
} from '@nestjs/common';
import { BasicHttpAuthGuard } from 'src/auth/guards/basic-http.guard';

@Controller('payme')
export class PaymeController {
  @Post('/')
  @UseGuards(BasicHttpAuthGuard)
  handleRequest(@Req() req: any) {
    return { ok: true };
  }
}

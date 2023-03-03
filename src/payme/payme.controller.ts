import {
  Body,
  Controller,
  HttpCode,
  Post,
  UseFilters,
  UseGuards,
} from '@nestjs/common';
import { BasicHttpAuthGuard } from 'src/auth/guards/basic-http.guard';
import { PostDto } from './dto/post-dto';
import { PaymeExceptionFilter } from './errors/payme-exception.filter';
import { PaymeService } from './payme.service';
import { MerchantResponse, MerchantResult, PaymeMethods } from './types/common';

@Controller('payme')
export class PaymeController {
  constructor(private readonly paymeService: PaymeService) {}

  @Post('/')
  @UseFilters(new PaymeExceptionFilter())
  @UseGuards(BasicHttpAuthGuard)
  @HttpCode(200)
  async handleRequest(@Body() body: PostDto): Promise<MerchantResponse> {
    let result: MerchantResult | any;

    const { params, method } = body;

    switch (method) {
      case PaymeMethods.checkPerformTransaction:
        result = await this.paymeService.checkPerformTransaction(params);

        break;
      case PaymeMethods.createTransaction:
        result = await this.paymeService.createTransaction(params);

        break;
      case PaymeMethods.performTransaction:
        result = await this.paymeService.performTransaction(params);

        break;
      case PaymeMethods.cancelTransaction:
        result = await this.paymeService.cancelTransaction(params);

        break;
      case PaymeMethods.checkTransaction:
        result = await this.paymeService.checkTransaction(params);

        break;
      case PaymeMethods.getStatement:
        result = await this.paymeService.getStatement(params);

        break;
    }

    return { id: body.id, result };
  }
}

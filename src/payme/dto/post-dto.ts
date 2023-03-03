import { CreateTransactionParams } from '../types/params';

export class PostDto {
  id: number;
  method: string;
  params: CreateTransactionParams.Request | any;
}

import {
  CheckPerformTransactionParams,
  CreateTransactionParams,
  PerformTransactionParams,
} from './params';

export type Transaction = {
  id: string;
  time: number;
  amount: number;
  account: Account;
  create_time: number;
  perform_time: number;
  cancel_time: number;
  transaction: string;
  state: number;
  reason: number | null;
  receivers?: Receiver[];
};

export type Account = {
  order_id?: number;
  phone?: string;
};

export type Receiver = {
  id: string;
  amount: number;
};

export type MerchantResponse = {
  id: number;
  result: MerchantResult;
};

export type MerchantResult =
  | CheckPerformTransactionParams.Response
  | CreateTransactionParams.Response
  | PerformTransactionParams.Response;

export const PaymeMethods = {
  checkPerformTransaction: 'CheckPerformTransaction',
  createTransaction: 'CreateTransaction',
  performTransaction: 'PerformTransaction',
  cancelTransaction: 'CancelTransaction',
  checkTransaction: 'CheckTransaction',
  getStatement: 'GetStatement',
} as const;

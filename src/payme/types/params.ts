import { Account, Transaction } from './common';

export namespace CheckPerformTransactionParams {
  export type Request = {
    amount: number;
    account: Account;
  };

  export type Response = {
    allow: boolean;
  };
}

export namespace CreateTransactionParams {
  export type Request = {
    id: string;
    time: number;
    amount: number;
    account: Account;
  };

  export type Response = Pick<
    Transaction,
    'transaction' | 'create_time' | 'state' | 'receivers'
  >;
}

export namespace PerformTransactionParams {
  export type Request = {
    id: string;
  };

  export type Response = Pick<
    Transaction,
    'transaction' | 'perform_time' | 'state'
  >;
}

export namespace CancelTransactionParams {
  export type Request = {
    id: string;
    reason: string;
  };

  export type Response = Pick<
    Transaction,
    'transaction' | 'cancel_time' | 'state'
  >;
}

export namespace CheckTransactionParams {
  export type Request = {
    id: string;
  };

  export type Response = Pick<
    Transaction,
    | 'transaction'
    | 'create_time'
    | 'perform_time'
    | 'cancel_time'
    | 'state'
    | 'reason'
  >;
}

export namespace GetStatementParams {
  export type Request = {
    from: number;
    to: number;
  };

  export type Response = {
    transactions: Transaction[];
  };
}

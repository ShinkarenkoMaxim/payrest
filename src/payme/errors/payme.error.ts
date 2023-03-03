import { PaymeStatus } from '../types/enums';

export type PaymeError = {
  name: string;
  code: number;
  message: {
    ru: string;
    uz: string;
    en: string;
  };
  data?: any;
};

type PaymeErrorsList = { [errorName: string]: PaymeError };

export const PaymeError: PaymeErrorsList = {
  ORDER_NOT_FOUND: {
    name: 'Order not Found',
    code: PaymeStatus.ORDER_NOT_FOUND,
    message: {
      ru: 'Заказ не найден',
      en: 'Order not found',
      uz: 'Buyurtma topilmadi',
    },
  },
  ORDER_IN_PROGRESS: {
    name: 'Order is already being processed',
    code: PaymeStatus.ORDER_IN_PROGRESS,
    message: {
      ru: 'Заказ уже обрабатывается',
      en: 'The order is already being processed',
      uz: "Buyurtma allaqachon ko'rib chiqilmoqda",
    },
  },
  ORDER_ACCEPTED: {
    name: 'Order is already being processed (accepted)',
    code: PaymeStatus.ORDER_ACCEPTED,
    message: {
      ru: 'Заказ уже оплачен',
      en: 'The order has already been paid',
      uz: "Buyurtma allaqachon to'langan",
    },
  },
  ORDER_CANCELLED: {
    name: 'Order is already being processed (cancelled)',
    code: PaymeStatus.ORDER_ACCEPTED,
    message: {
      ru: 'Заказ уже отменён',
      en: 'The order has already been canceled ',
      uz: 'Buyurtma allaqachon bekor qilingan',
    },
  },
  INVALID_AMOUNT: {
    name: 'The transaction amount does not match the order amount',
    code: PaymeStatus.INVALID_AMOUNT,
    message: {
      ru: 'Сумма транзакции не совпадает с суммой заказа',
      en: 'The transaction amount does not match the order amount',
      uz: "Bitim summasi buyurtma summasiga to'g'ri kelmaydi",
    },
  },
  INACTIVE_TRANSCACTION: {
    name: 'Transaction is not active',
    code: PaymeStatus.COULD_NOT_PERFORM_TRANSACTION,
    message: {
      ru: 'Транзакция не активна или уже была обработана',
      en: 'Transaction is not active',
      uz: 'Bitim faol emas yoki allaqachon qayta ishlangan',
    },
  },
  COULD_NOT_PERFORM_TRANSACTION: {
    name: 'Could not to perform transaction',
    code: PaymeStatus.COULD_NOT_PERFORM_TRANSACTION,
    message: {
      ru: 'Транзакцию не возможно выполнить',
      en: 'Could not to perform transaction',
      uz: 'Tranzaktsiyani amalga oshirish mumkin emas',
    },
  },
  TRANSACTION_NOT_FOUND: {
    name: 'Transaction not found',
    code: PaymeStatus.TRANSACTION_NOT_FOUND,
    message: {
      ru: 'Транзакция не найдена',
      en: 'Transaction not found',
      uz: 'Bitim topilmadi',
    },
  },
  NO_REFUND: {
    name: 'No refund after complete',
    code: PaymeStatus.NO_REFUND,
    message: {
      ru: 'Заказ выполнен. Невозможно отменить транзакцию. Товар или услуга предоставлена покупателю в полном объеме.',
      en: 'The order is completed. It is not possible to cancel the transaction. The product or service is provided to the buyer in full.',
      uz: "Buyurtma bajarildi. Tranzaktsiyani bekor qilish mumkin emas. Tovar yoki xizmat xaridorga to'liq hajmda taqdim etiladi.",
    },
  },
  INVALID_ACCESS_DATA: {
    name: 'Failure access',
    code: PaymeStatus.INVALID_ACCESS_DATA,
    message: {
      ru: 'Failure access',
      en: 'Failure access',
      uz: 'Failure access',
    },
  },
  SYSTEM_ERROR: {
    name: 'A system error has occurred.',
    code: PaymeStatus.SYSTEM_ERROR,
    message: {
      ru: 'Произошла системная ошибка. Пожалуйста обратитесь к поставщику услуг.',
      en: 'A system error has occurred. Please contact your service provider.',
      uz: "Tizim xatosi yuz berdi. Iltimos, xizmat ko'rsatuvchi provayder bilan bog'laning.",
    },
  },
};

export interface PaymentResult {
  success: boolean;
  transactionId?: string;
  paymentUrl?: string;
  error?: string;
}

export interface IPaymentStrategy {
  processPayment(amount: number, currency: string): Promise<PaymentResult>;
}

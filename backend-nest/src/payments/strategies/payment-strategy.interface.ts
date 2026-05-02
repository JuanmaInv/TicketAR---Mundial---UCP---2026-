export interface PaymentResult {
  success: boolean;
  transactionId?: string;
  error?: string;
}

export interface IPaymentStrategy {
  processPayment(amount: number, currency: string): Promise<PaymentResult>;
}

export interface PaymentResult {
  success: boolean;
  transactionId?: string;
  paymentUrl?: string;
  error?: string;
}

export interface IPaymentStrategy {
  processPayment(
    unitPrice: number,
    cantidad: number,
    currency: string,
    metadata?: { ticketId: string },
  ): Promise<PaymentResult>;

  verifyPayment(transactionId: string): Promise<PaymentResult>;
}

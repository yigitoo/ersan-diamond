export type PaymentMethod = "CASH" | "TRANSFER" | "CARD" | "CRYPTO" | "OTHER";

export interface ISale {
  _id: string;
  productId: string;
  buyerName: string;
  buyerPhone: string;
  buyerEmail: string;
  buyerCity?: string;
  buyerCountry?: string;
  salePrice: number;
  currency: string;
  paymentMethod: PaymentMethod;
  soldAt: Date;
  salesRepId: string;
  notes: string;
  attachments: string[];
  createdAt: Date;
}

import { z } from "zod";

export const createSaleSchema = z.object({
  productId: z.string().min(1, "Ürün seçimi zorunlu"),
  buyerName: z.string().min(2, "Alıcı adı zorunlu"),
  buyerPhone: z.string().optional().default(""),
  buyerEmail: z.string().email().optional().default(""),
  buyerCity: z.string().optional(),
  buyerCountry: z.string().optional(),
  salePrice: z.number().positive("Satış fiyatı pozitif olmalı"),
  currency: z.string().default("EUR"),
  paymentMethod: z.enum(["CASH", "TRANSFER", "CARD", "CRYPTO", "OTHER"]).default("CASH"),
  soldAt: z.string().datetime(),
  salesRepId: z.string().min(1, "Satış temsilcisi zorunlu"),
  notes: z.string().max(2000).optional().default(""),
  attachments: z.array(z.string().url()).optional().default([]),
});

export type CreateSaleInput = z.infer<typeof createSaleSchema>;

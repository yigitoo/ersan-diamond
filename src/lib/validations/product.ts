import { z } from "zod";

const imageSchema = z.object({
  url: z.string().url(),
  alt: z.string().default(""),
  order: z.number().int().min(0).default(0),
});

export const createProductSchema = z.object({
  category: z.enum(["WATCH", "HERMES"]),
  brand: z.string().min(1, "Marka zorunlu"),
  model: z.string().min(1, "Model zorunlu"),
  reference: z.string().optional().default(""),
  year: z.number().int().min(1900).max(2030).optional(),
  condition: z.enum(["UNWORN", "EXCELLENT", "VERY_GOOD", "GOOD", "FAIR"]).default("EXCELLENT"),
  price: z.number().positive().optional(),
  currency: z.string().default("EUR"),
  priceOnRequest: z.boolean().default(false),
  title: z.string().min(1, "Başlık zorunlu"),
  description: z.string().optional().default(""),
  specs: z.record(z.string(), z.unknown()).optional().default({}),
  images: z.array(imageSchema).optional().default([]),
  featured: z.boolean().default(false),
  published: z.boolean().default(false),
});

export const updateProductSchema = createProductSchema.partial().extend({
  availability: z.enum(["AVAILABLE", "RESERVED", "SOLD"]).optional(),
});

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;

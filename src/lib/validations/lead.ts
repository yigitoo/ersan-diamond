import { z } from "zod";

export const createLeadSchema = z.object({
  type: z.enum(["INQUIRY", "SELL_TO_US", "CHAT"]),
  name: z.string().min(2, "İsim en az 2 karakter olmalı"),
  phone: z.string().optional().default(""),
  email: z.string().email("Geçerli bir email adresi girin").optional().default(""),
  source: z.enum(["WEBSITE", "WHATSAPP", "CHATBOT", "REFERRAL", "WALK_IN", "OTHER"]).optional().default("WEBSITE"),
  notes: z.string().max(2000).optional().default(""),
  relatedProductId: z.string().optional(),
  // Sell-to-us specific
  images: z.array(z.string().url()).max(5).optional(),
  desiredPrice: z.number().positive().optional(),
  currency: z.string().optional(),
  productBrand: z.string().optional(),
  productModel: z.string().optional(),
  productReference: z.string().optional(),
  productYear: z.number().int().min(1900).max(2030).optional(),
  productCondition: z.string().optional(),
});

export const updateLeadSchema = z.object({
  status: z.enum(["NEW", "CONTACTED", "QUALIFIED", "PROPOSAL", "WON", "LOST"]).optional(),
  assignedUserId: z.string().optional(),
  notes: z.string().max(2000).optional(),
  tags: z.array(z.string()).optional(),
});

export type CreateLeadInput = z.infer<typeof createLeadSchema>;
export type UpdateLeadInput = z.infer<typeof updateLeadSchema>;

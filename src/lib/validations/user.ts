import { z } from "zod";

export const createUserSchema = z.object({
  name: z.string().min(2, "İsim en az 2 karakter olmalı"),
  email: z.string().email("Geçerli bir email adresi girin"),
  password: z.string().min(8, "Şifre en az 8 karakter olmalı"),
  role: z.enum(["OWNER", "ADMIN", "SALES", "VIEWER"]).default("SALES"),
  signatureName: z.string().optional().default(""),
  signatureTitle: z.string().optional().default(""),
  phoneInternal: z.string().optional().default(""),
});

export const updateUserSchema = z.object({
  name: z.string().min(2).optional(),
  role: z.enum(["OWNER", "ADMIN", "SALES", "VIEWER"]).optional(),
  active: z.boolean().optional(),
  signatureName: z.string().optional(),
  signatureTitle: z.string().optional(),
  phoneInternal: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().email("Geçerli bir email adresi girin"),
  password: z.string().min(1, "Şifre zorunlu"),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type LoginInput = z.infer<typeof loginSchema>;

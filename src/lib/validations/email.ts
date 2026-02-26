import { z } from "zod";

export const sendEmailSchema = z.object({
  to: z.string().email("Geçerli bir email adresi girin"),
  subject: z.string().min(1, "Konu zorunlu"),
  html: z.string().optional().default(""),
  text: z.string().optional().default(""),
  templateId: z.string().optional(),
  templateData: z.record(z.string(), z.unknown()).optional(),
  threadId: z.string().optional(),
  relatedLeadId: z.string().optional(),
  relatedAppointmentId: z.string().optional(),
});

export const contactFormSchema = z.object({
  name: z.string().min(2, "İsim en az 2 karakter olmalı"),
  email: z.string().email("Geçerli bir email adresi girin"),
  phone: z.string().optional(),
  message: z.string().min(10, "Mesaj en az 10 karakter olmalı").max(2000),
});

export type SendEmailInput = z.infer<typeof sendEmailSchema>;
export type ContactFormInput = z.infer<typeof contactFormSchema>;

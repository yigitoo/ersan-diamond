import { z } from "zod";

export const createAppointmentSchema = z.object({
  customerName: z.string().min(2, "İsim en az 2 karakter olmalı"),
  customerPhone: z.string().min(10, "Geçerli bir telefon numarası girin"),
  customerEmail: z.string().email("Geçerli bir email adresi girin"),
  serviceType: z.enum(["IN_STORE", "VIDEO_CALL", "SOURCING"]),
  datetimeStart: z.string().datetime(),
  notes: z.string().max(1000).optional().default(""),
  relatedProductId: z.string().optional(),
});

export const updateAppointmentSchema = z.object({
  status: z.enum(["PENDING", "CONFIRMED", "RESCHEDULED", "CANCELLED", "COMPLETED", "NO_SHOW"]).optional(),
  assignedUserId: z.string().optional(),
  notes: z.string().max(1000).optional(),
  datetimeStart: z.string().datetime().optional(),
});

export type CreateAppointmentInput = z.infer<typeof createAppointmentSchema>;
export type UpdateAppointmentInput = z.infer<typeof updateAppointmentSchema>;

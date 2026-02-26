import { z } from "zod";

export const createCalendarEventSchema = z.object({
  ownerUserId: z.string().min(1),
  title: z.string().min(1, "Başlık zorunlu"),
  start: z.string().or(z.date()),
  end: z.string().or(z.date()),
  type: z.enum(["APPOINTMENT", "BLOCKED", "PERSONAL"]).default("APPOINTMENT"),
  location: z.string().optional(),
  notes: z.string().optional(),
  appointmentId: z.string().optional(),
});

export const updateCalendarEventSchema = createCalendarEventSchema.partial();

export type CreateCalendarEventInput = z.infer<typeof createCalendarEventSchema>;
export type UpdateCalendarEventInput = z.infer<typeof updateCalendarEventSchema>;

import { z } from 'zod';

export const serviceSchema = z.object({
  clientId: z.string().uuid('Cliente invalido'),
  category: z.string().optional(),
  freq: z.string().optional(),
  weekday: z.string().optional(),
  time: z.string().optional(),
  notes: z.string().optional(),
  // Campos de poubelles (compatibilidade v3.6/v3.7)
  binsEnabled: z.boolean().optional().default(false),
  binsDays: z.number().min(0).max(7).optional().default(0),
  binsWeekdays: z.array(z.number().min(0).max(6)).optional().default([]),
  binsTypes: z.array(z.string()).optional().default([]),
  binsTypesMap: z.record(z.string(), z.array(z.string())).optional().default({}),
  binsSchedule: z.string().optional().default(''),
  binsTimeOut: z.string().optional().default('20:00'),
  binsTimeIn: z.string().optional().default('06:00'),
});

export type ServiceInput = z.infer<typeof serviceSchema>;

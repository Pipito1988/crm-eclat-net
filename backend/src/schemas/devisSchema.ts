import { z } from 'zod';

export const devisSchema = z.object({
  clientId: z.string().uuid('Cliente invalido'),
  title: z.string().min(1, 'Titulo e obrigatorio'),
  amount: z.coerce.number().min(0, 'Valor deve ser positivo'),
  date: z.string().datetime().optional(),
  valid: z.string().datetime().optional(),
  status: z.enum(['ENVIADO', 'ACEITE', 'RECUSADO', 'RASCUNHO']).default('ENVIADO'),
  active: z.boolean().default(true),
  notes: z.string().optional(),
});

export type DevisCreateInput = z.infer<typeof devisSchema>;

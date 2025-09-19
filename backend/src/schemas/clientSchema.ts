import { z } from 'zod';

const employeeSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1, 'Nome do empregado e obrigatorio'),
  salary: z.coerce.number().min(0, 'Salario deve ser positivo'),
});

const devisSchema = z.object({
  id: z.string().uuid().optional(),
  title: z.string().min(1, 'Titulo e obrigatorio'),
  amount: z.coerce.number().min(0, 'Valor deve ser positivo'),
  date: z.string().datetime().optional(),
  valid: z.string().datetime().optional(),
  status: z.enum(['ENVIADO', 'ACEITE', 'RECUSADO', 'RASCUNHO']).default('ENVIADO'),
  active: z.boolean().default(true),
  notes: z.string().optional(),
});

export const clientSchema = z.object({
  name: z.string().min(1, 'Nome e obrigatorio'),
  clientStatus: z.enum(['ATIVO', 'ESPECULATIVO', 'INATIVO']).default('ATIVO'),
  clientType: z.string().default('Imovel'),
  startDate: z.string().datetime().optional(),
  serviceAddress: z.string().optional(),
  billingAddress: z.string().optional(),
  value: z.coerce.number().min(0, 'Valor deve ser positivo'),
  frequency: z.enum(['MENSAL', 'SEMANAL', 'PAGAMENTO_UNICO', 'OUTRO']).default('MENSAL'),
  method: z.enum(['TRANSFERENCIA', 'CHEQUE', 'DINHEIRO', 'OUTRO']).default('TRANSFERENCIA'),
  service: z.string().optional(),
  contract: z.enum(['COM_CONTRATO', 'SEM_CONTRATO', 'A_NEGOCIAR']).default('SEM_CONTRATO'),
  employees: z.array(employeeSchema).optional(),
  devis: z.array(devisSchema).optional(),
});

export type ClientInput = z.infer<typeof clientSchema>;
export type EmployeeInput = z.infer<typeof employeeSchema>;
export type DevisInput = z.infer<typeof devisSchema>;

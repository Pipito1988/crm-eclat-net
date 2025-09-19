import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().min(1, 'Nome e obrigatorio'),
  email: z.string().email('Email invalido'),
  password: z.string().min(8, 'Palavra-passe deve ter pelo menos 8 caracteres'),
});

export const loginSchema = z.object({
  email: z.string().email('Email invalido'),
  password: z.string().min(1, 'Palavra-passe e obrigatoria'),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;

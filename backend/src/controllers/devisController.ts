import type { Request, Response } from 'express';
import { prisma } from '../config/prisma';
import { devisSchema } from '../schemas/devisSchema';

function toDate(value?: string) {
  if (!value) return undefined;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

export async function listDevis(req: Request, res: Response) {
  const { clientId } = req.query;
  const where = clientId ? { clientId: String(clientId) } : undefined;

  const devis = await prisma.devis.findMany({
    where,
    include: { client: true },
    orderBy: { createdAt: 'desc' },
  });

  res.json(devis);
}

export async function getDevis(req: Request, res: Response) {
  const { id } = req.params;
  const devis = await prisma.devis.findUnique({
    where: { id },
    include: { client: true },
  });

  if (!devis) {
    return res.status(404).json({ message: 'Devis nao encontrado' });
  }

  res.json(devis);
}

export async function createDevis(req: Request, res: Response) {
  const parsed = devisSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: 'Dados invalidos', issues: parsed.error.flatten() });
  }

  const data = parsed.data;

  const clientExists = await prisma.client.findUnique({ where: { id: data.clientId } });
  if (!clientExists) {
    return res.status(404).json({ message: 'Cliente associado nao existe' });
  }

  const devis = await prisma.devis.create({
    data: {
      clientId: data.clientId,
      title: data.title,
      amount: data.amount,
      date: toDate(data.date),
      valid: toDate(data.valid),
      status: data.status,
      active: data.active,
      notes: data.notes,
    },
    include: { client: true },
  });

  res.status(201).json(devis);
}

export async function updateDevis(req: Request, res: Response) {
  const { id } = req.params;
  const parsed = devisSchema.partial().safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: 'Dados invalidos', issues: parsed.error.flatten() });
  }

  const existing = await prisma.devis.findUnique({ where: { id } });
  if (!existing) {
    return res.status(404).json({ message: 'Devis nao encontrado' });
  }

  if (parsed.data.clientId) {
    const clientExists = await prisma.client.findUnique({ where: { id: parsed.data.clientId } });
    if (!clientExists) {
      return res.status(404).json({ message: 'Cliente associado nao existe' });
    }
  }

  const { amount, date, valid, ...rest } = parsed.data;

  const devis = await prisma.devis.update({
    where: { id },
    data: {
      ...rest,
      amount,
      date: date ? toDate(date) : undefined,
      valid: valid ? toDate(valid) : undefined,
    },
    include: { client: true },
  });

  res.json(devis);
}

export async function deleteDevis(req: Request, res: Response) {
  const { id } = req.params;
  const existing = await prisma.devis.findUnique({ where: { id } });
  if (!existing) {
    return res.status(404).json({ message: 'Devis nao encontrado' });
  }

  await prisma.devis.delete({ where: { id } });
  res.status(204).send();
}

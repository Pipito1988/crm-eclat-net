import type { Request, Response } from 'express';
import { prisma } from '../config/prisma';
import { serviceSchema } from '../schemas/serviceSchema';

export async function listServices(req: Request, res: Response) {
  const { clientId } = req.query;
  const where = clientId ? { clientId: String(clientId) } : undefined;

  const services = await prisma.service.findMany({
    where,
    include: { client: true },
    orderBy: { createdAt: 'desc' },
  });

  res.json(services);
}

export async function getService(req: Request, res: Response) {
  const { id } = req.params;
  const service = await prisma.service.findUnique({
    where: { id },
    include: { client: true },
  });

  if (!service) {
    return res.status(404).json({ message: 'Servico nao encontrado' });
  }

  res.json(service);
}

export async function createService(req: Request, res: Response) {
  const parsed = serviceSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: 'Dados invalidos', issues: parsed.error.flatten() });
  }

  const data = parsed.data;

  const clientExists = await prisma.client.findUnique({ where: { id: data.clientId } });
  if (!clientExists) {
    return res.status(404).json({ message: 'Cliente associado nao existe' });
  }

  const service = await prisma.service.create({
    data: {
      ...data,
      binsWeekdays: data.binsWeekdays || [],
      binsTypes: data.binsTypes || [],
      binsTypesMap: data.binsTypesMap || {},
    },
    include: { client: true },
  });

  res.status(201).json(service);
}

export async function updateService(req: Request, res: Response) {
  const { id } = req.params;
  const parsed = serviceSchema.partial().safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: 'Dados invalidos', issues: parsed.error.flatten() });
  }

  const existing = await prisma.service.findUnique({ where: { id } });
  if (!existing) {
    return res.status(404).json({ message: 'Servico nao encontrado' });
  }

  if (parsed.data.clientId) {
    const clientExists = await prisma.client.findUnique({ where: { id: parsed.data.clientId } });
    if (!clientExists) {
      return res.status(404).json({ message: 'Cliente associado nao existe' });
    }
  }

  const service = await prisma.service.update({
    where: { id },
    data: {
      ...parsed.data,
      binsWeekdays: parsed.data.binsWeekdays || [],
      binsTypes: parsed.data.binsTypes || [],
      binsTypesMap: parsed.data.binsTypesMap || {},
    },
    include: { client: true },
  });

  res.json(service);
}

export async function deleteService(req: Request, res: Response) {
  const { id } = req.params;
  const existing = await prisma.service.findUnique({ where: { id } });
  if (!existing) {
    return res.status(404).json({ message: 'Servico nao encontrado' });
  }

  await prisma.service.delete({ where: { id } });
  res.status(204).send();
}

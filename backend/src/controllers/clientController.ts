import type { Request, Response } from 'express';
import { Prisma } from '@prisma/client';
import { prisma } from '../config/prisma';
import { clientSchema } from '../schemas/clientSchema';

function toDate(value?: string) {
  if (!value) return undefined;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

export async function listClients(_req: Request, res: Response) {
  const clients = await prisma.client.findMany({
    include: {
      employees: true,
      devis: true,
      services: true,
    },
    orderBy: { createdAt: 'desc' },
  });
  res.json(clients);
}

export async function getClient(req: Request, res: Response) {
  const { id } = req.params;
  const client = await prisma.client.findUnique({
    where: { id },
    include: { employees: true, devis: true, services: true },
  });

  if (!client) {
    return res.status(404).json({ message: 'Cliente nao encontrado' });
  }

  res.json(client);
}

export async function createClient(req: Request, res: Response) {
  try {
    const parsed = clientSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ 
        message: 'Dados invalidos', 
        issues: parsed.error.flatten()
      });
    }

  const data = parsed.data;

  const client = await prisma.client.create({
    data: {
      name: data.name,
      clientStatus: data.clientStatus,
      clientType: data.clientType,
      startDate: toDate(data.startDate),
      serviceAddress: data.serviceAddress,
      billingAddress: data.billingAddress,
      value: data.value,
      frequency: data.frequency,
      method: data.method,
      service: data.service,
      contract: data.contract,
      employees: data.employees
        ? {
            create: data.employees.map((emp) => ({
              name: emp.name,
              salary: emp.salary,
            })),
          }
        : undefined,
      devis: data.devis
        ? {
            create: data.devis.map((devis) => ({
              title: devis.title,
              amount: devis.amount,
              date: toDate(devis.date),
              valid: toDate(devis.valid),
              status: devis.status,
              active: devis.active,
              notes: devis.notes,
            })),
          }
        : undefined,
    },
    include: { employees: true, devis: true, services: true },
    });

    res.status(201).json(client);
    
  } catch (error) {
    console.error('Erro ao criar cliente:', error);
    res.status(500).json({ 
      message: 'Erro interno do servidor',
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
}

export async function updateClient(req: Request, res: Response) {
  try {
    const { id } = req.params;
    
    const parsed = clientSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ 
        message: 'Dados invalidos', 
        issues: parsed.error.flatten()
      });
    }

  const existing = await prisma.client.findUnique({ where: { id } });
  if (!existing) {
    return res.status(404).json({ message: 'Cliente nao encontrado' });
  }

    const data = parsed.data;

    const result = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    await tx.employee.deleteMany({ where: { clientId: id } });
    await tx.devis.deleteMany({ where: { clientId: id } });

    return tx.client.update({
      where: { id },
      data: {
        name: data.name,
        clientStatus: data.clientStatus,
        clientType: data.clientType,
        startDate: toDate(data.startDate),
        serviceAddress: data.serviceAddress,
        billingAddress: data.billingAddress,
        value: data.value,
        frequency: data.frequency,
        method: data.method,
        service: data.service,
        contract: data.contract,
        employees: data.employees
          ? {
              create: data.employees.map((emp) => ({
                name: emp.name,
                salary: emp.salary,
              })),
            }
          : undefined,
        devis: data.devis
          ? {
              create: data.devis.map((devis) => ({
                title: devis.title,
                amount: devis.amount,
                date: toDate(devis.date),
                valid: toDate(devis.valid),
                status: devis.status,
                active: devis.active,
                notes: devis.notes,
              })),
            }
          : undefined,
      },
      include: { employees: true, devis: true, services: true },
    });
    });

    res.json(result);
    
  } catch (error) {
    console.error('Erro ao atualizar cliente:', error);
    res.status(500).json({ 
      message: 'Erro interno do servidor',
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
}

export async function deleteClient(req: Request, res: Response) {
  const { id } = req.params;
  const existing = await prisma.client.findUnique({ where: { id } });
  if (!existing) {
    return res.status(404).json({ message: 'Cliente nao encontrado' });
  }

  await prisma.client.delete({ where: { id } });

  res.status(204).send();
}

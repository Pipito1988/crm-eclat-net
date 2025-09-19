import type { Request, Response } from 'express';
import { prisma } from '../config/prisma';

const URSSAF_RATE = 0.238;

export async function getMonthlyStats(_req: Request, res: Response) {
  const clients = await prisma.client.findMany({ include: { employees: true } });

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  let billed = 0;
  let costs = 0;

  for (const client of clients) {
    const value = Number(client.value);
    let monthly = 0;

    switch (client.frequency) {
      case 'MENSAL':
        monthly = value;
        break;
      case 'SEMANAL':
        monthly = value * 4.33;
        break;
      case 'PAGAMENTO_UNICO':
        if (client.startDate) {
          const start = new Date(client.startDate);
          if (start.getMonth() === currentMonth && start.getFullYear() === currentYear) {
            monthly = value;
          }
        }
        break;
      default:
        monthly = value;
    }

    billed += monthly;

    let employeeCosts = 0;
    for (const employee of client.employees) {
      employeeCosts += Number(employee.salary);
    }

    costs += employeeCosts;
  }

  const urssaf = billed * URSSAF_RATE;
  const gross = billed - costs;
  const net = billed - urssaf - costs;

  res.json({ billed, urssaf, costs, gross, net });
}

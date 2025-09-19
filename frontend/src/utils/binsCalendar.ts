import type { Client, Service } from '../types';

export interface BinEvent {
  id: string;
  serviceId: string;
  clientName: string;
  clientType: string;
  type: 'out' | 'in';
  day: number;
  time: string;
  binTypes: string[];
  title: string;
}

export function generateBinEvents(services: Service[], clients: Client[]): BinEvent[] {
  const events: BinEvent[] = [];

  services.forEach((service) => {
    if (!service.binsEnabled || !service.binsWeekdays || service.binsWeekdays.length === 0) {
      return;
    }

    const client = service.client ?? clients.find((item) => item.id === service.clientId);
    const clientName = client?.name ?? 'Cliente removido';
    const clientType = client?.clientType ?? '-';

    service.binsWeekdays.forEach((rawDay) => {
      const dayIndex = typeof rawDay === 'string' ? Number(rawDay) : rawDay;
      if (!Number.isInteger(dayIndex) || dayIndex < 0 || dayIndex > 6) {
        return;
      }

      // Solução definitiva para TS7015 - type guard e acesso seguro
      const typesMap = service.binsTypesMap;
      let binTypes: string[] = [];
      
      if (typesMap) {
        // Acesso seguro com verificação de tipo
        if (typeof dayIndex === 'number' && dayIndex in typesMap) {
          binTypes = typesMap[dayIndex] || [];
        } else if (String(dayIndex) in typesMap) {
          binTypes = (typesMap as any)[String(dayIndex)] || [];
        }
      }

      if (binTypes.length === 0) {
        return;
      }

      events.push({
        id: `${service.id}-out-${dayIndex}`,
        serviceId: service.id,
        clientName,
        clientType,
        type: 'out',
        day: dayIndex,
        time: service.binsTimeOut ?? '20:00',
        binTypes,
        title: `Saida: ${binTypes.join(', ')}`,
      });

      const nextDay = (dayIndex + 1) % 7;
      events.push({
        id: `${service.id}-in-${dayIndex}`,
        serviceId: service.id,
        clientName,
        clientType,
        type: 'in',
        day: nextDay,
        time: service.binsTimeIn ?? '06:00',
        binTypes,
        title: `Entrada: ${binTypes.join(', ')}`,
      });
    });
  });

  return events;
}

export function getBinEventColor(event: BinEvent) {
  if (event.type === 'out') {
    return {
      bg: '#fef3c7',
      border: '#f59e0b',
      text: '#92400e',
    };
  }

  return {
    bg: '#dcfce7',
    border: '#22c55e',
    text: '#166534',
  };
}

export function getBinTypeIcon(type: string): string {
  switch (type) {
    case 'Verde':
      return 'verde';
    case 'Amarela':
      return 'amarela';
    case 'Azul':
      return 'azul';
    case 'Vidro':
      return 'vidro';
    case 'Organico':
      return 'organico';
    case 'Indiferenciado':
      return 'indiferenciado';
    default:
      return 'outro';
  }
}

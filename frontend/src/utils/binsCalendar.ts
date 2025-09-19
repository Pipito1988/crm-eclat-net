import type { Service } from '../types';

// Tipo para eventos de poubelles no calendário
export interface BinEvent {
  id: string;
  serviceId: string;
  clientName: string;
  clientType: string;
  type: 'out' | 'in'; // saída ou entrada
  day: number; // 0-6 (Domingo-Sábado)
  time: string; // HH:MM
  binTypes: string[]; // tipos de lixo
  title: string; // título para exibição
}

// Função para gerar eventos de poubelles a partir dos serviços
export function generateBinEvents(services: Service[], clients: any[]): BinEvent[] {
  const events: BinEvent[] = [];

  services.forEach(service => {
    if (!service.binsEnabled || !service.binsWeekdays || service.binsWeekdays.length === 0) {
      return;
    }

    const client = service.client ?? clients.find(c => c.id === service.clientId);
    const clientName = client ? client.name : 'Cliente removido';
    const clientType = client ? client.clientType : '-';

    service.binsWeekdays.forEach(dayIndex => {
      // Converter chave para string se necessário (Prisma pode retornar como string)
      const binTypes = service.binsTypesMap?.[dayIndex] || service.binsTypesMap?.[dayIndex.toString()] || [];
      
      if (binTypes.length === 0) return;

      // Evento de saída (colocar poubelles na rua)
      events.push({
        id: `${service.id}-out-${dayIndex}`,
        serviceId: service.id,
        clientName,
        clientType,
        type: 'out',
        day: dayIndex,
        time: service.binsTimeOut || '20:00',
        binTypes,
        title: `🗑️ Saída: ${binTypes.join(', ')}`
      });

      // Evento de entrada (recolher poubelles - dia seguinte)
      const nextDay = (dayIndex + 1) % 7;
      events.push({
        id: `${service.id}-in-${dayIndex}`,
        serviceId: service.id,
        clientName,
        clientType,
        type: 'in',
        day: nextDay,
        time: service.binsTimeIn || '06:00',
        binTypes,
        title: `🏠 Entrada: ${binTypes.join(', ')}`
      });
    });
  });

  return events;
}

// Função para obter cor do evento baseada no tipo
export function getBinEventColor(event: BinEvent) {
  if (event.type === 'out') {
    return {
      bg: '#fef3c7', // warning-light
      border: '#f59e0b', // warning
      text: '#92400e' // warning-dark
    };
  } else {
    return {
      bg: '#dcfce7', // success-light  
      border: '#22c55e', // success
      text: '#166534' // success-dark
    };
  }
}

// Função para obter ícone do tipo de lixo
export function getBinTypeIcon(type: string): string {
  switch (type) {
    case 'Verde': return '🌱';
    case 'Amarela': return '📦';
    case 'Azul': return '📄';
    case 'Vidro': return '🍶';
    case 'Orgânico': return '🥬';
    case 'Indiferenciado': return '🗑️';
    default: return '♻️';
  }
}

import type { Service, Client } from '../types';

interface WeeklyCalendarProps {
  services: Service[];
  clients: Client[];
}

const WEEKDAYS = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'];
const HOURS = ['07:00', '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00'];

export function WeeklyCalendar({ services, clients }: WeeklyCalendarProps) {
  // Organizar serviços por dia da semana
  const servicesByDay = WEEKDAYS.reduce((acc, day) => {
    acc[day] = services.filter(service => service.weekday === day);
    return acc;
  }, {} as Record<string, Service[]>);

  // Função para obter informações do cliente
  const getClientInfo = (service: Service) => {
    const client = service.client ?? clients.find(c => c.id === service.clientId);
    return {
      name: client ? client.name : 'Cliente removido',
      type: client ? client.clientType : '-'
    };
  };

  // Função para obter cor baseada no tipo de cliente
  const getClientTypeColor = (clientType: string) => {
    switch (clientType.toLowerCase()) {
      case 'imovel':
      case 'imóvel':
        return '#007bff';
      case 'escritorio':
      case 'escritório':
        return '#28a745';
      default:
        return '#6c757d';
    }
  };

  return (
    <div className="card" style={{ marginTop: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h3 style={{ margin: 0, color: 'var(--primary)' }}>
          Calendário Semanal
        </h3>
        <div className="text-muted" style={{ fontSize: '0.9rem' }}>
          {services.filter(s => s.weekday).length} serviços agendados
        </div>
      </div>

      <div className="weekly-calendar">
        {/* Cabeçalho com os dias da semana */}
        <div className="calendar-header">
          <div className="time-column-header"></div>
          {WEEKDAYS.map(day => (
            <div key={day} className="day-header">
              <div className="day-name">{day}</div>
              <div className="day-count">
                {servicesByDay[day].length} serviço{servicesByDay[day].length !== 1 ? 's' : ''}
              </div>
            </div>
          ))}
        </div>

        {/* Grid principal */}
        <div className="calendar-grid">
          {/* Coluna das horas */}
          <div className="time-column">
            {HOURS.map(hour => (
              <div key={hour} className="time-slot">
                {hour}
              </div>
            ))}
          </div>

          {/* Colunas dos dias */}
          {WEEKDAYS.map(day => (
            <div key={day} className="day-column">
              {HOURS.map(hour => (
                <div key={hour} className="hour-slot">
                  {servicesByDay[day]
                    .filter(service => service.time === hour)
                    .map(service => {
                      const clientInfo = getClientInfo(service);
                      return (
                        <div
                          key={service.id}
                          className="service-slot"
                          style={{
                            borderLeft: `4px solid ${getClientTypeColor(clientInfo.type)}`,
                            backgroundColor: '#f7fbff',
                            padding: '6px 8px',
                            borderRadius: '4px',
                            marginBottom: '2px',
                            fontSize: '0.8rem'
                          }}
                        >
                          <div style={{ fontWeight: 'bold', marginBottom: '2px' }}>
                            {clientInfo.name}
                          </div>
                          <div style={{ color: '#666', fontSize: '0.75rem' }}>
                            {service.category && <span>{service.category}</span>}
                            {service.category && service.freq && <span> • </span>}
                            {service.freq && <span>{service.freq}</span>}
                          </div>
                        </div>
                      );
                    })
                  }
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* Serviços sem horário específico */}
        {WEEKDAYS.some(day => servicesByDay[day].some(s => !s.time)) && (
          <div style={{ marginTop: '16px' }}>
            <h4 style={{ margin: '0 0 8px', fontSize: '0.9rem', color: 'var(--primary)' }}>
              Serviços sem horário específico
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '8px' }}>
              {WEEKDAYS.map(day => {
                const unscheduledServices = servicesByDay[day].filter(s => !s.time);
                if (unscheduledServices.length === 0) return null;
                
                return (
                  <div key={day} style={{ padding: '8px', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
                    <div style={{ fontWeight: 'bold', marginBottom: '4px', fontSize: '0.8rem' }}>
                      {day}
                    </div>
                    {unscheduledServices.map(service => {
                      const clientInfo = getClientInfo(service);
                      return (
                        <div
                          key={service.id}
                          style={{
                            padding: '4px',
                            borderLeft: `3px solid ${getClientTypeColor(clientInfo.type)}`,
                            backgroundColor: 'white',
                            borderRadius: '2px',
                            marginBottom: '2px',
                            fontSize: '0.75rem'
                          }}
                        >
                          <div style={{ fontWeight: 'bold' }}>{clientInfo.name}</div>
                          {service.category && (
                            <div style={{ color: '#666' }}>{service.category}</div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Legenda */}
      <div style={{ 
        marginTop: '16px', 
        padding: '12px', 
        backgroundColor: '#f8f9fa', 
        borderRadius: '6px',
        fontSize: '0.8rem'
      }}>
        <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>Legenda:</div>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <div style={{ width: '12px', height: '12px', backgroundColor: '#007bff', borderRadius: '2px' }}></div>
            <span>Imóvel</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <div style={{ width: '12px', height: '12px', backgroundColor: '#28a745', borderRadius: '2px' }}></div>
            <span>Escritório</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <div style={{ width: '12px', height: '12px', backgroundColor: '#6c757d', borderRadius: '2px' }}></div>
            <span>Outros</span>
          </div>
        </div>
      </div>
    </div>
  );
}

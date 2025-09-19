import { useState } from 'react';
import type { Service, Client } from '../types';
import { Icon } from './Icon';
import { generateBinEvents, getBinEventColor, getBinTypeIcon, type BinEvent } from '../utils/binsCalendar';

interface ModernWeeklyCalendarProps {
  services: Service[];
  clients: Client[];
}

const WEEKDAYS = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
const WEEKDAYS_SHORT = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const HOURS = Array.from({ length: 16 }, (_, i) => {
  const hour = i + 6; // 6:00 to 21:00 (para cobrir entrada às 06:00 e saída às 20:00)
  return `${hour.toString().padStart(2, '0')}:00`;
});

export function ModernWeeklyCalendar({ services, clients }: ModernWeeklyCalendarProps) {
  const [selectedView, setSelectedView] = useState<'week' | 'services' | 'bins'>('week');
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  // Gerar eventos de poubelles
  const binEvents = generateBinEvents(services, clients);
  
  // Organizar eventos de poubelles por dia e hora
  const binEventsByDay = WEEKDAYS.reduce((acc, _, index) => {
    acc[index] = binEvents.filter(event => event.day === index);
    return acc;
  }, {} as Record<number, BinEvent[]>);

  const binEventsByHour = (dayIndex: number) => {
    return HOURS.reduce((acc, hour) => {
      acc[hour] = binEventsByDay[dayIndex].filter(event => {
        // Normalizar formato de hora para comparação
        const eventHour = event.time.padStart(5, '0'); // "6:00" -> "06:00"
        const gridHour = hour; // já vem como "07:00"
        return eventHour === gridHour;
      });
      return acc;
    }, {} as Record<string, BinEvent[]>);
  };

  // Organizar serviços por dia da semana
  const servicesByDay = WEEKDAYS.reduce((acc, _, index) => {
    acc[index] = services.filter(service => {
      const dayName = service.weekday;
      return dayName === WEEKDAYS[index] || dayName === WEEKDAYS_SHORT[index];
    });
    return acc;
  }, {} as Record<number, Service[]>);

  // Organizar serviços por hora
  const servicesByHour = (dayIndex: number) => {
    return HOURS.reduce((acc, hour) => {
      acc[hour] = servicesByDay[dayIndex].filter(service => service.time === hour);
      return acc;
    }, {} as Record<string, Service[]>);
  };

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
        return {
          bg: 'var(--info-bg)',
          border: 'var(--info)',
          text: 'var(--info-dark)'
        };
      case 'escritorio':
      case 'escritório':
        return {
          bg: 'var(--success-bg)',
          border: 'var(--success)',
          text: 'var(--success-dark)'
        };
      default:
        return {
          bg: 'var(--gray-100)',
          border: 'var(--gray-400)',
          text: 'var(--gray-700)'
        };
    }
  };

  // Função para obter cor do tipo de lixo
  const getBinTypeColor = (type: string) => {
    switch (type) {
      case 'Verde': return '#22c55e';
      case 'Amarela': return '#eab308';
      case 'Azul': return '#3b82f6';
      case 'Vidro': return '#06b6d4';
      case 'Orgânico': return '#84cc16';
      case 'Indiferenciado': return '#6b7280';
      default: return '#9ca3af';
    }
  };

  // Obter serviços com poubelles para um dia
  const getBinsForDay = (dayIndex: number) => {
    return services.filter(service => {
      if (!service.binsEnabled || !service.binsWeekdays) return false;
      return service.binsWeekdays.includes(dayIndex);
    });
  };

  // Renderizar evento de poubelles
  const renderBinEvent = (event: BinEvent, isCompact = false) => {
    const colors = getBinEventColor(event);
    
    return (
      <div
        key={event.id}
        style={{
          padding: isCompact ? 'var(--space-1)' : 'var(--space-2)',
          background: colors.bg,
          border: `2px solid ${colors.border}`,
          borderRadius: 'var(--radius)',
          marginBottom: 'var(--space-1)',
          cursor: 'pointer',
          transition: 'var(--transition)',
          boxShadow: 'var(--shadow-sm)'
        }}
        title={`${event.clientName} - ${event.title} às ${event.time}`}
      >
        <div style={{ 
          fontWeight: '600', 
          fontSize: isCompact ? '0.65rem' : '0.7rem',
          color: colors.text,
          marginBottom: '2px',
          display: 'flex',
          alignItems: 'center',
          gap: '2px'
        }}>
          {event.type === 'out' ? '🗑️' : '🏠'} {event.clientName}
        </div>
        <div style={{ 
          fontSize: '0.6rem', 
          color: colors.text,
          opacity: 0.8,
          display: 'flex',
          alignItems: 'center',
          gap: '2px',
          flexWrap: 'wrap'
        }}>
          <span>🕐 {event.time}</span>
          {event.binTypes.map(type => (
            <span key={type} style={{ fontSize: '0.55rem' }}>
              {getBinTypeIcon(type)}
            </span>
          ))}
        </div>
      </div>
    );
  };

  // Renderizar slot de serviço
  const renderServiceSlot = (service: Service, isCompact = false) => {
    const clientInfo = getClientInfo(service);
    const colors = getClientTypeColor(clientInfo.type);
    
    return (
      <div
        key={service.id}
        style={{
          padding: isCompact ? 'var(--space-2)' : 'var(--space-3)',
          background: colors.bg,
          border: `2px solid ${colors.border}`,
          borderRadius: 'var(--radius-lg)',
          marginBottom: 'var(--space-1)',
          cursor: 'pointer',
          transition: 'var(--transition)',
          boxShadow: 'var(--shadow-sm)'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = 'var(--shadow-md)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
        }}
      >
        <div style={{ 
          fontWeight: '600', 
          fontSize: isCompact ? '0.75rem' : '0.8rem',
          color: colors.text,
          marginBottom: 'var(--space-1)'
        }}>
          {clientInfo.name}
        </div>
        <div style={{ 
          fontSize: '0.7rem', 
          color: colors.text,
          opacity: 0.8,
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-1)',
          flexWrap: 'wrap'
        }}>
          {service.category && <span>📋 {service.category}</span>}
          {service.freq && <span>🔄 {service.freq}</span>}
          {service.time && <span>🕐 {service.time}</span>}
        </div>
        
        {/* Mostrar poubelles se ativo */}
        {service.binsEnabled && service.binsTypesMap && (
          <div style={{ 
            marginTop: 'var(--space-2)',
            display: 'flex',
            flexWrap: 'wrap',
            gap: '2px'
          }}>
            {Object.entries(service.binsTypesMap).map(([day, types]) => {
              const currentDayIndex = Object.keys(servicesByDay).find(dayKey => 
                servicesByDay[parseInt(dayKey)].some((s: Service) => s.id === service.id)
              );
              if (parseInt(day) !== parseInt(currentDayIndex || '-1')) return null;
              
              return types.map(type => (
                <span
                  key={type}
                  style={{
                    padding: '1px 4px',
                    background: getBinTypeColor(type),
                    color: 'white',
                    borderRadius: 'var(--radius)',
                    fontSize: '0.6rem',
                    fontWeight: '600'
                  }}
                >
                  🗑️ {type}
                </span>
              ));
            })}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="card" style={{ padding: 'var(--space-6)' }}>
      {/* Header do calendário */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        marginBottom: 'var(--space-6)'
      }}>
        <div>
          <h2 style={{ 
            margin: 0,
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-2)',
            marginBottom: 'var(--space-1)'
          }}>
            📅 Calendário Semanal
          </h2>
          <p className="text-muted" style={{ margin: 0, fontSize: '0.875rem' }}>
            Vista semanal dos serviços e gestão de poubelles
          </p>
        </div>
        
        {/* Controles de vista */}
        <div style={{ display: 'flex', gap: 'var(--space-1)' }}>
          <button
            className={`btn ${selectedView === 'week' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
            onClick={() => setSelectedView('week')}
          >
            <Icon name="calendar" size="sm" />
            Semana
          </button>
          <button
            className={`btn ${selectedView === 'services' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
            onClick={() => setSelectedView('services')}
          >
            <Icon name="briefcase" size="sm" />
            Serviços
          </button>
          <button
            className={`btn ${selectedView === 'bins' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
            onClick={() => setSelectedView('bins')}
          >
            🗑️ Poubelles
          </button>
        </div>
      </div>

      {/* Vista de Semana */}
      {selectedView === 'week' && (
        <div style={{ 
          display: 'grid',
          gridTemplateColumns: '80px repeat(7, 1fr)',
          gap: '1px',
          background: 'var(--gray-200)',
          borderRadius: 'var(--radius-xl)',
          overflow: 'hidden',
          boxShadow: 'var(--shadow-lg)'
        }}>
          {/* Header com horas */}
          <div style={{ 
            background: 'var(--gray-100)',
            padding: 'var(--space-3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: '600',
            fontSize: '0.8rem',
            color: 'var(--text-secondary)'
          }}>
            Hora
          </div>
          
          {/* Headers dos dias */}
          {WEEKDAYS.map((day, index) => {
            const dayServices = servicesByDay[index];
            const dayBinEvents = binEventsByDay[index];
            const totalEvents = dayServices.length + dayBinEvents.length;
            
            return (
              <div
                key={day}
                style={{
                  background: selectedDay === index ? 'var(--primary)' : 'var(--primary-dark)',
                  color: 'white',
                  padding: 'var(--space-3)',
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'var(--transition)'
                }}
                onClick={() => setSelectedDay(selectedDay === index ? null : index)}
              >
                <div style={{ fontWeight: '700', fontSize: '0.8rem', marginBottom: '2px' }}>
                  {WEEKDAYS_SHORT[index]}
                </div>
                <div style={{ fontSize: '0.7rem', opacity: 0.9 }}>
                  {totalEvents} evento{totalEvents !== 1 ? 's' : ''}
                </div>
              </div>
            );
          })}

          {/* Grid de horas e serviços */}
          {HOURS.map(hour => (
            <div key={`hour-${hour}`} style={{ display: 'contents' }}>
              {/* Coluna da hora */}
              <div style={{
                background: 'var(--gray-50)',
                padding: 'var(--space-2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.75rem',
                fontWeight: '500',
                color: 'var(--text-secondary)',
                borderRight: '1px solid var(--gray-200)'
              }}>
                {hour}
              </div>
              
              {/* Colunas dos dias */}
              {WEEKDAYS.map((_, dayIndex) => {
                const hourServices = servicesByHour(dayIndex)[hour] || [];
                const hourBinEvents = binEventsByHour(dayIndex)[hour] || [];
                const isSelected = selectedDay === dayIndex;
                
                return (
                  <div
                    key={`${hour}-${dayIndex}`}
                    style={{
                      background: isSelected ? 'var(--primary-bg)' : 'var(--white)',
                      padding: 'var(--space-2)',
                      minHeight: '60px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 'var(--space-1)',
                      borderBottom: '1px solid var(--gray-100)'
                    }}
                  >
                    {hourServices.map(service => renderServiceSlot(service, true))}
                    {hourBinEvents.map(event => renderBinEvent(event, true))}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      )}

      {/* Vista de Serviços */}
      {selectedView === 'services' && (
        <div style={{ 
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: 'var(--space-4)'
        }}>
          {WEEKDAYS.map((day, dayIndex) => {
            const dayServices = servicesByDay[dayIndex];
            
            return (
              <div
                key={day}
                style={{
                  background: 'var(--white)',
                  border: '1px solid var(--gray-200)',
                  borderRadius: 'var(--radius-xl)',
                  padding: 'var(--space-4)',
                  boxShadow: 'var(--shadow-sm)'
                }}
              >
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: 'var(--space-3)',
                  paddingBottom: 'var(--space-2)',
                  borderBottom: '2px solid var(--primary)'
                }}>
                  <h3 style={{ 
                    margin: 0,
                    color: 'var(--primary)',
                    fontSize: '1rem',
                    fontWeight: '600'
                  }}>
                    {day}
                  </h3>
                  <span style={{
                    padding: 'var(--space-1) var(--space-2)',
                    background: dayServices.length > 0 ? 'var(--primary)' : 'var(--gray-400)',
                    color: 'white',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '0.7rem',
                    fontWeight: '600'
                  }}>
                    {dayServices.length}
                  </span>
                </div>
                
                {dayServices.length === 0 ? (
                  <div style={{
                    textAlign: 'center',
                    padding: 'var(--space-6)',
                    color: 'var(--text-light)',
                    fontSize: '0.8rem'
                  }}>
                    <div style={{ fontSize: '2rem', marginBottom: 'var(--space-2)', opacity: 0.3 }}>
                      📅
                    </div>
                    Sem serviços agendados
                  </div>
                ) : (
                  <div style={{ display: 'grid', gap: 'var(--space-2)' }}>
                    {dayServices
                      .sort((a, b) => (a.time || '').localeCompare(b.time || ''))
                      .map(service => renderServiceSlot(service, false))
                    }
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Vista de Poubelles */}
      {selectedView === 'bins' && (
        <div>
          <div style={{ 
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 'var(--space-4)',
            marginBottom: 'var(--space-6)'
          }}>
            {WEEKDAYS.map((day, dayIndex) => {
              const binsServices = getBinsForDay(dayIndex);
              const allBinTypes = new Set<string>();
              
              binsServices.forEach(service => {
                if (service.binsTypesMap && service.binsTypesMap[dayIndex]) {
                  service.binsTypesMap[dayIndex].forEach(type => allBinTypes.add(type));
                }
              });

              return (
                <div
                  key={day}
                  style={{
                    background: 'var(--white)',
                    border: '1px solid var(--gray-200)',
                    borderRadius: 'var(--radius-xl)',
                    padding: 'var(--space-4)',
                    boxShadow: 'var(--shadow-sm)'
                  }}
                >
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: 'var(--space-3)',
                    paddingBottom: 'var(--space-2)',
                    borderBottom: `2px solid ${binsServices.length > 0 ? 'var(--success)' : 'var(--gray-300)'}`
                  }}>
                    <h3 style={{ 
                      margin: 0,
                      color: binsServices.length > 0 ? 'var(--success)' : 'var(--text-secondary)',
                      fontSize: '1rem',
                      fontWeight: '600',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 'var(--space-1)'
                    }}>
                      🗑️ {day}
                    </h3>
                    <span style={{
                      padding: 'var(--space-1) var(--space-2)',
                      background: binsServices.length > 0 ? 'var(--success)' : 'var(--gray-400)',
                      color: 'white',
                      borderRadius: 'var(--radius-full)',
                      fontSize: '0.7rem',
                      fontWeight: '600'
                    }}>
                      {binsServices.length}
                    </span>
                  </div>

                  {binsServices.length === 0 ? (
                    <div style={{
                      textAlign: 'center',
                      padding: 'var(--space-4)',
                      color: 'var(--text-light)',
                      fontSize: '0.8rem'
                    }}>
                      <div style={{ fontSize: '1.5rem', marginBottom: 'var(--space-2)', opacity: 0.3 }}>
                        🗑️
                      </div>
                      Sem recolha de lixo
                    </div>
                  ) : (
                    <div style={{ display: 'grid', gap: 'var(--space-3)' }}>
                      {/* Tipos de lixo do dia */}
                      {allBinTypes.size > 0 && (
                        <div>
                          <h4 style={{ 
                            margin: '0 0 var(--space-2)', 
                            fontSize: '0.8rem',
                            color: 'var(--success)',
                            fontWeight: '600'
                          }}>
                            Tipos de Lixo
                          </h4>
                          <div style={{ 
                            display: 'flex', 
                            flexWrap: 'wrap', 
                            gap: 'var(--space-1)' 
                          }}>
                            {Array.from(allBinTypes).map(type => (
                              <span
                                key={type}
                                style={{
                                  padding: 'var(--space-1) var(--space-2)',
                                  background: getBinTypeColor(type),
                                  color: 'white',
                                  borderRadius: 'var(--radius-lg)',
                                  fontSize: '0.75rem',
                                  fontWeight: '600',
                                  boxShadow: 'var(--shadow-sm)'
                                }}
                              >
                                {type}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {/* Serviços com poubelles */}
                      <div>
                        <h4 style={{ 
                          margin: '0 0 var(--space-2)', 
                          fontSize: '0.8rem',
                          color: 'var(--text-primary)',
                          fontWeight: '600'
                        }}>
                          Clientes
                        </h4>
                        <div style={{ display: 'grid', gap: 'var(--space-2)' }}>
                          {binsServices.map(service => {
                            const clientInfo = getClientInfo(service);
                            return (
                              <div
                                key={service.id}
                                style={{
                                  padding: 'var(--space-3)',
                                  background: 'var(--gray-50)',
                                  border: '1px solid var(--gray-200)',
                                  borderRadius: 'var(--radius-lg)'
                                }}
                              >
                                <div style={{ 
                                  fontWeight: '600', 
                                  fontSize: '0.8rem',
                                  color: 'var(--text-primary)',
                                  marginBottom: 'var(--space-1)'
                                }}>
                                  {clientInfo.name}
                                </div>
                                <div style={{ 
                                  fontSize: '0.7rem', 
                                  color: 'var(--text-secondary)'
                                }}>
                                  {service.category} • {clientInfo.type}
                                </div>
                                {service.binsSchedule && (
                                  <div style={{ 
                                    marginTop: 'var(--space-1)',
                                    fontSize: '0.7rem', 
                                    color: 'var(--success)',
                                    fontWeight: '500'
                                  }}>
                                    {service.binsSchedule}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Resumo geral de poubelles */}
          <div style={{
            background: 'linear-gradient(135deg, var(--success-bg), var(--accent-light))',
            border: '1px solid var(--success-light)',
            borderRadius: 'var(--radius-xl)',
            padding: 'var(--space-4)'
          }}>
            <h3 style={{ 
              margin: '0 0 var(--space-3)',
              color: 'var(--success-dark)',
              fontSize: '1rem',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-2)'
            }}>
              📊 Resumo Semanal de Poubelles
            </h3>
            
            <div style={{ 
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
              gap: 'var(--space-3)'
            }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ 
                  fontSize: '1.5rem', 
                  fontWeight: '700', 
                  color: 'var(--success)',
                  marginBottom: 'var(--space-1)'
                }}>
                  {services.filter(s => s.binsEnabled).length}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--success-dark)' }}>
                  Serviços com poubelles
                </div>
              </div>
              
              <div style={{ textAlign: 'center' }}>
                <div style={{ 
                  fontSize: '1.5rem', 
                  fontWeight: '700', 
                  color: 'var(--info)',
                  marginBottom: 'var(--space-1)'
                }}>
                  {WEEKDAYS.filter(day => getBinsForDay(WEEKDAYS.indexOf(day)).length > 0).length}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--success-dark)' }}>
                  Dias com recolha
                </div>
              </div>
              
              <div style={{ textAlign: 'center' }}>
                <div style={{ 
                  fontSize: '1.5rem', 
                  fontWeight: '700', 
                  color: 'var(--warning)',
                  marginBottom: 'var(--space-1)'
                }}>
                  {new Set(
                    services
                      .filter(s => s.binsEnabled && s.binsTypesMap)
                      .flatMap(s => Object.values(s.binsTypesMap || {}))
                      .flat()
                  ).size}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--success-dark)' }}>
                  Tipos diferentes
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Legenda */}
      <div style={{ 
        marginTop: 'var(--space-6)',
        padding: 'var(--space-4)',
        background: 'var(--gray-50)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--gray-200)'
      }}>
        <h4 style={{ 
          margin: '0 0 var(--space-3)',
          fontSize: '0.8rem',
          color: 'var(--text-primary)',
          fontWeight: '600'
        }}>
          📖 Legenda
        </h4>
        <div style={{ 
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 'var(--space-3)',
          fontSize: '0.75rem'
        }}>
          <div>
            <strong style={{ color: 'var(--primary)' }}>Tipos de Cliente:</strong>
            <div style={{ marginTop: 'var(--space-1)', display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                <div style={{ 
                  width: '12px', 
                  height: '12px', 
                  background: 'var(--info)', 
                  borderRadius: '2px' 
                }}></div>
                <span>Imóvel</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                <div style={{ 
                  width: '12px', 
                  height: '12px', 
                  background: 'var(--success)', 
                  borderRadius: '2px' 
                }}></div>
                <span>Escritório</span>
              </div>
            </div>
          </div>
          
          <div>
            <strong style={{ color: 'var(--success)' }}>Tipos de Lixo:</strong>
            <div style={{ marginTop: 'var(--space-1)', display: 'flex', flexWrap: 'wrap', gap: 'var(--space-1)' }}>
              {['Verde', 'Amarela', 'Azul', 'Vidro', 'Orgânico'].map(type => (
                <span
                  key={type}
                  style={{
                    padding: '2px 6px',
                    background: getBinTypeColor(type),
                    color: 'white',
                    borderRadius: 'var(--radius)',
                    fontSize: '0.65rem',
                    fontWeight: '500'
                  }}
                >
                  {type}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

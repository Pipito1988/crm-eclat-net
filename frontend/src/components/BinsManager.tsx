import { useState, useEffect } from 'react';

interface BinsConfig {
  binsEnabled: boolean;
  binsDays: number;
  binsWeekdays: number[];
  binsTypes: string[];
  binsTypesMap: Record<number, string[]>;
  binsSchedule: string;
  // Horários de poubelles
  binsTimeOut: string; // Hora de saída das poubelles
  binsTimeIn: string;  // Hora de entrada das poubelles (dia seguinte)
}

interface BinsManagerProps {
  binsConfig: BinsConfig;
  onBinsConfigChange: (config: BinsConfig) => void;
  disabled?: boolean;
}

const WEEKDAYS = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
const BIN_TYPES = ['Verde', 'Amarela', 'Azul', 'Vidro', 'Orgânico', 'Indiferenciado'];

const initialBinsConfig: BinsConfig = {
  binsEnabled: false,
  binsDays: 0,
  binsWeekdays: [],
  binsTypes: [],
  binsTypesMap: {},
  binsSchedule: '',
  binsTimeOut: '20:00', // Hora padrão de saída
  binsTimeIn: '06:00'   // Hora padrão de entrada
};

export function BinsManager({ binsConfig, onBinsConfigChange, disabled = false }: BinsManagerProps) {
  const [localConfig, setLocalConfig] = useState<BinsConfig>(binsConfig);

  // Atualizar configuração quando props mudam
  useEffect(() => {
    setLocalConfig(binsConfig);
  }, [binsConfig]);

  // Função para gerar resumo legível
  const generateSchedule = (weekdays: number[], typesMap: Record<number, string[]>, timeOut: string, timeIn: string): string => {
    if (weekdays.length === 0) return '';
    
    const schedule = weekdays
      .sort()
      .map(day => {
        const dayName = WEEKDAYS[day];
        const types = typesMap[day] || [];
        const nextDay = WEEKDAYS[(day + 1) % 7];
        
        if (types.length === 0) return `${dayName} ${timeOut} (sem tipos) → ${nextDay} ${timeIn}`;
        return `${dayName} ${timeOut} (${types.join(' + ')}) → ${nextDay} ${timeIn}`;
      })
      .join(' | ');
    
    return schedule;
  };

  // Atualizar configuração e notificar parent
  const updateConfig = (updates: Partial<BinsConfig>) => {
    const newConfig = { ...localConfig, ...updates };
    
    // Gerar schedule automaticamente
    if (updates.binsWeekdays || updates.binsTypesMap || updates.binsTimeOut || updates.binsTimeIn) {
      newConfig.binsSchedule = generateSchedule(
        updates.binsWeekdays || newConfig.binsWeekdays,
        updates.binsTypesMap || newConfig.binsTypesMap,
        updates.binsTimeOut || newConfig.binsTimeOut,
        updates.binsTimeIn || newConfig.binsTimeIn
      );
    }
    
    setLocalConfig(newConfig);
    onBinsConfigChange(newConfig);
  };

  // Toggle habilitação de poubelles
  const toggleBinsEnabled = () => {
    if (localConfig.binsEnabled) {
      // Desabilitar e limpar tudo
      updateConfig(initialBinsConfig);
    } else {
      // Habilitar
      updateConfig({ binsEnabled: true });
    }
  };

  // Adicionar/remover dia da semana
  const toggleWeekday = (dayIndex: number) => {
    const newWeekdays = localConfig.binsWeekdays.includes(dayIndex)
      ? localConfig.binsWeekdays.filter(d => d !== dayIndex)
      : [...localConfig.binsWeekdays, dayIndex].sort();
    
    // Atualizar tipos também
    const newTypesMap = { ...localConfig.binsTypesMap };
    if (!newWeekdays.includes(dayIndex)) {
      delete newTypesMap[dayIndex];
    } else if (!newTypesMap[dayIndex]) {
      newTypesMap[dayIndex] = [];
    }

    updateConfig({
      binsWeekdays: newWeekdays,
      binsDays: newWeekdays.length,
      binsTypesMap: newTypesMap
    });
  };

  // Adicionar/remover tipo de lixo para um dia específico
  const toggleBinType = (dayIndex: number, binType: string) => {
    const newTypesMap = { ...localConfig.binsTypesMap };
    if (!newTypesMap[dayIndex]) {
      newTypesMap[dayIndex] = [];
    }

    if (newTypesMap[dayIndex].includes(binType)) {
      newTypesMap[dayIndex] = newTypesMap[dayIndex].filter(t => t !== binType);
    } else {
      newTypesMap[dayIndex] = [...newTypesMap[dayIndex], binType];
    }

    // Atualizar array simples para compatibilidade
    const newBinsTypes = localConfig.binsWeekdays.map(day => 
      newTypesMap[day]?.[0] || ''
    );

    updateConfig({
      binsTypesMap: newTypesMap,
      binsTypes: newBinsTypes
    });
  };

  return (
    <div style={{
      border: '1px solid var(--gray-200)',
      borderRadius: 'var(--radius-xl)',
      padding: 'var(--space-4)',
      background: 'var(--gray-50)'
    }}>
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        marginBottom: 'var(--space-4)'
      }}>
        <h4 style={{ 
          margin: 0, 
          fontSize: '0.875rem', 
          color: 'var(--primary)',
          fontWeight: '600',
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-2)'
        }}>
          🗑️ Gestão de Poubelles (Recolha de Lixo)
        </h4>
        <label style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 'var(--space-2)',
          cursor: 'pointer',
          fontSize: '0.8rem',
          fontWeight: '500',
          color: localConfig.binsEnabled ? 'var(--success)' : 'var(--text-muted)'
        }}>
          <input
            type="checkbox"
            checked={localConfig.binsEnabled}
            onChange={toggleBinsEnabled}
            disabled={disabled}
            style={{ margin: 0, transform: 'scale(1.2)' }}
          />
          <span>Ativar gestão</span>
        </label>
      </div>

      {localConfig.binsEnabled && (
        <div style={{ display: 'grid', gap: 'var(--space-4)' }}>
          {/* Seleção de dias */}
          <div>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              marginBottom: 'var(--space-3)'
            }}>
              <h5 style={{ 
                margin: 0, 
                fontSize: '0.8rem', 
                color: 'var(--primary)',
                fontWeight: '600'
              }}>
                📅 Dias de Recolha
              </h5>
              <span style={{
                padding: 'var(--space-1) var(--space-2)',
                background: localConfig.binsDays > 0 ? 'var(--info)' : 'var(--gray-400)',
                color: 'white',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.7rem',
                fontWeight: '600'
              }}>
                {localConfig.binsDays} dia{localConfig.binsDays !== 1 ? 's' : ''}
              </span>
            </div>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(7, 1fr)', 
              gap: 'var(--space-1)' 
            }}>
              {WEEKDAYS.map((day, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => toggleWeekday(index)}
                  disabled={disabled}
                  style={{
                    padding: 'var(--space-2)',
                    background: localConfig.binsWeekdays.includes(index) 
                      ? 'var(--primary)' 
                      : 'var(--white)',
                    color: localConfig.binsWeekdays.includes(index) 
                      ? 'white' 
                      : 'var(--text-secondary)',
                    border: `1px solid ${localConfig.binsWeekdays.includes(index) 
                      ? 'var(--primary)' 
                      : 'var(--gray-300)'}`,
                    borderRadius: 'var(--radius)',
                    cursor: 'pointer',
                    transition: 'var(--transition)',
                    fontSize: '0.7rem',
                    fontWeight: localConfig.binsWeekdays.includes(index) ? '600' : '400',
                    textAlign: 'center'
                  }}
                >
                  {day.substring(0, 3)}
                </button>
              ))}
            </div>
          </div>

          {/* Configuração de horários */}
          <div>
            <h5 style={{ 
              margin: '0 0 var(--space-3)', 
              fontSize: '0.8rem', 
              color: 'var(--primary)',
              fontWeight: '600'
            }}>
              🕐 Horários de Recolha
            </h5>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
              gap: 'var(--space-3)' 
            }}>
              <div style={{
                padding: 'var(--space-3)',
                background: 'var(--white)',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--gray-200)'
              }}>
                <label style={{ 
                  fontSize: '0.75rem',
                  fontWeight: '600',
                  color: 'var(--text-primary)',
                  marginBottom: 'var(--space-2)',
                  display: 'block'
                }}>
                  🗑️ Hora de Saída
                </label>
                <select
                  value={localConfig.binsTimeOut}
                  onChange={(e) => updateConfig({ binsTimeOut: e.target.value })}
                  disabled={disabled}
                  style={{
                    width: '100%',
                    padding: 'var(--space-2)',
                    border: '1px solid var(--gray-300)',
                    borderRadius: 'var(--radius)',
                    fontSize: '0.8rem'
                  }}
                >
                  {Array.from({ length: 24 }, (_, i) => {
                    const hour = i.toString().padStart(2, '0') + ':00';
                    return (
                      <option key={hour} value={hour}>
                        {hour}
                      </option>
                    );
                  })}
                </select>
                <p style={{ 
                  margin: 'var(--space-1) 0 0', 
                  fontSize: '0.7rem', 
                  color: 'var(--text-muted)'
                }}>
                  Quando colocar as poubelles na rua
                </p>
              </div>

              <div style={{
                padding: 'var(--space-3)',
                background: 'var(--white)',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--gray-200)'
              }}>
                <label style={{ 
                  fontSize: '0.75rem',
                  fontWeight: '600',
                  color: 'var(--text-primary)',
                  marginBottom: 'var(--space-2)',
                  display: 'block'
                }}>
                  🏠 Hora de Entrada
                </label>
                <select
                  value={localConfig.binsTimeIn}
                  onChange={(e) => updateConfig({ binsTimeIn: e.target.value })}
                  disabled={disabled}
                  style={{
                    width: '100%',
                    padding: 'var(--space-2)',
                    border: '1px solid var(--gray-300)',
                    borderRadius: 'var(--radius)',
                    fontSize: '0.8rem'
                  }}
                >
                  {Array.from({ length: 24 }, (_, i) => {
                    const hour = i.toString().padStart(2, '0') + ':00';
                    return (
                      <option key={hour} value={hour}>
                        {hour}
                      </option>
                    );
                  })}
                </select>
                <p style={{ 
                  margin: 'var(--space-1) 0 0', 
                  fontSize: '0.7rem', 
                  color: 'var(--text-muted)'
                }}>
                  Quando recolher as poubelles (dia seguinte)
                </p>
              </div>
            </div>
          </div>

          {/* Configuração de tipos por dia */}
          {localConfig.binsWeekdays.length > 0 && (
            <div>
              <h5 style={{ 
                margin: '0 0 var(--space-3)', 
                fontSize: '0.8rem', 
                color: 'var(--primary)',
                fontWeight: '600'
              }}>
                🗂️ Tipos de Lixo por Dia
              </h5>
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
                gap: 'var(--space-3)' 
              }}>
                {localConfig.binsWeekdays.map(dayIndex => (
                  <div 
                    key={dayIndex}
                    style={{
                      padding: 'var(--space-3)',
                      background: 'var(--white)',
                      borderRadius: 'var(--radius-lg)',
                      border: '1px solid var(--gray-200)',
                      boxShadow: 'var(--shadow-sm)'
                    }}
                  >
                    <div style={{ 
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: 'var(--space-2)'
                    }}>
                      <h6 style={{ 
                        margin: 0, 
                        fontSize: '0.8rem',
                        color: 'var(--text-primary)',
                        fontWeight: '600'
                      }}>
                        {WEEKDAYS[dayIndex]}
                      </h6>
                      <span style={{
                        fontSize: '0.7rem',
                        color: 'var(--text-muted)'
                      }}>
                        {localConfig.binsTypesMap[dayIndex]?.length || 0} tipo{(localConfig.binsTypesMap[dayIndex]?.length || 0) !== 1 ? 's' : ''}
                      </span>
                    </div>
                    <div style={{ 
                      display: 'grid', 
                      gridTemplateColumns: 'repeat(auto-fit, minmax(70px, 1fr))', 
                      gap: 'var(--space-1)' 
                    }}>
                      {BIN_TYPES.map(binType => {
                        const isSelected = localConfig.binsTypesMap[dayIndex]?.includes(binType) || false;
                        const getTypeColor = (type: string) => {
                          switch (type) {
                            case 'Verde': return '#22c55e';
                            case 'Amarela': return '#eab308';
                            case 'Azul': return '#3b82f6';
                            case 'Vidro': return '#06b6d4';
                            case 'Orgânico': return '#84cc16';
                            case 'Indiferenciado': return '#6b7280';
                            default: return 'var(--gray-400)';
                          }
                        };
                        
                        return (
                          <button
                            key={binType}
                            type="button"
                            onClick={() => toggleBinType(dayIndex, binType)}
                            disabled={disabled}
                            style={{
                              padding: 'var(--space-1)',
                              border: `2px solid ${isSelected ? getTypeColor(binType) : 'var(--gray-300)'}`,
                              background: isSelected ? getTypeColor(binType) : 'var(--white)',
                              color: isSelected ? 'white' : 'var(--text-secondary)',
                              borderRadius: 'var(--radius)',
                              fontSize: '0.65rem',
                              fontWeight: isSelected ? '600' : '500',
                              cursor: 'pointer',
                              transition: 'var(--transition)',
                              textAlign: 'center',
                              lineHeight: 1.2
                            }}
                            title={`${binType} - ${isSelected ? 'Clique para remover' : 'Clique para adicionar'}`}
                          >
                            {binType}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Resumo da agenda */}
          {localConfig.binsSchedule && (
            <div style={{
              padding: 'var(--space-3)',
              background: 'var(--success-bg)',
              border: '1px solid var(--success-light)',
              borderRadius: 'var(--radius-lg)'
            }}>
              <div style={{ 
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-2)',
                marginBottom: 'var(--space-2)'
              }}>
                <span style={{ fontSize: '1rem' }}>📋</span>
                <h6 style={{ 
                  margin: 0, 
                  fontSize: '0.8rem', 
                  color: 'var(--success-dark)',
                  fontWeight: '600'
                }}>
                  Agenda de Recolha
                </h6>
              </div>
              <p style={{ 
                margin: 0, 
                fontSize: '0.75rem', 
                color: 'var(--success-dark)',
                lineHeight: 1.4,
                fontWeight: '500'
              }}>
                {localConfig.binsSchedule}
              </p>
            </div>
          )}

          {/* Estatísticas compactas */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-around',
            padding: 'var(--space-2)',
            background: 'var(--white)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--gray-200)'
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ 
                fontSize: '1.2rem', 
                fontWeight: '700', 
                color: 'var(--primary)',
                lineHeight: 1
              }}>
                {localConfig.binsDays}
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                Dias/semana
              </div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ 
                fontSize: '1.2rem', 
                fontWeight: '700', 
                color: 'var(--accent)',
                lineHeight: 1
              }}>
                {Object.values(localConfig.binsTypesMap).flat().length}
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                Tipos total
              </div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ 
                fontSize: '1.2rem', 
                fontWeight: '700', 
                color: 'var(--success)',
                lineHeight: 1
              }}>
                {new Set(Object.values(localConfig.binsTypesMap).flat()).size}
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                Tipos únicos
              </div>
            </div>
          </div>
        </div>
      )}

      {!localConfig.binsEnabled && (
        <div style={{
          textAlign: 'center',
          padding: 'var(--space-4)',
          background: 'var(--white)',
          borderRadius: 'var(--radius-lg)',
          border: '2px dashed var(--gray-300)'
        }}>
          <div style={{ fontSize: '1.5rem', marginBottom: 'var(--space-2)', opacity: 0.5 }}>🗑️</div>
          <p className="text-muted" style={{ margin: 0, fontSize: '0.8rem' }}>
            Ative a gestão de poubelles para configurar a agenda de recolha de lixo
          </p>
        </div>
      )}
    </div>
  );
}

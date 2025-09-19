import { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../api/client';
import type { Client, Service } from '../types';
import { formatDate } from '../utils/format';
import { useConfirm } from '../components/ConfirmDialog';
import { FilterBar } from '../components/FilterBar';
import { ModernWeeklyCalendar } from '../components/ModernWeeklyCalendar';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { useToast } from '../components/Toast';
import { Icon } from '../components/Icon';
import { useFilters } from '../hooks/useFilters';
import { useExport } from '../hooks/useExport';
import { BinsManager } from '../components/BinsManager';

async function fetchServices() {
  const response = await api.get<Service[]>('/services');
  return response.data;
}

async function fetchClients() {
  const response = await api.get<Client[]>('/clients');
  return response.data;
}

interface ServiceFormState {
  clientId: string;
  category: string;
  freq: string;
  weekday: string;
  time: string;
  notes: string;
  // Campos de poubelles
  binsEnabled: boolean;
  binsDays: number;
  binsWeekdays: number[];
  binsTypes: string[];
  binsTypesMap: Record<number, string[]>;
  binsSchedule: string;
  binsTimeOut: string;
  binsTimeIn: string;
}

const initialServiceState: ServiceFormState = {
  clientId: '',
  category: '',
  freq: '',
  weekday: '',
  time: '',
  notes: '',
  // Campos de poubelles
  binsEnabled: false,
  binsDays: 0,
  binsWeekdays: [],
  binsTypes: [],
  binsTypesMap: {},
  binsSchedule: '',
  binsTimeOut: '20:00',
  binsTimeIn: '06:00',
};

export function ServicesPage() {
  const queryClient = useQueryClient();
  const { data: services, isLoading } = useQuery({ queryKey: ['services'], queryFn: fetchServices });
  const { data: clients } = useQuery({ queryKey: ['clients'], queryFn: fetchClients });
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<ServiceFormState>(initialServiceState);
  const [error, setError] = useState<string | null>(null);
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null);
  const [showCalendar, setShowCalendar] = useState(false);
  const { confirm, ConfirmDialogComponent } = useConfirm();
  const { success, error: showError, ToastContainer } = useToast();
  const { exportServices } = useExport();
  
  const {
    selectedClientId,
    selectedClientType,
    searchTerm,
    setSelectedClientId,
    setSelectedClientType,
    setSearchTerm,
    filteredServices,
    hasActiveFilters,
    totalServices,
    filteredCount
  } = useFilters({ services: services || [], clients: clients || [] });

  // Verificar se há um serviço pendente de conversão de devis
  useEffect(() => {
    const pendingService = sessionStorage.getItem('pendingServiceFromDevis');
    if (pendingService) {
      try {
        const serviceData = JSON.parse(pendingService);
        setForm(serviceData);
        setShowForm(true);
        sessionStorage.removeItem('pendingServiceFromDevis');
      } catch (error) {
        console.error('Erro ao carregar serviço pendente:', error);
      }
    }
  }, []);

  const createService = useMutation({
    mutationFn: async (payload: ServiceFormState) => {
      const response = await api.post('/services', payload);
      return response.data as Service;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
      setForm(initialServiceState);
      setEditingServiceId(null);
      setShowForm(false);
      success('Serviço guardado com sucesso!');
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Não foi possível guardar o serviço.';
      setError(message);
      showError(message);
    },
  });

  const updateService = useMutation({
    mutationFn: async (payload: ServiceFormState & { id: string }) => {
      const response = await api.put(`/services/${payload.id}`, payload);
      return response.data as Service;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
      setForm(initialServiceState);
      setEditingServiceId(null);
      setShowForm(false);
      success('Serviço atualizado com sucesso!');
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Não foi possível atualizar o serviço.';
      setError(message);
      showError(message);
    },
  });

  const deleteService = useMutation({
    mutationFn: async (serviceId: string) => {
      await api.delete(`/services/${serviceId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
      success('Serviço eliminado com sucesso!');
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Não foi possível eliminar o serviço.';
      showError(message);
    },
  });

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!form.clientId) {
      setError('Selecione um cliente.');
      return;
    }
    setError(null);
    
    if (editingServiceId) {
      updateService.mutate({ ...form, id: editingServiceId });
    } else {
      createService.mutate(form);
    }
  }

  function handleEdit(service: Service) {
    setForm({
      clientId: service.clientId,
      category: service.category || '',
      freq: service.freq || '',
      weekday: service.weekday || '',
      time: service.time || '',
      notes: service.notes || '',
      // Campos de poubelles
      binsEnabled: service.binsEnabled || false,
      binsDays: service.binsDays || 0,
      binsWeekdays: service.binsWeekdays || [],
      binsTypes: service.binsTypes || [],
      binsTypesMap: service.binsTypesMap || {},
      binsSchedule: service.binsSchedule || '',
      binsTimeOut: service.binsTimeOut || '20:00',
      binsTimeIn: service.binsTimeIn || '06:00',
    });
    setEditingServiceId(service.id);
    setShowForm(true);
    setError(null);
  }

  function handleCancelEdit() {
    setForm(initialServiceState);
    setEditingServiceId(null);
    setShowForm(false);
    setError(null);
  }

  async function handleDelete(service: Service) {
    const client = clients?.find(c => c.id === service.clientId);
    const clientName = client ? client.name : 'Cliente desconhecido';
    
    const confirmed = await confirm({
      title: 'Eliminar Serviço',
      message: `Tem a certeza que pretende eliminar o serviço de "${clientName}"? Esta ação não pode ser desfeita.`,
      variant: 'danger'
    });
    
    if (confirmed) {
      deleteService.mutate(service.id);
    }
  }

  const noClients = !clients || clients.length === 0;

  return (
    <section className="card">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <h1>Servicos</h1>
        <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
          {services && services.length > 0 && (
            <button 
              className="btn btn-ghost btn-sm" 
              onClick={() => exportServices(services, clients || [])}
              type="button"
              title="Exportar serviços para CSV"
            >
              <Icon name="download" size="sm" />
              Exportar CSV
            </button>
          )}
          <button
            className="btn btn-secondary"
            onClick={() => setShowCalendar(!showCalendar)}
            type="button"
            disabled={!services || services.length === 0}
          >
            <Icon name="calendar" size="sm" />
            {showCalendar ? 'Esconder Calendário' : 'Ver Calendário Semanal'}
          </button>
          <button
            className="btn btn-primary"
            onClick={() => {
              if (showForm) {
                handleCancelEdit();
              } else {
                setShowForm(true);
              }
            }}
            type="button"
            disabled={noClients}
          >
            <Icon name={showForm ? 'x' : 'plus'} size="sm" />
            {showForm ? 'Fechar' : 'Adicionar serviço'}
          </button>
        </div>
      </div>
      {noClients ? <p className="text-muted" style={{ marginTop: '12px' }}>Crie um cliente antes de registar servicos.</p> : null}

      {!noClients && (
        <FilterBar
          clients={clients || []}
          selectedClientId={selectedClientId}
          selectedClientType={selectedClientType}
          searchTerm={searchTerm}
          onClientChange={setSelectedClientId}
          onClientTypeChange={setSelectedClientType}
          onSearchChange={setSearchTerm}
          disabled={isLoading}
        />
      )}

      {showForm ? (
        <div className="card" style={{ marginTop: '20px' }}>
          <h2 style={{ marginTop: 0 }}>
            {editingServiceId ? 'Editar servico' : 'Novo servico'}
          </h2>
          <form onSubmit={handleSubmit} className="form-grid">
            <div>
              <label htmlFor="service-client">Cliente</label>
              <select
                id="service-client"
                required
                value={form.clientId}
                onChange={(event) => setForm((prev) => ({ ...prev, clientId: event.target.value }))}
              >
                <option value="">Selecione...</option>
                {clients?.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="service-category">Categoria</label>
              <select
                id="service-category"
                value={form.category}
                onChange={(event) => setForm((prev) => ({ ...prev, category: event.target.value }))}
              >
                <option value="">Selecione...</option>
                <option value="Limpeza">Limpeza</option>
                <option value="Manutenção">Manutenção</option>
                <option value="Jardinagem">Jardinagem</option>
                <option value="Segurança">Segurança</option>
                <option value="Portaria">Portaria</option>
                <option value="Consultoria">Consultoria</option>
                <option value="Outro">Outro</option>
              </select>
            </div>
            <div>
              <label htmlFor="service-freq">Frequência</label>
              <select
                id="service-freq"
                value={form.freq}
                onChange={(event) => setForm((prev) => ({ ...prev, freq: event.target.value }))}
              >
                <option value="">Selecione...</option>
                <option value="Diária">Diária</option>
                <option value="Semanal">Semanal</option>
                <option value="Quinzenal">Quinzenal</option>
                <option value="Mensal">Mensal</option>
                <option value="Trimestral">Trimestral</option>
                <option value="Pontual">Pontual</option>
                <option value="Sob demanda">Sob demanda</option>
              </select>
            </div>
            <div>
              <label htmlFor="service-weekday">Dia da Semana</label>
              <select
                id="service-weekday"
                value={form.weekday}
                onChange={(event) => setForm((prev) => ({ ...prev, weekday: event.target.value }))}
              >
                <option value="">Selecione...</option>
                <option value="Segunda">Segunda-feira</option>
                <option value="Terça">Terça-feira</option>
                <option value="Quarta">Quarta-feira</option>
                <option value="Quinta">Quinta-feira</option>
                <option value="Sexta">Sexta-feira</option>
                <option value="Sábado">Sábado</option>
                <option value="Domingo">Domingo</option>
              </select>
            </div>
            <div>
              <label htmlFor="service-time">Horário</label>
              <select
                id="service-time"
                value={form.time}
                onChange={(event) => setForm((prev) => ({ ...prev, time: event.target.value }))}
              >
                <option value="">Selecione...</option>
                <option value="07:00">07:00</option>
                <option value="07:30">07:30</option>
                <option value="08:00">08:00</option>
                <option value="08:30">08:30</option>
                <option value="09:00">09:00</option>
                <option value="09:30">09:30</option>
                <option value="10:00">10:00</option>
                <option value="10:30">10:30</option>
                <option value="11:00">11:00</option>
                <option value="11:30">11:30</option>
                <option value="12:00">12:00</option>
                <option value="12:30">12:30</option>
                <option value="13:00">13:00</option>
                <option value="13:30">13:30</option>
                <option value="14:00">14:00</option>
                <option value="14:30">14:30</option>
                <option value="15:00">15:00</option>
                <option value="15:30">15:30</option>
                <option value="16:00">16:00</option>
                <option value="16:30">16:30</option>
                <option value="17:00">17:00</option>
                <option value="17:30">17:30</option>
                <option value="18:00">18:00</option>
                <option value="18:30">18:30</option>
                <option value="19:00">19:00</option>
              </select>
            </div>
            <div style={{ gridColumn: '1/-1' }}>
              <label htmlFor="service-notes">Notas</label>
              <textarea
                id="service-notes"
                rows={3}
                value={form.notes}
                onChange={(event) => setForm((prev) => ({ ...prev, notes: event.target.value }))}
              />
            </div>
            
            <div style={{ gridColumn: '1/-1' }}>
              <BinsManager
                binsConfig={{
                  binsEnabled: form.binsEnabled,
                  binsDays: form.binsDays,
                  binsWeekdays: form.binsWeekdays,
                  binsTypes: form.binsTypes,
                  binsTypesMap: form.binsTypesMap,
                  binsSchedule: form.binsSchedule,
                  binsTimeOut: form.binsTimeOut,
                  binsTimeIn: form.binsTimeIn
                }}
                onBinsConfigChange={(config) => {
                  setForm(prev => ({
                    ...prev,
                    binsEnabled: config.binsEnabled,
                    binsDays: config.binsDays,
                    binsWeekdays: config.binsWeekdays,
                    binsTypes: config.binsTypes,
                    binsTypesMap: config.binsTypesMap,
                    binsSchedule: config.binsSchedule,
                    binsTimeOut: config.binsTimeOut,
                    binsTimeIn: config.binsTimeIn
                  }));
                }}
                disabled={createService.isPending || updateService.isPending}
              />
            </div>
            {error ? (
              <div className="alert" style={{ gridColumn: '1/-1' }}>
                {error}
              </div>
            ) : null}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', gridColumn: '1/-1' }}>
              <button className="btn btn-secondary" type="button" onClick={handleCancelEdit}>
                Cancelar
              </button>
              <button 
                className="btn btn-primary" 
                type="submit" 
                disabled={createService.isPending || updateService.isPending}
              >
                {(createService.isPending || updateService.isPending) 
                  ? 'A guardar...' 
                  : (editingServiceId ? 'Atualizar' : 'Guardar')
                }
              </button>
            </div>
          </form>
        </div>
      ) : null}

      <div style={{ marginTop: '24px' }}>
        {isLoading && !services ? <LoadingSpinner message="A carregar serviços..." /> : null}
        {!isLoading && services && services.length === 0 ? (
          <p className="text-muted">Ainda nao existem servicos registados.</p>
        ) : null}
        
        {services && services.length > 0 && (
          <div style={{ marginBottom: '12px' }}>
            <p className="text-muted" style={{ margin: 0, fontSize: '0.9rem' }}>
              {hasActiveFilters 
                ? `A mostrar ${filteredCount} de ${totalServices} serviços`
                : `Total: ${totalServices} serviços`
              }
            </p>
          </div>
        )}
        
        {showCalendar && services && services.length > 0 && (
          <ModernWeeklyCalendar 
            services={filteredServices} 
            clients={clients || []} 
          />
        )}
        
        {filteredServices && filteredServices.length > 0 ? (
          <table className="table">
            <thead>
              <tr>
                <th>Cliente</th>
                <th>Categoria</th>
                <th>Frequencia</th>
                <th>Dia</th>
                <th>Hora</th>
                <th>Poubelles</th>
                <th>Notas</th>
                <th>Atualizado</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredServices.map((service) => {
                const client = service.client ?? clients?.find((item) => item.id === service.clientId) ?? null;
                return (
                  <tr key={service.id}>
                    <td>{client ? client.name : 'Cliente removido'}</td>
                    <td>{service.category || '-'}</td>
                    <td>{service.freq || '-'}</td>
                    <td>{service.weekday || '-'}</td>
                    <td>{service.time || '-'}</td>
                    <td>
                      {service.binsEnabled ? (
                        <div style={{ minWidth: '140px', maxWidth: '200px' }}>
                          <div style={{ 
                            display: 'flex',
                            alignItems: 'center',
                            gap: 'var(--space-1)',
                            marginBottom: 'var(--space-1)'
                          }}>
                            <span style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '2px',
                              padding: '2px 6px',
                              background: 'var(--success)',
                              color: 'white',
                              borderRadius: 'var(--radius-full)',
                              fontWeight: '600',
                              fontSize: '0.65rem'
                            }}>
                              🗑️ {service.binsDays}
                            </span>
                            <span style={{ 
                              color: 'var(--text-secondary)', 
                              fontSize: '0.65rem',
                              fontWeight: '500'
                            }}>
                              dia{service.binsDays !== 1 ? 's' : ''}
                            </span>
                          </div>
                          {service.binsSchedule && (
                            <div style={{ 
                              padding: 'var(--space-1)',
                              background: 'var(--gray-100)',
                              borderRadius: 'var(--radius)',
                              fontSize: '0.65rem',
                              color: 'var(--text-secondary)',
                              lineHeight: 1.3,
                              fontWeight: '500'
                            }}
                            title={service.binsSchedule}
                            >
                              {service.binsSchedule.length > 40 
                                ? service.binsSchedule.substring(0, 37) + '...'
                                : service.binsSchedule
                              }
                            </div>
                          )}
                          {/* Mostrar tipos únicos como chips pequenos */}
                          {service.binsTypesMap && Object.keys(service.binsTypesMap).length > 0 && (
                            <div style={{ 
                              display: 'flex', 
                              flexWrap: 'wrap', 
                              gap: '2px',
                              marginTop: 'var(--space-1)'
                            }}>
                              {Array.from(new Set(Object.values(service.binsTypesMap).flat())).slice(0, 3).map(type => (
                                <span
                                  key={type}
                                  style={{
                                    padding: '1px 4px',
                                    background: 'var(--primary-light)',
                                    color: 'var(--primary-dark)',
                                    borderRadius: 'var(--radius)',
                                    fontSize: '0.6rem',
                                    fontWeight: '500'
                                  }}
                                >
                                  {type}
                                </span>
                              ))}
                              {Array.from(new Set(Object.values(service.binsTypesMap).flat())).length > 3 && (
                                <span style={{
                                  fontSize: '0.6rem',
                                  color: 'var(--text-muted)'
                                }}>
                                  +{Array.from(new Set(Object.values(service.binsTypesMap).flat())).length - 3}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      ) : (
                        <span style={{ 
                          color: 'var(--text-light)', 
                          fontSize: '0.75rem',
                          fontStyle: 'italic'
                        }}>
                          Sem gestão
                        </span>
                      )}
                    </td>
                    <td>{service.notes || '-'}</td>
                    <td>{formatDate(service.updatedAt) || '-'}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '4px' }}>
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => handleEdit(service)}
                          type="button"
                        >
                          <Icon name="edit" size="sm" />
                          Editar
                        </button>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => handleDelete(service)}
                          type="button"
                          disabled={deleteService.isPending}
                        >
                          <Icon name="trash" size="sm" />
                          {deleteService.isPending ? 'A eliminar...' : 'Eliminar'}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : null}
        
        {services && services.length > 0 && filteredServices.length === 0 && (
          <div className="card" style={{ textAlign: 'center', padding: '24px' }}>
            <p className="text-muted" style={{ margin: '0 0 12px' }}>
              Nenhum serviço encontrado com os filtros aplicados.
            </p>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => {
                setSelectedClientId('');
                setSelectedClientType('');
                setSearchTerm('');
              }}
            >
              Limpar Filtros
            </button>
          </div>
        )}
      </div>
      <ConfirmDialogComponent />
      <ToastContainer />
    </section>
  );
}

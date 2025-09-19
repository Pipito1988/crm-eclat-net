import { useState } from 'react';
import type { FormEvent } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../api/client';
import type { Client, Employee, Devis } from '../types';
import { formatCurrency, formatDate } from '../utils/format';
import { useConfirm } from '../components/ConfirmDialog';
import { EmployeeManager } from '../components/EmployeeManager';
import { DevisManager } from '../components/DevisManager';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { useToast } from '../components/Toast';
import { Icon } from '../components/Icon';
import { useExport } from '../hooks/useExport';

interface ClientFormState {
  name: string;
  clientStatus: 'ATIVO' | 'ESPECULATIVO' | 'INATIVO';
  clientType: string;
  startDate: string;
  serviceAddress: string;
  billingAddress: string;
  value: string;
  frequency: 'MENSAL' | 'SEMANAL' | 'PAGAMENTO_UNICO' | 'OUTRO';
  method: 'TRANSFERENCIA' | 'CHEQUE' | 'DINHEIRO' | 'OUTRO';
  service: string;
  contract: 'COM_CONTRATO' | 'SEM_CONTRATO' | 'A_NEGOCIAR';
}

const initialState: ClientFormState = {
  name: '',
  clientStatus: 'ATIVO',
  clientType: 'Imovel',
  startDate: '',
  serviceAddress: '',
  billingAddress: '',
  value: '0',
  frequency: 'MENSAL',
  method: 'TRANSFERENCIA',
  service: '',
  contract: 'SEM_CONTRATO',
};

async function fetchClients() {
  const response = await api.get<Client[]>('/clients');
  return response.data;
}

export function ClientsPage() {
  const queryClient = useQueryClient();
  const { data: clients, isLoading } = useQuery({ queryKey: ['clients'], queryFn: fetchClients });
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<ClientFormState>(initialState);
  const [error, setError] = useState<string | null>(null);
  const [editingClientId, setEditingClientId] = useState<string | null>(null);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [devis, setDevis] = useState<Devis[]>([]);
  const { confirm, ConfirmDialogComponent } = useConfirm();
  const { success, error: showError, ToastContainer } = useToast();
  const { exportClients } = useExport();

  const createClient = useMutation({
    mutationFn: async (payload: ClientFormState) => {
      const createData = {
        ...payload,
        value: Number(payload.value),
        startDate: payload.startDate ? new Date(payload.startDate).toISOString() : undefined,
        employees: employees.map(emp => ({
          name: emp.name,
          salary: Number(emp.salary) // Converter salary para number
        })),
        devis: devis.map(d => ({
          title: d.title,
          amount: Number(d.amount),
          date: d.date ? new Date(d.date).toISOString() : undefined,
          valid: d.valid ? new Date(d.valid).toISOString() : undefined,
          status: d.status,
          active: d.active,
          notes: d.notes
        })),
      };
      
      const response = await api.post('/clients', createData);
      return response.data as Client;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      setForm(initialState);
      setEmployees([]);
      setDevis([]);
      setShowForm(false);
      setEditingClientId(null);
      success('Cliente guardado com sucesso!');
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Não foi possível guardar o cliente.';
      setError(message);
      showError(message);
    },
  });

  const updateClient = useMutation({
    mutationFn: async (payload: ClientFormState & { id: string }) => {
      const updateData = {
        ...payload,
        value: Number(payload.value),
        startDate: payload.startDate ? new Date(payload.startDate).toISOString() : undefined,
        employees: employees.map(emp => ({
          name: emp.name,
          salary: Number(emp.salary) // Converter salary para number
        })),
        devis: devis.map(d => ({
          title: d.title,
          amount: Number(d.amount),
          date: d.date ? new Date(d.date).toISOString() : undefined,
          valid: d.valid ? new Date(d.valid).toISOString() : undefined,
          status: d.status,
          active: d.active,
          notes: d.notes
        })),
      };
      
      const response = await api.put(`/clients/${payload.id}`, updateData);
      return response.data as Client;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      setForm(initialState);
      setEmployees([]);
      setDevis([]);
      setShowForm(false);
      setEditingClientId(null);
      success('Cliente atualizado com sucesso!');
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Não foi possível atualizar o cliente.';
      setError(message);
      showError(message);
    },
  });

  const deleteClient = useMutation({
    mutationFn: async (clientId: string) => {
      await api.delete(`/clients/${clientId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      success('Cliente eliminado com sucesso!');
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Não foi possível eliminar o cliente.';
      showError(message);
    },
  });

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    
    if (editingClientId) {
      updateClient.mutate({ ...form, id: editingClientId });
    } else {
      createClient.mutate(form);
    }
  }

  function handleEdit(client: Client) {
    setForm({
      name: client.name,
      clientStatus: client.clientStatus,
      clientType: client.clientType,
      startDate: client.startDate ? client.startDate.split('T')[0] : '',
      serviceAddress: client.serviceAddress || '',
      billingAddress: client.billingAddress || '',
      value: client.value,
      frequency: client.frequency,
      method: client.method,
      service: client.service || '',
      contract: client.contract,
    });
    setEmployees(client.employees || []);
    setDevis(client.devis || []);
    setEditingClientId(client.id);
    setShowForm(true);
    setError(null);
  }

  function handleCancelEdit() {
    setForm(initialState);
    setEmployees([]);
    setDevis([]);
    setEditingClientId(null);
    setShowForm(false);
    setError(null);
  }

  async function handleDelete(client: Client) {
    const confirmed = await confirm({
      title: 'Eliminar Cliente',
      message: `Tem a certeza que pretende eliminar o cliente "${client.name}"? Esta ação não pode ser desfeita.`,
      variant: 'danger'
    });
    
    if (confirmed) {
      deleteClient.mutate(client.id);
    }
  }

  async function handleConvertDevisToService(devis: Devis) {
    const confirmed = await confirm({
      title: 'Converter Devis em Serviço',
      message: `Tem a certeza que pretende converter o devis "${devis.title}" num serviço? Será redirecionado para a página de serviços.`,
      variant: 'primary'
    });

    if (confirmed) {
      // Guardar dados do devis no sessionStorage para usar na página de serviços
      const serviceData = {
        clientId: editingClientId || '',
        category: 'Limpeza', // categoria padrão
        freq: 'Semanal', // frequência padrão
        weekday: '',
        time: '',
        notes: `Convertido do devis: ${devis.title} (€${devis.amount})`
      };
      
      sessionStorage.setItem('pendingServiceFromDevis', JSON.stringify(serviceData));
      
      // Navegar para a página de serviços
      window.location.hash = '#services';
      
      // Mostrar feedback
      alert(`Devis "${devis.title}" será convertido em serviço. Complete os detalhes na página de Serviços.`);
    }
  }

  return (
    <section className="card">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <h1>Clientes</h1>
        <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'center' }}>
          {clients && clients.length > 0 && (
            <button 
              className="btn btn-ghost btn-sm" 
              onClick={() => exportClients(clients)}
              type="button"
              title="Exportar clientes para CSV"
            >
              <Icon name="download" size="sm" />
              Exportar CSV
            </button>
          )}
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
          >
            <Icon name={showForm ? 'x' : 'plus'} size="sm" />
            {showForm ? 'Fechar' : 'Adicionar cliente'}
          </button>
        </div>
      </div>

      {showForm ? (
        <div className="card" style={{ marginTop: '20px' }}>
          <h2 style={{ marginTop: 0 }}>
            {editingClientId ? 'Editar cliente' : 'Novo cliente'}
          </h2>
          <form onSubmit={handleSubmit} className="form-grid">
            <div>
              <label htmlFor="client-name">Nome</label>
              <input
                id="client-name"
                required
                value={form.name}
                onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
              />
            </div>
            <div>
              <label htmlFor="client-status">Estado</label>
              <select
                id="client-status"
                value={form.clientStatus}
                onChange={(event) => setForm((prev) => ({ ...prev, clientStatus: event.target.value as ClientFormState['clientStatus'] }))}
              >
                <option value="ATIVO">Ativo</option>
                <option value="ESPECULATIVO">Especulativo</option>
                <option value="INATIVO">Inativo</option>
              </select>
            </div>
            <div>
              <label htmlFor="client-type">Tipo</label>
              <input
                id="client-type"
                value={form.clientType}
                onChange={(event) => setForm((prev) => ({ ...prev, clientType: event.target.value }))}
              />
            </div>
            <div>
              <label htmlFor="client-date">Data de inicio</label>
              <input
                id="client-date"
                type="date"
                value={form.startDate}
                onChange={(event) => setForm((prev) => ({ ...prev, startDate: event.target.value }))}
              />
            </div>
            <div className="form-grid" style={{ gridColumn: '1/-1' }}>
              <div>
                <label htmlFor="service-address">Morada do servico</label>
                <input
                  id="service-address"
                  value={form.serviceAddress}
                  onChange={(event) => setForm((prev) => ({ ...prev, serviceAddress: event.target.value }))}
                />
              </div>
              <div>
                <label htmlFor="billing-address">Morada de faturacao</label>
                <input
                  id="billing-address"
                  value={form.billingAddress}
                  onChange={(event) => setForm((prev) => ({ ...prev, billingAddress: event.target.value }))}
                />
              </div>
            </div>
            <div>
              <label htmlFor="client-value">Valor mensal (EUR)</label>
              <input
                id="client-value"
                type="number"
                min="0"
                step="0.01"
                value={form.value}
                onChange={(event) => setForm((prev) => ({ ...prev, value: event.target.value }))}
              />
            </div>
            <div>
              <label htmlFor="client-frequency">Frequencia</label>
              <select
                id="client-frequency"
                value={form.frequency}
                onChange={(event) => setForm((prev) => ({ ...prev, frequency: event.target.value as ClientFormState['frequency'] }))}
              >
                <option value="MENSAL">Mensal</option>
                <option value="SEMANAL">Semanal</option>
                <option value="PAGAMENTO_UNICO">Pagamento unico</option>
                <option value="OUTRO">Outro</option>
              </select>
            </div>
            <div>
              <label htmlFor="client-method">Metodo</label>
              <select
                id="client-method"
                value={form.method}
                onChange={(event) => setForm((prev) => ({ ...prev, method: event.target.value as ClientFormState['method'] }))}
              >
                <option value="TRANSFERENCIA">Transferencia</option>
                <option value="CHEQUE">Cheque</option>
                <option value="DINHEIRO">Dinheiro</option>
                <option value="OUTRO">Outro</option>
              </select>
            </div>
            <div style={{ gridColumn: '1/-1' }}>
              <label htmlFor="client-service">Descricao do servico</label>
              <textarea
                id="client-service"
                rows={3}
                value={form.service}
                onChange={(event) => setForm((prev) => ({ ...prev, service: event.target.value }))}
              />
            </div>
            
            <div style={{ gridColumn: '1/-1' }}>
              <EmployeeManager 
                employees={employees}
                onEmployeesChange={setEmployees}
                disabled={createClient.isPending || updateClient.isPending}
              />
            </div>
            
            <div style={{ gridColumn: '1/-1' }}>
              <DevisManager 
                devis={devis}
                onDevisChange={setDevis}
                disabled={createClient.isPending || updateClient.isPending}
                onConvertToService={handleConvertDevisToService}
              />
            </div>
            <div>
              <label htmlFor="client-contract">Contrato</label>
              <select
                id="client-contract"
                value={form.contract}
                onChange={(event) => setForm((prev) => ({ ...prev, contract: event.target.value as ClientFormState['contract'] }))}
              >
                <option value="COM_CONTRATO">Com contrato</option>
                <option value="SEM_CONTRATO">Sem contrato</option>
                <option value="A_NEGOCIAR">A negociar</option>
              </select>
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
                disabled={createClient.isPending || updateClient.isPending}
              >
                {(createClient.isPending || updateClient.isPending) 
                  ? 'A guardar...' 
                  : (editingClientId ? 'Atualizar' : 'Guardar')
                }
              </button>
            </div>
          </form>
        </div>
      ) : null}

      <div style={{ marginTop: '24px' }}>
        {isLoading && !clients ? (
          <LoadingSpinner message="A carregar clientes..." />
        ) : null}
        {!isLoading && clients && clients.length === 0 ? (
          <p className="text-muted">Ainda nao existem clientes registados.</p>
        ) : null}
        {clients && clients.length > 0 ? (
          <div className="list-grid">
            {clients.map((client) => (
              <div className="card" key={client.id}>
                <h3 style={{ marginTop: 0 }}>
                  {client.name}{' '}
                  <span className="chip">{client.clientStatus}</span>{' '}
                  <span className="chip">{client.clientType}</span>
                </h3>
                <p>
                  <strong>Valor:</strong> {formatCurrency(client.value)} ({client.frequency.toLowerCase()}) via {client.method.toLowerCase()}
                </p>
                {client.service ? (
                  <p>
                    <strong>Servico:</strong> {client.service}
                  </p>
                ) : null}
                {client.serviceAddress ? (
                  <p>
                    <strong>Morada:</strong> {client.serviceAddress}
                  </p>
                ) : null}
                {client.billingAddress ? (
                  <p>
                    <strong>Faturacao:</strong> {client.billingAddress}
                  </p>
                ) : null}
                {client.startDate ? (
                  <p>
                    <strong>Inicio:</strong> {formatDate(client.startDate)}
                  </p>
                ) : null}
                <p>
                  <strong>Contrato:</strong> {client.contract}
                </p>
                <p>
                  <strong>Empregados:</strong> {client.employees.length}
                </p>
                <p>
                  <strong>Devis ativos:</strong> {client.devis.filter((devis) => devis.active).length} / {client.devis.length}
                </p>
                <div className="card-actions">
                  <button 
                    className="btn btn-secondary btn-sm" 
                    onClick={() => handleEdit(client)}
                    type="button"
                  >
                    <Icon name="edit" size="sm" />
                    Editar
                  </button>
                  <button 
                    className="btn btn-danger btn-sm" 
                    onClick={() => handleDelete(client)}
                    type="button"
                    disabled={deleteClient.isPending}
                  >
                    <Icon name="trash" size="sm" />
                    {deleteClient.isPending ? 'A eliminar...' : 'Eliminar'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : null}
      </div>
      <ConfirmDialogComponent />
      <ToastContainer />
    </section>
  );
}

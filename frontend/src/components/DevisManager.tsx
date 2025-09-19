import { useState } from 'react';
import type { Devis, DevisStatus } from '../types';
import { formatCurrency, formatDate } from '../utils/format';
import { useConfirm } from './ConfirmDialog';

interface DevisManagerProps {
  devis: Devis[];
  onDevisChange: (devis: Devis[]) => void;
  disabled?: boolean;
  onConvertToService?: (devis: Devis) => void;
}

interface DevisFormState {
  title: string;
  amount: string;
  date: string;
  valid: string;
  status: DevisStatus;
  active: boolean;
  notes: string;
}

const initialDevisState: DevisFormState = {
  title: '',
  amount: '0',
  date: '',
  valid: '',
  status: 'ENVIADO',
  active: true,
  notes: ''
};

export function DevisManager({ devis, onDevisChange, disabled = false, onConvertToService }: DevisManagerProps) {
  const [form, setForm] = useState<DevisFormState>(initialDevisState);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const { confirm, ConfirmDialogComponent } = useConfirm();

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    
    if (!form.title.trim()) {
      alert('Por favor, indique o título/descrição do devis.');
      return;
    }

    const amount = parseFloat(form.amount.replace(',', '.'));
    if (!isFinite(amount) || amount < 0) {
      alert('Por favor, indique um valor válido.');
      return;
    }

    const newDevis: Devis = {
      id: editingIndex !== null ? devis[editingIndex].id : String(Date.now()),
      title: form.title.trim(),
      amount: amount.toFixed(2),
      date: form.date || null,
      valid: form.valid || null,
      status: form.status,
      active: form.active,
      notes: form.notes.trim() || null
    };

    let updatedDevis: Devis[];
    if (editingIndex !== null) {
      // Editar devis existente
      updatedDevis = devis.map((dev, index) => 
        index === editingIndex ? newDevis : dev
      );
      setEditingIndex(null);
    } else {
      // Adicionar novo devis
      updatedDevis = [...devis, newDevis];
    }

    onDevisChange(updatedDevis);
    setForm(initialDevisState);
  }

  function handleEdit(index: number) {
    const devisItem = devis[index];
    setForm({
      title: devisItem.title,
      amount: devisItem.amount,
      date: devisItem.date || '',
      valid: devisItem.valid || '',
      status: devisItem.status,
      active: devisItem.active,
      notes: devisItem.notes || ''
    });
    setEditingIndex(index);
  }

  function handleCancelEdit() {
    setForm(initialDevisState);
    setEditingIndex(null);
  }

  async function handleDelete(index: number) {
    const devisItem = devis[index];
    const confirmed = await confirm({
      title: 'Eliminar Devis',
      message: `Tem a certeza que pretende eliminar o devis "${devisItem.title}"?`,
      variant: 'danger'
    });

    if (confirmed) {
      const updatedDevis = devis.filter((_, i) => i !== index);
      onDevisChange(updatedDevis);
    }
  }

  function getStatusColor(status: DevisStatus): string {
    switch (status) {
      case 'ACEITE': return '#28a745';
      case 'RECUSADO': return '#dc3545';
      case 'ENVIADO': return '#007bff';
      case 'RASCUNHO': return '#6c757d';
      default: return '#6c757d';
    }
  }

  function getStatusLabel(status: DevisStatus): string {
    switch (status) {
      case 'ACEITE': return 'Aceite';
      case 'RECUSADO': return 'Recusado';
      case 'ENVIADO': return 'Enviado';
      case 'RASCUNHO': return 'Rascunho';
      default: return status;
    }
  }

  return (
    <fieldset className="block">
      <legend>Devis (Orçamentos)</legend>
      
      <div className="form-grid">
        <div>
          <label htmlFor="devis-title">Título / Descrição</label>
          <input
            id="devis-title"
            value={form.title}
            onChange={(e) => setForm(prev => ({ ...prev, title: e.target.value }))}
            placeholder="Ex.: Limpeza semanal edifício X"
            disabled={disabled}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleSubmit(e as any);
              }
            }}
          />
        </div>
        <div>
          <label htmlFor="devis-amount">Valor (€)</label>
          <input
            id="devis-amount"
            type="number"
            min="0"
            step="0.01"
            value={form.amount}
            onChange={(e) => setForm(prev => ({ ...prev, amount: e.target.value }))}
            placeholder="Ex.: 350.00"
            disabled={disabled}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleSubmit(e as any);
              }
            }}
          />
        </div>
        <div>
          <label htmlFor="devis-date">Data</label>
          <input
            id="devis-date"
            type="date"
            value={form.date}
            onChange={(e) => setForm(prev => ({ ...prev, date: e.target.value }))}
            disabled={disabled}
          />
        </div>
        <div>
          <label htmlFor="devis-valid">Validade (até)</label>
          <input
            id="devis-valid"
            type="date"
            value={form.valid}
            onChange={(e) => setForm(prev => ({ ...prev, valid: e.target.value }))}
            disabled={disabled}
          />
        </div>
        <div>
          <label htmlFor="devis-status">Estado</label>
          <select
            id="devis-status"
            value={form.status}
            onChange={(e) => setForm(prev => ({ ...prev, status: e.target.value as DevisStatus }))}
            disabled={disabled}
          >
            <option value="ENVIADO">Enviado</option>
            <option value="ACEITE">Aceite</option>
            <option value="RECUSADO">Recusado</option>
            <option value="RASCUNHO">Rascunho</option>
          </select>
        </div>
        <div>
          <label htmlFor="devis-active">Ativo?</label>
          <select
            id="devis-active"
            value={form.active ? 'true' : 'false'}
            onChange={(e) => setForm(prev => ({ ...prev, active: e.target.value === 'true' }))}
            disabled={disabled}
          >
            <option value="true">Sim</option>
            <option value="false">Não</option>
          </select>
        </div>
        <div style={{ gridColumn: '1/-1' }}>
          <label htmlFor="devis-notes">Notas</label>
          <textarea
            id="devis-notes"
            rows={2}
            value={form.notes}
            onChange={(e) => setForm(prev => ({ ...prev, notes: e.target.value }))}
            placeholder="Observações internas / condições"
            disabled={disabled}
          />
        </div>
        <div style={{ gridColumn: '1/-1', alignSelf: 'end' }}>
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
            {editingIndex !== null && (
              <button 
                type="button" 
                className="btn btn-secondary"
                onClick={handleCancelEdit}
                disabled={disabled}
              >
                Cancelar
              </button>
            )}
            <button 
              type="button" 
              className="btn btn-primary"
              onClick={handleSubmit}
              disabled={disabled}
            >
              {editingIndex !== null ? 'Atualizar Devis' : 'Adicionar Devis'}
            </button>
          </div>
        </div>
      </div>

      {devis.length === 0 ? (
        <p className="text-muted" style={{ margin: '12px 0 0' }}>
          Ainda não foram adicionados devis.
        </p>
      ) : (
        <div style={{ marginTop: '12px' }}>
          <h4 style={{ margin: '0 0 8px', fontSize: '0.9rem', color: 'var(--primary)' }}>
            Lista de Devis ({devis.length})
          </h4>
          <div style={{ display: 'grid', gap: '12px' }}>
            {devis.map((devisItem, index) => (
              <div
                key={devisItem.id}
                className="card"
                style={{
                  padding: '12px',
                  border: editingIndex === index ? '2px solid var(--primary)' : '1px solid #e5e5e5'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                  <div style={{ flex: 1 }}>
                    <h5 style={{ margin: '0 0 4px', fontSize: '1rem' }}>
                      {devisItem.title}
                    </h5>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '4px' }}>
                      <span 
                        className="chip" 
                        style={{ 
                          backgroundColor: getStatusColor(devisItem.status), 
                          color: 'white',
                          fontWeight: 'bold'
                        }}
                      >
                        {getStatusLabel(devisItem.status)}
                      </span>
                      <span className={`chip ${devisItem.active ? 'status-ok' : 'text-muted'}`}>
                        {devisItem.active ? 'Ativo' : 'Inativo'}
                      </span>
                      <span style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>
                        {formatCurrency(parseFloat(devisItem.amount))}
                      </span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    {devisItem.status === 'ACEITE' && onConvertToService && (
                      <button
                        type="button"
                        className="btn btn-primary"
                        onClick={() => onConvertToService(devisItem)}
                        disabled={disabled}
                        style={{ fontSize: '0.8rem', padding: '4px 8px' }}
                        title="Converter em serviço"
                      >
                        → Serviço
                      </button>
                    )}
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => handleEdit(index)}
                      disabled={disabled}
                      style={{ fontSize: '0.8rem', padding: '4px 8px' }}
                    >
                      Editar
                    </button>
                    <button
                      type="button"
                      className="btn btn-danger"
                      onClick={() => handleDelete(index)}
                      disabled={disabled}
                      style={{ fontSize: '0.8rem', padding: '4px 8px' }}
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
                
                <div style={{ fontSize: '0.85rem', color: '#666' }}>
                  {devisItem.date && (
                    <span><strong>Data:</strong> {formatDate(devisItem.date)} </span>
                  )}
                  {devisItem.valid && (
                    <span><strong>Validade:</strong> {formatDate(devisItem.valid)}</span>
                  )}
                </div>
                
                {devisItem.notes && (
                  <div style={{ 
                    marginTop: '8px', 
                    padding: '8px', 
                    backgroundColor: '#f8f9fa', 
                    borderRadius: '4px',
                    fontSize: '0.85rem'
                  }}>
                    <strong>Notas:</strong> {devisItem.notes}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{ marginTop: '8px' }}>
        <p className="text-muted" style={{ fontSize: '0.85rem', margin: 0 }}>
          <strong>Total devis ativos:</strong> {formatCurrency(
            devis.filter(d => d.active).reduce((sum, d) => sum + parseFloat(d.amount), 0)
          )} ({devis.filter(d => d.active).length} de {devis.length})
        </p>
        <p className="text-muted" style={{ fontSize: '0.8rem', margin: '4px 0 0' }}>
          Os devis não entram nos cálculos do dashboard. Use o botão "→ Serviço" para converter devis aceites em serviços.
        </p>
      </div>

      <ConfirmDialogComponent />
    </fieldset>
  );
}

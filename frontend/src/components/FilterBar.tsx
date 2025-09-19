import type { Client } from '../types';

interface FilterBarProps {
  clients: Client[];
  selectedClientId: string;
  selectedClientType: string;
  searchTerm: string;
  onClientChange: (clientId: string) => void;
  onClientTypeChange: (clientType: string) => void;
  onSearchChange: (searchTerm: string) => void;
  disabled?: boolean;
}

export function FilterBar({
  clients,
  selectedClientId,
  selectedClientType,
  searchTerm,
  onClientChange,
  onClientTypeChange,
  onSearchChange,
  disabled = false
}: FilterBarProps) {
  const clientTypes = Array.from(new Set(clients.map(client => client.clientType))).sort();

  return (
    <div className="card" style={{ marginTop: 'var(--space-4)', padding: 'var(--space-4)' }}>
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        marginBottom: 'var(--space-3)'
      }}>
        <h3 style={{ margin: 0, fontSize: '0.875rem', color: 'var(--primary)', fontWeight: '600' }}>
          🔍 Filtros e Pesquisa
        </h3>
        {(selectedClientId || selectedClientType || searchTerm) && (
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={() => {
              onClientChange('');
              onClientTypeChange('');
              onSearchChange('');
            }}
            disabled={disabled}
          >
            Limpar Filtros
          </button>
        )}
      </div>
      <div className="form-grid">
        <div>
          <label htmlFor="search-term">Pesquisar</label>
          <input
            id="search-term"
            type="text"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Pesquisar por cliente, categoria, notas..."
            disabled={disabled}
          />
        </div>
        <div>
          <label htmlFor="filter-client">Filtrar por Cliente</label>
          <select
            id="filter-client"
            value={selectedClientId}
            onChange={(e) => onClientChange(e.target.value)}
            disabled={disabled}
          >
            <option value="">— Todos os clientes —</option>
            {clients.map((client) => (
              <option key={client.id} value={client.id}>
                {client.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="filter-type">Filtrar por Tipo de Cliente</label>
          <select
            id="filter-type"
            value={selectedClientType}
            onChange={(e) => onClientTypeChange(e.target.value)}
            disabled={disabled}
          >
            <option value="">— Todos os tipos —</option>
            {clientTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>
      </div>
      
      {(selectedClientId || selectedClientType || searchTerm) && (
        <div style={{ 
          marginTop: 'var(--space-3)', 
          padding: 'var(--space-2) var(--space-3)', 
          background: 'var(--primary-bg)', 
          border: '1px solid var(--primary-light)',
          borderRadius: 'var(--radius-lg)',
          fontSize: '0.8rem',
          color: 'var(--primary-dark)',
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-2)',
          flexWrap: 'wrap'
        }}>
          <span style={{ fontWeight: '500' }}>Filtros ativos:</span>
          {searchTerm && (
            <span className="chip" style={{ 
              background: 'var(--primary)', 
              color: 'white',
              fontSize: '0.75rem'
            }}>
              🔍 "{searchTerm}"
            </span>
          )}
          {selectedClientId && (
            <span className="chip" style={{ 
              background: 'var(--accent)', 
              color: 'white',
              fontSize: '0.75rem'
            }}>
              👤 {clients.find(c => c.id === selectedClientId)?.name}
            </span>
          )}
          {selectedClientType && (
            <span className="chip" style={{ 
              background: 'var(--info)', 
              color: 'white',
              fontSize: '0.75rem'
            }}>
              🏢 {selectedClientType}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

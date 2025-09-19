import { useQuery } from '@tanstack/react-query';
import { api } from '../api/client';
import type { Client, StatsResponse } from '../types';
import { formatCurrency } from '../utils/format';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { StatsCard } from '../components/StatsCard';
import { Icon } from '../components/Icon';
import { useExport } from '../hooks/useExport';

async function fetchStats() {
  const response = await api.get<StatsResponse>('/stats/monthly');
  return response.data;
}

async function fetchClients() {
  const response = await api.get<Client[]>('/clients');
  return response.data;
}

export function DashboardPage() {
  const { data: stats, isLoading: loadingStats } = useQuery({ queryKey: ['stats'], queryFn: fetchStats });
  const { data: clients, isLoading: loadingClients } = useQuery({ queryKey: ['clients'], queryFn: fetchClients });
  const { exportFullReport } = useExport();

  const totalClients = clients?.length ?? 0;
  const activeClients = clients?.filter((client) => client.clientStatus === 'ATIVO').length ?? 0;
  const devisActive =
    clients?.reduce((sum, client) => sum + client.devis.filter((devis) => devis.active).length, 0) ?? 0;

  return (
    <div style={{ display: 'grid', gap: 'var(--space-6)' }}>
      {/* Header Section */}
      <div className="card" style={{ 
        background: 'linear-gradient(135deg, var(--primary-bg) 0%, var(--accent-light) 100%)',
        border: '1px solid var(--primary-light)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
          <div style={{ 
            padding: 'var(--space-3)',
            background: 'var(--primary)',
            borderRadius: 'var(--radius-xl)',
            color: 'white',
            fontSize: '1.5rem'
          }}>
            📊
          </div>
          <div style={{ flex: 1 }}>
            <h1 style={{ marginBottom: 'var(--space-1)' }}>Dashboard Financeiro</h1>
            <p className="text-muted">Resumo financeiro mensal com base nos clientes registados.</p>
          </div>
          {(clients && clients.length > 0) && (
            <button 
              className="btn btn-primary btn-sm" 
              onClick={() => exportFullReport(clients, [])}
              type="button"
              title="Exportar relatório completo"
            >
              <Icon name="download" size="sm" />
              Relatório Completo
            </button>
          )}
        </div>
      </div>

      {/* Stats Section */}
      <section>
        {loadingStats || !stats ? (
          <div className="card">
            <LoadingSpinner message="A carregar estatísticas..." />
          </div>
        ) : (
          <div className="stat-grid">
            <StatsCard
              title="Total Faturado (Bruto)"
              value={formatCurrency(stats.billed)}
              icon="trending_up"
              variant="info"
            />
            <StatsCard
              title="Impostos URSSAF (23,8%)"
              value={formatCurrency(stats.urssaf)}
              icon="building"
              variant="warning"
            />
            <StatsCard
              title="Custos com Empregados"
              value={formatCurrency(stats.costs)}
              icon="users"
              variant="danger"
            />
            <StatsCard
              title="Lucro Bruto"
              value={formatCurrency(stats.gross)}
              icon="euro"
              variant="default"
            />
            <StatsCard
              title="Lucro Líquido"
              value={formatCurrency(stats.net)}
              icon="check"
              variant="success"
            />
          </div>
        )}
      </section>

      {/* Quick Indicators */}
      <div className="card">
        <h3 style={{ 
          marginBottom: 'var(--space-4)', 
          display: 'flex', 
          alignItems: 'center', 
          gap: 'var(--space-2)',
          fontSize: '1.125rem'
        }}>
          ⚡ Indicadores Rápidos
        </h3>
        {loadingClients && !clients ? (
          <LoadingSpinner message="A carregar clientes..." />
        ) : null}
        {!loadingClients && clients && clients.length === 0 ? (
          <div style={{ 
            textAlign: 'center', 
            padding: 'var(--space-8)',
            background: 'var(--gray-50)',
            borderRadius: 'var(--radius-lg)',
            border: '2px dashed var(--gray-300)'
          }}>
            <div style={{ fontSize: '3rem', marginBottom: 'var(--space-2)' }}>📊</div>
            <p className="text-muted" style={{ fontSize: '1rem' }}>
              Ainda não existem clientes registados.
            </p>
            <p className="text-muted" style={{ fontSize: '0.875rem' }}>
              Comece por adicionar o seu primeiro cliente para ver as estatísticas.
            </p>
          </div>
        ) : null}
        {clients && clients.length > 0 ? (
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
            gap: 'var(--space-4)' 
          }}>
            <div style={{ 
              padding: 'var(--space-4)',
              background: 'var(--info-bg)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--info-light)',
              textAlign: 'center',
              transition: 'var(--transition)'
            }}>
              <div style={{ fontSize: '2rem', marginBottom: 'var(--space-1)' }}>👥</div>
              <div style={{ fontSize: '1.75rem', fontWeight: '700', color: 'var(--info)', marginBottom: 'var(--space-1)' }}>
                {totalClients}
              </div>
              <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                Clientes registados
              </div>
            </div>
            <div style={{ 
              padding: 'var(--space-4)',
              background: 'var(--success-bg)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--success-light)',
              textAlign: 'center',
              transition: 'var(--transition)'
            }}>
              <div style={{ fontSize: '2rem', marginBottom: 'var(--space-1)' }}>✅</div>
              <div style={{ fontSize: '1.75rem', fontWeight: '700', color: 'var(--success)', marginBottom: 'var(--space-1)' }}>
                {activeClients}
              </div>
              <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                Clientes ativos
              </div>
            </div>
            <div style={{ 
              padding: 'var(--space-4)',
              background: 'var(--warning-bg)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--warning-light)',
              textAlign: 'center',
              transition: 'var(--transition)'
            }}>
              <div style={{ fontSize: '2rem', marginBottom: 'var(--space-1)' }}>📋</div>
              <div style={{ fontSize: '1.75rem', fontWeight: '700', color: 'var(--warning)', marginBottom: 'var(--space-1)' }}>
                {devisActive}
              </div>
              <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                Devis ativos
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
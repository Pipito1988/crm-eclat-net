import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useConfirm } from './ConfirmDialog';

interface DevToolsProps {
  show?: boolean;
}

export function DevTools({ show = false }: DevToolsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const queryClient = useQueryClient();
  const { confirm, ConfirmDialogComponent } = useConfirm();

  const clearCacheMutation = useMutation({
    mutationFn: async () => {
      // Simular limpeza de cache
      await new Promise(resolve => setTimeout(resolve, 500));
    },
    onSuccess: () => {
      queryClient.invalidateQueries();
      queryClient.clear();
    }
  });

  const handleClearCache = async () => {
    const confirmed = await confirm({
      title: 'Limpar Cache',
      message: 'Tem a certeza que pretende limpar todo o cache da aplicação? Os dados serão recarregados do servidor.',
      variant: 'primary'
    });

    if (confirmed) {
      clearCacheMutation.mutate();
    }
  };

  const handleResetLocalStorage = async () => {
    const confirmed = await confirm({
      title: 'Reset Local Storage',
      message: 'Tem a certeza que pretende limpar todos os dados locais? Isto irá terminar a sua sessão.',
      variant: 'danger'
    });

    if (confirmed) {
      localStorage.clear();
      sessionStorage.clear();
      window.location.reload();
    }
  };

  const handleExportLogs = () => {
    const logs = {
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      localStorage: { ...localStorage },
      sessionStorage: { ...sessionStorage },
      queryCache: queryClient.getQueryCache().getAll().map(query => ({
        queryKey: query.queryKey,
        state: query.state.status,
        dataUpdatedAt: query.state.dataUpdatedAt,
        error: query.state.error?.message
      }))
    };

    const blob = new Blob([JSON.stringify(logs, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `crm-debug-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.json`;
    document.body.appendChild(link);
    link.click();
    setTimeout(() => {
      URL.revokeObjectURL(url);
      document.body.removeChild(link);
    }, 100);
  };

  if (!show) return null;

  return (
    <>
      <div style={{
        position: 'fixed',
        bottom: '20px',
        left: '20px',
        zIndex: 1000
      }}>
        <button
          className="btn btn-secondary"
          onClick={() => setIsOpen(!isOpen)}
          style={{
            borderRadius: '50%',
            width: '48px',
            height: '48px',
            fontSize: '18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          title="Ferramentas de desenvolvimento"
        >
          🔧
        </button>

        {isOpen && (
          <div style={{
            position: 'absolute',
            bottom: '60px',
            left: '0',
            backgroundColor: 'white',
            border: '1px solid #ddd',
            borderRadius: '8px',
            padding: '12px',
            minWidth: '200px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
          }}>
            <h4 style={{ margin: '0 0 12px', fontSize: '0.9rem', color: 'var(--primary)' }}>
              Dev Tools
            </h4>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <button
                className="btn btn-ghost"
                onClick={handleClearCache}
                disabled={clearCacheMutation.isPending}
                style={{ fontSize: '0.8rem', padding: '6px 8px', textAlign: 'left' }}
              >
                {clearCacheMutation.isPending ? 'A limpar...' : '🗑️ Limpar Cache'}
              </button>

              <button
                className="btn btn-ghost"
                onClick={handleExportLogs}
                style={{ fontSize: '0.8rem', padding: '6px 8px', textAlign: 'left' }}
              >
                📄 Exportar Logs
              </button>

              <button
                className="btn btn-danger"
                onClick={handleResetLocalStorage}
                style={{ fontSize: '0.8rem', padding: '6px 8px', textAlign: 'left' }}
              >
                ⚠️ Reset Total
              </button>
            </div>

            <div style={{ 
              marginTop: '8px', 
              paddingTop: '8px', 
              borderTop: '1px solid #eee',
              fontSize: '0.7rem',
              color: '#666'
            }}>
              Cache: {queryClient.getQueryCache().getAll().length} queries
            </div>
          </div>
        )}
      </div>
      <ConfirmDialogComponent />
    </>
  );
}

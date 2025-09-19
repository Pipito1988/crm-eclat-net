import { useState } from 'react';
import type { Client, Service } from '../types';
import { useExport } from '../hooks/useExport';
import { Icon } from './Icon';

interface ExportButtonsProps {
  clients?: Client[];
  services?: Service[];
  showClientExport?: boolean;
  showServiceExport?: boolean;
  showFullReport?: boolean;
  disabled?: boolean;
}

export function ExportButtons({
  clients = [],
  services = [],
  showClientExport = true,
  showServiceExport = true,
  showFullReport = true,
  disabled = false
}: ExportButtonsProps) {
  const [exporting, setExporting] = useState<string | null>(null);
  const { exportClients, exportServices, exportFullReport } = useExport();

  const handleExportClients = async () => {
    if (!clients.length) return;
    setExporting('clients');
    try {
      exportClients(clients);
    } finally {
      setTimeout(() => setExporting(null), 1000);
    }
  };

  const handleExportServices = async () => {
    if (!services.length) return;
    setExporting('services');
    try {
      exportServices(services, clients);
    } finally {
      setTimeout(() => setExporting(null), 1000);
    }
  };

  const handleExportFullReport = async () => {
    if (!clients.length && !services.length) return;
    setExporting('report');
    try {
      exportFullReport(clients, services);
    } finally {
      setTimeout(() => setExporting(null), 1000);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div style={{ 
      display: 'flex', 
      gap: 'var(--space-2)', 
      flexWrap: 'wrap', 
      alignItems: 'center',
      marginRight: 'var(--space-4)'
    }}>
      {showClientExport && (
        <button
          className="btn btn-ghost"
          onClick={handleExportClients}
          disabled={disabled || !clients.length || exporting === 'clients'}
          type="button"
          title="Exportar lista de clientes para CSV"
        >
          <Icon name="download" size="sm" />
          {exporting === 'clients' ? 'A exportar...' : 'CSV Clientes'}
        </button>
      )}

      {showServiceExport && (
        <button
          className="btn btn-ghost"
          onClick={handleExportServices}
          disabled={disabled || !services.length || exporting === 'services'}
          type="button"
          title="Exportar lista de serviços para CSV"
        >
          <Icon name="download" size="sm" />
          {exporting === 'services' ? 'A exportar...' : 'CSV Serviços'}
        </button>
      )}

      {showFullReport && (clients.length > 0 || services.length > 0) && (
        <button
          className="btn btn-ghost"
          onClick={handleExportFullReport}
          disabled={disabled || exporting === 'report'}
          type="button"
          title="Exportar relatório completo com estatísticas"
        >
          <Icon name="download" size="sm" />
          {exporting === 'report' ? 'A exportar...' : 'Relatório Completo'}
        </button>
      )}

      <button
        className="btn btn-ghost"
        onClick={handlePrint}
        disabled={disabled}
        type="button"
        title="Imprimir página atual ou salvar como PDF"
      >
        <Icon name="printer" size="sm" />
        Imprimir/PDF
      </button>

      {(clients.length === 0 && services.length === 0) && (
        <span className="text-muted" style={{ fontSize: '0.8rem' }}>
          Sem dados para exportar
        </span>
      )}
    </div>
  );
}

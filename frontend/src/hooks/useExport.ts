import type { Client, Service } from '../types';

export function useExport() {
  // Função para converter dados para CSV
  const toCSV = (rows: string[][]): string => {
    return rows.map(row => 
      row.map(cell => {
        // Escapar aspas e adicionar aspas se necessário
        const cellStr = (cell == null) ? '' : String(cell);
        if (cellStr.search(/("|,|\n)/g) >= 0) {
          return '"' + cellStr.replace(/"/g, '""') + '"';
        }
        return cellStr;
      }).join(',')
    ).join('\n');
  };

  // Função para fazer download do arquivo
  const downloadFile = (filename: string, content: string, mimeType: string = 'text/csv;charset=utf-8') => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    setTimeout(() => {
      URL.revokeObjectURL(url);
      document.body.removeChild(link);
    }, 100);
  };

  // Exportar clientes para CSV
  const exportClients = (clients: Client[]) => {
    const headers = [
      'ID',
      'Nome',
      'Estado Cliente',
      'Tipo',
      'Morada Serviço',
      'Morada Faturação',
      'Valor (€)',
      'Frequência',
      'Método Pagamento',
      'Contrato',
      'Data Início',
      'Empregados (Nome: Salário)',
      'Devis (Título [Estado, Ativo, Valor])',
      'Total Salários (€)',
      'Total Devis Ativos (€)',
      'Criado em',
      'Atualizado em'
    ];

    const rows = [headers];

    clients.forEach(client => {
      // Formatar empregados
      const employeesStr = client.employees
        .map(emp => `${emp.name}: €${parseFloat(emp.salary).toFixed(2)}`)
        .join(' | ');

      // Formatar devis
      const devisStr = client.devis
        .map(devis => {
          const activeStr = devis.active ? 'Ativo' : 'Inativo';
          return `${devis.title} [${devis.status}, ${activeStr}, €${parseFloat(devis.amount).toFixed(2)}]`;
        })
        .join(' || ');

      // Calcular totais
      const totalSalaries = client.employees.reduce((sum, emp) => sum + parseFloat(emp.salary), 0);
      const totalActiveDevis = client.devis
        .filter(d => d.active)
        .reduce((sum, d) => sum + parseFloat(d.amount), 0);

      const row = [
        client.id,
        client.name,
        client.clientStatus,
        client.clientType,
        client.serviceAddress || '',
        client.billingAddress || '',
        parseFloat(client.value).toFixed(2),
        client.frequency,
        client.method,
        client.contract,
        client.startDate || '',
        employeesStr,
        devisStr,
        totalSalaries.toFixed(2),
        totalActiveDevis.toFixed(2),
        new Date().toLocaleDateString('pt-PT'), // Created
        new Date().toLocaleDateString('pt-PT')  // Updated
      ];

      rows.push(row);
    });

    const csvContent = toCSV(rows);
    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
    downloadFile(`clientes_${timestamp}.csv`, csvContent);
  };

  // Exportar serviços para CSV
  const exportServices = (services: Service[], clients: Client[]) => {
    const headers = [
      'ID',
      'Cliente ID',
      'Cliente Nome',
      'Cliente Tipo',
      'Categoria',
      'Frequência',
      'Dia da Semana',
      'Hora',
      'Notas',
      'Criado em',
      'Atualizado em'
    ];

    const rows = [headers];

    services.forEach(service => {
      const client = service.client ?? clients.find(c => c.id === service.clientId);
      
      const row = [
        service.id,
        service.clientId,
        client ? client.name : 'Cliente removido',
        client ? client.clientType : '',
        service.category || '',
        service.freq || '',
        service.weekday || '',
        service.time || '',
        service.notes || '',
        new Date(service.createdAt).toLocaleDateString('pt-PT'),
        new Date(service.updatedAt).toLocaleDateString('pt-PT')
      ];

      rows.push(row);
    });

    const csvContent = toCSV(rows);
    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
    downloadFile(`servicos_${timestamp}.csv`, csvContent);
  };

  // Exportar relatório completo
  const exportFullReport = (clients: Client[], services: Service[]) => {
    // Calcular estatísticas
    const totalClients = clients.length;
    const activeClients = clients.filter(c => c.clientStatus === 'ATIVO').length;
    const totalServices = services.length;
    const totalEmployees = clients.reduce((sum, c) => sum + c.employees.length, 0);
    const totalDevis = clients.reduce((sum, c) => sum + c.devis.length, 0);
    const activeDevis = clients.reduce((sum, c) => sum + c.devis.filter(d => d.active).length, 0);

    // Calcular valores financeiros
    const totalRevenue = clients.reduce((sum, c) => {
      const value = parseFloat(c.value);
      switch (c.frequency) {
        case 'MENSAL': return sum + value;
        case 'SEMANAL': return sum + (value * 4.33);
        case 'PAGAMENTO_UNICO': return sum + value;
        default: return sum + value;
      }
    }, 0);

    const totalSalaryCosts = clients.reduce((sum, c) => 
      sum + c.employees.reduce((empSum, emp) => empSum + parseFloat(emp.salary), 0), 0
    );

    const urssafTax = totalRevenue * 0.238;
    const netProfit = totalRevenue - urssafTax - totalSalaryCosts;

    // Criar relatório
    const headers = ['Categoria', 'Valor'];
    const rows = [
      headers,
      ['=== RESUMO GERAL ===', ''],
      ['Total de Clientes', totalClients.toString()],
      ['Clientes Ativos', activeClients.toString()],
      ['Total de Serviços', totalServices.toString()],
      ['Total de Empregados', totalEmployees.toString()],
      ['Total de Devis', totalDevis.toString()],
      ['Devis Ativos', activeDevis.toString()],
      ['', ''],
      ['=== ANÁLISE FINANCEIRA (MENSAL) ===', ''],
      ['Receita Total Estimada', `€${totalRevenue.toFixed(2)}`],
      ['Custos com Empregados', `€${totalSalaryCosts.toFixed(2)}`],
      ['Impostos URSSAF (23,8%)', `€${urssafTax.toFixed(2)}`],
      ['Lucro Líquido Estimado', `€${netProfit.toFixed(2)}`],
      ['', ''],
      ['=== DETALHES POR CLIENTE ===', ''],
      ['Cliente', 'Tipo', 'Estado', 'Valor Mensal', 'Empregados', 'Devis Ativos']
    ];

    clients.forEach(client => {
      const monthlyValue = (() => {
        const value = parseFloat(client.value);
        switch (client.frequency) {
          case 'MENSAL': return value;
          case 'SEMANAL': return value * 4.33;
          case 'PAGAMENTO_UNICO': return value;
          default: return value;
        }
      })();

      rows.push([
        client.name,
        client.clientType,
        client.clientStatus,
        `€${monthlyValue.toFixed(2)}`,
        client.employees.length.toString(),
        client.devis.filter(d => d.active).length.toString()
      ]);
    });

    const csvContent = toCSV(rows);
    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
    downloadFile(`relatorio_completo_${timestamp}.csv`, csvContent);
  };

  return {
    exportClients,
    exportServices,
    exportFullReport
  };
}

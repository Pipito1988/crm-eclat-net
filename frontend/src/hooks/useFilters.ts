import { useState, useMemo } from 'react';
import type { Service, Client } from '../types';

interface UseFiltersProps {
  services: Service[];
  clients: Client[];
}

export function useFilters({ services, clients }: UseFiltersProps) {
  const [selectedClientId, setSelectedClientId] = useState('');
  const [selectedClientType, setSelectedClientType] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredServices = useMemo(() => {
    if (!services) return [];

    return services.filter((service) => {
      // Filtro por cliente específico
      if (selectedClientId && service.clientId !== selectedClientId) {
        return false;
      }

      // Filtro por tipo de cliente
      if (selectedClientType) {
        const client = clients?.find(c => c.id === service.clientId);
        if (!client || client.clientType !== selectedClientType) {
          return false;
        }
      }

      // Filtro por termo de pesquisa
      if (searchTerm) {
        const client = service.client ?? clients?.find(c => c.id === service.clientId);
        const clientName = client ? client.name.toLowerCase() : '';
        const category = (service.category || '').toLowerCase();
        const notes = (service.notes || '').toLowerCase();
        const freq = (service.freq || '').toLowerCase();
        const weekday = (service.weekday || '').toLowerCase();
        
        const term = searchTerm.toLowerCase();
        
        if (
          !clientName.includes(term) &&
          !category.includes(term) &&
          !notes.includes(term) &&
          !freq.includes(term) &&
          !weekday.includes(term)
        ) {
          return false;
        }
      }

      return true;
    });
  }, [services, clients, selectedClientId, selectedClientType, searchTerm]);

  const clearFilters = () => {
    setSelectedClientId('');
    setSelectedClientType('');
    setSearchTerm('');
  };

  const hasActiveFilters = selectedClientId || selectedClientType || searchTerm;

  return {
    // Estados
    selectedClientId,
    selectedClientType,
    searchTerm,
    
    // Setters
    setSelectedClientId,
    setSelectedClientType,
    setSearchTerm,
    
    // Dados filtrados
    filteredServices,
    
    // Utilitários
    clearFilters,
    hasActiveFilters,
    
    // Estatísticas
    totalServices: services?.length || 0,
    filteredCount: filteredServices.length
  };
}

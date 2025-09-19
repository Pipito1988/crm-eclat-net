export type ClientStatus = 'ATIVO' | 'ESPECULATIVO' | 'INATIVO';
export type BillingFrequency = 'MENSAL' | 'SEMANAL' | 'PAGAMENTO_UNICO' | 'OUTRO';
export type PaymentMethod = 'TRANSFERENCIA' | 'CHEQUE' | 'DINHEIRO' | 'OUTRO';
export type ContractStatus = 'COM_CONTRATO' | 'SEM_CONTRATO' | 'A_NEGOCIAR';
export type DevisStatus = 'ENVIADO' | 'ACEITE' | 'RECUSADO' | 'RASCUNHO';

export interface User {
  id: string;
  name: string;
  email: string;
}

export interface Employee {
  id: string;
  name: string;
  salary: string;
}

export interface Devis {
  id: string;
  title: string;
  amount: string;
  date: string | null;
  valid: string | null;
  status: DevisStatus;
  active: boolean;
  notes?: string | null;
}

export interface Service {
  id: string;
  category?: string | null;
  freq?: string | null;
  weekday?: string | null;
  time?: string | null;
  notes?: string | null;
  clientId: string;
  // Campos de poubelles (compatibilidade v3.6/v3.7)
  binsEnabled?: boolean;
  binsDays?: number;
  binsWeekdays?: Array<number | string>;
  binsTypes?: string[];
  binsTypesMap?: Record<number | string, string[]>;
  binsSchedule?: string | null;
  binsTimeOut?: string;
  binsTimeIn?: string;
  createdAt: string;
  updatedAt: string;
  client?: {
    id: string;
    name: string;
    clientType: string;
  } | null;
}

export interface Client {
  id: string;
  name: string;
  clientStatus: ClientStatus;
  clientType: string;
  startDate?: string | null;
  serviceAddress?: string | null;
  billingAddress?: string | null;
  value: string;
  frequency: BillingFrequency;
  method: PaymentMethod;
  service?: string | null;
  contract: ContractStatus;
  employees: Employee[];
  devis: Devis[];
  services: Service[];
}

export interface StatsResponse {
  billed: number;
  urssaf: number;
  costs: number;
  gross: number;
  net: number;
}

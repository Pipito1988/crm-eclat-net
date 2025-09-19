# 🏢 CRM Eclat Net

Sistema de gestão de clientes moderno e completo, desenvolvido com React e Node.js.

## 🚀 Funcionalidades

### 👥 Gestão de Clientes
- ✅ CRUD completo (Criar, Ler, Atualizar, Deletar)
- ✅ Gestão de empregados por cliente
- ✅ Sistema de orçamentos (Devis)
- ✅ Estados de cliente (Ativo, Especulativo, Inativo)
- ✅ Tipos de contrato e métodos de pagamento

### 🔧 Gestão de Serviços
- ✅ CRUD completo de serviços
- ✅ Agendamento por dias da semana e horários
- ✅ Categorização de serviços
- ✅ Sistema de notas e observações

### 🗑️ Sistema de Poubelles (Gestão de Resíduos)
- ✅ Configuração de dias de recolha
- ✅ Tipos de resíduos (Verde, Amarela, Azul, Vidro, Orgânico, Indiferenciado)
- ✅ Horários de saída e entrada
- ✅ Agendamento automático

### 📅 Calendário Moderno
- ✅ Vista semanal interativa (06:00 - 21:00)
- ✅ Três modos de visualização:
  - 📊 **Semana**: Grid completo com todos os eventos
  - 🔧 **Serviços**: Lista detalhada de serviços por dia
  - 🗑️ **Poubelles**: Gestão específica de resíduos
- ✅ Cores diferenciadas por tipo de cliente
- ✅ Eventos de poubelles com horários específicos

### 🔍 Filtros e Pesquisa
- ✅ Pesquisa por nome de cliente
- ✅ Filtros por status, tipo e categoria
- ✅ Filtros por frequência de serviço

### 📊 Exportação e Relatórios
- ✅ Exportação CSV de clientes
- ✅ Exportação CSV de serviços
- ✅ Relatório completo em CSV
- ✅ Funcionalidade de impressão

### 🎨 Design Moderno
- ✅ Interface responsiva
- ✅ Sistema de cores consistente
- ✅ Ícones modernos
- ✅ Notificações toast
- ✅ Diálogos de confirmação
- ✅ Loading states

## 🛠️ Tecnologias

### Backend
- **Node.js** - Runtime JavaScript
- **Express.js** - Framework web
- **TypeScript** - Tipagem estática
- **Prisma** - ORM e migrations
- **PostgreSQL** - Base de dados
- **Zod** - Validação de schemas
- **JWT** - Autenticação

### Frontend
- **React 19** - Biblioteca UI
- **Vite** - Build tool
- **React Query** - Gestão de estado server
- **React Router DOM v7** - Roteamento
- **Axios** - Cliente HTTP
- **CSS Modules** - Estilização

## 📦 Instalação

### Pré-requisitos
- Node.js (v18+)
- PostgreSQL
- npm ou yarn

### 1. Clonar o repositório
```bash
git clone https://github.com/seu-usuario/crm-eclat-net.git
cd crm-eclat-net
```

### 2. Configurar Backend
```bash
cd backend
npm install

# Configurar variáveis de ambiente
cp .env.example .env
# Editar .env com suas configurações de BD

# Executar migrations
npx prisma migrate dev

# Iniciar servidor
npm run dev
```

### 3. Configurar Frontend
```bash
cd ../frontend
npm install

# Iniciar aplicação
npm run dev
```

### 4. Aceder à aplicação
- Frontend: http://localhost:5173
- Backend: http://localhost:4000

## 🗂️ Estrutura do Projeto

```
crm-eclat-net/
├── backend/
│   ├── prisma/          # Schema e migrations
│   ├── src/
│   │   ├── controllers/ # Controladores
│   │   ├── routes/      # Rotas API
│   │   ├── schemas/     # Validação Zod
│   │   ├── config/      # Configurações
│   │   └── middleware/  # Middlewares
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/  # Componentes React
│   │   ├── pages/       # Páginas principais
│   │   ├── hooks/       # Custom hooks
│   │   ├── utils/       # Utilitários
│   │   ├── api/         # Cliente API
│   │   └── types/       # Tipos TypeScript
│   └── package.json
└── README.md
```

## 🎯 Funcionalidades Principais

### Dashboard
- Visão geral de clientes, serviços e poubelles
- Estatísticas em tempo real
- Acesso rápido a funcionalidades

### Gestão de Clientes
- Formulário completo com validação
- Gestão de empregados inline
- Sistema de orçamentos integrado
- Histórico de alterações

### Calendário de Serviços
- Vista semanal com drag & drop
- Eventos de poubelles automáticos
- Códigos de cores por tipo
- Tooltips informativos

### Sistema de Poubelles
- Configuração flexível de dias
- Múltiplos tipos de resíduos
- Horários personalizáveis
- Integração com calendário

## 🚀 Scripts Disponíveis

### Backend
```bash
npm run dev          # Servidor desenvolvimento
npm run build        # Build para produção
npm run start        # Iniciar produção
npm run migrate      # Executar migrations
```

### Frontend
```bash
npm run dev          # Servidor desenvolvimento
npm run build        # Build para produção
npm run preview      # Preview da build
```

## 🔧 Configuração

### Variáveis de Ambiente (Backend)
```env
DATABASE_URL="postgresql://user:pass@localhost:5432/crm_eclat"
JWT_SECRET="your-secret-key"
PORT=4000
```

### Configuração da Base de Dados
O projeto usa PostgreSQL com Prisma. O schema inclui:
- Users (autenticação)
- Clients (clientes)
- Employees (empregados)
- Devis (orçamentos)
- Services (serviços)

## 📈 Roadmap

- [ ] Sistema de notificações
- [ ] Dashboard com gráficos
- [ ] Integração com email
- [ ] App mobile
- [ ] Relatórios avançados
- [ ] Backup automático

## 🤝 Contribuição

1. Fork o projeto
2. Crie sua feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 👨‍💻 Autor

**Filipe** - Desenvolvimento completo do sistema

---

⭐ Se este projeto te ajudou, considera dar uma estrela no GitHub!
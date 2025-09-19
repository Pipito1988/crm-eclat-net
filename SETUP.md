# 🚀 Setup Rápido - CRM Eclat Net

## 📋 Pré-requisitos
- Node.js 18+
- PostgreSQL
- Git

## ⚡ Instalação Rápida

### 1. Clonar Repositório
```bash
git clone https://github.com/Pipito1988/crm-eclat-net.git
cd crm-eclat-net
```

### 2. Configurar Backend
```bash
cd backend
npm install

# Criar arquivo .env
echo 'DATABASE_URL="postgresql://username:password@localhost:5432/crm_eclat_net"
JWT_SECRET="your-super-secret-jwt-key-here"
PORT=4000
NODE_ENV="development"' > .env

# Executar migrations
npx prisma migrate dev

# Iniciar servidor
npm run dev
```

### 3. Configurar Frontend
```bash
cd ../frontend
npm install
npm run dev
```

### 4. Aceder Aplicação
- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:4000

## 🔧 Configuração da Base de Dados

### PostgreSQL Local
```sql
CREATE DATABASE crm_eclat_net;
CREATE USER crm_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE crm_eclat_net TO crm_user;
```

### Variáveis de Ambiente (backend/.env)
```env
DATABASE_URL="postgresql://crm_user:your_password@localhost:5432/crm_eclat_net"
JWT_SECRET="generate-a-strong-secret-key"
PORT=4000
NODE_ENV="development"
```

## 🎯 Primeiro Uso

1. **Registar Utilizador**: Ir para http://localhost:5173 e criar conta
2. **Criar Cliente**: Adicionar primeiro cliente com empregados
3. **Criar Serviço**: Configurar serviço com poubelles
4. **Ver Calendário**: Verificar eventos no calendário

## 🛠️ Scripts Úteis

### Backend
```bash
npm run dev          # Desenvolvimento
npm run build        # Build produção
npm run start        # Iniciar produção
npx prisma studio    # Interface BD
npx prisma migrate dev # Nova migration
```

### Frontend
```bash
npm run dev          # Desenvolvimento
npm run build        # Build produção
npm run preview      # Preview build
```

## 📊 Funcionalidades Principais

- ✅ **Gestão de Clientes** - CRUD completo
- ✅ **Gestão de Empregados** - Por cliente
- ✅ **Gestão de Serviços** - Com horários
- ✅ **Sistema Poubelles** - Recolha de resíduos
- ✅ **Calendário Moderno** - 3 vistas diferentes
- ✅ **Filtros e Pesquisa** - Busca avançada
- ✅ **Exportação CSV** - Relatórios
- ✅ **Design Responsivo** - Mobile friendly

## 🎨 Personalização

### Cores do Sistema
Editar `frontend/src/styles/global.css`:
```css
:root {
  --primary: #6366f1;      /* Cor principal */
  --secondary: #8b5cf6;    /* Cor secundária */
  --success: #10b981;      /* Cor de sucesso */
  /* ... */
}
```

### Tipos de Poubelles
Editar `frontend/src/components/BinsManager.tsx`:
```typescript
const BIN_TYPES = ['Verde', 'Amarela', 'Azul', 'Vidro', 'Orgânico', 'Indiferenciado'];
```

## 🔍 Troubleshooting

### Erro de Conexão BD
- Verificar se PostgreSQL está a correr
- Confirmar DATABASE_URL no .env
- Executar `npx prisma migrate dev`

### Erro CORS
- Verificar se backend está na porta 4000
- Confirmar URL da API no frontend

### Erro de Dependências
```bash
rm -rf node_modules package-lock.json
npm install
```

## 📞 Suporte

- **Repositório**: https://github.com/Pipito1988/crm-eclat-net
- **Issues**: https://github.com/Pipito1988/crm-eclat-net/issues

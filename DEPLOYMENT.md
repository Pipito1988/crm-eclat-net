# 🚀 Deployment no Replit

## 📋 Configuração Rápida

### 1. Variáveis de Ambiente
No painel de **Secrets** do Replit, adicionar:

```env
DATABASE_URL=postgresql://username:password@host:5432/database
JWT_SECRET=your-super-secret-jwt-key-here
NODE_ENV=production
PORT=3000
```

### 2. Comandos de Build
O projeto está configurado para build automático. Os comandos definidos:

- **Run Command**: `npm run start:prod`
- **Build**: Automático via `postinstall`

### 3. Estrutura de Deploy
```
📦 Replit Deploy
├── 🔧 Build frontend → frontend/dist/
├── 🔧 Build backend → backend/dist/  
├── 🌐 Serve static files
└── 🚀 Start production server
```

## ⚙️ Configuração Manual

### 1. No painel Configuration:
- **Run Command**: `npm run start:prod`
- **Build Command**: `npm run build`

### 2. Database Setup:
Para usar PostgreSQL no Replit:
```bash
# No Shell do Replit
psql postgresql://username:password@host/database
```

### 3. Migrations:
```bash
npm run migrate
```

## 🔍 Troubleshooting

### Erro: "Configuration pane"
1. Ir ao painel **Configuration**
2. Definir **Run Command**: `npm run start:prod`
3. Salvar e fazer redeploy

### Erro: Database Connection
1. Verificar `DATABASE_URL` nos Secrets
2. Testar conexão: `npm run migrate`

### Erro: Build Failed
1. Limpar cache: `rm -rf node_modules`
2. Reinstalar: `npm install`
3. Build manual: `npm run build`

## 📊 Monitoramento

### Logs
```bash
# Ver logs do servidor
tail -f /tmp/replit.log

# Logs da aplicação
npm run start:prod
```

### Health Check
- **Frontend**: `https://seu-repl.replit.dev/`
- **API**: `https://seu-repl.replit.dev/api/`

## 🎯 Otimizações

### Performance
- Frontend servido como arquivos estáticos
- Gzip compression automática
- Cache de assets

### Security
- CORS configurado
- Headers de segurança
- Validação de input com Zod

## 📝 Comandos Úteis

```bash
# Build completo
npm run build

# Start produção
npm run start:prod

# Desenvolvimento local
npm run dev:backend  # Terminal 1
npm run dev:frontend # Terminal 2

# Database
npm run migrate
```

## 🌐 URLs de Produção

- **App**: `https://crm-eclat-net.replit.app/`
- **API**: `https://crm-eclat-net.replit.app/api/`
- **Docs**: `https://github.com/Pipito1988/crm-eclat-net`

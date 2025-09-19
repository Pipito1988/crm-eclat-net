# 🌐 Opções de Hosting Gratuito

## 🥇 VERCEL (Recomendado)

### ✅ Porquê Vercel?
- Deploy automático do GitHub
- Domínio gratuito: `crm-eclat-net.vercel.app`
- SSL automático
- Edge functions para API
- Excelente para React + Node.js

### 🚀 Setup Vercel:

#### 1. Preparar Projeto
```bash
# Já está configurado com vercel.json!
```

#### 2. Deploy
1. Ir a https://vercel.com
2. **Sign up** com GitHub
3. **Import Project** → `Pipito1988/crm-eclat-net`
4. **Deploy** (automático)

#### 3. Configurar Base de Dados
**Opção A - Neon (PostgreSQL gratuito):**
1. Ir a https://neon.tech
2. Criar conta gratuita
3. Criar database `crm_eclat_net`
4. Copiar connection string

**Opção B - Supabase:**
1. Ir a https://supabase.com
2. Criar projeto
3. Usar PostgreSQL incluído

#### 4. Variáveis de Ambiente (Vercel)
No dashboard Vercel → Settings → Environment Variables:
```env
DATABASE_URL=postgresql://user:pass@host/db
JWT_SECRET=your-secret-key
NODE_ENV=production
```

---

## 🥈 NETLIFY + RAILWAY

### Frontend no Netlify
1. Ir a https://netlify.com
2. Conectar GitHub
3. Deploy `frontend/` folder
4. Build command: `npm run build`
5. Publish directory: `dist`

### Backend no Railway
1. Ir a https://railway.app
2. Deploy from GitHub
3. Selecionar `backend/` folder
4. PostgreSQL automático incluído

---

## 🥉 RENDER

### Setup Render:
1. Ir a https://render.com
2. Conectar GitHub
3. **Web Service** → `crm-eclat-net`
4. Build command: `npm run build`
5. Start command: `npm run start:prod`

### PostgreSQL no Render:
1. **New** → **PostgreSQL**
2. Copiar connection string
3. Adicionar às env variables

---

## 🆓 SUPABASE + NETLIFY

### Base de Dados - Supabase:
1. https://supabase.com → New project
2. Executar schema Prisma:
```sql
-- Copiar schema do prisma/schema.prisma
-- Executar no SQL Editor
```

### Frontend - Netlify:
- Deploy automático do GitHub
- Configurar API URL para Supabase

---

## 💰 COMPARAÇÃO DE CUSTOS

| Plataforma | Frontend | Backend | Database | Bandwidth | Limitações |
|------------|----------|---------|----------|-----------|------------|
| **Vercel** | ✅ Grátis | ✅ Grátis | Neon: Grátis | 100GB | Perfeito |
| **Netlify+Railway** | ✅ Grátis | $5/mês após trial | Incluído | 100GB | Railway pago |
| **Render** | ✅ Grátis | ✅ Grátis | ✅ Grátis | Ilimitado | App hiberna |
| **Supabase+Netlify** | ✅ Grátis | ✅ Grátis | ✅ Grátis | 100GB | Mais setup |

---

## 🎯 RECOMENDAÇÃO FINAL

### 🏆 **Para ti: VERCEL + NEON**

**Porquê?**
- ✅ **100% gratuito** para sempre
- ✅ **Deploy automático** do GitHub
- ✅ **Performance excelente**
- ✅ **Domínio profissional**
- ✅ **SSL automático**
- ✅ **Zero configuração**

### 📋 Passos Rápidos:
1. **Vercel.com** → Sign up → Import GitHub repo
2. **Neon.tech** → Create database → Copy URL
3. **Vercel Settings** → Add DATABASE_URL
4. **Deploy** → Funciona! 🎉

### 🌐 Resultado:
- **App**: `https://crm-eclat-net.vercel.app`
- **Uptime**: 99.9%
- **Speed**: Excelente
- **Custo**: €0 para sempre

---

## 🚀 DEPLOY IMEDIATO

Quer que configure o Vercel agora mesmo?

1. **Tu**: Criar conta Vercel + Neon
2. **Eu**: Otimizar configuração
3. **Deploy**: App online em 5 minutos! 

**🎯 Vercel é definitivamente a melhor opção gratuita para o teu projeto!**

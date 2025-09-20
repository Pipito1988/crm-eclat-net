// Script para criar utilizador admin padrão
require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function createAdmin() {
  try {
    const adminEmail = 'admin@crm-eclat.com';
    const adminPassword = 'admin123';
    
    // Verificar se já existe
    const existing = await prisma.user.findUnique({
      where: { email: adminEmail }
    });
    
    if (existing) {
      console.log('✅ Admin já existe:', adminEmail);
      return;
    }
    
    // Criar hash da password
    const hashedPassword = await bcrypt.hash(adminPassword, 10);
    
    // Criar utilizador admin
    const admin = await prisma.user.create({
      data: {
        email: adminEmail,
        name: 'Administrador',
        password: hashedPassword
      }
    });
    
    console.log('🎉 Admin criado com sucesso!');
    console.log('📧 Email:', adminEmail);
    console.log('🔐 Password:', adminPassword);
    console.log('👤 ID:', admin.id);
    
  } catch (error) {
    console.error('❌ Erro ao criar admin:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin();

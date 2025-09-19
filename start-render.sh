#!/bin/bash

echo "🚀 Starting CRM Eclat Net server..."

# Verificar se build existe
if [ ! -d "backend/dist" ]; then
  echo "❌ Backend build not found! Running build first..."
  cd backend
  npm run build
  cd ..
fi

# Navegar para backend e iniciar
echo "📁 Starting from: $(pwd)"
cd backend || exit 1
echo "📁 Backend directory: $(pwd)"
echo "📁 Backend contents: $(ls -la)"

# Verificar se dist existe
if [ ! -d "dist" ]; then
  echo "❌ Dist folder not found, building..."
  npm run build || exit 1
fi

echo "🚀 Starting server..."
npm run start

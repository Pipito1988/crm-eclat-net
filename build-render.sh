#!/bin/bash

echo "🚀 Building CRM Eclat Net for Render..."

# Verificar se estamos no diretório correto
echo "📁 Current directory: $(pwd)"
echo "📁 Contents: $(ls -la)"

# Build frontend
echo "🎨 Building frontend..."
cd frontend || exit 1
echo "📁 Frontend directory: $(pwd)"
npm install || exit 1
npm run build || exit 1
echo "✅ Frontend build completed"

# Build backend  
echo "⚙️ Building backend..."
cd ../backend || exit 1
echo "📁 Backend directory: $(pwd)"
npm install || exit 1
npm run build || exit 1
echo "✅ Backend build completed"

echo "🎉 Build completed successfully!"

#!/bin/bash

echo "🚀 Building CRM Eclat Net for production..."

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build frontend
echo "🎨 Building frontend..."
cd frontend
npm run build
cd ..

# Build backend
echo "⚙️ Building backend..."
cd backend
npm run build
cd ..

echo "✅ Build completed successfully!"
echo "📁 Frontend built to: frontend/dist/"
echo "📁 Backend built to: backend/dist/"
echo ""
echo "🌟 Ready for deployment!"

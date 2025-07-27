#!/bin/bash

# Script to reload data after changing sample_products.json

echo "🔄 Reloading data after sample_products.json changes..."

# Stop containers
echo "📦 Stopping containers..."
sudo /usr/local/bin/docker-compose down

# Rebuild data-init service (includes new JSON file)
echo "🔨 Rebuilding data-init service..."
sudo /usr/local/bin/docker-compose build data-init

# Start all services
echo "🚀 Starting all services..."
sudo /usr/local/bin/docker-compose up -d

# Wait for services to be ready
echo "⏳ Waiting for services to initialize..."
sleep 10

# Check data-init logs
echo "📋 Data initialization logs:"
sudo /usr/local/bin/docker-compose logs data-init

# Test API
echo "🧪 Testing API..."
curl -s http://localhost:3000/health | python3 -m json.tool

echo "✅ Data reload complete!"
echo "🌐 API available at: http://localhost:3000"
echo "📊 Products endpoint: http://localhost:3000/api/products"


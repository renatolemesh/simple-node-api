# Makefile for Products API Docker Operations

.PHONY: help build up down logs clean dev-up dev-down restart status reload-data live-up live-down live-reload-data

# Default target
help:
	@echo "Available commands:"
	@echo "  build         - Build Docker images"
	@echo "  up            - Start all services in production mode"
	@echo "  down          - Stop all services"
	@echo "  logs          - Show logs from all services"
	@echo "  clean         - Remove all containers, images, and volumes"
	@echo "  dev-up        - Start services in development mode"
	@echo "  dev-down      - Stop development services"
	@echo "  restart       - Restart all services"
	@echo "  status        - Show status of all services"
	@echo "  reload-data   - Reload data after changing sample_products.json"
	@echo "  live-up       - Start with live file monitoring (auto-reload)"
	@echo "  live-down     - Stop live monitoring services"
	@echo "  live-reload-data - Reload data in live mode"

# Build Docker images
build:
	docker-compose build --no-cache

# Start services in production mode
up:
	docker-compose up -d

# Stop all services
down:
	docker-compose down

# Show logs
logs:
	docker-compose logs -f

# Clean up everything
clean:
	docker-compose down -v --rmi all --remove-orphans
	docker system prune -f

# Development mode
dev-up:
	docker-compose -f docker-compose.dev.yml up -d

dev-down:
	docker-compose -f docker-compose.dev.yml down

# Restart services
restart:
	docker-compose restart

# Show service status
status:
	docker-compose ps

# Reload data after changing sample_products.json
reload-data:
	./scripts/reload-data.sh

# Live reload mode - files changes are reflected immediately
live-up:
	docker-compose -f docker-compose.live.yml up -d

live-down:
	docker-compose -f docker-compose.live.yml down

# Reload data in live mode (just restart data processor)
live-reload-data:
	docker-compose -f docker-compose.live.yml exec data-processor npx ts-node src/processDataDocker.ts


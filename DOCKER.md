# Docker Deployment Guide - Products API

This guide explains how to run the Products API using Docker and Docker Compose.

## Prerequisites

- Docker Engine 20.10+
- Docker Compose 2.0+
- At least 2GB of available RAM
- Ports 3000 and 27017 available

## Quick Start

1. **Clone and navigate to the project:**
   ```bash
   cd products-api
   ```

2. **Build and start all services:**
   ```bash
   make up
   # OR
   docker-compose up -d
   ```

3. **Access the API:**
   - API: http://localhost:3000
   - Health Check: http://localhost:3000/health
   - MongoDB: localhost:27017

## Docker Architecture

### Services

#### 1. MongoDB Database (`mongodb`)
- **Image:** `mongo:7.0`
- **Port:** `27017:27017`
- **Volumes:** 
  - `mongodb_data:/data/db` (persistent data)
  - `mongodb_config:/data/configdb` (configuration)
- **Health Check:** MongoDB ping command
- **Network:** `products-network`

#### 2. Node.js API (`api`)
- **Build:** Multi-stage Dockerfile
- **Port:** `3000:3000`
- **Environment:** Production optimized
- **Depends on:** MongoDB (waits for health check)
- **Health Check:** HTTP GET /health
- **Network:** `products-network`

#### 3. Data Initialization (`data-init`)
- **Build:** Same as API service
- **Purpose:** One-time data seeding
- **Depends on:** MongoDB (waits for health check)
- **Restart:** No (runs once and exits)
- **Network:** `products-network`

### Networking
- **Custom Bridge Network:** `products-network`
- **Internal Communication:** Services communicate using service names
- **External Access:** Only API port 3000 is exposed

### Data Persistence
- **MongoDB Data:** Stored in named volume `mongodb_data`
- **Configuration:** Stored in named volume `mongodb_config`
- **Backup:** Volumes persist across container restarts

## File Structure

```
products-api/
├── Dockerfile                    # Multi-stage build for Node.js API
├── docker-compose.yml           # Production services configuration
├── docker-compose.dev.yml       # Development services configuration
├── .dockerignore                # Files excluded from Docker build
├── .env.docker                  # Docker environment variables
├── Makefile                     # Convenient Docker commands
├── DOCKER.md                    # This documentation
└── src/
    ├── processDataDocker.ts     # Docker-compatible data seeding
    └── sample_products.json     # Sample data for initialization
```

## Available Commands

### Using Makefile (Recommended)

```bash
# Show all available commands
make help

# Build Docker images
make build

# Start all services (production)
make up

# Stop all services
make down

# View logs from all services
make logs

# Start development services
make dev-up

# Stop development services
make dev-down

# Restart all services
make restart

# Show service status
make status

# Clean up everything (containers, images, volumes)
make clean
```

### Using Docker Compose Directly

```bash
# Production Environment
docker-compose up -d                    # Start services
docker-compose down                     # Stop services
docker-compose logs -f                  # View logs
docker-compose ps                       # Show status
docker-compose build --no-cache         # Rebuild images

# Development Environment
docker-compose -f docker-compose.dev.yml up -d
docker-compose -f docker-compose.dev.yml down
```

## Environment Configuration

### Production (.env.docker)
```env
PORT=3000
MONGODB_URI=mongodb://mongodb:27017/products_db
NODE_ENV=production
```

### Development
- Uses volume mounts for live code reloading
- Includes development dependencies
- Enables debug logging

## API Endpoints

Once running, the following endpoints are available:

### Health Check
```bash
curl http://localhost:3000/health
```

### Products API
```bash
# Get all products
curl http://localhost:3000/api/products

# Get product by ID
curl http://localhost:3000/api/products/452

# Search products
curl "http://localhost:3000/api/products/search?q=POKE"

# Create new product
curl -X POST http://localhost:3000/api/products \
  -H "Content-Type: application/json" \
  -d '{
    "id": 999,
    "name": "New Product",
    "unitPrice": 29.99,
    "unit": "UN",
    "enabled": "S",
    "detail": "Product description"
  }'
```

## Data Management

### Initial Data Seeding
- Automatically runs on first startup via `data-init` service
- Loads sample products from `src/sample_products.json`
- Only runs once (restart policy: "no")

### Manual Data Operations
```bash
# Access MongoDB directly
docker exec -it products-mongodb mongosh products_db

# View data initialization logs
docker-compose logs data-init

# Re-run data initialization
docker-compose run --rm data-init
```

## Monitoring and Debugging

### Health Checks
Both services include health checks:
- **MongoDB:** `mongosh ping` command
- **API:** HTTP GET request to `/health`

### Viewing Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f api
docker-compose logs -f mongodb
docker-compose logs data-init
```

### Container Status
```bash
# Show running containers
docker-compose ps

# Show detailed container info
docker inspect products-api
docker inspect products-mongodb
```

## Troubleshooting

### Common Issues

#### Port Already in Use
```bash
# Check what's using the port
sudo lsof -i :3000
sudo lsof -i :27017

# Stop conflicting services
sudo systemctl stop mongod  # If local MongoDB is running
```

#### Container Won't Start
```bash
# Check logs for errors
docker-compose logs api

# Rebuild images
docker-compose build --no-cache

# Check system resources
docker system df
docker system prune  # Clean up if needed
```

#### Database Connection Issues
```bash
# Verify MongoDB is healthy
docker-compose ps

# Check MongoDB logs
docker-compose logs mongodb

# Test connection manually
docker exec -it products-mongodb mongosh products_db
```

#### Data Not Loading
```bash
# Check data-init logs
docker-compose logs data-init

# Manually run data initialization
docker-compose run --rm data-init

# Verify sample data file exists
docker exec -it products-api ls -la /app/src/
```

### Performance Tuning

#### Resource Limits
Add to docker-compose.yml:
```yaml
services:
  api:
    deploy:
      resources:
        limits:
          memory: 512M
          cpus: '0.5'
  mongodb:
    deploy:
      resources:
        limits:
          memory: 1G
          cpus: '1.0'
```

#### MongoDB Optimization
```yaml
mongodb:
  command: mongod --wiredTigerCacheSizeGB 0.5
```

## Security Considerations

### Production Deployment
1. **Environment Variables:** Use Docker secrets or external secret management
2. **Network Security:** Use custom networks, avoid exposing MongoDB port
3. **User Permissions:** Non-root user in containers (already implemented)
4. **Image Security:** Regular base image updates
5. **Data Encryption:** Enable MongoDB encryption at rest

### Recommended Production Changes
```yaml
# Don't expose MongoDB port in production
mongodb:
  ports: []  # Remove port mapping

# Use secrets for sensitive data
api:
  secrets:
    - mongodb_uri
  environment:
    - MONGODB_URI_FILE=/run/secrets/mongodb_uri
```

## Backup and Recovery

### Database Backup
```bash
# Create backup
docker exec products-mongodb mongodump --db products_db --out /data/backup

# Copy backup from container
docker cp products-mongodb:/data/backup ./backup

# Restore from backup
docker exec -i products-mongodb mongorestore --db products_db /data/backup/products_db
```

### Volume Backup
```bash
# Backup volumes
docker run --rm -v products-api_mongodb_data:/data -v $(pwd):/backup alpine tar czf /backup/mongodb_backup.tar.gz /data

# Restore volumes
docker run --rm -v products-api_mongodb_data:/data -v $(pwd):/backup alpine tar xzf /backup/mongodb_backup.tar.gz -C /
```

## Development Workflow

### Local Development with Docker
1. Use `docker-compose.dev.yml` for development
2. Code changes are reflected immediately via volume mounts
3. Development dependencies are available
4. Debug logging is enabled

### Building for Production
1. Test with production compose file
2. Verify health checks pass
3. Test data persistence across restarts
4. Performance test under load

## Deployment Options

### Single Server
- Use provided docker-compose.yml
- Ensure adequate resources
- Set up monitoring and backups

### Container Orchestration
- **Kubernetes:** Convert compose to K8s manifests
- **Docker Swarm:** Use docker stack deploy
- **Cloud Services:** AWS ECS, Azure Container Instances, GCP Cloud Run

### CI/CD Integration
```bash
# Build and test
docker-compose -f docker-compose.test.yml up --abort-on-container-exit

# Deploy
docker-compose up -d

# Health check
curl -f http://localhost:3000/health || exit 1
```

## Support

For issues and questions:
1. Check logs: `docker-compose logs`
2. Verify health: `docker-compose ps`
3. Review this documentation
4. Check Docker and system resources


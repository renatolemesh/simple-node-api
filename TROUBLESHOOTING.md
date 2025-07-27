# Troubleshooting Guide - Data Reload Issues

## Problem: Data Not Updating After Changing sample_products.json

### Root Cause
When you modify `src/sample_products.json`, the changes are not automatically reflected in the running Docker containers because:

1. **Docker Image Caching**: The JSON file is copied into the Docker image during build time
2. **Container Isolation**: Running containers use the image that was built, not the current filesystem
3. **Data Initialization**: The `data-init` service only runs once and exits

### ✅ Solution: Use the Data Reload Script

After modifying `src/sample_products.json`, run:

```bash
# Option 1: Using Make (Recommended)
make reload-data

# Option 2: Using the script directly
./scripts/reload-data.sh

# Option 3: Manual steps
sudo /usr/local/bin/docker-compose down
sudo /usr/local/bin/docker-compose build data-init
sudo /usr/local/bin/docker-compose up -d
```

### What the Reload Script Does

1. **Stops all containers** to ensure clean state
2. **Rebuilds the data-init service** with your updated JSON file
3. **Starts all services** including fresh data initialization
4. **Shows logs** to verify successful data loading
5. **Tests the API** to confirm everything is working

### Verification Steps

After running the reload script, verify your changes:

```bash
# Check if API is running
curl http://localhost:3000/health

# View all products
curl http://localhost:3000/api/products

# Check specific product count
curl -s http://localhost:3000/api/products | python3 -c "import sys, json; data = json.load(sys.stdin); print('Total products:', data['pagination']['totalItems'])"
```

### Alternative Methods

#### Method 1: Manual Data Processing
```bash
# Run data processing manually
sudo /usr/local/bin/docker-compose run --rm data-init
```

#### Method 2: Development Mode
For frequent JSON changes, use development mode:
```bash
# Start in development mode (with volume mounts)
make dev-up

# Your changes will be reflected immediately
```

#### Method 3: Direct MongoDB Access
```bash
# Access MongoDB directly to verify data
sudo docker exec -it products-mongodb mongosh products_db

# In MongoDB shell:
db.products.find().count()
db.products.find({}, {name: 1, id: 1})
```

### Common Issues and Solutions

#### Issue: "Permission denied" when running script
```bash
# Make script executable
chmod +x scripts/reload-data.sh
```

#### Issue: Port already in use
```bash
# Check what's using the ports
sudo lsof -i :3000
sudo lsof -i :27017

# Stop conflicting services
sudo systemctl stop mongod  # If local MongoDB is running
```

#### Issue: Docker build fails
```bash
# Clean up Docker cache
sudo docker system prune -f

# Rebuild from scratch
sudo /usr/local/bin/docker-compose build --no-cache
```

#### Issue: Data not loading
```bash
# Check data-init logs for errors
sudo /usr/local/bin/docker-compose logs data-init

# Verify JSON file syntax
python3 -m json.tool src/sample_products.json
```

### Best Practices

1. **Always validate JSON** before reloading:
   ```bash
   python3 -m json.tool src/sample_products.json
   ```

2. **Use the reload script** instead of manual commands

3. **Check logs** if data doesn't appear as expected:
   ```bash
   sudo /usr/local/bin/docker-compose logs data-init
   ```

4. **For development**, consider using development mode with volume mounts

5. **Backup important data** before making changes:
   ```bash
   curl http://localhost:3000/api/products > backup.json
   ```

### File Structure for Data Changes

When modifying data, ensure your JSON follows this structure:

```json
{
  "products": [
    {
      "id": 1,
      "name": "Product Name",
      "unitPrice": 29.99,
      "unit": "UN",
      "enabled": "S",
      "detail": "Product description",
      "structure": [
        {
          "variable": {
            "id": 1,
            "name": "Variable Name",
            "requerid": "S",
            "quantity": 1,
            "maximum": "N",
            "quantitymaximum": 1,
            "components": [
              {
                "component": {
                  "id": 2,
                  "name": "Component Name",
                  "unitPrice": 15.99,
                  "unit": "UN",
                  "enabled": "S"
                }
              }
            ]
          }
        }
      ]
    }
  ]
}
```

### Quick Reference Commands

```bash
# Reload data after JSON changes
make reload-data

# Check service status
make status

# View all logs
make logs

# Stop all services
make down

# Start all services
make up

# Show available commands
make help
```


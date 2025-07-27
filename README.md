# Products API - Node.js TypeScript MongoDB

A RESTful API built with Node.js, TypeScript, Express.js, and MongoDB for managing product data with complex nested structures. **Now fully containerized with Docker and Docker Compose!**

## 🐳 Quick Start with Docker (Recommended)

```bash
# Start all services (API + MongoDB)
make up
# OR
docker-compose up -d

# Access the API
curl http://localhost:3000/health
curl http://localhost:3000/api/products
```

**For live code changes (development):**
```bash
make live-up
# OR
docker-compose -f docker-compose.live.yml up -d
```

**That's it!** The API and database are now running in containers with sample data loaded.

📖 **[Complete Docker Guide](DOCKER.md)** - Detailed Docker documentation

## Features

- **🐳 Docker Ready**: Fully containerized with Docker Compose
- **TypeScript**: Full TypeScript support for type safety
- **MongoDB**: NoSQL database with Mongoose ODM
- **Express.js**: Fast and minimal web framework
- **CORS**: Cross-origin resource sharing enabled
- **Data Processing**: Transforms complex nested JSON structures
- **Pagination**: Built-in pagination for product listings
- **Search**: Full-text search functionality
- **Error Handling**: Comprehensive error handling and validation
- **Health Checks**: Built-in container health monitoring
- **Auto Data Seeding**: Automatic sample data loading

## Project Structure

```
products-api/
├── src/
│   ├── config/
│   │   └── database.ts          # MongoDB connection configuration
│   ├── controllers/
│   │   └── productController.ts # Business logic for product operations
│   ├── models/
│   │   └── Product.ts           # Mongoose schema and model
│   ├── routes/
│   │   └── productRoutes.ts     # API route definitions
│   ├── index.ts                 # Main server file
│   ├── processData.ts           # Data processing script
│   └── sample_products.json     # Sample product data
├── dist/                        # Compiled JavaScript files
├── .env                         # Environment variables
├── package.json                 # Dependencies and scripts
├── tsconfig.json               # TypeScript configuration
└── README.md                   # This file
```

## Installation

### 🐳 Docker Installation (Recommended)

**Prerequisites:** Docker and Docker Compose installed

```bash
# Clone the repository
git clone <repository-url>
cd products-api

# Start all services
make up
# OR
docker-compose up -d

# View logs
make logs
# OR
docker-compose logs -f

# Stop services
make down
# OR
docker-compose down
```

### 📋 Available Docker Commands

```bash
make help          # Show all available commands
make build         # Build Docker images
make up            # Start all services
make down          # Stop all services
make logs          # View logs
make restart       # Restart services
make status        # Show service status
make clean         # Clean up everything
make dev-up        # Start development environment
```

### 🛠️ Manual Installation (Alternative)

1. **Clone the repository and install dependencies:**
   ```bash
   npm install
   ```

2. **Install and start MongoDB:**
   ```bash
   sudo systemctl start mongod
   sudo systemctl enable mongod
   ```

3. **Environment Setup:**
   Create a `.env` file with:
   ```
   PORT=3000
   MONGODB_URI=mongodb://localhost:27017/products_db
   NODE_ENV=development
   ```

4. **Process sample data:**
   ```bash
   npm run process-data
   ```

5. **Start the server:**
   ```bash
   # Development mode
   npm run dev

   # Production mode
   npm run build
   npm start
   ```

## API Endpoints

### Base URL: `http://localhost:3000`

### Health Check
- **GET** `/health`
  - Returns API status

### Products

#### Get All Products
- **GET** `/api/products`
- **Query Parameters:**
  - `page` (optional): Page number (default: 1)
  - `limit` (optional): Items per page (default: 10)
- **Response:** Paginated list of products

#### Search Products
- **GET** `/api/products/search`
- **Query Parameters:**
  - `q` (required): Search query
  - `page` (optional): Page number (default: 1)
  - `limit` (optional): Items per page (default: 10)
- **Response:** Paginated search results

#### Get Product by ID
- **GET** `/api/products/:id`
- **Parameters:**
  - `id`: Product ID
- **Response:** Single product object

#### Create Product
- **POST** `/api/products`
- **Body:** Product object (JSON)
- **Required fields:** `id`, `name`, `unitPrice`, `unit`, `enabled`
- **Response:** Created product object

#### Update Product
- **PUT** `/api/products/:id`
- **Parameters:**
  - `id`: Product ID
- **Body:** Updated product data (JSON)
- **Response:** Updated product object

#### Delete Product
- **DELETE** `/api/products/:id`
- **Parameters:**
  - `id`: Product ID
- **Response:** Success message

## Data Structure

### Product Schema
```typescript
{
  id: number;                    // Unique product identifier
  name: string;                  // Product name
  unitPrice: number;             // Price per unit
  unit: string;                  // Unit of measurement (e.g., "UN", "KG")
  enabled: string;               // Status ("S" for enabled, "N" for disabled)
  barcode?: string;              // Product barcode
  detail?: string;               // Product description
  href?: string;                 // Image URL
  salesgroup?: number;           // Sales group ID
  groupId?: number;              // Group ID
  type?: number;                 // Product type
  highlighted?: string;          // Highlighted status
  manufactured?: string;         // Manufacturing status
  productResale?: string;        // Resale status
  lastCost?: number;             // Last cost price
  variables?: Variable[];        // Product variables/options
  createdAt: Date;               // Creation timestamp
  updatedAt: Date;               // Last update timestamp
}
```

### Variable Schema
```typescript
{
  id: number;                    // Variable ID
  name: string;                  // Variable name
  required: string;              // Required status
  quantity: number;              // Quantity
  maximum: string;               // Maximum status
  quantityMaximum: number;       // Maximum quantity
  components: Component[];       // Variable components
}
```

### Component Schema
```typescript
{
  id: number;                    // Component ID
  name: string;                  // Component name
  unitPrice: number;             // Component price
  unit: string;                  // Unit of measurement
  enabled: string;               // Status
  barcode?: string;              // Component barcode
  detail?: string;               // Component description
  href?: string;                 // Image URL
}
```

## Example API Calls

### Get All Products
```bash
curl http://localhost:3000/api/products
```

### Search Products
```bash
curl "http://localhost:3000/api/products/search?q=POKE"
```

### Get Product by ID
```bash
curl http://localhost:3000/api/products/452
```

### Create New Product
```bash
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

## Scripts

- `npm run build` - Compile TypeScript to JavaScript
- `npm start` - Start production server
- `npm run dev` - Start development server with auto-reload
- `npm run process-data` - Process and import sample data

## Error Handling

The API returns consistent error responses:

```json
{
  "success": false,
  "error": "Error message"
}
```

## Success Responses

All successful responses follow this format:

```json
{
  "success": true,
  "data": {...},
  "message": "Optional success message",
  "pagination": {...} // For paginated responses
}
```

## Development

The project uses:
- **TypeScript** for type safety
- **Nodemon** for development auto-reload
- **Mongoose** for MongoDB object modeling
- **Express.js** for web framework
- **CORS** for cross-origin requests
- **dotenv** for environment variables

## License

ISC


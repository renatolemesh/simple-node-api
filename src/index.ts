import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/database';
import productRoutes from './routes/productRoutes';

dotenv.config();

const app = express();
const PORT = parseInt(process.env.PORT || '3000');

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/products', productRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Products API is running' });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'Products API', 
    version: '1.0.0',
    endpoints: {
      health: '/health',
      products: '/api/products'
    }
  });
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

const startServer = async () => {
  try {
    // Connect to database
    await connectDB();
    
    // Start server
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server is running on http://0.0.0.0:${PORT}`);
      console.log(`Health check: http://0.0.0.0:${PORT}/health`);
      console.log(`Products API: http://0.0.0.0:${PORT}/api/products`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();


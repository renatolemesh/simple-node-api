

// routes/externalProductRoutes.ts
import express from 'express';
import {
  getExternalProductById,
  searchExternalProducts,
  getExternalProductsCacheStatus
} from '../controllers/externalProductController';

const router = express.Router();

// GET /api/external-products/cache-status
router.get('/cache-status', getExternalProductsCacheStatus);

// GET /api/external-products/search?q=term
router.get('/search', searchExternalProducts);

// GET /api/external-products/:id
router.get('/:id', getExternalProductById);

export default router;
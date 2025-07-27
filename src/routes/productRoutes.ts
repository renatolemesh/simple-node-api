import express from 'express';
import {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  searchProducts,
  tests,
  deleteAllProducts,
  getProductsShortData,
} from '../controllers/productController';

const router = express.Router();

// GET /api/products - Get all products with pagination
router.get('/', getAllProducts);

// GET /api/products/search - Search products (must come before /:id)
router.get('/search', searchProducts);

// POST /api/products - Create new product
router.post('/', createProduct);

// GET /api/products/:id - Get product by ID
router.get('/:id', getProductById);

// PUT /api/products/:id - Update product
router.put('/:id', updateProduct);

// DELETE /api/products/:id - Delete product
router.delete('/:id', deleteProduct);

// GET /api/products/tests/1 - tests case
router.get('/tests/1', tests);

// DELETE /api/products/delete/all - Delete all products
router.delete('/delete/all', deleteAllProducts);

router.get('/short-data/all', getProductsShortData);

export default router;


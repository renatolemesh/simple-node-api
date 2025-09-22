import { Request, Response } from 'express';
import { externalProductService } from '../services/externalProductService';

export const getExternalProductById = async (req: Request, res: Response) => {
  try {
    const productId = parseInt(req.params.id);

    if (isNaN(productId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID'
      });
    }

    const product = await externalProductService.getProductById(productId);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.json({
      success: true,
      data: product
    });
  } catch (error) {
    console.error('Error getting external product:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const searchExternalProducts = async (req: Request, res: Response) => {
  try {
    const { q } = req.query;

    if (!q || typeof q !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }

    const products = await externalProductService.searchProducts(q);

    res.json({
      success: true,
      data: products,
      total: products.length
    });
  } catch (error) {
    console.error('Error searching external products:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const getExternalProductsCacheStatus = async (req: Request, res: Response) => {
  try {
    const status = externalProductService.getCacheStatus();
    res.json({
      success: true,
      data: status
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error getting cache status'
    });
  }
};
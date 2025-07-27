import { Request, Response } from 'express';
import Product, { IProduct } from '../models/Product';

// Get all products
export const getAllProducts = async (req: Request, res: Response) => {
  try {
    const { no_paginate } = req.query;

    if (no_paginate) {
      const products = await Product.find().sort({ createdAt: -1 });

      res.json({
        success: true,
        products: products
      });
    } else {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const skip = (page - 1) * limit;

      const products = await Product.find()
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 });

      const total = await Product.countDocuments();
      const totalPages = Math.ceil(total / limit);

      res.json({
        success: true,
        products: products,
        pagination: {
          currentPage: page,
          totalPages,
          totalItems: total,
          itemsPerPage: limit
        }
      });
    }
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch products'
    });
  }
};

// Get product by ID
export const getProductById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const product = await Product.findOne({ id: parseInt(id) });

    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }

    res.json({
      success: true,
      data: product
    });
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch product'
    });
  }
};

// Create new product
export const createProduct = async (req: Request, res: Response) => {
  try {
    const productData = req.body;

    // Check if product with same ID already exists
    const existingProduct = await Product.findOne({ id: productData.id });
    if (existingProduct) {
      return res.status(400).json({
        success: false,
        error: 'Product with this ID already exists'
      });
    }

    const product = new Product(productData);
    await product.save();

    res.status(201).json({
      success: true,
      data: product,
      message: 'Product created successfully'
    });
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create product'
    });
  }
};

// Update product
export const updateProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const product = await Product.findOneAndUpdate(
      { id: parseInt(id) },
      updateData,
      { new: true, runValidators: true }
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }

    res.json({
      success: true,
      data: product,
      message: 'Product updated successfully'
    });
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update product'
    });
  }
};

// Delete product
export const deleteProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const product = await Product.findOneAndDelete({ id: parseInt(id) });

    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }

    res.json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete product'
    });
  }
};

// Delete all products
export const deleteAllProducts = async (req: Request, res: Response) => {
  try {
    await Product.deleteMany({});
    res.json({
      success: true,
      message: 'All products deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting all products:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete all products'
    });
  }
};

// Search products
export const searchProducts = async (req: Request, res: Response) => {
  try {
    const { q } = req.query;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    if (!q) {
      return res.status(400).json({
        success: false,
        error: 'Search query is required'
      });
    }

    const searchRegex = new RegExp(q as string, 'i');
    const products = await Product.find({
      $or: [
        { name: searchRegex },
        { detail: searchRegex }
      ]
    })
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await Product.countDocuments({
      $or: [
        { name: searchRegex },
        { detail: searchRegex }
      ]
    });

    const totalPages = Math.ceil(total / limit);

    res.json({
      success: true,
      data: products,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: total,
        itemsPerPage: limit
      }
    });
  } catch (error) {
    console.error('Error searching products:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to search products'
    });
  }
};

//tests
export const tests = async (req: Request, res: Response) => {
  res.json({
    test: "test executed sucefully",
  });
}

// Get all product names and ids (no pagination)
export const getProductsShortData = async (req: Request, res: Response) => {
  try {
    const products = await Product.find({}, { id: 1, detail: 1, unitPrice: 1, name: 1, _id: 0 }).sort({ createdAt: -1 });

    res.json({
      success: true,
      products: products
    });
  } catch (error) {
    console.error('Error fetching product names and IDs:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch product names and IDs'
    });
  }
};





"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchProducts = exports.deleteProduct = exports.updateProduct = exports.createProduct = exports.getProductById = exports.getAllProducts = void 0;
const Product_1 = __importDefault(require("../models/Product"));
// Get all products
const getAllProducts = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const products = await Product_1.default.find()
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 });
        const total = await Product_1.default.countDocuments();
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
    }
    catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch products'
        });
    }
};
exports.getAllProducts = getAllProducts;
// Get product by ID
const getProductById = async (req, res) => {
    try {
        const { id } = req.params;
        const product = await Product_1.default.findOne({ id: parseInt(id) });
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
    }
    catch (error) {
        console.error('Error fetching product:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch product'
        });
    }
};
exports.getProductById = getProductById;
// Create new product
const createProduct = async (req, res) => {
    try {
        const productData = req.body;
        // Check if product with same ID already exists
        const existingProduct = await Product_1.default.findOne({ id: productData.id });
        if (existingProduct) {
            return res.status(400).json({
                success: false,
                error: 'Product with this ID already exists'
            });
        }
        const product = new Product_1.default(productData);
        await product.save();
        res.status(201).json({
            success: true,
            data: product,
            message: 'Product created successfully'
        });
    }
    catch (error) {
        console.error('Error creating product:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to create product'
        });
    }
};
exports.createProduct = createProduct;
// Update product
const updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;
        const product = await Product_1.default.findOneAndUpdate({ id: parseInt(id) }, updateData, { new: true, runValidators: true });
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
    }
    catch (error) {
        console.error('Error updating product:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update product'
        });
    }
};
exports.updateProduct = updateProduct;
// Delete product
const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const product = await Product_1.default.findOneAndDelete({ id: parseInt(id) });
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
    }
    catch (error) {
        console.error('Error deleting product:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to delete product'
        });
    }
};
exports.deleteProduct = deleteProduct;
// Search products
const searchProducts = async (req, res) => {
    try {
        const { q } = req.query;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        if (!q) {
            return res.status(400).json({
                success: false,
                error: 'Search query is required'
            });
        }
        const searchRegex = new RegExp(q, 'i');
        const products = await Product_1.default.find({
            $or: [
                { name: searchRegex },
                { detail: searchRegex }
            ]
        })
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 });
        const total = await Product_1.default.countDocuments({
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
    }
    catch (error) {
        console.error('Error searching products:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to search products'
        });
    }
};
exports.searchProducts = searchProducts;
//# sourceMappingURL=productController.js.map
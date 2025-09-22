import { ExternalProduct, CacheStatus } from '../types/ExternalProduct';
import { externalProductCache } from '../models/ExternalProductCache';
import { productDataProcessor } from '../processExternalProducts'; // Adjust path
import { convertCachedToExternal } from '../utils/externalProductConverter';
import fetchProducts from './externalGetProducts'; // Adjust path as needed

export class ExternalProductService {
  /**
   * Get a single product by ID
   */
  async getProductById(id: number): Promise<ExternalProduct | null> {
    // Try cache first
    let product = externalProductCache.get(id);
    
    if (!product) {
      // If not in cache, fetch all products
      await this.loadProducts();
      product = externalProductCache.get(id);
    }

    return product || null;
  }

  /**
   * Search products by query string
   */
  async searchProducts(query: string): Promise<ExternalProduct[]> {
    // Ensure products are loaded
    if (externalProductCache.isEmpty()) {
      await this.loadProducts();
    }

    return externalProductCache.search(query);
  }

  /**
   * Advanced search using the processor's capabilities
   */
  async advancedSearch(query: string): Promise<ExternalProduct[]> {
    if (externalProductCache.isEmpty()) {
      await this.loadProducts();
    }

    // Use the processor's search which includes barcode and ID search
    const processorResults = productDataProcessor.searchProducts(query);
    
    // Convert results to ExternalProduct format
    return processorResults.map(convertCachedToExternal);
  }

  /**
   * Get products by type
   */
  async getProductsByType(type: number): Promise<ExternalProduct[]> {
    if (externalProductCache.isEmpty()) {
      await this.loadProducts();
    }
    return externalProductCache.getByType(type);
  }

  /**
   * Get products that have variables
   */
  async getProductsWithVariables(): Promise<ExternalProduct[]> {
    if (externalProductCache.isEmpty()) {
      await this.loadProducts();
    }
    return externalProductCache.getWithVariables();
  }

  /**
   * Get enabled products only
   */
  async getEnabledProducts(): Promise<ExternalProduct[]> {
    if (externalProductCache.isEmpty()) {
      await this.loadProducts();
    }
    return externalProductCache.getEnabled();
  }

  /**
   * Get all products
   */
  async getAllProducts(): Promise<ExternalProduct[]> {
    if (externalProductCache.isEmpty()) {
      await this.loadProducts();
    }
    return externalProductCache.getAll();
  }

  /**
   * Load products from external API and process them
   */
  async loadProducts(): Promise<void> {
    try {
      console.log('Loading products from external API...');
      
      // Use your existing fetchProducts function
      const apiResponse = await fetchProducts();
      
      // Process the response
      if (!apiResponse || !apiResponse.products) {
        throw new Error('Invalid API response');
      }

      // Use your sophisticated processor
      const processedProducts = productDataProcessor.processProducts(apiResponse.products);
      
      // Convert to ExternalProduct format for cache
      const cacheProducts = processedProducts.map(convertCachedToExternal);
      
      // Store in cache
      externalProductCache.set(cacheProducts);
      
      console.log(`Loaded ${cacheProducts.length} external products`);
    } catch (error) {
      console.error('Error loading external products:', error);
      throw error;
    }
  }

  /**
   * Get product with full hierarchy using the processor
   */
  async getProductHierarchy(productId: number): Promise<any> {
    // Ensure the product is processed by the data processor
    const cachedProduct = productDataProcessor.getCachedProduct(productId);
    
    if (!cachedProduct) {
      // Try to load from API if not cached
      await this.loadProducts();
      return productDataProcessor.getProductHierarchy(productId);
    }

    return productDataProcessor.getProductHierarchy(productId);
  }

  /**
   * Calculate estimated cost for a product
   */
  async getProductCost(productId: number): Promise<number | null> {
    const hierarchy = await this.getProductHierarchy(productId);
    return hierarchy?.estimatedCost || null;
  }

  /**
   * Get component count for a product
   */
  async getProductComponentCount(productId: number): Promise<number | null> {
    const hierarchy = await this.getProductHierarchy(productId);
    return hierarchy?.totalComponents || null;
  }

  /**
   * Get cache status and statistics
   */
  getCacheStatus(): CacheStatus {
    const processorStats = productDataProcessor.getCacheStats();
    return {
      totalProducts: externalProductCache.size(),
      lastFetch: externalProductCache.getLastFetch(),
      isEmpty: externalProductCache.isEmpty(),
      processorStats
    };
  }

  /**
   * Clear all caches
   */
  clearCache(): void {
    externalProductCache.clear();
    productDataProcessor.clearCache();
  }

  /**
   * Force reload products from API
   */
  async reloadProducts(): Promise<void> {
    this.clearCache();
    await this.loadProducts();
  }

  /**
   * Check if products are loaded in cache
   */
  isLoaded(): boolean {
    return !externalProductCache.isEmpty();
  }

  /**
   * Get cache size
   */
  getCacheSize(): number {
    return externalProductCache.size();
  }
}

export const externalProductService = new ExternalProductService();
import fs from 'fs';
import path from 'path';
import connectDB from './config/database';
import Product from './models/Product';

interface RawComponent {
  id: number;
  name: string;
  unitPrice: number;
  unit: string;
  enabled: string;
  barcode?: string;
  detail?: string;
  href?: string;
}

interface RawVariable {
  id: number;
  name: string;
  requerid: string;
  quantity: number;
  maximum: string;
  quantitymaximum: number;
  components: Array<{
    component: RawComponent;
  }>;
}

interface RawStructure {
  variable?: RawVariable;
}

interface RawProduct {
  id: number;
  name: string;
  unitPrice: number;
  unit: string;
  enabled: string;
  barcode?: string;
  detail?: string;
  href?: string;
  salesgroup?: number;
  groupId?: number;
  type?: number;
  highlighted?: string;
  manufactured?: string;
  productResale?: string;
  lastCost?: number;
  structure?: RawStructure[];
}

interface RawData {
  products: RawProduct[];
}

const processData = async () => {
  try {
    console.log('Starting data processing...');
    
    // Wait a bit for MongoDB to be ready
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // Connect to database
    await connectDB();
    
    // Read JSON file
    const jsonPath = path.join(__dirname, '..', 'src', 'sample_products.json');
    console.log(`Reading data from: ${jsonPath}`);
    
    if (!fs.existsSync(jsonPath)) {
      throw new Error(`Sample data file not found at: ${jsonPath}`);
    }
    
    const rawData = fs.readFileSync(jsonPath, 'utf8');
    
    // Parse JSON directly
    const data: RawData = JSON.parse(rawData);
    
    console.log(`Found ${data.products.length} products to process`);
    
    // Clear existing products
    await Product.deleteMany({});
    console.log('Cleared existing products');
    
    // Process each product
    for (const rawProduct of data.products) {
      const processedProduct = {
        id: rawProduct.id,
        name: rawProduct.name,
        unitPrice: rawProduct.unitPrice,
        unit: rawProduct.unit,
        enabled: rawProduct.enabled,
        barcode: rawProduct.barcode || '',
        detail: rawProduct.detail || '',
        href: rawProduct.href || '',
        salesgroup: rawProduct.salesgroup,
        groupId: rawProduct.groupId,
        type: rawProduct.type,
        highlighted: rawProduct.highlighted,
        manufactured: rawProduct.manufactured,
        productResale: rawProduct.productResale,
        lastCost: rawProduct.lastCost,
        variables: [] as any[]
      };
      
      // Process structure to extract variables
      if (rawProduct.structure) {
        for (const structureItem of rawProduct.structure) {
          if (structureItem.variable) {
            const variable = structureItem.variable;
            const processedVariable = {
              id: variable.id,
              name: variable.name,
              required: variable.requerid,
              quantity: variable.quantity,
              maximum: variable.maximum,
              quantityMaximum: variable.quantitymaximum,
              components: variable.components.map(comp => ({
                id: comp.component.id,
                name: comp.component.name,
                unitPrice: comp.component.unitPrice,
                unit: comp.component.unit,
                enabled: comp.component.enabled,
                barcode: comp.component.barcode || '',
                detail: comp.component.detail || '',
                href: comp.component.href || ''
              }))
            };
            processedProduct.variables.push(processedVariable);
          }
        }
      }
      
      // Save to database
      const product = new Product(processedProduct);
      await product.save();
      console.log(`Saved product: ${product.name}`);
    }
    
    console.log('Data processing completed successfully');
    
  } catch (error) {
    console.error('Error processing data:', error);
    throw error;
  }
};

// Only run if this file is executed directly
if (require.main === module) {
  processData()
    .then(() => {
      console.log('Data processing finished');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Data processing failed:', error);
      process.exit(1);
    });
}

export default processData;


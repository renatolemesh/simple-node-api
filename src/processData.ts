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
  type?: string;
  value?: number;
}

interface RawVariable {
  id: number;
  name: string;
  requerid: string;
  quantity: number;
  maximum: string;
  quantitymaximum: number;
  quantityadditional: number;
  valueadditional: number;
  price: number;
  value?: number;
  components: Array<{
    id: number;
    product?: number;
    order?: number;
    variableComposition?: number;
    quantity?: number;
    value?: number;
    component: RawComponent;
  }>;
}

interface RawStructure {
  id: number;
  product: number;
  variableComposition?: number;
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
  type?: number;
  value?: number;
  structure?: RawStructure[];
}

interface RawData {
  products: RawProduct[];
}

const processData = async () => {
  try {
    // Connect to database
    await connectDB();
    
    // Read JSON file
    const jsonPath = path.join(__dirname, 'sample_products.json');
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
        type: rawProduct.type,
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
              price: variable.price,
              valueadditional: variable.valueadditional,
              value: variable.value || 0,
              components: variable.components.map(comp => ({
                id: comp.component.id,
                name: comp.component.name,
                unitPrice: comp.component.unitPrice,
                unit: comp.component.unit,
                enabled: comp.component.enabled,
                barcode: comp.component.barcode || '',
                detail: comp.component.detail || '',
                href: comp.component.href || '',
                value: comp.value || 0,
                type: comp.component.type || '',
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
    process.exit(0);
    
  } catch (error) {
    console.error('Error processing data:', error);
    process.exit(1);
  }
};

processData();


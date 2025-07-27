"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const database_1 = __importDefault(require("./config/database"));
const Product_1 = __importDefault(require("./models/Product"));
const processData = async () => {
    try {
        // Connect to database
        await (0, database_1.default)();
        // Read JSON file
        const jsonPath = path_1.default.join(__dirname, 'sample_products.json');
        const rawData = fs_1.default.readFileSync(jsonPath, 'utf8');
        // Parse JSON directly
        const data = JSON.parse(rawData);
        console.log(`Found ${data.products.length} products to process`);
        // Clear existing products
        await Product_1.default.deleteMany({});
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
                variables: []
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
            const product = new Product_1.default(processedProduct);
            await product.save();
            console.log(`Saved product: ${product.name}`);
        }
        console.log('Data processing completed successfully');
        process.exit(0);
    }
    catch (error) {
        console.error('Error processing data:', error);
        process.exit(1);
    }
};
processData();
//# sourceMappingURL=processData.js.map
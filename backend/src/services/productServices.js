import productRepository from '../repository/productRepository.js';
import { 
    CreateProductDTO, 
    UpdateProductDTO, 
    ProductResponseDTO,
    ProductListResponseDTO 
} from '../dto/productDTO.js';

class ProductService {
    async getAllProducts(filters) {
        const products = await productRepository.findAll(filters);
        const total = await productRepository.count(filters);
        
        const productList = products.map(product => new ProductListResponseDTO(product));

        return {
            products: productList,
            pagination: {
                total,
                limit: filters.limit || total,
                offset: filters.offset || 0,
                pages: filters.limit ? Math.ceil(total / filters.limit) : 1
            }
        };
    }

    async getProductById(productId) {
        const product = await productRepository.findById(productId);
        
        if (!product) {
            throw new Error('Product not found');
        }

        return new ProductResponseDTO(product);
    }

    async createProduct(productData) {
        if (productData.product_base_price <= 0) {
            throw new Error('Product price must be greater than 0');
        }

        if (productData.product_discount_percentage < 0 || productData.product_discount_percentage > 100) {
            throw new Error('Discount percentage must be between 0 and 100');
        }

        const codeExists = await productRepository.existsByCode(productData.product_code);
        if (codeExists) {
            throw new Error('Product code already exists');
        }

        const dto = new CreateProductDTO(productData);
        const newProduct = await productRepository.create(dto);
        
        return new ProductResponseDTO(newProduct);
    }

    async updateProduct(productId, productData) {
        const existingProduct = await productRepository.findById(productId);
        if (!existingProduct) {
            throw new Error('Product not found');
        }

        if (productData.product_base_price !== undefined && productData.product_base_price <= 0) {
            throw new Error('Product price must be greater than 0');
        }

        if (productData.product_discount_percentage !== undefined) {
            if (productData.product_discount_percentage < 0 || productData.product_discount_percentage > 100) {
                throw new Error('Discount percentage must be between 0 and 100');
            }
        }

        if (productData.product_code) {
            const codeExists = await productRepository.existsByCode(
                productData.product_code, 
                productId
            );
            if (codeExists) {
                throw new Error('Product code already exists');
            }
        }

        const dto = new UpdateProductDTO(productData);
        const updatedProduct = await productRepository.update(productId, dto);
        
        return new ProductResponseDTO(updatedProduct);
    }

    async deleteProduct(productId) {
        const exists = await productRepository.findById(productId);
        if (!exists) {
            throw new Error('Product not found');
        }

        return await productRepository.delete(productId);
    }

    async getBrands() {
        return await productRepository.getBrands();
    }
}

export default new ProductService();
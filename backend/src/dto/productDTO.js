export class CreateProductDTO {
    constructor(data) {
        this.product_category_id = data.product_category_id || null;
        this.product_code = data.product_code;
        this.product_name = data.product_name;
        this.product_description = data.product_description || null;
        this.product_base_price = parseFloat(data.product_base_price);
        this.product_discount_percentage = parseFloat(data.product_discount_percentage || 0);
        this.product_brand = data.product_brand || null;
        this.product_dimensions = data.product_dimensions || null;
        this.product_is_featured = data.product_is_featured === true || data.product_is_featured === 1;
    }
}

export class UpdateProductDTO {
    constructor(data) {
        if (data.product_category_id !== undefined) {
            this.product_category_id = data.product_category_id;
        }
        if (data.product_code !== undefined) {
            this.product_code = data.product_code;
        }
        if (data.product_name !== undefined) {
            this.product_name = data.product_name;
        }
        if (data.product_description !== undefined) {
            this.product_description = data.product_description;
        }
        if (data.product_base_price !== undefined) {
            this.product_base_price = parseFloat(data.product_base_price);
        }
        if (data.product_discount_percentage !== undefined) {
            this.product_discount_percentage = parseFloat(data.product_discount_percentage);
        }
        if (data.product_brand !== undefined) {
            this.product_brand = data.product_brand;
        }
        if (data.product_dimensions !== undefined) {
            this.product_dimensions = data.product_dimensions;
        }
        if (data.product_is_featured !== undefined) {
            this.product_is_featured = data.product_is_featured === true || data.product_is_featured === 1;
        }
    }
}

export class ProductResponseDTO {
    constructor(product) {
        this.product_id = product.product_id;
        this.product_code = product.product_code;
        this.product_name = product.product_name;
        this.product_description = product.product_description;
        this.product_base_price = parseFloat(product.product_base_price);
        this.product_discount_percentage = parseFloat(product.product_discount_percentage);
        this.product_final_price = this.calculateFinalPrice();
        this.product_brand = product.product_brand;
        this.product_dimensions = product.product_dimensions;
        this.product_is_featured = Boolean(product.product_is_featured);
        
        if (product.images) {
            try {
                this.images = typeof product.images === 'string' 
                    ? JSON.parse(product.images) 
                    : product.images;
            } catch {
                this.images = [];
            }
        }
    }

    calculateFinalPrice() {
        const discount = this.product_base_price * (this.product_discount_percentage / 100);
        return this.product_base_price - discount;
    }
}

export class ProductListResponseDTO {
    constructor(product) {
        this.product_id=product.product_id;
        this.product_code = product.product_code;
        this.product_name = product.product_name;
        this.product_base_price = parseFloat(product.product_base_price);
        this.product_discount_percentage = parseFloat(product.product_discount_percentage);
        this.product_brand = product.product_brand;
        this.product_is_featured = Boolean(product.product_is_featured);
        this.primary_image = product.primary_image || null;
    }
}
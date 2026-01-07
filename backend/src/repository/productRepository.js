import db from '../config/database.js';
const ALLOWED_FIELDS = [
    'product_category_id',
    'product_code',
    'product_name',
    'product_description',
    'product_base_price',
    'product_discount_percentage',
    'product_brand',
    'product_dimensions',
    'product_is_featured'
];
class ProductRepository {
    async findAll(options = {}) {
        let sql = `SELECT product_code, product_name, product_base_price, product_brand FROM product `;

        const conditions = [];
        const params = [];
        if (options.filters?.brandId) {
            sql += `product_brand = ?`;
            params.push(options.filters.brandId);
        }

        if (options.filters?.categoryId) {
            sql += `product_category_id = ?`;
            params.push(options.filters.categoryId);
        }

        if (options.filters?.minPrice && options.filters?.maxPrice) {
            conditions.push(`product_base_price BETWEEN ? AND ?`);
            params.push(options.filters.minPrice, options.filters.maxPrice);
        }
        
        if (conditions.length > 0) {
            sql += ` WHERE ` + conditions.join(' AND ');
        }


        sql += `ORDER BY product_created_at DESC`;

        if (options.limit) {
            sql += ` LIMIT ?`;
            params.push(options.limit);
        }
        if (options.offset) {
            sql += ` OFFSET ?`;
            params.push(options.offset);
        }

        const [products] = await db.execute(sql, params);
        return products;
    }

    async findByID(id) {
        let sql = "SELECT product_code, product_name, product_base_price, product_brand FROM product WHERE product_id = ?";
        const [products] = await db.execute(sql, [id]);
        return products[0];
    }

    async findByCode(code) {
        let sql = `SELECT product_code, product_name, product_base_price, product_brand FROM product WHERE product_code = ?`;
        const [products] = await db.execute(sql, [code]);
        return products[0];
    }

    async findByCategoryId(cateID) {
        const sql = `SELECT * FROM product WHERE cate_id = ?`;
        const [rows] = await db.execute(sql, [cateID]);
        return rows;
    }

    async findByName(name) {
        const sql = `SELECT  product_code, product_name, product_base_price, product_brand FROM product WHERE product_name LIKE ? `;
        const [rows] = await db.execute(sql, [`%${name}%`]);
        return rows;
    }

    async deleteProduct(id) {
        let sql = `DELETE FROM product WHERE product_id = ?`;
        const [results] = await db.execute(sql, [id]);
        return results.affectedRows > 0;
    }

    async createProduct(data) {

        let sql = `INSERT INTO product (
                product_id,
                product_category_id,
                product_code,
                product_name,
                product_description,
                product_base_price,
                product_discount_percentage,
                product_brand,
                product_dimensions,
                product_is_featured
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        const params = [
            data.product_id,
            data.product_category_id,
            data.product_code,
            data.product_name,
            data.product_description,
            data.product_base_price,
            data.product_discount_percentage,
            data.product_brand,
            data.product_dimensions,
            data.product_is_featured
        ];
        await db.execute(sql, params);
        return this.findByID(data.product_id);

    }

    async update(productId, productData) {
        const fields = [];
        const params = [];

        Object.keys(productData).forEach(key => {
            if (ALLOWED_FIELDS.includes(key)) {
                fields.push(`${key} = ?`);
                params.push(productData[key]);
            }
        });

        if (fields.length === 0) {
            return false;
        }

        params.push(productId);
        const query = `UPDATE product SET ${fields.join(', ')} WHERE product_id = ?`;

        const [results] = await db.execute(query, params);

        if (results.affectedRows === 0) {
            return null;
        }

        return true
    }
}

export default new ProductRepository();
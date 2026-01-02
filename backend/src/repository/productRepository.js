import db from '../config/database.js';
import { v4 as uuidv4 } from 'uuid';

class ProductRepository {
    /**
     * Lấy tất cả sản phẩm (JOIN với Category và Inventory)
     */
    async findAll(filters = {}) {
        let query = `
            SELECT 
                p.*,
                c.cate_name as category_name,
                i.inventory_quantity,
                i.inventory_status,
                (SELECT pi.image_url 
                 FROM Product_Image pi 
                 WHERE pi.image_product_id = p.product_id 
                   AND pi.image_is_primary = 1 
                 LIMIT 1) as primary_image_url
            FROM Product p
            LEFT JOIN Category c ON p.product_category_id = c.cate_id
            LEFT JOIN Inventory i ON p.product_id = i.invent_product_id
            WHERE 1=1
        `;
        const params = [];

        // Filter: Featured products
        if (filters.is_featured !== undefined) {
            query += ' AND p.product_is_featured = ?';
            params.push(filters.is_featured);
        }

        // Filter: Brand
        if (filters.brand) {
            query += ' AND p.product_brand = ?';
            params.push(filters.brand);
        }

        // Filter: Category
        if (filters.category_id) {
            query += ' AND p.product_category_id = ?';
            params.push(filters.category_id);
        }

        // Filter: Search by name
        if (filters.search) {
            query += ' AND p.product_name LIKE ?';
            params.push(`%${filters.search}%`);
        }

        // Filter: Price range
        if (filters.min_price) {
            query += ' AND p.product_base_price >= ?';
            params.push(filters.min_price);
        }
        if (filters.max_price) {
            query += ' AND p.product_base_price <= ?';
            params.push(filters.max_price);
        }

        // Sorting
        const allowedSortFields = ['product_name', 'product_base_price', 'created_at'];
        const orderBy = allowedSortFields.includes(filters.sort_by) ? filters.sort_by : 'product_name'
        const orderDir = filters.order === 'desc' ? 'DESC' : 'ASC';
        query += ` ORDER BY p.${orderBy} ${orderDir}`;

        // Pagination
        if (filters.limit) {
            query += ' LIMIT ?';
            params.push(parseInt(filters.limit));

            if (filters.offset) {
                query += ' OFFSET ?';
                params.push(parseInt(filters.offset));
            }
        }

        const [rows] = await db.execute(query, params);
        return rows;
    }

    /**
     * Đếm tổng số sản phẩm
     */
    async count(filters = {}) {
        let query = 'SELECT COUNT(*) as total FROM Product p WHERE 1=1';
        const params = [];

        if (filters.is_featured !== undefined) {
            query += ' AND p.product_is_featured = ?';
            params.push(filters.is_featured);
        }

        if (filters.brand) {
            query += ' AND p.product_brand = ?';
            params.push(filters.brand);
        }

        if (filters.category_id) {
            query += ' AND p.product_category_id = ?';
            params.push(filters.category_id);
        }

        if (filters.search) {
            query += ' AND p.product_name LIKE ?';
            params.push(`%${filters.search}%`);
        }

        const [rows] = await db.execute(query, params);
        return rows[0].total;
    }

    /**
     * Lấy chi tiết sản phẩm theo ID
     * JOIN với Category, Inventory và lấy tất cả Images
     */
    async findById(productId) {
        // Query 1: Lấy thông tin product + category + inventory
        const productQuery = `
            SELECT 
                p.*,
                c.cate_id as category_id,
                c.cate_name as category_name,
                c.cate_code as category_code,
                c.cate_description as category_description,
                i.inventory_id,
                i.inventory_quantity,
                i.inventory_status,
                i.inventory_reorder_level
            FROM Product p
            LEFT JOIN Category c ON p.product_category_id = c.cate_id
            LEFT JOIN Inventory i ON p.product_id = i.inventory_product_id
            WHERE p.product_id = ?
        `;

        const [productRows] = await db.execute(productQuery, [productId]);

        if (productRows.length === 0) {
            return null;
        }

        const product = productRows[0];

        // Query 2: Lấy tất cả images của product
        const imagesQuery = `
            SELECT 
                image_id,
                image_url,
                image_alt_text,
                image_display_order,
                image_is_primary,
                image_uploaded_at
            FROM Product_Image
            WHERE image_product_id = ?
            ORDER BY image_display_order ASC
        `;

        const [imagesRows] = await db.execute(imagesQuery, [productId]);

        // Gắn images vào product
        product.images = imagesRows;

        return product;
    }

    /**
     * Lấy sản phẩm theo product_code
     */
    async findByCode(productCode) {
        const query = 'SELECT * FROM Product WHERE product_code = ?';
        const [rows] = await db.execute(query, [productCode]);
        return rows[0] || null;
    }

    /**
     * Tạo sản phẩm mới
     */
    async create(productData) {
        const productId = uuidv4();

        const query = `
            INSERT INTO Product (
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
            productId,
            productData.product_category_id,
            productData.product_code,
            productData.product_name,
            productData.product_description,
            productData.product_base_price,
            productData.product_discount_percentage,
            productData.product_brand,
            productData.product_dimensions,
            productData.product_is_featured
        ];

        await db.execute(query, params);
        return this.findById(productId);
    }

    /**
     * Cập nhật sản phẩm
     */
    async update(productId, productData) {
        const fields = [];
        const params = [];

        Object.keys(productData).forEach(key => {
            fields.push(`${key} = ?`);
            params.push(productData[key]);
        });

        if (fields.length === 0) {
            throw new Error('No fields to update');
        }

        params.push(productId);
        const query = `UPDATE Product SET ${fields.join(', ')} WHERE product_id = ?`;

        const [result] = await db.execute(query, params);

        if (result.affectedRows === 0) {
            return null;
        }

        return this.findById(productId);
    }

    /**
     * Xóa sản phẩm
     */
    async delete(productId) {
        const query = 'DELETE FROM Product WHERE product_id = ?';
        const [result] = await db.execute(query, [productId]);
        return result.affectedRows > 0;
    }

    /**
     * Kiểm tra product_code đã tồn tại
     */
    async existsByCode(productCode, excludeId = null) {
        let query = 'SELECT COUNT(*) as count FROM Product WHERE product_code = ?';
        const params = [productCode];

        if (excludeId) {
            query += ' AND product_id != ?';
            params.push(excludeId);
        }

        const [rows] = await db.execute(query, params);
        return rows[0].count > 0;
    }

    /**
     * Lấy danh sách brands (distinct)
     */
    async getBrands() {
        const query = `
            SELECT DISTINCT product_brand 
            FROM Product 
            WHERE product_brand IS NOT NULL 
            ORDER BY product_brand
        `;
        const [rows] = await db.execute(query);
        return rows.map(row => row.product_brand);
    }
}

export default new ProductRepository();
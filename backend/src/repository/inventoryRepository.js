import db from '../config/database.js';

const ALLOWED_FIELDS = [
  'invent_quantity_available',
  'invent_quantity_reserved',
  'invent_reorder_level'
];
class InventoryRepository{

    async findByProductId(productID){
        const sql =`SELECT invent_quantity_available, invent_quantity_reserved, invent_order_level FROM inventory WHERE invent_product_id = ?`;
        const [rows]= await db.execute(sql, [productID]);
        return rows.length ? rows[0] : null;
    }

    async create(data,){
        const sql = `INSERT INTO inventory (
            invent_product_id,
            invent_quantity_available,
            invent_quantity_reserved,
            invent_reorder_level
        ) VALUES (?,?,?,?)`;
         const params=[
            data.product_id,
            data.invent_quantity_available,
            data.invent_quantity_reserved,
            data.invent_reorder_level
         ];
         await db.execute(sql, params);
         return true;
    }

    async deleteInventory(productId){
           let sql= `DELETE FROM inventory WHERE invent_product_id = ?`;
           const [results]=await db.execute(sql,[productId]);
           return results.affectedRows > 0;
    }

    async update(productId, data){
         const fields=[];
         const params=[];

         Object.keys(data).forEach(key =>{
            if(ALLOWED_FIELDS.includes(key)){
            fields.push(`${key} = ?`);
            params.push(data[key]);
            }
         });

         if(fields.length===0){
           return false;
         }
         params.push(productId);
         const sql=`UPDATE inventory SET ${fields.join(', ')} WHERE invent_product_id = ?`;
         const [results]= await db.execute(sql, params);

       
         return results.affectedRows > 0;
    }
  
}

export default new InventoryRepository();
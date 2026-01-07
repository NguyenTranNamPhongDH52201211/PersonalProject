import db from '../config/database.js';
import { v4 as uuidv4 } from 'uuid';
const ALLOWED_FIELDS = [
  'invent_quantity_available',
  'invent_quantity_reserved',
  'invent_reorder_level'
];
class InventoryRespository{

    async findByProductId(productID){
        const sql =`SELECT invent_quantity_available FROM inventory WHERE invent_product_id = ?`;
        const [rows]= await db.execute(sql, [productID]);
        return rows[0];
    }

    async create(data){
        const sql = `INSERT INTO invetory (
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

    async update(productId, productData){
         const fields=[];
         const params=[];

         Object.keys(productData).forEach(key =>{
            if(ALLOWED_FIELDS.includes(key)){
            fields.push(`${key} = ?`);
            params.push(productData[key]);
            }
         });

         if(fields.length===0){
           return false;
         }
         params.push(productId);
         const sql=`UPDATE inventory SET ${fields.join(', ')} WHERE invent_product_id = ?`;
         const [results]= await db.execute(sql, params);

         if(results.affectedRows===0){
            return null;
         }

         return true;
    }
  
}

export default new InventoryRespository();
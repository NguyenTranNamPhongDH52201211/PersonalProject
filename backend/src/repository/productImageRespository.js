import db from '../config/database.js';
const ALLOWED_FIELDS = [
    'image_url',
    'image_alt_text',
    'image_display_order',
    'images_is_primary',
];
class ProductImageRespository{
    async findAll(){
        let sql=`SELECT image_id, image_url, image_alt_text, image_display_order, image_is_primary FROM product_image`;
        const [images]= await db.execute(sql);
        return images;
    }

    async create(data){
        const sql =`INSERT INTO product_image (
              image_id,
              image_product_id,
              image_url,
              image_alt_text,
              image_display_order,
              image_is_primary
        ) VALUES (?,?,?,?,?,?)`;
         const params=[
            data.image_id,
            data.product_id,
            data.image_url,
            data.image_alt_text,
            data.image_display_order,
            data.image_is_primary
         ];
         await db.execute(sql,params);
         return true;
    }

    async delete(productId,imageId){
        const sql =`DELETE FROM product_image WHERE product_id = ? AND image_id = ?`;
        const [results]= await db.execute(sql,[productId,imageId]);
        return results.affectedRow > 0;
    }

    async update(productId, imageId,data){
        const fields=[];
        const params=[];

         Object.keys(data).forEach(key => {
             if(ALLOWED_FIELDS.includes(key)){
            fields.push(`${key} = ?`);
            params.push(data[key]);
             }
        });
        if(fields.length===0){
            return false;
        }

        params.push(imageId,productId);
           const sql = `UPDATE product_image SET ${fields.join(', ')} WHERE image_product_id = ? AND product_id= ?`;
           
           const [results]= await db.execute(sql,params);
           if(results.affectedRows ===0){

               return null;
           }
        
        return true
    }
}

export default new ProductImageRespository;
import db from '../config/db';

class CategoryRespository {
    async findAll() {
        let sql = `SELECT cate_id, cate_name FROM category`;
        const [cates] = await db.execute(sql);
        return cates;
    }
}

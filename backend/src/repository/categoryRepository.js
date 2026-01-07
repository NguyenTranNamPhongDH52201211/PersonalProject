import db from '../config/db';

class CategoryRepository {
    async findAll() {
        let sql = `SELECT cate_id, cate_name FROM category`;
        const [cates] = await db.execute(sql);
        return cates;
    }
}

export default new CategoryRepository;
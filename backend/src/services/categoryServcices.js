import CateRepo from '../repository/categoryRespository';


class CategoryServices{

    async findAll(){
        const [cates]= await CateRepo.findAll();
        return cates;
    }
}


export default new CategoryServices;
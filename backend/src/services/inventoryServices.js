import { ProductListResponseDTO } from "../dto/productDTO";
import inventRepo from "../repository/inventoryRepository";


class InventoryServices {

    async findInventoryByProductId(productId) {
        const product = await inventRepo.findByProductId(productId);
        return product;
    }

    async createInventory(data) {
        if (data.invent_quantity_available < 0) {
            throw new Error("Quantity must be greater than or equal to 0");
        }
        if (data.invent_quantity_reserved < 0) {
            throw new Error(" Reserved  quantity must be greater than or equal to 0");
        }

        const result = await inventRepo.create(data);
        return result;

    }

    async deleteInventory(productId) {
        return await inventRepo.deleteInventory(productId);
    }

    async updateInventory(productId, data) {
        if (
            data.invent_quantity_available !== undefined &&
            data.invent_quantity_available < 0) {
            throw new Error("Quantity must be greater than or equal to 0");
        }

        if (
            data.invent_quantity_reserved !== undefined &&
            data.invent_quantity_reserved < 0
        ) {
            throw new Error("Reserved quantity must be greater than or equal to 0");
        }

        const updated = await inventRepo.update(productId, data);

        if (!updated) {
            throw new Error("Inventory not found or no valid fields to update");
        }

    }

}

export default new InventoryServices;
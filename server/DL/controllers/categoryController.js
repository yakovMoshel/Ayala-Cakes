import { categoryModel } from "../Models/categoryModel";
import { serializeData } from "@/utils/serialization";

export const getCategories = async () => {
    const categories = await categoryModel.find().lean();
    return serializeData(categories);
}

export const getCategory = async (id) => {
    const category = await categoryModel.findById({ _id: id }).lean();
    return serializeData(category);
}

export const createCategory = async (categoryData) => {
    const newCategory = await categoryModel.create(categoryData);
    return serializeData(newCategory);
}
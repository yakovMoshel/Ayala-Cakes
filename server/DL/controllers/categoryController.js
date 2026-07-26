import { categoryModel } from "../Models/categoryModel";
import { productModel } from "../Models/productModel";
import { serializeData } from "@/utils/serialization";

export const getCategories = async () => {
  const categories = await categoryModel.find().sort({ name: 1 }).lean();
  return serializeData(categories);
};

export const getCategory = async (id) => {
  const category = await categoryModel.findById(id).lean();
  return serializeData(category);
};

export const createCategory = async (categoryData) => {
  const newCategory = await categoryModel.create(categoryData);
  return serializeData(newCategory);
};

export const updateCategory = async (id, data) => {
  const updated = await categoryModel
    .findByIdAndUpdate(id, data, { new: true, runValidators: true })
    .lean();
  return updated ? serializeData(updated) : null;
};

export const deleteCategory = async (id) => {
  const existing = await categoryModel.findById(id);
  if (!existing) return null;

  const inUse = await productModel.countDocuments({ categoryId: id });
  if (inUse > 0) {
    const err = new Error('Category is in use by products');
    err.code = 'CATEGORY_IN_USE';
    err.count = inUse;
    throw err;
  }

  await categoryModel.findByIdAndDelete(id);
  return serializeData(existing);
};

import {
  createCategory,
  getCategories,
  updateCategory,
  deleteCategory,
} from "../DL/controllers/categoryController";

export const getAllCategories = async () => getCategories();

export const newCategory = async (categoryData) => createCategory(categoryData);

export const editCategory = async (id, data) => updateCategory(id, data);

export const removeCategory = async (id) => deleteCategory(id);

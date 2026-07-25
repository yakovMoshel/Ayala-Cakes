import {
  getPostCategories,
  createPostCategory,
  updatePostCategory,
  deletePostCategory,
} from "../DL/controllers/postCategoryController";

export const getAllPostCategories = () => getPostCategories();
export const newPostCategory = (data) => createPostCategory(data);
export const editPostCategory = (id, data) => updatePostCategory(id, data);
export const removePostCategory = (id) => deletePostCategory(id);

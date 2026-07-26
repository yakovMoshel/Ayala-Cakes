import { postCategoryModel } from "../Models/postCategoryModel";
import { postModel } from "../Models/postModel";
import { serializeData } from "@/utils/serialization";

export const getPostCategories = async () => {
  const categories = await postCategoryModel.find().sort({ name: 1 }).lean();
  return serializeData(categories);
};

export const createPostCategory = async (data) => {
  const created = await postCategoryModel.create(data);
  return serializeData(created);
};

/**
 * Rename only updates the category doc — posts store categoryId, so no cascade.
 */
export const updatePostCategory = async (id, data) => {
  const updated = await postCategoryModel
    .findByIdAndUpdate(id, data, { new: true, runValidators: true })
    .lean();
  return updated ? serializeData(updated) : null;
};

export const deletePostCategory = async (id) => {
  const existing = await postCategoryModel.findById(id);
  if (!existing) return null;

  await postCategoryModel.findByIdAndDelete(id);
  await postModel.updateMany({ categoryId: id }, { $set: { categoryId: null } });

  return serializeData(existing);
};

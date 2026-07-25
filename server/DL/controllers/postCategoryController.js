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
 * Renaming a category also moves every post that used the old name,
 * otherwise those posts would silently drop out of the blog filter.
 */
export const updatePostCategory = async (id, data) => {
  const existing = await postCategoryModel.findById(id);
  if (!existing) return null;

  const previousName = existing.name;
  const updated = await postCategoryModel
    .findByIdAndUpdate(id, data, { new: true, runValidators: true })
    .lean();

  if (updated && data.name && data.name !== previousName) {
    await postModel.updateMany({ category: previousName }, { category: data.name });
  }

  return serializeData(updated);
};

export const deletePostCategory = async (id) => {
  const existing = await postCategoryModel.findById(id);
  if (!existing) return null;

  await postCategoryModel.findByIdAndDelete(id);
  await postModel.updateMany({ category: existing.name }, { category: '' });

  return serializeData(existing);
};

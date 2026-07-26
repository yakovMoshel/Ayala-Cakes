import { postModel } from "../Models/postModel";
import { serializeData } from "@/utils/serialization";
import { withCategoryFields, withCategoryFieldsList } from "@/utils/categoryRef";

const CATEGORY_POPULATE = { path: 'categoryId', select: 'name' };

export const getPosts = async () => {
  const posts = await postModel
    .find({ status: 'published' })
    .select('_id title summary image createdAt slug categoryId')
    .populate(CATEGORY_POPULATE)
    .sort({ publishDate: -1, createdAt: -1 })
    .lean();
  return withCategoryFieldsList(serializeData(posts));
};

/** Public: published posts only */
export const getOnePost = async (id) => {
  const post = await postModel
    .findOne({ _id: id, status: 'published' })
    .populate(CATEGORY_POPULATE)
    .lean();
  return withCategoryFields(serializeData(post));
};

/** Public: published posts only */
export const getOnePostBySlug = async (slug) => {
  const post = await postModel
    .findOne({ slug, status: 'published' })
    .populate(CATEGORY_POPULATE)
    .lean();
  return withCategoryFields(serializeData(post));
};

/** Admin: any non-deleted post */
export const getOnePostAdmin = async (id) => {
  const post = await postModel
    .findOne({ _id: id, status: { $ne: 'deleted' } })
    .populate(CATEGORY_POPULATE)
    .lean();
  return withCategoryFields(serializeData(post));
};

/** Admin: any non-deleted post by slug */
export const getOnePostBySlugAdmin = async (slug) => {
  const post = await postModel
    .findOne({ slug, status: { $ne: 'deleted' } })
    .populate(CATEGORY_POPULATE)
    .lean();
  return withCategoryFields(serializeData(post));
};

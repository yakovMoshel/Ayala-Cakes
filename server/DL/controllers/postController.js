import { postModel } from "../Models/postModel";

export const getPosts = async () => {
  const posts = await postModel
    .find({ status: 'published' })
    .sort({ publishDate: -1, createdAt: -1 })
    .lean();
  return posts;
};
export const getOnePost = (id) => postModel.findOne({ _id: id, status: { $ne: 'deleted' } }).lean();

export const getOnePostBySlug = (slug) => postModel.findOne({ slug, status: { $ne: 'deleted' } }).lean();




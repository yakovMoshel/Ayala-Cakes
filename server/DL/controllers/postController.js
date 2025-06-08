import { postModel } from "../Models/postModel";

export const getPosts = async  () => {
    const posts = await postModel.find().lean();
   return posts
}
export const getOnePost = (id) => postModel.findById(id).lean();

export const getOnePostBySlug = (slug) => postModel.findOne({ slug }).lean();




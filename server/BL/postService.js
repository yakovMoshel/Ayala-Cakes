import { getPosts } from "../DL/controllers/postController";

import { getOnePost, getOnePostBySlug } from "../DL/controllers/postController";

export const getAllPosts = async  () => {
return await getPosts()    
} 
export const getPost = (id) => getOnePost(id);
export const getPostBySlug = (slug) => getOnePostBySlug(slug);


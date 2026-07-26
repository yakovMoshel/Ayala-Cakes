import {
  getPosts,
  getOnePost,
  getOnePostBySlug,
  getOnePostAdmin,
  getOnePostBySlugAdmin,
} from "../DL/controllers/postController";

export const getAllPosts = async () => getPosts();

/** Public published post by id */
export const getPost = (idOrQuery) => {
  const id =
    idOrQuery && typeof idOrQuery === 'object' ? idOrQuery._id : idOrQuery;
  return getOnePost(id);
};

/** Public published post by slug */
export const getPostBySlug = (slug) => getOnePostBySlug(slug);

/** Admin: draft/published (not deleted) */
export const getPostAdmin = (idOrQuery) => {
  const id =
    idOrQuery && typeof idOrQuery === 'object' ? idOrQuery._id : idOrQuery;
  return getOnePostAdmin(id);
};

export const getPostBySlugAdmin = (slug) => getOnePostBySlugAdmin(slug);

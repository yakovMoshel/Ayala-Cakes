import { getProducts, getOneProduct, getSomeProducts, getProductBySlug as getProductBySlugController } from "../DL/controllers/productController";
import { productModel } from "../DL/Models/productModel";
import { createSlugFromHebrew, ensureUniqueSlug } from "../../utils/slugUtils";

export const getProduct = (id) => getOneProduct(id);
export const getProductsByIds = (ids) => getSomeProducts(ids);
export const getAllProducts = () => getProducts();
export const getProductsByCategory = (categoryName) => getProducts(categoryName);

/**
 * מוצא מוצר לפי slug
 * @param {string} slug - ה-slug של המוצר
 * @returns {Promise<Object|null>} - המוצר או null
 */
export const getProductBySlug = (slug) => getProductBySlugController(slug);

/**
 * יוצר slug ייחודי למוצר
 * @param {string} productName - שם המוצר
 * @returns {Promise<string>} - slug ייחודי
 */
export const generateUniqueSlug = async (productName) => {
  const baseSlug = createSlugFromHebrew(productName);
  
  const checkExists = async (slug) => {
    const existing = await productModel.findOne({ slug });
    return !!existing;
  };
  
  return await ensureUniqueSlug(baseSlug, checkExists);
};

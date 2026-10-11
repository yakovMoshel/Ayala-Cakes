import { getProducts, getOneProduct, getSomeProducts, getProductBySlug as getProductBySlugController, getPopularProducts as getPopularProductsController } from "../DL/controllers/productController";
import { productModel } from "../DL/Models/productModel";
import { ensureUniqueSlug } from "../../utils/slugUtils";
import { slugFromTitle } from "../../utils/adminContentRules";

export const getProduct = (id) => getOneProduct(id);
export const getProductsByIds = (ids) => getSomeProducts(ids);
export const getAllProducts = () => getProducts();
export const getProductsByCategory = (categoryName) => getProducts(categoryName);
export const getPopularProducts = (limit = 4) => getPopularProductsController(limit);

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
  const baseSlug = slugFromTitle(productName);
  if (!baseSlug) return '';
  
  const checkExists = async (slug) => {
    const existing = await productModel.findOne({ slug });
    return !!existing;
  };
  
  return await ensureUniqueSlug(baseSlug, checkExists);
};

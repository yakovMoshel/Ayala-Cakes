import { productModel } from "../Models/productModel";
import { messageModel } from "../Models/messageModel";
import { categoryModel } from "../Models/categoryModel";
import { serializeData } from "@/utils/serialization";


export const getProducts = async (categoryName) => {
  try {
    if (categoryName) {
      const productsByCategory = await productModel.find({ category: categoryName, isActive: true }).lean();
      return serializeData(productsByCategory);
    }
    
    const allProducts = await productModel.find({ isActive: true }).lean();
    return serializeData(allProducts);
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
};

export const getOneProduct = async (id) => {
  try {
    const product = await productModel.findOne({ _id: id, isActive: true }).lean();
    return serializeData(product);
  } catch (error) {
    console.error('Error fetching single product:', error);
    throw error;
  }
};

export const getProductBySlug = async (slug) => {
  try {
    const product = await productModel.findOne({ slug, isActive: true }).lean();
    return serializeData(product);
  } catch (error) {
    console.error('Error fetching product by slug:', error);
    throw error;
  }
};

export const getSomeProducts = async (ids) => {
  try {
    const products = await productModel.find({ _id: { $in: ids }, isActive: true }).lean();
    return serializeData(products);
  } catch (error) {
    console.error('Error fetching multiple products:', error);
    throw error;
  }
};

/**
 * Most-viewed active products for homepage "העוגות הפופולריות".
 * Ties broken by newest first so zero-view catalogs still look sensible.
 */
export const getPopularProducts = async (limit = 4) => {
  try {
    const products = await productModel
      .find({ isActive: true })
      .sort({ views: -1, createdAt: -1 })
      .limit(limit)
      .lean();
    return serializeData(products);
  } catch (error) {
    console.error('Error fetching popular products:', error);
    throw error;
  }
};

export const createMessage = async (message) => {
  try {
    const newMessage = await messageModel.create(message);
    return serializeData(newMessage);
  } catch (error) {
    console.error('Error creating message:', error);
    throw error;
  }
};

export const getCategories = async () => {
  try {
    const categories = await categoryModel.find().lean();
    return serializeData(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    throw error;
  }
};
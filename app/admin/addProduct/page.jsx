import { connectToMongo } from '@/server/DL/connectToMongo';
import { getAllCategories } from '@/server/BL/categoryService';
import { serializeData } from '@/utils/serialization';
import AddProductForm from '@/Components/AddProductForm';
import styles from './style.module.scss';

export default async function ProductsAdminPage() {
  await connectToMongo();
  const categories = await getAllCategories();
  // Ensure plain data for client component
  const safeCategories = serializeData(categories);
  
  return (
    <div className={styles.productsAdmin}>
      <h1>ניהול מוצרים</h1>
      <AddProductForm categories={safeCategories} />
    </div>
  );
}
import { connectToMongo } from '@/server/DL/connectToMongo';
import { getAllCategories } from '@/server/BL/categoryService';
import { serializeData } from '@/utils/serialization';
import AddProductForm from '@/Components/AddProductForm';
import styles from '../style.module.scss';

export default async function NewProductPage() {
  await connectToMongo();
  const categories = await getAllCategories();
  const safeCategories = serializeData(categories);

  return (
    <div className={styles.productsAdmin}>
      <h1>מוצר חדש</h1>
      <AddProductForm categories={safeCategories} />
    </div>
  );
}

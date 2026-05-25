import { connectToMongo } from '@/server/DL/connectToMongo';
import AddCategoryForm from '@/Components/AddCategoryForm';
import styles from './style.module.scss';
import layout from '../layoutShared.module.scss';

export default async function CategoriesAdminPage() {
  await connectToMongo();
  return (
    <div className={`${styles.categoriesPage} ${layout.listPage}`}>
      <div className={layout.stickyChrome}>
        <div className={styles.pageHeader}>
          <h1>ניהול קטגוריות</h1>
          <p className={styles.subtitle}>הוסיפי קטגוריות חדשות וצפי בקטלוג הקיים</p>
        </div>
      </div>
      <div className={layout.listScroller}>
        <AddCategoryForm />
      </div>
    </div>
  );
}

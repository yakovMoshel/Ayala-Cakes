import PostCategoriesManager from '@/Components/PostCategoriesManager';
import styles from './style.module.scss';
import layout from '../../layoutShared.module.scss';

export default function PostCategoriesAdminPage() {
  return (
    <div className={`${styles.categoriesPage} ${layout.listPage}`}>
      <div className={layout.stickyChrome}>
        <div className={styles.pageHeader}>
          <h1>קטגוריות בלוג</h1>
          <p className={styles.subtitle}>הוסיפי, ערכי ומחקי את הקטגוריות שמופיעות בסינון הבלוג</p>
        </div>
      </div>
      <div className={layout.listScroller}>
        <PostCategoriesManager />
      </div>
    </div>
  );
}

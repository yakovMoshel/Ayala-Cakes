import AddPostForm from '@/Components/AddPostForm';
import { connectToMongo } from '@/server/DL/connectToMongo';
import { getAllPostCategories } from '@/server/BL/postCategoryService';
import styles from '../../style.module.scss';

export default async function EditPostPage({ params }) {
  await connectToMongo();
  const blogCategories = await getAllPostCategories();

  return (
    <div className={styles.postsAdmin}>
      <h1>עריכת פוסט</h1>
      <AddPostForm postId={params.id} blogCategories={blogCategories || []} />
    </div>
  );
}

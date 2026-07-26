import AddPostForm from '@/Components/AddPostForm';
import { connectToMongo } from '@/server/DL/connectToMongo';
import { getAllPostCategories } from '@/server/BL/postCategoryService';
import styles from '../style.module.scss';

export default async function NewPostPage() {
  await connectToMongo();
  const blogCategories = await getAllPostCategories();

  return (
    <div className={styles.postsAdmin}>
      <h1>פוסט חדש</h1>
      <AddPostForm blogCategories={blogCategories || []} />
    </div>
  );
}

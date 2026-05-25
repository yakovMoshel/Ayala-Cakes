import AddPostForm from '@/Components/AddPostForm';
import styles from '../../style.module.scss';

export default function EditPostPage({ params }) {
  return (
    <div className={styles.postsAdmin}>
      <h1>עריכת פוסט</h1>
      <AddPostForm postId={params.id} />
    </div>
  );
}

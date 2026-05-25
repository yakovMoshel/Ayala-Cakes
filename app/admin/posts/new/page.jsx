import AddPostForm from '@/Components/AddPostForm';
import styles from '../style.module.scss';

export default function NewPostPage() {
  return (
    <div className={styles.postsAdmin}>
      <h1>פוסט חדש</h1>
      <AddPostForm />
    </div>
  );
}

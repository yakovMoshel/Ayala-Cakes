'use client';

import { useMemo, useState } from 'react';
import FilterToolbar from '@/Components/Toolbar';
import PostItem from '@/Components/PostItem';
import { buildFilterChips, filterByChipAndSearch } from '@/utils/catalogFilter';
import styles from './style.module.scss';

export default function BlogClient({ posts = [], categories = [] }) {
  const [chip, setChip] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const chips = useMemo(() => {
    const names = categories.map((cat) => cat.name);
    const fromPosts = posts.map((post) => post.category);
    return buildFilterChips([...names, ...fromPosts]);
  }, [categories, posts]);

  const filteredPosts = useMemo(
    () =>
      filterByChipAndSearch(posts, {
        chip,
        searchTerm,
        matchesChip: (post, selected) => post.category === selected,
        matchesSearch: (post, term) => {
          const title = (post.title || '').toLowerCase();
          const summary = (post.summary || '').toLowerCase();
          return title.includes(term) || summary.includes(term);
        },
      }),
    [posts, chip, searchTerm]
  );

  return (
    <div className={styles.blog}>
      <FilterToolbar
        setCategory={setChip}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        categories={chips}
      />
      <div className={styles.content}>
        <h1 className={styles.title}>טיפים, מתכונים ועוד</h1>
        <div className={styles.items}>
          {filteredPosts.length === 0 ? (
            <p className={styles.empty}>לא נמצאו פוסטים בקטגוריה זו</p>
          ) : (
            filteredPosts.map((post) => (
              <PostItem key={post._id} post={post} />
            ))
          )}
        </div>
      </div>
    </div>
  );
}

'use client';

import { useMemo, useState } from 'react';
import FilterToolbar from '@/Components/Toolbar';
import PostItem from '@/Components/PostItem';
import {
  buildFilterChips,
  filterByChipAndSearch,
  getUsedCategoryNames,
} from '@/utils/catalogFilter';
import { buildCategoryByIdMap } from '@/utils/categoryRef';
import styles from './style.module.scss';

export default function BlogClient({ posts = [], categories = [] }) {
  const [chip, setChip] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const categoryById = useMemo(
    () => buildCategoryByIdMap(categories),
    [categories]
  );

  const chips = useMemo(
    () => buildFilterChips(getUsedCategoryNames(categories, posts)),
    [categories, posts]
  );

  const filteredPosts = useMemo(
    () =>
      filterByChipAndSearch(posts, {
        chip,
        searchTerm,
        matchesChip: (post, selected) => {
          if (!selected) return true;
          // Prefer id map; fall back to populated `category` name prop
          const cat = categoryById.get(String(post.categoryId));
          if (cat) return cat.name === selected;
          return post.category === selected;
        },
        matchesSearch: (post, term) => {
          const title = (post.title || '').toLowerCase();
          const summary = (post.summary || '').toLowerCase();
          return title.includes(term) || summary.includes(term);
        },
      }),
    [posts, chip, searchTerm, categoryById]
  );

  return (
    <div className={styles.blog}>
      <FilterToolbar
        setCategory={setChip}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        categories={chips}
        activeValue={chip}
        mobileLabel="סינון פוסטים לפי נושא"
        selectedMobileLabel={(label) => `מציג פוסטים בנושא ${label}`}
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

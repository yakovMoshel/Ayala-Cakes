'use client';

import { useMemo, useState } from 'react';
import styles from './style.module.scss';
import FilterToolbar from '@/Components/Toolbar';
import ProductsList from '@/Components/ProductsList';
import { buildFilterChips, filterByChipAndSearch } from '@/utils/catalogFilter';
import { buildCategoryByIdMap } from '@/utils/categoryRef';

// Client island: products arrive server-rendered from the page,
// this component only handles the interactive filtering UI
export default function ShopClient({ products, dbCategories = [] }) {
  const [category, setCategory] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const categoryById = useMemo(
    () => buildCategoryByIdMap(dbCategories),
    [dbCategories]
  );

  const categories = useMemo(
    () => buildFilterChips((dbCategories || []).map((c) => c.name)),
    [dbCategories]
  );

  const filteredProducts = useMemo(
    () =>
      filterByChipAndSearch(products, {
        chip: category,
        searchTerm,
        matchesChip: (product, chip) => {
          if (!chip) return true;
          const cat = categoryById.get(String(product.categoryId));
          return cat?.name === chip;
        },
        matchesSearch: (product, term) =>
          (product.name || '').toLowerCase().includes(term),
      }),
    [products, category, searchTerm, categoryById]
  );

  return (
    <div className={styles.shop}>
      <FilterToolbar
        setCategory={setCategory}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        categories={categories}
        activeValue={category}
      />
      <div className={styles.content}>
        <ProductsList productByCat={filteredProducts} isLoading={false} />
        {filteredProducts.length === 0 && (
          <p style={{ textAlign: 'center', marginTop: 24 }}>לא נמצאו מוצרים בקטגוריה זו</p>
        )}
      </div>
    </div>
  );
}

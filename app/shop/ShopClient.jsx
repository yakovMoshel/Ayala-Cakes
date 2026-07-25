'use client';

import { useMemo, useState } from 'react';
import styles from './style.module.scss';
import FilterToolbar from '@/Components/Toolbar';
import ProductsList from '@/Components/ProductsList';
import { buildFilterChips, filterByChipAndSearch } from '@/utils/catalogFilter';

// Client island: products arrive server-rendered from the page,
// this component only handles the interactive filtering UI
export default function ShopClient({ products, dbCategories = [] }) {
  const [category, setCategory] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const categories = useMemo(() => {
    const names = (dbCategories || []).map((c) => c.name);
    const fromProducts = (products || []).map((p) => {
      const raw = p.category;
      if (!raw) return '';
      const match = (dbCategories || []).find((c) => String(c._id) === String(raw));
      return match
        ? match.name
        : typeof raw === 'string' && !/^[a-f\d]{24}$/i.test(raw)
          ? raw
          : '';
    });
    return buildFilterChips([...names, ...fromProducts]);
  }, [dbCategories, products]);

  const filteredProducts = useMemo(
    () =>
      filterByChipAndSearch(products, {
        chip: category,
        searchTerm,
        matchesChip: (product, chip) => {
          if (!chip) return true;
          if (product.category === chip) return true;
          const match = (dbCategories || []).find((c) => c.name === chip);
          if (match && String(product.category) === String(match._id)) return true;
          return false;
        },
        matchesSearch: (product, term) =>
          (product.name || '').toLowerCase().includes(term),
      }),
    [products, category, searchTerm, dbCategories]
  );

  return (
    <div className={styles.shop}>
      <FilterToolbar
        setCategory={setCategory}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        categories={categories}
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

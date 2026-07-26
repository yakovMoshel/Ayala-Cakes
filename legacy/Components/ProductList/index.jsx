"use client"
import React, { useState, useEffect } from 'react';
import ProductItem from '../ProductItem';
import styles from './style.module.scss';

export default function ProductList({ productByCat }) {
  const [products, setProducts] = useState(productByCat);

  useEffect(() => {
    setProducts(productByCat);
  }, [productByCat]);

  return (
    <div className={styles.items}>
      {products.map((product) => (
        <ProductItem key={product._id} product={product} />
      ))}
    </div>
  );
}

'use client';

import React, { useState } from 'react';
import styles from './style.module.scss';
import { FaBars } from 'react-icons/fa';
import SearchItem from '../SearchItem';

export default function Toolbar({
  categories,
  onCategoryChange,
  setCategory, // backward compatibility with old prop name
  searchTerm,
  setSearchTerm,
  className,
  defaultOpen = false,
  showSearch = true,
  closeOnSelect = true,
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const categoriesToRender = categories ?? [];
  const handleCategoryChange = onCategoryChange ?? setCategory ?? (() => {});

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className={`${styles.sideBar} ${className ? className : ''}`}>
      <button className={styles.burgerButton} onClick={toggleMenu}>
        <FaBars />
      </button>
      <div className={`${styles.menu} ${isOpen ? styles.open : ''}`}>
        {showSearch && (
          <SearchItem searchTerm={searchTerm ?? ''} setSearchTerm={setSearchTerm ?? (() => {})} />
        )}
        <div className={styles.categories}>
          {categoriesToRender.map((categoryItem, index) => (
            <div
              className={styles.category}
              key={index}
              onClick={() => {
                handleCategoryChange(categoryItem.value);
                if (closeOnSelect) setIsOpen(false);
              }}
            >
              {categoryItem.icon} {categoryItem.label}
            </div>
          ))}
        </div>
      </div>
      <div className={styles.categoriesDesktop}>
        {showSearch && (
          <SearchItem searchTerm={searchTerm ?? ''} setSearchTerm={setSearchTerm ?? (() => {})} />
        )}
        {categoriesToRender.map((categoryItem, index) => (
          <div
            className={styles.category}
            key={index}
            onClick={() => {
              handleCategoryChange(categoryItem.value);
              if (closeOnSelect) setIsOpen(false);
            }}
          >
            {categoryItem.icon} {categoryItem.label}
          </div>
        ))}
      </div>
    </div>
  );
}



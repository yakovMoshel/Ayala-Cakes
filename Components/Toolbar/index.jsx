'use client';

import React, { useId, useState } from 'react';
import styles from './style.module.scss';
import { FaFilter } from 'react-icons/fa';
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
  activeValue,
  mobileLabel = 'סינון',
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const menuId = useId();

  const categoriesToRender = categories ?? [];
  const handleCategoryChange = onCategoryChange ?? setCategory ?? (() => {});

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const renderChip = (categoryItem, index) => {
    const isActive = activeValue !== undefined && activeValue === categoryItem.value;
    return (
      <button
        type="button"
        className={`${styles.category} ${isActive ? styles.active : ''}`}
        key={categoryItem.value ?? index}
        aria-pressed={isActive}
        onClick={() => {
          handleCategoryChange(categoryItem.value);
          if (closeOnSelect) setIsOpen(false);
        }}
      >
        {categoryItem.icon} {categoryItem.label}
      </button>
    );
  };

  return (
    <div className={`${styles.sideBar} ${className ? className : ''}`}>
      <button
        type="button"
        className={styles.burgerButton}
        onClick={toggleMenu}
        aria-label={isOpen ? 'סגור תפריט סינון' : 'פתח תפריט סינון'}
        aria-expanded={isOpen}
        aria-controls={menuId}
      >
        <FaFilter aria-hidden="true" />
        <span>{mobileLabel}</span>
      </button>
      <div
        id={menuId}
        className={`${styles.menu} ${isOpen ? styles.open : ''}`}
      >
        {showSearch && (
          <SearchItem searchTerm={searchTerm ?? ''} setSearchTerm={setSearchTerm ?? (() => {})} />
        )}
        <div className={styles.categories}>
          {categoriesToRender.map(renderChip)}
        </div>
      </div>
      <div className={styles.categoriesDesktop}>
        {showSearch && (
          <SearchItem searchTerm={searchTerm ?? ''} setSearchTerm={setSearchTerm ?? (() => {})} />
        )}
        {categoriesToRender.map(renderChip)}
      </div>
    </div>
  );
}

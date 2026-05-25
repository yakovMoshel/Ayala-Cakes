"use client";

import React, { useState, useEffect, useCallback } from 'react';
import styles from './style.module.scss';
import { FolderPlus, Folder, AlertCircle, Loader2 } from 'lucide-react';
import AdminImageField from '@/Components/AdminImageField';

export default function AddCategoryForm() {
  const [categories, setCategories] = useState([]);
  const [isCategoriesLoading, setIsCategoriesLoading] = useState(true);
  const [categoriesError, setCategoriesError] = useState("");

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    slug: '',
    image: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const fetchCategories = useCallback(async () => {
    setIsCategoriesLoading(true);
    setCategoriesError("");
    try {
      const res = await fetch('/api/category');
      const data = await res.json();
      if (data.success) {
        setCategories(data.data || []);
      } else {
        throw new Error(data.error || 'Failed to fetch categories');
      }
    } catch (e) {
      setCategoriesError(e.message);
    } finally {
      setIsCategoriesLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError("");
    setSubmitSuccess(false);

    try {
      const response = await fetch('/api/category', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      const resData = await response.json();
      if (!response.ok || !resData.success) {
        throw new Error(resData.error || 'Failed to add category');
      }
      
      setSubmitSuccess(true);
      setFormData({
        name: '',
        description: '',
        slug: '',
        image: ''
      });
      
      // Refresh list
      fetchCategories();
      
      // Auto-hide success message
      setTimeout(() => setSubmitSuccess(false), 4000);
    } catch (error) {
      setSubmitError(error.message || 'אירעה שגיאה ביצירת הקטגוריה');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.dualPaneContainer}>
      {/* Right Pane: Form for Adding Category */}
      <div className={styles.formPane}>
        <div className={styles.paneHeader}>
          <FolderPlus className={styles.headerIcon} size={24} />
          <h3>הוספת קטגוריה חדשה</h3>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label htmlFor="name">שם הקטגוריה</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              placeholder="למשל: עוגות מוס, מארזים"
              onChange={handleChange}
              required
              disabled={isSubmitting}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="slug">Slug (מזהה בכתובת האתר)</label>
            <input
              type="text"
              id="slug"
              name="slug"
              value={formData.slug}
              placeholder="למשל: mousse-cakes"
              onChange={handleChange}
              required
              disabled={isSubmitting}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="description">תיאור הקטגוריה</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              placeholder="תיאור קצר שיוצג לקוראים..."
              onChange={handleChange}
              disabled={isSubmitting}
            ></textarea>
          </div>

          <AdminImageField
            id="category-image"
            label="תמונת קטגוריה"
            value={formData.image}
            onChange={(url) => setFormData((prev) => ({ ...prev, image: url }))}
            required
            disabled={isSubmitting}
            hint="ניתן להדביק קישור או לבחור תמונה מספריית המדיה"
          />

          {submitError && (
            <div className={styles.submitError}>
              <AlertCircle size={18} />
              <span>{submitError}</span>
            </div>
          )}

          {submitSuccess && (
            <div className={styles.submitSuccess}>
              <span>הקטגוריה נוצרה בהצלחה! 🎉</span>
            </div>
          )}

          <button 
            type="submit" 
            className={styles.submitButton}
            disabled={isSubmitting || !formData.name || !formData.slug || !formData.image}
          >
            {isSubmitting ? (
              <>
                <Loader2 className={styles.spinner} size={18} />
                <span>יוצר קטגוריה...</span>
              </>
            ) : (
              <span>צור קטגוריה</span>
            )}
          </button>
        </form>
      </div>

      {/* Left Pane: Categories List */}
      <div className={styles.listPane}>
        <div className={styles.paneHeader}>
          <Folder className={styles.headerIcon} size={24} />
          <h3>קטגוריות קיימות ({categories.length})</h3>
        </div>

        {isCategoriesLoading ? (
          <div className={styles.skeletonGrid}>
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className={styles.skeletonCard} />
            ))}
          </div>
        ) : categoriesError ? (
          <div className={styles.errorState}>
            <AlertCircle size={32} />
            <p>שגיאה בטעינת קטגוריות: {categoriesError}</p>
          </div>
        ) : categories.length === 0 ? (
          <div className={styles.emptyState}>
            <Folder size={40} className={styles.emptyIcon} />
            <p>אין קטגוריות במערכת עדיין.</p>
          </div>
        ) : (
          <div className={styles.categoryGrid}>
            {categories.map((cat) => (
              <div key={cat._id} className={styles.categoryCard}>
                <div 
                  className={styles.cardImage} 
                  style={{ backgroundImage: `url(${cat.image})` }}
                >
                  <div className={styles.imageOverlay} />
                </div>
                <div className={styles.cardInfo}>
                  <h4>{cat.name}</h4>
                  <span className={styles.slugBadge}>{cat.slug}</span>
                  {cat.description && (
                    <p className={styles.catDesc} title={cat.description}>
                      {cat.description}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
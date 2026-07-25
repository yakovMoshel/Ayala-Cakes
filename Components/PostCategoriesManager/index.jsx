"use client";

import React, { useState, useEffect, useCallback } from 'react';
import styles from './style.module.scss';
import { FolderPlus, Folder, AlertCircle, Loader2, Pencil, Trash2, Check, X } from 'lucide-react';
import { createSlugFromHebrew } from '@/utils/slugUtils';

const EMPTY_FORM = { name: '', description: '', slug: '' };

export default function PostCategoriesManager() {
  const [categories, setCategories] = useState([]);
  const [isCategoriesLoading, setIsCategoriesLoading] = useState(true);
  const [categoriesError, setCategoriesError] = useState("");

  const [formData, setFormData] = useState(EMPTY_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState(EMPTY_FORM);
  const [rowError, setRowError] = useState("");

  const fetchCategories = useCallback(async () => {
    setIsCategoriesLoading(true);
    setCategoriesError("");
    try {
      const res = await fetch('/api/post-category');
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
    setFormData((prev) => {
      const next = { ...prev, [name]: value };
      if (name === 'name' && !prev.slug) {
        next.slug = createSlugFromHebrew(value);
      }
      return next;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError("");
    setSubmitSuccess(false);

    try {
      const payload = {
        ...formData,
        slug: formData.slug || createSlugFromHebrew(formData.name),
      };

      const response = await fetch('/api/post-category', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const resData = await response.json();
      if (!response.ok || !resData.success) {
        throw new Error(resData.error || 'Failed to add category');
      }

      setSubmitSuccess(true);
      setFormData(EMPTY_FORM);
      fetchCategories();
      setTimeout(() => setSubmitSuccess(false), 4000);
    } catch (error) {
      setSubmitError(error.message || 'אירעה שגיאה ביצירת הקטגוריה');
    } finally {
      setIsSubmitting(false);
    }
  };

  const startEdit = (cat) => {
    setRowError("");
    setEditingId(cat._id);
    setEditForm({
      name: cat.name || '',
      description: cat.description || '',
      slug: cat.slug || '',
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm(EMPTY_FORM);
    setRowError("");
  };

  const saveEdit = async (id) => {
    setRowError("");
    try {
      const response = await fetch(`/api/post-category/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      });
      const resData = await response.json();
      if (!response.ok || !resData.success) {
        throw new Error(resData.error || 'Failed to update category');
      }
      cancelEdit();
      fetchCategories();
    } catch (error) {
      setRowError(error.message || 'אירעה שגיאה בעדכון הקטגוריה');
    }
  };

  const deleteCategory = async (cat) => {
    const confirmed = window.confirm(
      `למחוק את הקטגוריה "${cat.name}"? פוסטים שמשויכים אליה יישארו ללא קטגוריה.`
    );
    if (!confirmed) return;

    setRowError("");
    try {
      const response = await fetch(`/api/post-category/${cat._id}`, { method: 'DELETE' });
      const resData = await response.json();
      if (!response.ok || !resData.success) {
        throw new Error(resData.error || 'Failed to delete category');
      }
      fetchCategories();
    } catch (error) {
      setRowError(error.message || 'אירעה שגיאה במחיקת הקטגוריה');
    }
  };

  return (
    <div className={styles.dualPaneContainer}>
      <div className={styles.formPane}>
        <div className={styles.paneHeader}>
          <FolderPlus className={styles.headerIcon} size={24} />
          <h3>הוספת קטגוריית בלוג</h3>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label htmlFor="name">שם הקטגוריה</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              placeholder="למשל: מתכונים, טיפים"
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
              placeholder="למשל: recipes"
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

          {submitError && (
            <div className={styles.submitError}>
              <AlertCircle size={18} />
              <span>{submitError}</span>
            </div>
          )}

          {submitSuccess && (
            <div className={styles.submitSuccess}>
              <span>הקטגוריה נוצרה בהצלחה!</span>
            </div>
          )}

          <button
            type="submit"
            className={styles.submitButton}
            disabled={isSubmitting || !formData.name}
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

      <div className={styles.listPane}>
        <div className={styles.paneHeader}>
          <Folder className={styles.headerIcon} size={24} />
          <h3>קטגוריות קיימות ({categories.length})</h3>
        </div>

        {rowError && (
          <div className={styles.submitError}>
            <AlertCircle size={18} />
            <span>{rowError}</span>
          </div>
        )}

        {isCategoriesLoading ? (
          <div className={styles.skeletonList}>
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className={styles.skeletonRow} />
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
            <p>אין קטגוריות בלוג עדיין.</p>
          </div>
        ) : (
          <ul className={styles.categoryList}>
            {categories.map((cat) => (
              <li key={cat._id} className={styles.categoryRow}>
                {editingId === cat._id ? (
                  <div className={styles.editRow}>
                    <input
                      type="text"
                      value={editForm.name}
                      onChange={(e) => setEditForm((p) => ({ ...p, name: e.target.value }))}
                      placeholder="שם"
                    />
                    <input
                      type="text"
                      value={editForm.slug}
                      onChange={(e) => setEditForm((p) => ({ ...p, slug: e.target.value }))}
                      placeholder="slug"
                    />
                    <input
                      type="text"
                      value={editForm.description}
                      onChange={(e) => setEditForm((p) => ({ ...p, description: e.target.value }))}
                      placeholder="תיאור"
                    />
                    <div className={styles.rowActions}>
                      <button
                        type="button"
                        className={styles.iconButton}
                        onClick={() => saveEdit(cat._id)}
                        aria-label="שמור"
                      >
                        <Check size={16} />
                      </button>
                      <button
                        type="button"
                        className={styles.iconButton}
                        onClick={cancelEdit}
                        aria-label="בטל"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className={styles.rowInfo}>
                      <h4>{cat.name}</h4>
                      <span className={styles.slugBadge}>{cat.slug}</span>
                      {cat.description && <p className={styles.catDesc}>{cat.description}</p>}
                    </div>
                    <div className={styles.rowActions}>
                      <button
                        type="button"
                        className={styles.iconButton}
                        onClick={() => startEdit(cat)}
                        aria-label="ערוך"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        type="button"
                        className={`${styles.iconButton} ${styles.danger}`}
                        onClick={() => deleteCategory(cat)}
                        aria-label="מחק"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

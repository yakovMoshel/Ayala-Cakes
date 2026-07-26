"use client";

import React, { useState, useEffect, useCallback } from 'react';
import styles from './style.module.scss';
import {
  FolderPlus,
  Folder,
  AlertCircle,
  Loader2,
  Pencil,
  Trash2,
  Check,
  X,
} from 'lucide-react';
import { createSlugFromHebrew } from '@/utils/slugUtils';
import AdminImageField from '@/Components/AdminImageField';

/**
 * Shared dual-pane category manager for blog + product categories.
 *
 * @param {object} props
 * @param {string} props.endpoint - Base API path (e.g. /api/post-category)
 * @param {{
 *   createTitle: string,
 *   listTitle: string,
 *   emptyMessage: string,
 *   namePlaceholder?: string,
 *   descriptionPlaceholder?: string,
 *   slugPlaceholder?: string,
 *   deleteConfirm?: (name: string) => string,
 *   successMessage?: string,
 * }} props.labels
 * @param {{ edit?: boolean, delete?: boolean }} [props.permissions]
 * @param {boolean} [props.requireImage]
 * @param {boolean} [props.autoSlug]
 * @param {'list'|'grid'} [props.listVariant]
 */
export default function CategoryManager({
  endpoint,
  labels,
  permissions = { edit: false, delete: false },
  requireImage = false,
  autoSlug = true,
  listVariant = 'list',
}) {
  const canEdit = Boolean(permissions.edit);
  const canDelete = Boolean(permissions.delete);

  const emptyForm = requireImage
    ? { name: '', description: '', slug: '', image: '' }
    : { name: '', description: '', slug: '' };

  const [categories, setCategories] = useState([]);
  const [isCategoriesLoading, setIsCategoriesLoading] = useState(true);
  const [categoriesError, setCategoriesError] = useState('');

  const [formData, setFormData] = useState(emptyForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState(emptyForm);
  const [rowError, setRowError] = useState('');

  const fetchCategories = useCallback(async () => {
    setIsCategoriesLoading(true);
    setCategoriesError('');
    try {
      const res = await fetch(endpoint);
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
  }, [endpoint]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const next = { ...prev, [name]: value };
      if (autoSlug && name === 'name' && !prev.slug) {
        next.slug = createSlugFromHebrew(value);
      }
      return next;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError('');
    setSubmitSuccess(false);

    try {
      const payload = {
        ...formData,
        slug: formData.slug || createSlugFromHebrew(formData.name),
      };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const resData = await response.json();
      if (!response.ok || !resData.success) {
        throw new Error(resData.error || 'Failed to add category');
      }

      setSubmitSuccess(true);
      setFormData(emptyForm);
      fetchCategories();
      setTimeout(() => setSubmitSuccess(false), 4000);
    } catch (error) {
      setSubmitError(error.message || 'אירעה שגיאה ביצירת הקטגוריה');
    } finally {
      setIsSubmitting(false);
    }
  };

  const startEdit = (cat) => {
    setRowError('');
    setEditingId(cat._id);
    setEditForm({
      name: cat.name || '',
      description: cat.description || '',
      slug: cat.slug || '',
      ...(requireImage ? { image: cat.image || '' } : {}),
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm(emptyForm);
    setRowError('');
  };

  const saveEdit = async (id) => {
    setRowError('');
    try {
      const response = await fetch(`${endpoint}/${id}`, {
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
    const confirmFn =
      labels.deleteConfirm ||
      ((name) => `למחוק את הקטגוריה "${name}"?`);
    if (!window.confirm(confirmFn(cat.name))) return;

    setRowError('');
    try {
      const response = await fetch(`${endpoint}/${cat._id}`, { method: 'DELETE' });
      const resData = await response.json();
      if (!response.ok || !resData.success) {
        throw new Error(resData.error || 'Failed to delete category');
      }
      fetchCategories();
    } catch (error) {
      setRowError(error.message || 'אירעה שגיאה במחיקת הקטגוריה');
    }
  };

  const submitDisabled =
    isSubmitting ||
    !formData.name ||
    !formData.slug ||
    (requireImage && !formData.image);

  const renderRowActions = (cat) => {
    if (!canEdit && !canDelete) return null;
    return (
      <div className={styles.rowActions}>
        {canEdit && (
          <button
            type="button"
            className={styles.iconButton}
            onClick={() => startEdit(cat)}
            aria-label="ערוך"
          >
            <Pencil size={16} />
          </button>
        )}
        {canDelete && (
          <button
            type="button"
            className={`${styles.iconButton} ${styles.danger}`}
            onClick={() => deleteCategory(cat)}
            aria-label="מחק"
          >
            <Trash2 size={16} />
          </button>
        )}
      </div>
    );
  };

  const renderEditFields = () => (
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
        onChange={(e) =>
          setEditForm((p) => ({ ...p, description: e.target.value }))
        }
        placeholder="תיאור"
      />
      {requireImage && (
        <input
          type="text"
          value={editForm.image || ''}
          onChange={(e) => setEditForm((p) => ({ ...p, image: e.target.value }))}
          placeholder="תמונה (URL)"
        />
      )}
      <div className={styles.rowActions}>
        <button
          type="button"
          className={styles.iconButton}
          onClick={() => saveEdit(editingId)}
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
  );

  const renderList = () => {
    if (isCategoriesLoading) {
      if (listVariant === 'grid') {
        return (
          <div className={styles.skeletonGrid}>
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className={styles.skeletonCard} />
            ))}
          </div>
        );
      }
      return (
        <div className={styles.skeletonList}>
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className={styles.skeletonRow} />
          ))}
        </div>
      );
    }

    if (categoriesError) {
      return (
        <div className={styles.errorState}>
          <AlertCircle size={32} />
          <p>שגיאה בטעינת קטגוריות: {categoriesError}</p>
        </div>
      );
    }

    if (categories.length === 0) {
      return (
        <div className={styles.emptyState}>
          <Folder size={40} className={styles.emptyIcon} />
          <p>{labels.emptyMessage}</p>
        </div>
      );
    }

    if (listVariant === 'grid') {
      return (
        <div className={styles.categoryGrid}>
          {categories.map((cat) => (
            <div key={cat._id} className={styles.categoryCard}>
              {editingId === cat._id ? (
                renderEditFields()
              ) : (
                <>
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
                    {renderRowActions(cat)}
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      );
    }

    return (
      <ul className={styles.categoryList}>
        {categories.map((cat) => (
          <li key={cat._id} className={styles.categoryRow}>
            {editingId === cat._id ? (
              renderEditFields()
            ) : (
              <>
                <div className={styles.rowInfo}>
                  <h4>{cat.name}</h4>
                  <span className={styles.slugBadge}>{cat.slug}</span>
                  {cat.description && (
                    <p className={styles.catDesc}>{cat.description}</p>
                  )}
                </div>
                {renderRowActions(cat)}
              </>
            )}
          </li>
        ))}
      </ul>
    );
  };

  return (
    <div className={styles.dualPaneContainer}>
      <div className={styles.formPane}>
        <div className={styles.paneHeader}>
          <FolderPlus className={styles.headerIcon} size={24} />
          <h3>{labels.createTitle}</h3>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label htmlFor="cm-name">שם הקטגוריה</label>
            <input
              type="text"
              id="cm-name"
              name="name"
              value={formData.name}
              placeholder={labels.namePlaceholder || ''}
              onChange={handleChange}
              required
              disabled={isSubmitting}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="cm-slug">Slug (מזהה בכתובת האתר)</label>
            <input
              type="text"
              id="cm-slug"
              name="slug"
              value={formData.slug}
              placeholder={labels.slugPlaceholder || ''}
              onChange={handleChange}
              required
              disabled={isSubmitting}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="cm-description">תיאור הקטגוריה</label>
            <textarea
              id="cm-description"
              name="description"
              value={formData.description}
              placeholder={labels.descriptionPlaceholder || ''}
              onChange={handleChange}
              disabled={isSubmitting}
            />
          </div>

          {requireImage && (
            <AdminImageField
              id="category-image"
              label="תמונת קטגוריה"
              value={formData.image}
              onChange={(url) => setFormData((prev) => ({ ...prev, image: url }))}
              required
              disabled={isSubmitting}
              hint="ניתן להדביק קישור או לבחור תמונה מספריית המדיה"
            />
          )}

          {submitError && (
            <div className={styles.submitError}>
              <AlertCircle size={18} />
              <span>{submitError}</span>
            </div>
          )}

          {submitSuccess && (
            <div className={styles.submitSuccess}>
              <span>{labels.successMessage || 'הקטגוריה נוצרה בהצלחה!'}</span>
            </div>
          )}

          <button
            type="submit"
            className={styles.submitButton}
            disabled={submitDisabled}
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
          <h3>
            {labels.listTitle} ({categories.length})
          </h3>
        </div>

        {rowError && (
          <div className={styles.submitError}>
            <AlertCircle size={18} />
            <span>{rowError}</span>
          </div>
        )}

        {renderList()}
      </div>
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import popupStyles from '@/Components/OrderPopup/style.module.scss';
import styles from './style.module.scss';

export default function ImageDetailsModal({
  isOpen,
  onClose,
  onConfirm,
  image,
}) {
  const [mounted, setMounted] = useState(false);
  const [alt, setAlt] = useState('');
  const [description, setDescription] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isOpen || !image) return;
    setAlt(image.alt || '');
    setDescription(image.description || '');
    setError('');
    setIsSaving(false);
  }, [isOpen, image]);

  const handleSubmit = async () => {
    if (!image?.secure_url) return;

    setIsSaving(true);
    setError('');

    const trimmedAlt = alt.trim();

    try {
      if (trimmedAlt !== (image.alt || '').trim() && image.public_id) {
        const res = await fetch('/api/media/metadata', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ public_id: image.public_id, alt: trimmedAlt }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'שמירת alt נכשלה');
      }

      onConfirm({
        ...image,
        alt: trimmedAlt,
        description: description.trim(),
      });
    } catch (err) {
      setError(err.message || 'שמירת פרטי התמונה נכשלה');
      setIsSaving(false);
    }
  };

  const stopEnterSubmit = (event) => {
    if (event.key === 'Enter' && event.target.tagName !== 'TEXTAREA') {
      event.preventDefault();
    }
  };

  if (!isOpen || !image || !mounted) return null;

  return createPortal(
    <div className={popupStyles.popupOverlay}>
      <div className={styles.imageDetailsModal}>
        <div
          className={styles.modalContent}
          onKeyDown={stopEnterSubmit}
          role="dialog"
          aria-modal="true"
          aria-labelledby="image-details-title"
        >
          <div className={styles.modalHeader}>
            <h2 id="image-details-title">{image.isEdit ? 'עריכת תמונה' : 'פרטי תמונה'}</h2>
            <button
              type="button"
              className={styles.closeButton}
              onClick={onClose}
              aria-label="סגור"
            >
              ×
            </button>
          </div>

          <div className={styles.previewRow}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={image.secure_url}
              alt={alt || 'תצוגה מקדימה'}
              className={styles.preview}
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="image-alt">טקסט חלופי (Alt)</label>
            <input
              id="image-alt"
              type="text"
              value={alt}
              onChange={(e) => setAlt(e.target.value)}
              placeholder="תיאור קצר לנגישות ול-SEO"
            />
            <p className={styles.hint}>משמש קוראי מסך ומנועי חיפוש. נשמר גם בספריית המדיה.</p>
          </div>

          <div className={styles.field}>
            <label htmlFor="image-description">תיאור (יוצג מתחת לתמונה בפוסט)</label>
            <textarea
              id="image-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="טקסט שיופיע מתחת לתמונה בפוסט"
              rows={3}
            />
          </div>

          {error && (
            <p className={styles.error} role="alert">
              {error}
            </p>
          )}

          <div className={styles.modalActions}>
            <button type="button" className={styles.cancelButton} onClick={onClose} disabled={isSaving}>
              ביטול
            </button>
            <button
              type="button"
              className={styles.confirmButton}
              onClick={handleSubmit}
              disabled={isSaving}
            >
              {isSaving ? 'שומר...' : image.isEdit ? 'עדכן' : 'הוסף לפוסט'}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

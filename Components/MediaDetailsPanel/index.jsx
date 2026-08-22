'use client';

import { useEffect, useState } from 'react';
import { getPublicIdBasename } from '@/utils/cloudinaryPublicId';
import styles from './style.module.scss';

export default function MediaDetailsPanel({
  image,
  onCancel,
  onSaved,
  onDelete,
  onCopy,
  embedded = false,
  cancelLabel = 'ביטול',
}) {
  const [filename, setFilename] = useState('');
  const [alt, setAlt] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!image) return;
    setFilename(getPublicIdBasename(image.public_id));
    setAlt(image.alt || '');
    setError('');
    setIsSaving(false);
  }, [image]);

  const handleSave = async () => {
    if (!image?.public_id) return;

    setIsSaving(true);
    setError('');

    const trimmedAlt = alt.trim();
    const trimmedFilename = filename.trim();
    const originalBasename = getPublicIdBasename(image.public_id);

    if (!trimmedFilename) {
      setError('יש להזין שם קובץ');
      setIsSaving(false);
      return;
    }

    let publicId = image.public_id;
    let secureUrl = image.secure_url;

    try {
      if (trimmedFilename !== originalBasename) {
        const res = await fetch('/api/media/rename', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ public_id: publicId, new_basename: trimmedFilename }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'שינוי שם הקובץ נכשל');
        publicId = data.public_id;
        secureUrl = data.secure_url;
      }

      if (trimmedAlt !== (image.alt || '').trim()) {
        const res = await fetch('/api/media/metadata', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ public_id: publicId, alt: trimmedAlt }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'שמירת alt נכשלה');
      }

      onSaved?.({
        ...image,
        public_id: publicId,
        secure_url: secureUrl,
        alt: trimmedAlt,
      });
    } catch (err) {
      setError(err.message || 'שמירת פרטי התמונה נכשלה');
      setIsSaving(false);
    }
  };

  if (!image) return null;

  return (
    <div className={`${styles.panel} ${embedded ? styles.embedded : ''}`}>
      {!embedded && (
        <div className={styles.panelHeader}>
          <h2 id="media-details-title">עריכת תמונה</h2>
          <button
            type="button"
            className={styles.closeButton}
            onClick={onCancel}
            aria-label="סגור"
          >
            ×
          </button>
        </div>
      )}

      <div className={styles.previewRow}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={image.secure_url}
          alt={alt || filename || 'תצוגה מקדימה'}
          className={styles.preview}
        />
      </div>

      <p className={styles.publicId} dir="ltr">
        {image.public_id}
      </p>

      <div className={styles.field}>
        <label htmlFor="media-filename">שם קובץ</label>
        <input
          id="media-filename"
          type="text"
          value={filename}
          onChange={(e) => setFilename(e.target.value)}
          placeholder="לדוגמה: birthday-cake"
          dir="ltr"
        />
      </div>

      <div className={styles.field}>
        <label htmlFor="media-alt">טקסט חלופי (Alt)</label>
        <input
          id="media-alt"
          type="text"
          value={alt}
          onChange={(e) => setAlt(e.target.value)}
          placeholder="תיאור קצר לנגישות ול-SEO"
        />
      </div>

      {error && (
        <p className={styles.error} role="alert">
          {error}
        </p>
      )}

      <div className={styles.panelActions}>
        {onCopy && (
          <button type="button" className={styles.secondaryButton} onClick={onCopy} disabled={isSaving}>
            העתק קישור
          </button>
        )}
        {onDelete && (
          <button type="button" className={styles.dangerButton} onClick={onDelete} disabled={isSaving}>
            מחק
          </button>
        )}
        <button type="button" className={styles.cancelButton} onClick={onCancel} disabled={isSaving}>
          {cancelLabel}
        </button>
        <button
          type="button"
          className={styles.confirmButton}
          onClick={handleSave}
          disabled={isSaving}
        >
          {isSaving ? 'שומר...' : 'שמור'}
        </button>
      </div>
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import popupStyles from '@/Components/OrderPopup/style.module.scss';
import MediaDetailsPanel from '@/Components/MediaDetailsPanel';
import styles from './style.module.scss';

export default function MediaDetailsModal({
  isOpen,
  image,
  onClose,
  onSaved,
  onDelete,
  onCopy,
  onNavigate,
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isOpen || !image || !mounted) return null;

  return createPortal(
    <div className={popupStyles.popupOverlay} onClick={onClose}>
      <div className={styles.mediaDetailsModal} onClick={(e) => e.stopPropagation()}>
        {onNavigate && (
          <>
            <button
              type="button"
              className={styles.navLeft}
              aria-label="הקודם"
              onClick={() => onNavigate('prev')}
            >
              ‹
            </button>
            <button
              type="button"
              className={styles.navRight}
              aria-label="הבא"
              onClick={() => onNavigate('next')}
            >
              ›
            </button>
          </>
        )}

        <div
          className={styles.modalContent}
          role="dialog"
          aria-modal="true"
          aria-labelledby="media-details-title"
        >
          <MediaDetailsPanel
            image={image}
            onCancel={onClose}
            onSaved={(updated) => {
              onSaved?.(updated);
              onClose();
            }}
            onDelete={onDelete}
            onCopy={onCopy}
          />
        </div>
      </div>
    </div>,
    document.body
  );
}

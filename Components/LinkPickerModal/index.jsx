'use client';

import { useCallback, useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import popupStyles from '@/Components/OrderPopup/style.module.scss';
import { EXTERNAL_LINK_OPTIONS } from '@/utils/postCta';
import { normalizeInternalPath } from '@/utils/siteLinks';
import styles from './style.module.scss';

const TYPE_FILTERS = [
  { id: 'all', label: 'הכל' },
  { id: 'page', label: 'דפים' },
  { id: 'post', label: 'פוסטים' },
  { id: 'product', label: 'מוצרים' },
];

const SORT_OPTIONS = [
  { id: 'title-asc', sort: 'title', order: 'asc', label: 'שם (א-ת)' },
  { id: 'date-desc', sort: 'date', order: 'desc', label: 'חדש ביותר' },
  { id: 'views-desc', sort: 'views', order: 'desc', label: 'פופולרי (צפיות)' },
];

const TYPE_LABELS = {
  page: 'דף',
  post: 'פוסט',
  product: 'מוצר',
};

const STATUS_LABELS = {
  draft: 'טיוטה',
  published: 'מפורסם',
  active: 'פעיל',
  inactive: 'לא פעיל',
};

export default function LinkPickerModal({
  isOpen,
  onClose,
  onConfirm,
  initialUrl = '',
  initialLinkType = 'internal',
  selectedText = '',
  excludePostId = '',
}) {
  const [linkType, setLinkType] = useState(initialLinkType);
  const [url, setUrl] = useState(initialUrl);
  const [linkText, setLinkText] = useState(selectedText);
  const [openInNewTab, setOpenInNewTab] = useState(initialLinkType === 'external');
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [sortKey, setSortKey] = useState('title-asc');
  const [results, setResults] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    setLinkType(initialLinkType);
    setUrl(initialUrl);
    setLinkText(selectedText);
    setOpenInNewTab(initialLinkType === 'external');
    setSearch('');
    setTypeFilter('all');
    setSortKey('title-asc');
    setSelectedId(null);
    setError('');
  }, [isOpen, initialLinkType, initialUrl, selectedText]);

  const fetchTargets = useCallback(async () => {
    if (linkType !== 'internal') return;

    setIsLoading(true);
    setError('');
    try {
      const sortOption = SORT_OPTIONS.find((o) => o.id === sortKey) || SORT_OPTIONS[0];
      const params = new URLSearchParams({
        type: typeFilter,
        sort: sortOption.sort,
        order: sortOption.order,
      });
      if (search.trim()) params.set('q', search.trim());
      if (excludePostId) params.set('excludePostId', excludePostId);

      const res = await fetch(`/api/admin/link-targets?${params.toString()}`, {
        credentials: 'include',
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'שגיאה בטעינת קישורים');
      setResults(json.data || []);
    } catch (err) {
      setResults([]);
      setError(err.message || 'שגיאה בטעינת קישורים');
    } finally {
      setIsLoading(false);
    }
  }, [linkType, search, typeFilter, sortKey, excludePostId]);

  useEffect(() => {
    if (!isOpen || linkType !== 'internal') return;
    const timer = setTimeout(fetchTargets, 300);
    return () => clearTimeout(timer);
  }, [isOpen, linkType, fetchTargets]);

  const handleSelectItem = (item) => {
    setSelectedId(item.id);
    setUrl(item.url);
  };

  const handleConfirm = () => {
    const trimmedUrl = url.trim();
    if (!trimmedUrl) {
      setError('יש להזין כתובת קישור');
      return;
    }

    const finalUrl =
      linkType === 'internal' ? normalizeInternalPath(trimmedUrl) : trimmedUrl;

    onConfirm({
      url: finalUrl,
      linkType,
      openInNewTab: linkType === 'external' ? openInNewTab : false,
      linkText: linkText.trim() || selectedText.trim() || finalUrl,
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className={popupStyles.popupOverlay}>
      <div className={styles.linkModal}>
        <div className={styles.modalContent}>
          <div className={styles.modalHeader}>
            <h2>הוספת קישור</h2>
            <button
              type="button"
              className={styles.closeButton}
              onClick={onClose}
              aria-label="סגירה"
            >
              ×
            </button>
          </div>

          <div className={styles.tabContainer}>
            <button
              type="button"
              className={`${styles.tab} ${linkType === 'internal' ? styles.active : ''}`}
              onClick={() => {
                setLinkType('internal');
                setOpenInNewTab(false);
                setError('');
              }}
            >
              קישור פנימי
            </button>
            <button
              type="button"
              className={`${styles.tab} ${linkType === 'external' ? styles.active : ''}`}
              onClick={() => {
                setLinkType('external');
                setOpenInNewTab(true);
                setError('');
              }}
            >
              קישור חיצוני
            </button>
          </div>

          <div className={styles.linkTextRow}>
            <label htmlFor="link-picker-text">טקסט לקישור</label>
            <input
              id="link-picker-text"
              type="text"
              value={linkText}
              onChange={(e) => setLinkText(e.target.value)}
              placeholder={selectedText || 'הטקסט שיוצג בפוסט'}
            />
          </div>

          {linkType === 'internal' ? (
            <div className={styles.internalPanel}>
              <div className={styles.searchRow}>
                <Search size={18} aria-hidden />
                <input
                  type="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="חיפוש לפי שם, slug או נתיב..."
                />
              </div>

              <div className={styles.controlsRow}>
                <div className={styles.filterChips} role="group" aria-label="סינון לפי סוג">
                  {TYPE_FILTERS.map((filter) => (
                    <button
                      key={filter.id}
                      type="button"
                      className={typeFilter === filter.id ? styles.chipActive : styles.chip}
                      onClick={() => setTypeFilter(filter.id)}
                    >
                      {filter.label}
                    </button>
                  ))}
                </div>
                <select
                  value={sortKey}
                  onChange={(e) => setSortKey(e.target.value)}
                  className={styles.sortSelect}
                  aria-label="מיון תוצאות"
                >
                  {SORT_OPTIONS.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.resultsList}>
                {isLoading && <p className={styles.statusText}>טוען...</p>}
                {!isLoading && error && <p className={styles.errorText}>{error}</p>}
                {!isLoading && !error && results.length === 0 && (
                  <p className={styles.statusText}>לא נמצאו תוצאות</p>
                )}
                {!isLoading &&
                  results.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      className={
                        selectedId === item.id ? styles.resultItemActive : styles.resultItem
                      }
                      onClick={() => handleSelectItem(item)}
                    >
                      <div className={styles.resultMain}>
                        <span className={styles.resultTitle}>{item.title}</span>
                        <span className={`${styles.typeBadge} ${styles[`type_${item.type}`]}`}>
                          {TYPE_LABELS[item.type] || item.type}
                        </span>
                        {item.status && item.type !== 'page' && (
                          <span className={styles.statusBadge}>
                            {STATUS_LABELS[item.status] || item.status}
                          </span>
                        )}
                      </div>
                      <span className={styles.resultPath} dir="ltr">
                        {item.url}
                      </span>
                      {item.subtitle && (
                        <span className={styles.resultSubtitle}>{item.subtitle}</span>
                      )}
                    </button>
                  ))}
              </div>

              <div className={styles.urlPreviewRow}>
                <label htmlFor="internal-url-preview">נתיב נבחר</label>
                <input
                  id="internal-url-preview"
                  type="text"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="/blog/my-post"
                  dir="ltr"
                />
              </div>
            </div>
          ) : (
            <div className={styles.externalPanel}>
              <div className={styles.urlPreviewRow}>
                <label htmlFor="external-url">כתובת URL</label>
                <input
                  id="external-url"
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://..."
                  dir="ltr"
                />
              </div>

              <div className={styles.presets}>
                <span className={styles.presetsLabel}>קיצורי דרך</span>
                <div className={styles.presetList}>
                  {EXTERNAL_LINK_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      className={styles.presetBtn}
                      onClick={() => setUrl(opt.value)}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <label className={styles.checkboxRow}>
                <input
                  type="checkbox"
                  checked={openInNewTab}
                  onChange={(e) => setOpenInNewTab(e.target.checked)}
                />
                פתיחה בטאב חדש
              </label>
            </div>
          )}

          {error && linkType === 'external' && (
            <p className={styles.errorText}>{error}</p>
          )}

          <div className={styles.modalActions}>
            <button type="button" className={styles.cancelButton} onClick={onClose}>
              ביטול
            </button>
            <button type="button" className={styles.confirmButton} onClick={handleConfirm}>
              הוספת קישור
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

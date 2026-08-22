"use client";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import popupStyles from "@/Components/OrderPopup/style.module.scss";
import MediaDetailsPanel from "@/Components/MediaDetailsPanel";
import { getPublicIdBasename } from "@/utils/cloudinaryPublicId";
import styles from "./style.module.scss";

export default function MediaPickerModal({
  isOpen,
  onClose,
  onConfirm,
  multiple = false,
  initialSelection = [],
}) {
  const [activeTab, setActiveTab] = useState("upload");
  const [images, setImages] = useState([]);
  const [nextCursor, setNextCursor] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadFilename, setUploadFilename] = useState("");
  const [uploadAlt, setUploadAlt] = useState("");
  const [actionError, setActionError] = useState("");
  const [selectedIds, setSelectedIds] = useState([]);
  const [editingImage, setEditingImage] = useState(null);
  const [mounted, setMounted] = useState(false);
  const fileInputRef = useRef(null);

  const isEditing = Boolean(editingImage);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    if (Array.isArray(initialSelection) && initialSelection.length > 0) {
      const ids = initialSelection
        .map((s) => (typeof s === "string" ? s : s.public_id))
        .filter(Boolean);
      setSelectedIds(ids);
    } else {
      setSelectedIds([]);
    }
    setActiveTab("upload");
    setUploadFilename("");
    setUploadAlt("");
    setActionError("");
    setEditingImage(null);
    fetchImages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const fetchImages = async (cursor) => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (cursor) params.set("next_cursor", cursor);
      const res = await fetch(`/api/media/list?${params.toString()}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load media");
      setImages((prev) => (cursor ? [...prev, ...data.resources] : data.resources));
      setNextCursor(data.next_cursor || null);
    } catch (_) {
      // keep UX simple
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpload = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      for (const file of files) {
        const formData = new FormData();
        formData.append("file", file);
        if (uploadFilename.trim()) formData.append("filename", uploadFilename.trim());
        if (uploadAlt.trim()) formData.append("alt", uploadAlt.trim());
        const res = await fetch("/api/upload", { method: "POST", body: formData });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Upload failed");
      }
      if (fileInputRef.current) fileInputRef.current.value = "";
      setUploadFilename("");
      setUploadAlt("");
      await fetchImages();
      setActiveTab("library");
    } catch (e) {
      setActionError(e.message || "העלאה נכשלה");
    } finally {
      setUploading(false);
    }
  };

  const toggleSelect = (publicId) => {
    setSelectedIds((prev) =>
      multiple
        ? prev.includes(publicId)
          ? prev.filter((id) => id !== publicId)
          : [...prev, publicId]
        : [publicId]
    );
  };

  const openEditor = (img) => {
    setEditingImage(img);
    setActionError("");
  };

  const closeEditor = () => {
    setEditingImage(null);
    setActiveTab("library");
  };

  const deleteSingle = async (publicId) => {
    if (!confirm("למחוק את התמונה הזו לצמיתות?")) return;
    try {
      const res = await fetch("/api/media/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ public_id: publicId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Delete failed");
      setImages((prev) => prev.filter((i) => i.public_id !== publicId));
      setSelectedIds((prev) => prev.filter((id) => id !== publicId));
      if (editingImage?.public_id === publicId) closeEditor();
    } catch (e) {
      setActionError(e.message || "מחיקה נכשלה");
    }
  };

  const handleImageSaved = (updated) => {
    const previousId = editingImage?.public_id;
    setImages((prev) =>
      prev.map((img) => (img.public_id === previousId ? { ...img, ...updated } : img))
    );
    if (previousId && selectedIds.includes(previousId) && updated.public_id !== previousId) {
      setSelectedIds((prev) => prev.map((id) => (id === previousId ? updated.public_id : id)));
    }
    closeEditor();
  };

  const confirmSelection = () => {
    const selected = images.filter((img) => selectedIds.includes(img.public_id));
    onConfirm(multiple ? selected : selected.slice(0, 1));
  };

  if (!isOpen || !mounted) return null;

  return createPortal(
    <div className={popupStyles.popupOverlay}>
      <div className={styles.mediaModal}>
        <div className={styles.modalContent}>
          <div className={styles.modalHeader}>
            {isEditing ? (
              <>
                <button
                  type="button"
                  className={styles.backButton}
                  onClick={closeEditor}
                >
                  ← חזרה לספרייה
                </button>
                <h2>עריכת תמונה</h2>
              </>
            ) : (
              <h2>בחירת תמונות</h2>
            )}
            <button type="button" className={styles.closeButton} onClick={onClose} aria-label="סגור">
              ×
            </button>
          </div>

          {!isEditing && (
            <div className={styles.tabContainer}>
              <button
                type="button"
                className={`${styles.tab} ${activeTab === "upload" ? styles.active : ""}`}
                onClick={() => setActiveTab("upload")}
              >
                העלאה חדשה
              </button>
              <button
                type="button"
                className={`${styles.tab} ${activeTab === "library" ? styles.active : ""}`}
                onClick={() => setActiveTab("library")}
              >
                ספריית תמונות
              </button>
            </div>
          )}

          <div className={styles.modalBody}>
            {isEditing && editingImage ? (
              <MediaDetailsPanel
                embedded
                image={editingImage}
                onCancel={closeEditor}
                onSaved={handleImageSaved}
                onDelete={() => deleteSingle(editingImage.public_id)}
                cancelLabel="ביטול"
              />
            ) : activeTab === "upload" ? (
              <div className={styles.uploadSection}>
                <h3>העלאת תמונות חדשות</h3>
                <div className={styles.uploadField}>
                  <label htmlFor="media-upload-filename">שם קובץ (אופציונלי)</label>
                  <input
                    id="media-upload-filename"
                    type="text"
                    value={uploadFilename}
                    onChange={(e) => setUploadFilename(e.target.value)}
                    placeholder="לדוגמה: עוגת-יום-הולדת"
                    className={styles.filenameInput}
                    dir="ltr"
                    disabled={uploading}
                  />
                </div>
                <div className={styles.uploadField}>
                  <label htmlFor="media-upload-alt">טקסט חלופי (Alt)</label>
                  <input
                    id="media-upload-alt"
                    type="text"
                    value={uploadAlt}
                    onChange={(e) => setUploadAlt(e.target.value)}
                    placeholder="תיאור קצר לנגישות ול-SEO"
                    className={styles.filenameInput}
                    disabled={uploading}
                  />
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple={multiple}
                  onChange={handleUpload}
                  disabled={uploading}
                  className={styles.uploadInput}
                />
                <div className={styles.uploadDescription}>
                  קבצים יועלו עם אופטימיזציה אוטומטית.
                </div>
                {uploading && <div className={styles.uploadDescription}>מעלה קבצים...</div>}
              </div>
            ) : (
              <div className={styles.librarySection}>
                {actionError && (
                  <p className={styles.actionError} role="alert">
                    {actionError}
                  </p>
                )}
                <div className={styles.imageGrid}>
                  {images.map((img) => (
                    <div
                      key={img.public_id}
                      className={`${styles.imageCard} ${selectedIds.includes(img.public_id) ? styles.selected : ""}`}
                      onClick={() => toggleSelect(img.public_id)}
                    >
                      <div className={`${styles.imageWrapper} ${selectedIds.includes(img.public_id) ? styles.selected : ""}`}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={img.secure_url} alt={img.alt || img.public_id} />
                        <div className={styles.selectionOverlay}>
                          <div className={styles.checkIcon}>✓</div>
                        </div>
                      </div>
                      <div className={styles.imageMeta}>
                        <div className={styles.imageName} title={img.public_id}>
                          {getPublicIdBasename(img.public_id)}
                          {img.alt ? ` · ${img.alt}` : ""}
                        </div>
                        <div className={styles.imageActions}>
                          <button
                            type="button"
                            className={styles.actionButton}
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleSelect(img.public_id);
                            }}
                          >
                            {selectedIds.includes(img.public_id) ? "בטל" : "בחר"}
                          </button>
                          <button
                            type="button"
                            className={styles.actionButton}
                            onClick={(e) => {
                              e.stopPropagation();
                              openEditor(img);
                            }}
                          >
                            ערוך
                          </button>
                          <button
                            type="button"
                            className={`${styles.actionButton} ${styles.danger}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteSingle(img.public_id);
                            }}
                          >
                            מחק
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                {nextCursor && (
                  <button
                    type="button"
                    className={styles.loadMoreButton}
                    onClick={() => fetchImages(nextCursor)}
                    disabled={isLoading}
                  >
                    {isLoading ? "טוען..." : "טען תמונות נוספות"}
                  </button>
                )}
              </div>
            )}
          </div>

          {!isEditing && (
            <div className={styles.modalActions}>
              <button type="button" className={styles.cancelButton} onClick={onClose}>
                ביטול
              </button>
              <button
                type="button"
                className={styles.confirmButton}
                onClick={confirmSelection}
                disabled={!selectedIds.length}
              >
                אישור בחירה ({selectedIds.length})
              </button>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}

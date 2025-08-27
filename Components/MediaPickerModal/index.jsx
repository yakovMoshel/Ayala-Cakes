"use client";
import { useEffect, useRef, useState } from "react";
import popupStyles from "@/Components/OrderPopup/style.module.scss";
import styles from "./style.module.scss";

export default function MediaPickerModal({
  isOpen,
  onClose,
  onConfirm,
  multiple = false,
  initialSelection = [], // array of { public_id, secure_url } or urls
}) {
  const [activeTab, setActiveTab] = useState("upload");
  const [images, setImages] = useState([]); // [{ public_id, secure_url }]
  const [nextCursor, setNextCursor] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;
    // map initial selection (urls) to ids if needed
    if (Array.isArray(initialSelection) && initialSelection.length > 0) {
      const ids = initialSelection
        .map((s) => (typeof s === "string" ? s : s.public_id))
        .filter(Boolean);
      setSelectedIds(ids);
    } else {
      setSelectedIds([]);
    }
    // fetch initial list
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
    } catch (e) {
      // no-op, keep UX simple
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
        const res = await fetch("/api/upload", { method: "POST", body: formData });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Upload failed");
      }
      if (fileInputRef.current) fileInputRef.current.value = "";
      // refresh library and switch to it
      await fetchImages();
      setActiveTab("library");
    } catch (e) {
      // handle silently
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

  const deleteSingle = async (publicId) => {
    if (!confirm("למחוק את התמונה לצמיתות?")) return;
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
    } catch (_) {
      // keep silent
    }
  };

  const confirmSelection = () => {
    const selected = images.filter((img) => selectedIds.includes(img.public_id));
    onConfirm(multiple ? selected : selected.slice(0, 1));
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className={popupStyles.popupOverlay}>
      <div className={styles.mediaModal}>
        <div className={styles.modalContent}>
          <div className={styles.modalHeader}>
            <h2>בחירת תמונות</h2>
            <button className={styles.closeButton} onClick={onClose} aria-label="close">
              ×
            </button>
          </div>

          <div className={styles.tabContainer}>
            <button
              className={`${styles.tab} ${activeTab === "upload" ? styles.active : ""}`}
              onClick={() => setActiveTab("upload")}
            >
              העלאה חדשה
            </button>
            <button
              className={`${styles.tab} ${activeTab === "library" ? styles.active : ""}`}
              onClick={() => setActiveTab("library")}
            >
              ספריית תמונות
            </button>
          </div>

          {activeTab === "upload" && (
            <div className={styles.uploadSection}>
              <h3>העלאת תמונות חדשות</h3>
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
                קבצים יועלו עם אופטימיזציה אוטומטית:<br/>
                • המרה ל-WEBP לטעינה מהירה<br/>
                • דחיסה חכמה לאיכות מושלמת<br/>
                • הגבלת רוחב מקסימלי לביצועים מיטביים
              </div>
              {uploading && (
                <div className={styles.uploadDescription}>
                  מעלה קבצים...
                </div>
              )}
            </div>
          )}

          {activeTab === "library" && (
            <div className={styles.librarySection}>
              <div className={styles.imageGrid}>
                {images.map((img) => (
                  <div
                    key={img.public_id}
                    className={`${styles.imageCard} ${selectedIds.includes(img.public_id) ? styles.selected : ""}`}
                    onClick={() => toggleSelect(img.public_id)}
                  >
                    <div className={`${styles.imageWrapper} ${selectedIds.includes(img.public_id) ? styles.selected : ""}`}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={img.secure_url} alt={img.public_id} />
                      <div className={styles.selectionOverlay}>
                        <div className={styles.checkIcon}>✓</div>
                      </div>
                    </div>
                    <div className={styles.imageMeta}>
                      <div className={styles.imageName}>{img.public_id}</div>
                      <div className={styles.imageActions}>
                        <button
                          className={styles.actionButton}
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleSelect(img.public_id);
                          }}
                        >
                          {selectedIds.includes(img.public_id) ? "בטל" : "בחר"}
                        </button>
                        <button
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
                  className={styles.loadMoreButton}
                  onClick={() => fetchImages(nextCursor)}
                  disabled={isLoading}
                >
                  {isLoading ? "טוען..." : "טען תמונות נוספות"}
                </button>
              )}
            </div>
          )}

          <div className={styles.modalActions}>
            <button className={styles.cancelButton} onClick={onClose}>
              ביטול
            </button>
            <button
              className={styles.confirmButton}
              onClick={confirmSelection}
              disabled={!selectedIds.length}
            >
              אישור בחירה ({selectedIds.length})
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
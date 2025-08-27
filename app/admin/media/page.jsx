"use client";
import { useEffect, useRef, useState } from "react";
import styles from "./style.module.scss";

export default function MediaLibraryPage() {
  const [images, setImages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [nextCursor, setNextCursor] = useState(null);
  const [folder, setFolder] = useState("");
  const [uploading, setUploading] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [preview, setPreview] = useState(null); // { url, public_id }
  // width control removed from UI; keep internal default for preview/thumbnail
  const [preferredWidth] = useState(1200);

  const fileInputRef = useRef(null);

  const fetchImages = async (cursor) => {
    setIsLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      if (cursor) params.set("next_cursor", cursor);
      if (folder) params.set("folder", folder);
      const res = await fetch(`/api/media/list?${params.toString()}`, {
        method: "GET",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load media");
      setImages((prev) => (cursor ? [...prev, ...data.resources] : data.resources));
      setNextCursor(data.next_cursor);
    } catch (e) {
      setError(e.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchImages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [folder]);

  const handleUpload = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      for (const file of files) {
        const formData = new FormData();
        formData.append("file", file);
        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Upload failed");
      }
      fetchImages();
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (e) {
      setError(e.message);
    } finally {
      setUploading(false);
    }
  };

  const handleCopy = async (url) => {
    try {
      await navigator.clipboard.writeText(url);
      alert("הקישור הועתק ללוח");
    } catch (_) {}
  };

  const injectTransform = (secureUrl, transform) => {
    if (!secureUrl) return secureUrl;
    const marker = "/upload/";
    const idx = secureUrl.indexOf(marker);
    if (idx === -1) return secureUrl;
    return `${secureUrl.slice(0, idx + marker.length)}${transform}/${secureUrl.slice(
      idx + marker.length
    )}`;
  };

  const optimizedUrl = (secureUrl, width = preferredWidth) =>
    injectTransform(secureUrl, `f_auto,q_auto,c_limit,w_${width},dpr_auto`);

  const webpUrl = (secureUrl, width = preferredWidth) =>
    injectTransform(secureUrl, `f_webp,q_auto,c_limit,w_${width},dpr_auto`);

  const thumbUrl = (secureUrl) => injectTransform(secureUrl, `f_auto,q_auto,c_fill,w_400,h_300`);

  const toggleSelect = (publicId) => {
    setSelectedIds((prev) =>
      prev.includes(publicId) ? prev.filter((id) => id !== publicId) : [...prev, publicId]
    );
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
      setImages((prev) => prev.filter((img) => img.public_id !== publicId));
    } catch (e) {
      setError(e.message);
    }
  };

  const deleteBulk = async () => {
    if (!selectedIds.length) return;
    if (!confirm(`למחוק ${selectedIds.length} תמונות לצמיתות?`)) return;
    try {
      const res = await fetch("/api/media/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ publicIds: selectedIds }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Bulk delete failed");
      setImages((prev) => prev.filter((img) => !selectedIds.includes(img.public_id)));
      setSelectedIds([]);
      setIsEditMode(false);
    } catch (e) {
      setError(e.message);
    }
  };

  // keyboard navigation in modal
  useEffect(() => {
    if (!preview) return;
    const handler = (e) => {
      if (!preview) return;
      const idx = images.findIndex((i) => i.public_id === preview.public_id);
      if (e.key === 'ArrowRight') {
        const nextIdx = (idx + 1) % images.length;
        const next = images[nextIdx];
        setPreview({ url: optimizedUrl(next.secure_url, 1600), public_id: next.public_id });
      } else if (e.key === 'ArrowLeft') {
        const prevIdx = (idx - 1 + images.length) % images.length;
        const prev = images[prevIdx];
        setPreview({ url: optimizedUrl(prev.secure_url, 1600), public_id: prev.public_id });
      } else if (e.key === 'Escape') {
        setPreview(null);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [preview, images]);

  return (
    <div className={styles.mediaPage}>
      <div className={styles.header}>
        <h1 className={styles.title}>ספריית מדיה</h1>
        <div className={styles.actions}>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            onChange={handleUpload}
            disabled={uploading}
          />
          <input
            className={styles.folderInput}
            type="text"
            placeholder="תיקייה (רשות) למשל: ayala-media"
            value={folder}
            onChange={(e) => setFolder(e.target.value)}
          />
          <button className={styles.actionButton} onClick={() => fetchImages()} disabled={isLoading}>
            רענן
          </button>
          {/* רוחב ברירת מחדל נשלט פנימית */}
          <button
            className={`${styles.actionButton} ${isEditMode ? styles.editMode : ""}`}
            onClick={() => setIsEditMode((v) => !v)}
          >
            {isEditMode ? "בטל עריכה" : "מצב עריכה"}
          </button>
          {isEditMode && (
            <button
              className={`${styles.actionButton} ${styles.bulkDelete}`}
              onClick={deleteBulk}
              disabled={!selectedIds.length}
            >
              מחק נבחרים ({selectedIds.length})
            </button>
          )}
        </div>
      </div>
      {error && <div className={styles.error}>{error}</div>}
      {isLoading && (
        <div className={styles.skeletonGrid} aria-hidden>
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className={styles.skeletonCard}>
              <div className={styles.skeletonImage} />
              <div className={styles.skeletonMeta}>
                <div className={styles.skeletonText} />
                <div className={styles.skeletonActions} />
              </div>
            </div>
          ))}
        </div>
      )}
      <div className={styles.items} style={{ display: isLoading ? 'none' : undefined }}>
        {images.map((img) => (
          <div key={img.public_id} className={styles.card}>
            {isEditMode && (
              <label className={styles.checkboxWrap}>
                <input
                  type="checkbox"
                  checked={selectedIds.includes(img.public_id)}
                  onChange={() => toggleSelect(img.public_id)}
                />
              </label>
            )}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={thumbUrl(img.secure_url)}
              alt={img.public_id}
              onClick={() => setPreview({ url: optimizedUrl(img.secure_url, 1600), public_id: img.public_id })}
            />
            <div className={styles.meta}>
              <div className={styles.name} title={img.public_id}>
                {img.public_id}
              </div>
              <div className={styles.rowBtns}>
                <button className={styles.actionButton} onClick={() => handleCopy(optimizedUrl(img.secure_url))}>
                  העתק
                </button>
                <button className={`${styles.actionButton} ${styles.danger}`} onClick={() => deleteSingle(img.public_id)}>
                  מחק
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className={styles.footer}>
        {nextCursor && (
          <button className={styles.loadMoreButton} onClick={() => fetchImages(nextCursor)} disabled={isLoading}>
            טען תמונות נוספות
          </button>
        )}
      </div>

      {preview && (
        <div className={styles.modal} onClick={() => setPreview(null)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={preview.url} alt={preview.public_id} />
            <button
              className={styles.navLeft}
              aria-label="previous"
              onClick={() => {
                const idx = images.findIndex((i) => i.public_id === preview.public_id);
                const prevIdx = (idx - 1 + images.length) % images.length;
                const prev = images[prevIdx];
                setPreview({ url: optimizedUrl(prev.secure_url, 1600), public_id: prev.public_id });
              }}
            >
              ‹
            </button>
            <button
              className={styles.navRight}
              aria-label="next"
              onClick={() => {
                const idx = images.findIndex((i) => i.public_id === preview.public_id);
                const nextIdx = (idx + 1) % images.length;
                const next = images[nextIdx];
                setPreview({ url: optimizedUrl(next.secure_url, 1600), public_id: next.public_id });
              }}
            >
              ›
            </button>
            <div className={styles.modalActions}>
              <button className={styles.modalButton} onClick={() => handleCopy(preview.url)}>
                העתק קישור
              </button>
              <button className={`${styles.modalButton} ${styles.danger}`} onClick={() => {
                deleteSingle(preview.public_id);
                setPreview(null);
              }}>
                מחק
              </button>
              <button className={styles.modalButton} onClick={() => setPreview(null)}>
                סגור
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}



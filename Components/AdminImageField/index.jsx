"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { ImageIcon, FolderOpen, X } from "lucide-react";
import styles from "./style.module.scss";

const MediaPickerModal = dynamic(
  () => import("@/Components/MediaPickerModal"),
  { ssr: false }
);

export default function AdminImageField({
  label = "תמונה",
  value = "",
  onChange,
  required = false,
  disabled = false,
  placeholder = "הדביקי קישור או בחרי מספריית המדיה",
  id = "image",
  hint,
}) {
  const [showPicker, setShowPicker] = useState(false);

  const handleConfirm = (selection) => {
    const first = Array.isArray(selection) ? selection[0] : selection;
    if (first?.secure_url) {
      onChange(first.secure_url);
    }
    setShowPicker(false);
  };

  return (
    <div className={styles.field}>
      <label htmlFor={id}>
        {label}
        {required && <span className={styles.required} aria-hidden="true"> *</span>}
      </label>

      {hint && <p className={styles.hint}>{hint}</p>}

      {value ? (
        <div className={styles.preview}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={value} alt="" />
          <button
            type="button"
            className={styles.clearPreview}
            onClick={() => onChange("")}
            disabled={disabled}
            aria-label="הסר תמונה"
          >
            <X size={16} />
          </button>
        </div>
      ) : null}

      <div className={styles.inputRow}>
        <div className={styles.urlInputWrap}>
          <ImageIcon className={styles.inputIcon} size={18} aria-hidden="true" />
          <input
            type="url"
            id={id}
            name={id}
            value={value}
            placeholder={placeholder}
            onChange={(e) => onChange(e.target.value)}
            required={required && !value}
            disabled={disabled}
          />
        </div>
        <button
          type="button"
          className={styles.libraryBtn}
          onClick={() => setShowPicker(true)}
          disabled={disabled}
        >
          <FolderOpen size={16} />
          <span>ספריית מדיה</span>
        </button>
      </div>

      {showPicker && (
        <MediaPickerModal
          isOpen={showPicker}
          onClose={() => setShowPicker(false)}
          onConfirm={handleConfirm}
          multiple={false}
          initialSelection={value ? [value] : []}
        />
      )}
    </div>
  );
}

"use client";

import { useEffect, useId, useRef, useState } from "react";
import { MoreVertical } from "lucide-react";
import styles from "./style.module.scss";

/**
 * Compact three-dots action menu for admin list rows.
 *
 * @param {object} props
 * @param {string} [props.label] - Hebrew aria-label for the trigger
 * @param {boolean} [props.disabled]
 * @param {Array<{
 *   id: string,
 *   label: string,
 *   icon?: React.ReactNode,
 *   onClick: Function,
 *   disabled?: boolean,
 *   tone?: 'default' | 'danger',
 * }>} props.items
 */
export default function AdminRowMenu({
  label = "פעולות נוספות",
  disabled = false,
  items = [],
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);
  const menuId = useId();

  useEffect(() => {
    if (!open) return undefined;

    const onPointerDown = (e) => {
      if (!rootRef.current?.contains(e.target)) {
        setOpen(false);
      }
    };

    const onKeyDown = (e) => {
      if (e.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div
      className={styles.menu}
      ref={rootRef}
      data-open={open ? "true" : undefined}
      onClick={(e) => e.stopPropagation()}
    >
      <button
        type="button"
        className={styles.trigger}
        aria-label={label}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        disabled={disabled}
        onClick={(e) => {
          e.stopPropagation();
          setOpen((prev) => !prev);
        }}
      >
        <MoreVertical size={18} aria-hidden />
      </button>

      {open && (
        <div
          id={menuId}
          className={styles.dropdown}
          role="menu"
          aria-label={label}
        >
          {items.map((item) => (
            <button
              key={item.id}
              type="button"
              role="menuitem"
              className={`${styles.item} ${
                item.tone === "danger" ? styles.danger : ""
              }`}
              disabled={item.disabled || disabled}
              onClick={(e) => {
                e.stopPropagation();
                setOpen(false);
                item.onClick(e);
              }}
            >
              {item.icon ? (
                <span className={styles.icon} aria-hidden>
                  {item.icon}
                </span>
              ) : null}
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

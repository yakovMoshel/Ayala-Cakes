'use client';

import { useEffect, useId, useRef, useState } from 'react';
import styles from './style.module.scss';

export function FieldHelp({ text, label = 'הסבר על השדה' }) {
  const tipId = useId();
  const buttonRef = useRef(null);
  const [pinned, setPinned] = useState(false);
  const [hover, setHover] = useState(false);
  const [focused, setFocused] = useState(false);
  const open = pinned || hover || focused;

  useEffect(() => {
    if (!pinned) return undefined;
    const onKey = (event) => {
      if (event.key === 'Escape') setPinned(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [pinned]);

  return (
    <span
      className={styles.help}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <button
        ref={buttonRef}
        type="button"
        className={styles.helpButton}
        aria-label={label}
        aria-describedby={tipId}
        aria-expanded={open}
        onClick={() => setPinned((value) => !value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      >
        ?
      </button>
      <span id={tipId} role="tooltip" className={open ? styles.tooltipOpen : styles.tooltip}>
        {text}
      </span>
    </span>
  );
}

export function FieldLabel({ htmlFor, help, helpLabel, children }) {
  return (
    <span className={styles.labelRow}>
      <label htmlFor={htmlFor}>{children}</label>
      {help ? <FieldHelp text={help} label={helpLabel} /> : null}
    </span>
  );
}

export function FieldError({ id, children }) {
  if (!children) return null;
  return (
    <p id={id} className={styles.error} role="alert">
      {children}
    </p>
  );
}

export function FieldWarning({ id, children }) {
  if (!children || (Array.isArray(children) && children.length === 0)) return null;
  const lines = Array.isArray(children) ? children : [children];
  return (
    <div id={id} className={styles.warning}>
      {lines.map((line) => (
        <p key={line}>{line}</p>
      ))}
    </div>
  );
}

export function SlugChangeDialog({ onCancel, onConfirm }) {
  const cancelRef = useRef(null);

  useEffect(() => {
    cancelRef.current?.focus();
  }, []);

  return (
    <div className={styles.dialogBackdrop}>
      <div
        className={styles.dialog}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="slug-change-title"
        aria-describedby="slug-change-desc"
      >
        <h2 id="slug-change-title">שינוי כתובת שפורסמה</h2>
        <p id="slug-change-desc">
          הכתובת הזו כבר פורסמה. שינוי שלה ישבור קישורים קיימים, ולא תיווצר הפניה אוטומטית.
        </p>
        <div className={styles.dialogActions}>
          <button ref={cancelRef} type="button" className={styles.dialogCancel} onClick={onCancel}>
            השאירו את הכתובת
          </button>
          <button type="button" className={styles.dialogConfirm} onClick={onConfirm}>
            שנו בכל זאת
          </button>
        </div>
      </div>
    </div>
  );
}

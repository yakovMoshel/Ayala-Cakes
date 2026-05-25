"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import AdminImageField from "@/Components/AdminImageField";
import PostCtaBlock from "./index";
import {
  DEFAULT_POST_CTA,
  MAX_CTA_BUTTONS,
  MAX_CTA_PRODUCTS,
  INTERNAL_LINK_OPTIONS,
  EXTERNAL_LINK_OPTIONS,
  createEmptyCtaButton,
  normalizePostCtaForEditor,
  isCtaEnabled,
} from "@/utils/postCta";
import styles from "./editor.module.scss";

const EMPTY_BUTTON = () => createEmptyCtaButton();

export default function PostCtaEditor({ value, onChange }) {
  const cta = useMemo(
    () => normalizePostCtaForEditor(value || DEFAULT_POST_CTA),
    [value]
  );
  const [catalogProducts, setCatalogProducts] = useState([]);
  const [previewProducts, setPreviewProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);

  const updateCta = useCallback(
    (patch) => {
      onChange(normalizePostCtaForEditor({ ...cta, ...patch }));
    },
    [cta, onChange]
  );

  const loadCatalog = useCallback(async () => {
    setLoadingProducts(true);
    try {
      const res = await fetch("/api/product/admin", { credentials: "include" });
      const json = await res.json();
      if (json.success) {
        setCatalogProducts(json.data || []);
      }
    } catch {
      setCatalogProducts([]);
    } finally {
      setLoadingProducts(false);
    }
  }, []);

  useEffect(() => {
    if (cta.enabled) {
      loadCatalog();
    }
  }, [cta.enabled, loadCatalog]);

  useEffect(() => {
    if (!cta.enabled || !cta.productIds.length) {
      setPreviewProducts([]);
      return;
    }

    const ids = cta.productIds.join(",");
    fetch(`/api/product/lookup?ids=${encodeURIComponent(ids)}`, {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((json) => {
        if (json.success) {
          setPreviewProducts(json.data || []);
        }
      })
      .catch(() => setPreviewProducts([]));
  }, [cta.enabled, cta.productIds]);

  const toggleProduct = (productId) => {
    const id = String(productId);
    const current = [...cta.productIds];
    if (current.includes(id)) {
      updateCta({ productIds: current.filter((x) => x !== id) });
      return;
    }
    if (current.length >= MAX_CTA_PRODUCTS) return;
    updateCta({ productIds: [...current, id] });
  };

  const updateButton = (index, patch) => {
    const buttons = [...(cta.buttons.length ? cta.buttons : [EMPTY_BUTTON()])];
    while (buttons.length <= index) buttons.push(EMPTY_BUTTON());
    buttons[index] = { ...buttons[index], ...patch };
    updateCta({ buttons: buttons.slice(0, MAX_CTA_BUTTONS) });
  };

  const addButton = () => {
    if (cta.buttons.length >= MAX_CTA_BUTTONS) return;
    updateCta({ buttons: [...cta.buttons, EMPTY_BUTTON()] });
  };

  const removeButton = (index) => {
    updateCta({ buttons: cta.buttons.filter((_, i) => i !== index) });
  };

  const buttonSlots =
    cta.buttons.length > 0
      ? cta.buttons
      : cta.enabled
        ? [EMPTY_BUTTON()]
        : [];

  return (
    <div className={styles.section}>
      <div className={styles.sectionHeader}>
        <div>
          <h4>בלוק CTA בסוף הפוסט</h4>
          <p>אופציונלי — יוצג אחרי תוכן הפוסט בלבד. כולל תצוגה מקדימה חיה.</p>
        </div>
        <label className={styles.enableToggle}>
          <input
            type="checkbox"
            checked={cta.enabled}
            onChange={(e) =>
              updateCta({
                enabled: e.target.checked,
                buttons: e.target.checked && !cta.buttons.length ? [EMPTY_BUTTON()] : cta.buttons,
              })
            }
          />
          <span>הפעל בלוק CTA</span>
        </label>
      </div>

      {cta.enabled && (
        <>
          <div className={styles.fields}>
            <div className={styles.formGroup}>
              <label htmlFor="cta-title">כותרת CTA</label>
              <input
                id="cta-title"
                type="text"
                value={cta.title}
                onChange={(e) => updateCta({ title: e.target.value })}
                placeholder="למשל: מוכנים להזמין?"
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="cta-description">תיאור (אופציונלי)</label>
              <textarea
                id="cta-description"
                value={cta.description}
                onChange={(e) => updateCta({ description: e.target.value })}
                placeholder="טקסט תומך קצר מתחת לכותרת"
              />
            </div>

            <div className={styles.formGroup}>
              <label>כפתורי פעולה (עד {MAX_CTA_BUTTONS})</label>
              {buttonSlots.map((btn, index) => (
                <div key={index} className={styles.buttonCard}>
                  <div className={styles.buttonCardHeader}>
                    <span>כפתור {index + 1}</span>
                    {cta.buttons.length > 0 && (
                      <button
                        type="button"
                        className={styles.removeBtn}
                        onClick={() => removeButton(index)}
                      >
                        הסר
                      </button>
                    )}
                  </div>
                  <div className={styles.formGroup}>
                    <label>טקסט כפתור</label>
                    <input
                      type="text"
                      value={btn.label}
                      onChange={(e) => updateButton(index, { label: e.target.value })}
                      placeholder="למשל: לחנות"
                    />
                  </div>
                  <div className={styles.linkRow}>
                    <div className={styles.formGroup}>
                      <label>סוג קישור</label>
                      <select
                        value={btn.linkType}
                        onChange={(e) =>
                          updateButton(index, {
                            linkType: e.target.value,
                            openInNewTab: e.target.value === "external",
                          })
                        }
                      >
                        <option value="internal">פנימי באתר</option>
                        <option value="external">חיצוני</option>
                      </select>
                    </div>
                    {btn.linkType === "internal" ? (
                      <div className={styles.formGroup}>
                        <label>דף באתר</label>
                        <select
                          value={
                            INTERNAL_LINK_OPTIONS.some((o) => o.value === btn.url)
                              ? btn.url
                              : "__custom__"
                          }
                          onChange={(e) => {
                            if (e.target.value === "__custom__") {
                              updateButton(index, { url: "" });
                            } else {
                              updateButton(index, { url: e.target.value, openInNewTab: false });
                            }
                          }}
                        >
                          <option value="__custom__">נתיב מותאם...</option>
                          {INTERNAL_LINK_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    ) : null}
                  </div>
                  <div className={styles.formGroup}>
                    <label>
                      {btn.linkType === "external" ? "כתובת URL חיצונית" : "נתיב (URL)"}
                    </label>
                    <input
                      type="url"
                      value={btn.url}
                      onChange={(e) => updateButton(index, { url: e.target.value })}
                      placeholder={
                        btn.linkType === "external"
                          ? "https://example.com"
                          : "/shop או /blog"
                      }
                      dir="ltr"
                    />
                  </div>
                  {btn.linkType === "external" && (
                    <label className={styles.enableToggle}>
                      <input
                        type="checkbox"
                        checked={btn.openInNewTab}
                        onChange={(e) =>
                          updateButton(index, { openInNewTab: e.target.checked })
                        }
                      />
                      <span>פתח בטאב חדש</span>
                    </label>
                  )}
                </div>
              ))}
              <button
                type="button"
                className={styles.addBtn}
                onClick={addButton}
                disabled={cta.buttons.length >= MAX_CTA_BUTTONS}
              >
                + הוסף כפתור
              </button>
            </div>

            <div className={styles.formGroup}>
              <label>מוצרים מומלצים (עד {MAX_CTA_PRODUCTS})</label>
              <p className={styles.hint}>
                יוצגו אופקית בסוף הפוסט; בנייד ניתן לגלול הצידה.
              </p>
              {loadingProducts ? (
                <p className={styles.hint}>טוען מוצרים...</p>
              ) : catalogProducts.length === 0 ? (
                <p className={styles.hint}>אין מוצרים זמינים להצגה.</p>
              ) : (
                <div className={styles.productPicker} role="group" aria-label="בחירת מוצרים">
                  {catalogProducts.map((product) => (
                    <label key={product._id} className={styles.productOption}>
                      <input
                        type="checkbox"
                        checked={cta.productIds.includes(String(product._id))}
                        onChange={() => toggleProduct(product._id)}
                        disabled={
                          !cta.productIds.includes(String(product._id)) &&
                          cta.productIds.length >= MAX_CTA_PRODUCTS
                        }
                      />
                      <span>{product.name}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            <AdminImageField
              id="cta-image"
              label="תמונת בלוק (אופציונלי)"
              value={cta.image}
              onChange={(url) => updateCta({ image: url })}
              hint="תמונה מעל או ליד תוכן הבלוק"
            />

            <div className={styles.formGroup}>
              <label htmlFor="cta-embed">HTML / הטמעה מותאמת (אופציונלי)</label>
              <textarea
                id="cta-embed"
                value={cta.embedHtml}
                onChange={(e) => updateCta({ embedHtml: e.target.value })}
                placeholder="קוד HTML מותאם (iframe, וידאו וכו')"
                dir="ltr"
              />
              <p className={styles.hint}>השתמשי רק בתוכן מהמקורות שאת סומכת עליהם.</p>
            </div>
          </div>

          {isCtaEnabled(cta) && (
            <div className={styles.previewWrap}>
              <PostCtaBlock
                cta={cta}
                products={previewProducts}
                preview
                hideAdminActions
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}

"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import axios from "axios";
import styles from "./style.module.scss";
import layout from "../layoutShared.module.scss";
import { 
  ShoppingBag, 
  Plus, 
  Edit3, 
  Trash2, 
  ToggleLeft, 
  ToggleRight, 
  Calendar, 
  TrendingUp, 
  Tag, 
  AlertCircle,
  Banknote,
  Check,
  X,
} from "lucide-react";

export default function AdminProductsListPage() {
  const router = useRouter();
  const [products, setProducts] = useState([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [actionId, setActionId] = useState(null);
  const [editingPriceId, setEditingPriceId] = useState(null);
  const [priceDraft, setPriceDraft] = useState("");

  const loadProducts = useCallback(() => {
    setIsLoading(true);
    setError("");
    return fetch("/api/product/admin", { credentials: "include" })
      .then((res) => res.json())
      .then((json) => {
        if (!json.success) throw new Error(json.error || "Failed to load products");
        setProducts(json.data);
      })
      .catch((e) => setError(e.message))
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const updateActive = async (e, productId, isActive) => {
    e.stopPropagation();
    setActionId(productId);
    try {
      await axios.put(`/api/product/${productId}`, { isActive });
      await loadProducts();
    } catch {
      setError("שגיאה בעדכון סטטוס מוצר");
    } finally {
      setActionId(null);
    }
  };

  const deactivateProduct = async (e, productId) => {
    e.stopPropagation();
    if (!window.confirm("האם להסיר את המוצר מהחנות?")) return;
    setActionId(productId);
    try {
      await axios.put(`/api/product/${productId}`, { isActive: false });
      setProducts((prev) => prev.filter((p) => p._id !== productId));
    } catch {
      setError("שגיאה בהסרת המוצר");
    } finally {
      setActionId(null);
    }
  };

  const startPriceEdit = (e, product) => {
    e.stopPropagation();
    setEditingPriceId(product._id);
    setPriceDraft(String(product.price ?? ""));
    setError("");
  };

  const cancelPriceEdit = (e) => {
    e?.stopPropagation();
    setEditingPriceId(null);
    setPriceDraft("");
  };

  const savePrice = async (e, productId) => {
    e.stopPropagation();
    const parsed = Number(priceDraft);
    if (!Number.isFinite(parsed) || parsed < 0) {
      setError("יש להזין מחיר תקין (מספר חיובי)");
      return;
    }

    setActionId(productId);
    try {
      await axios.put(`/api/product/${productId}`, { price: parsed });
      setProducts((prev) =>
        prev.map((p) => (p._id === productId ? { ...p, price: parsed } : p))
      );
      setEditingPriceId(null);
      setPriceDraft("");
    } catch {
      setError("שגיאה בעדכון המחיר");
    } finally {
      setActionId(null);
    }
  };

  const handlePriceKeyDown = (e, productId) => {
    if (e.key === "Enter") {
      e.preventDefault();
      savePrice(e, productId);
    }
    if (e.key === "Escape") {
      cancelPriceEdit(e);
    }
  };

  const formatDate = (date) => {
    if (!date) return "";
    return new Date(date).toLocaleDateString("he-IL", {
      year: "numeric",
      month: "short",
      day: "numeric"
    });
  };

  return (
    <div className={`${styles.listSection} ${layout.listPage}`}>
      <div className={layout.stickyChrome}>
        <div className={styles.pageHeader}>
          <div className={styles.headerTitle}>
            <h1>ניהול מוצרים בחנות</h1>
            <p className={styles.subtitle}>נהלי את מלאי העוגות, הקינוחים ומחירי המוצרים</p>
          </div>
          <Link href="/admin/products/new" className={styles.newButton}>
            <Plus size={18} />
            <span>מוצר חדש</span>
          </Link>
        </div>
      </div>

      <div className={layout.listScroller}>
      {error && (
        <div className={styles.errorMessage}>
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {isLoading && (
        <div className={styles.skeletonList}>
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className={styles.skeletonRow}>
              <div className={styles.skeletonThumb} />
              <div className={styles.skeletonContent}>
                <div className={styles.skeletonTitle} />
                <div className={styles.skeletonMeta} />
              </div>
              <div className={styles.skeletonActions} />
            </div>
          ))}
        </div>
      )}

      {!isLoading && !error && products.length === 0 && (
        <div className={styles.emptyState}>
          <ShoppingBag size={48} className={styles.emptyIcon} />
          <h3>אין מוצרים עדיין</h3>
          <p>הוסיפי את העוגה או הקינוח הראשון שלך כדי להתחיל למכור בחנות!</p>
          <Link href="/admin/products/new" className={styles.emptyBtn}>
            <Plus size={18} />
            <span>צרי מוצר חדש</span>
          </Link>
        </div>
      )}

      {!isLoading && !error && products.length > 0 && (
        <div className={styles.itemList}>
          {products.map((product) => (
            <div
              key={product._id}
              className={styles.itemRow}
              role="button"
              tabIndex={0}
              onClick={() => router.push(`/admin/products/${product._id}/edit`)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  router.push(`/admin/products/${product._id}/edit`);
                }
              }}
            >
              {product.images?.[0] ? (
                <img src={product.images[0]} alt="" className={styles.thumb} />
              ) : (
                <div className={styles.thumbPlaceholder}>
                  <ShoppingBag size={24} />
                </div>
              )}
              <div className={styles.itemInfo}>
                <div className={styles.itemTitle}>{product.name}</div>
                <div className={styles.itemMeta}>
                  <span
                    className={`${styles.badge} ${
                      product.isActive ? styles.active : styles.inactive
                    }`}
                  >
                    {product.isActive ? "פעיל" : "לא פעיל"}
                  </span>
                  <span className={styles.metaItem}>
                    <Tag size={13} />
                    <span>{product.category}</span>
                  </span>
                  <div
                    className={styles.priceQuickEdit}
                    onClick={(e) => e.stopPropagation()}
                    onKeyDown={(e) => e.stopPropagation()}
                  >
                    {editingPriceId === product._id ? (
                      <div className={styles.priceEditForm}>
                        <span className={styles.currencyPrefix}>₪</span>
                        <input
                          type="number"
                          min="0"
                          step="1"
                          className={styles.priceInput}
                          value={priceDraft}
                          onChange={(e) => setPriceDraft(e.target.value)}
                          onKeyDown={(e) => handlePriceKeyDown(e, product._id)}
                          autoFocus
                          disabled={actionId === product._id}
                          aria-label="מחיר מוצר"
                        />
                        <button
                          type="button"
                          className={styles.priceSaveBtn}
                          onClick={(e) => savePrice(e, product._id)}
                          disabled={actionId === product._id}
                          title="שמור מחיר"
                        >
                          <Check size={14} />
                        </button>
                        <button
                          type="button"
                          className={styles.priceCancelBtn}
                          onClick={cancelPriceEdit}
                          disabled={actionId === product._id}
                          title="ביטול"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        className={styles.priceDisplayBtn}
                        onClick={(e) => startPriceEdit(e, product)}
                        title="לחצי לעריכת מחיר מהירה"
                      >
                        <Banknote size={13} />
                        <strong>₪{product.price}</strong>
                        <span className={styles.priceEditHint}>עריכה</span>
                      </button>
                    )}
                  </div>
                  <span className={styles.metaItem}>
                    <Calendar size={13} />
                    <span>{formatDate(product.createdAt)}</span>
                  </span>
                  <span className={styles.metaItem}>
                    <TrendingUp size={13} />
                    <span>{product.views ?? 0} צפיות</span>
                  </span>
                </div>
              </div>
              <div className={styles.rowActions} onClick={(e) => e.stopPropagation()}>
                {product.isActive ? (
                  <button
                    type="button"
                    className={styles.actionDraft}
                    disabled={actionId === product._id}
                    onClick={(e) => updateActive(e, product._id, false)}
                    title="השבת מוצר מהחנות"
                  >
                    <ToggleRight size={16} />
                    <span>השבת</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    className={styles.actionPublish}
                    disabled={actionId === product._id}
                    onClick={(e) => updateActive(e, product._id, true)}
                    title="הפעל והצג בחנות"
                  >
                    <ToggleLeft size={16} />
                    <span>הפעל</span>
                  </button>
                )}
                <button
                  type="button"
                  className={styles.actionEdit}
                  onClick={(e) => {
                    e.stopPropagation();
                    router.push(`/admin/products/${product._id}/edit`);
                  }}
                  title="ערוך מוצר"
                >
                  <Edit3 size={14} />
                  <span>עריכה</span>
                </button>
                <button
                  type="button"
                  className={styles.actionDelete}
                  disabled={actionId === product._id}
                  onClick={(e) => deactivateProduct(e, product._id)}
                  title="הסר מוצר מהחנות"
                >
                  <Trash2 size={14} />
                  <span>הסר</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      </div>
    </div>
  );
}
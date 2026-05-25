"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import axios from "axios";
import styles from "./style.module.scss";

export default function AdminProductsListPage() {
  const router = useRouter();
  const [products, setProducts] = useState([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [actionId, setActionId] = useState(null);

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

  const formatDate = (date) => {
    if (!date) return "";
    return new Date(date).toLocaleDateString("he-IL");
  };

  return (
    <div className={styles.listSection}>
      <div className={styles.pageHeader}>
        <h1>כל המוצרים</h1>
        <Link href="/admin/products/new" className={styles.newButton}>
          + מוצר חדש
        </Link>
      </div>

      {isLoading && <p className={styles.loading}>טוען מוצרים...</p>}
      {error && <p className={styles.error}>{error}</p>}

      {!isLoading && !error && products.length === 0 && (
        <p className={styles.empty}>אין מוצרים עדיין.</p>
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
                <div className={styles.thumbPlaceholder} />
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
                  <span>{product.category}</span>
                  <span>₪{product.price}</span>
                  <span>{formatDate(product.createdAt)}</span>
                  <span>{product.views ?? 0} צפיות</span>
                </div>
              </div>
              <div className={styles.rowActions} onClick={(e) => e.stopPropagation()}>
                {!product.isActive ? (
                  <button
                    type="button"
                    className={styles.actionPublish}
                    disabled={actionId === product._id}
                    onClick={(e) => updateActive(e, product._id, true)}
                  >
                    הפעל
                  </button>
                ) : (
                  <button
                    type="button"
                    className={styles.actionDraft}
                    disabled={actionId === product._id}
                    onClick={(e) => updateActive(e, product._id, false)}
                  >
                    השבת
                  </button>
                )}
                <button
                  type="button"
                  className={styles.actionEdit}
                  onClick={(e) => {
                    e.stopPropagation();
                    router.push(`/admin/products/${product._id}/edit`);
                  }}
                >
                  עריכה
                </button>
                <button
                  type="button"
                  className={styles.actionDelete}
                  disabled={actionId === product._id}
                  onClick={(e) => deactivateProduct(e, product._id)}
                >
                  הסר
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

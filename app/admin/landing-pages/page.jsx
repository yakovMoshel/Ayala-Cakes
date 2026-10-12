"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import layout from "../layoutShared.module.scss";
import styles from "./style.module.scss";
import Button from "@/Components/Button";
import AdminRowMenu from "@/Components/AdminRowMenu";
import {
  AlertCircle,
  Archive,
  CheckCircle,
  Edit3,
  LayoutTemplate,
  Plus,
  Trash2,
} from "lucide-react";

const statusLabel = {
  published: "מפורסם",
  draft: "טיוטה",
};

export default function LandingPagesAdminPage() {
  const router = useRouter();
  const [pages, setPages] = useState([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [actionId, setActionId] = useState(null);
  const [pendingDelete, setPendingDelete] = useState(null);

  const loadPages = useCallback(() => {
    setIsLoading(true);
    setError("");
    return fetch("/api/landing-page", { credentials: "include" })
      .then((res) => res.json())
      .then((json) => {
        if (!json.success) throw new Error(json.error || "Failed to load landing pages");
        setPages(json.data || []);
      })
      .catch((loadError) => setError(loadError.message))
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    loadPages();
  }, [loadPages]);

  useEffect(() => {
    if (!pendingDelete) return undefined;
    const handleKeyDown = (event) => {
      if (event.key === "Escape" && actionId !== pendingDelete._id) {
        setPendingDelete(null);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [pendingDelete, actionId]);

  const updateStatus = async (pageId, status) => {
    setActionId(pageId);
    try {
      await axios.put(`/api/landing-page/${pageId}`, { status });
      await loadPages();
    } catch {
      setError("שגיאה בעדכון הסטטוס");
    } finally {
      setActionId(null);
    }
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    setActionId(pendingDelete._id);
    try {
      await axios.delete(`/api/landing-page/${pendingDelete._id}`);
      setPages((prev) => prev.filter((page) => page._id !== pendingDelete._id));
      setPendingDelete(null);
    } catch {
      setError("שגיאה במחיקת הדף");
    } finally {
      setActionId(null);
    }
  };

  return (
    <div className={`${styles.page} ${layout.listPage}`}>
      <div className={layout.stickyChrome}>
        <div className={layout.listToolbar}>
          <div className={layout.headerTitle}>
            <h1 className={layout.pageTitle}>דפי נחיתה</h1>
            <p className={layout.pageSubtitle}>צרי, ערכי ופרסמי דפי נחיתה. פרסום לא מוסיף את הדף לתפריט.</p>
          </div>
          <Button href="/admin/landing-pages/new" tone="admin">
            <Plus size={18} />
            <span>דף חדש</span>
          </Button>
        </div>
      </div>

      <div className={layout.listScroller}>
        {error ? (
          <div className={layout.errorMessage}>
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        ) : null}

        {isLoading ? (
          <div className={layout.skeletonList}>
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className={layout.skeletonRow}>
                <div className={layout.skeletonThumb} />
                <div className={layout.skeletonContent}>
                  <div className={layout.skeletonTitle} />
                  <div className={layout.skeletonMeta} />
                </div>
              </div>
            ))}
          </div>
        ) : null}

        {!isLoading && !error && pages.length === 0 ? (
          <div className={layout.emptyState}>
            <LayoutTemplate size={48} className={layout.emptyIcon} />
            <h3>אין דפי נחיתה עדיין</h3>
            <p>צרי דף נחיתה חדש. הוא יישמר כטיוטה עד שתפרסמי אותו.</p>
            <Button href="/admin/landing-pages/new" tone="admin">
              <Plus size={18} />
              <span>דף חדש</span>
            </Button>
          </div>
        ) : null}

        {!isLoading && !error && pages.length > 0 ? (
          <div className={styles.list}>
            {pages.map((page) => (
              <article key={page._id} className={styles.row}>
                {page.content?.hero?.image ? (
                  <img src={page.content.hero.image} alt="" className={styles.thumb} />
                ) : (
                  <div className={styles.thumbPlaceholder}>
                    <LayoutTemplate size={24} />
                  </div>
                )}
                <div className={styles.info}>
                  <a className={styles.title} href={`/admin/landing-pages/${page._id}/edit`}>
                    {page.title}
                  </a>
                  <div className={styles.meta}>
                    <span
                      className={`${layout.badge} ${
                        page.status === "published" ? layout.badgeSuccess : layout.badgeWarning
                      }`}
                    >
                      {statusLabel[page.status] || page.status}
                    </span>
                    <span dir="ltr">/{page.slug}</span>
                  </div>
                </div>
                <div className={layout.rowActions}>
                  <AdminRowMenu
                    label={`פעולות עבור ${page.title}`}
                    disabled={actionId === page._id}
                    items={[
                      {
                        id: "edit",
                        label: "עריכה",
                        icon: <Edit3 size={14} />,
                        onClick: () => router.push(`/admin/landing-pages/${page._id}/edit`),
                      },
                      page.status === "draft"
                        ? {
                            id: "publish",
                            label: "פרסם",
                            icon: <CheckCircle size={14} />,
                            onClick: () => updateStatus(page._id, "published"),
                          }
                        : {
                            id: "draft",
                            label: "בטל פרסום",
                            icon: <Archive size={14} />,
                            onClick: () => updateStatus(page._id, "draft"),
                          },
                      {
                        id: "delete",
                        label: "מחק",
                        icon: <Trash2 size={14} />,
                        tone: "danger",
                        onClick: () => setPendingDelete(page),
                      },
                    ]}
                  />
                </div>
              </article>
            ))}
          </div>
        ) : null}
      </div>

      {pendingDelete ? (
        <div
          className={styles.dialogBackdrop}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && actionId !== pendingDelete._id) {
              setPendingDelete(null);
            }
          }}
        >
          <div
            className={styles.confirmDialog}
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="landing-delete-title"
            aria-describedby="landing-delete-description"
          >
            <h3 id="landing-delete-title">מחיקת דף נחיתה</h3>
            <p id="landing-delete-description">
              למחוק את &quot;{pendingDelete.title}&quot;? הדף והכתובות הקודמות שלו יוסרו מהאתר.
            </p>
            <div className={styles.dialogActions}>
              <button type="button" onClick={() => setPendingDelete(null)} disabled={actionId === pendingDelete._id}>
                ביטול
              </button>
              <button type="button" className={styles.dangerButton} onClick={confirmDelete} disabled={actionId === pendingDelete._id}>
                מחיקה
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

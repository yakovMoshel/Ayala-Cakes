"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import styles from "./style.module.scss";
import layout from "../layoutShared.module.scss";
import { 
  FileText, 
  ShoppingBag, 
  Eye, 
  Users, 
  CheckCircle2, 
  Layers, 
  ExternalLink, 
  Edit3, 
  AlertCircle 
} from "lucide-react";

const TABS = [
  { id: "posts", label: "פוסטים", icon: FileText },
  { id: "products", label: "מוצרים", icon: ShoppingBag },
];

const postStatusLabel = {
  published: "מפורסם",
  draft: "טיוטה",
};

export default function MetricsPage() {
  const [activeTab, setActiveTab] = useState("posts");
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch("/api/analytics/metrics", { method: "GET", credentials: "include" })
      .then((res) => res.json())
      .then((json) => {
        if (!json.success) throw new Error(json.error || "Failed to load metrics");
        setData(json.data);
      })
      .catch((e) => setError(e.message))
      .finally(() => setIsLoading(false));
  }, []);

  const section = activeTab === "posts" ? data?.posts : data?.products;

  return (
    <div className={`${styles.metricsPage} ${layout.listPage}`}>
      <div className={layout.stickyChrome}>
        <div className={styles.pageHeader}>
          <h1>מדדים ואנליטיקה</h1>
          <p className={styles.subtitle}>צפיות ומבקרים ייחודיים לפי סוג תוכן</p>
        </div>

        <div className={styles.tabBar}>
          {TABS.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                type="button"
                className={`${styles.tab} ${activeTab === tab.id ? styles.tabActive : ""}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <Icon size={16} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className={layout.listScroller}>
      {error && (
        <div className={styles.errorContainer}>
          <AlertCircle size={20} />
          <span>שגיאה בטעינת הנתונים: {error}</span>
        </div>
      )}

      {isLoading && (
        <div className={styles.skeletonContainer}>
          <div className={styles.skeletonGrid}>
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className={styles.skeletonCard} />
            ))}
          </div>
          <div className={styles.skeletonTable} />
        </div>
      )}

      {!isLoading && !error && section && (
        <>
          <div className={styles.summaryGrid}>
            <div className={styles.summaryCard}>
              <div className={`${styles.cardIcon} ${styles.blue}`}>
                <Eye size={20} />
              </div>
              <div className={styles.cardInfo}>
                <span className={styles.summaryValue}>{section.summary.totalViews}</span>
                <span className={styles.summaryLabel}>סה״כ צפיות</span>
              </div>
            </div>

            <div className={styles.summaryCard}>
              <div className={`${styles.cardIcon} ${styles.purple}`}>
                <Users size={20} />
              </div>
              <div className={styles.cardInfo}>
                <span className={styles.summaryValue}>
                  {section.summary.totalUniqueVisitors}
                </span>
                <span className={styles.summaryLabel}>מבקרים ייחודיים</span>
              </div>
            </div>

            <div className={styles.summaryCard}>
              <div className={`${styles.cardIcon} ${styles.green}`}>
                <CheckCircle2 size={20} />
              </div>
              <div className={styles.cardInfo}>
                <span className={styles.summaryValue}>
                  {activeTab === "posts"
                    ? section.summary.publishedCount
                    : section.summary.activeCount}
                </span>
                <span className={styles.summaryLabel}>
                  {activeTab === "posts" ? "מפורסמים" : "פעילים"}
                </span>
              </div>
            </div>

            <div className={styles.summaryCard}>
              <div className={`${styles.cardIcon} ${styles.pink}`}>
                <Layers size={20} />
              </div>
              <div className={styles.cardInfo}>
                <span className={styles.summaryValue}>{section.summary.itemCount}</span>
                <span className={styles.summaryLabel}>סה״כ פריטים</span>
              </div>
            </div>
          </div>

          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>שם הפריט</th>
                  <th>סטטוס</th>
                  <th>צפיות</th>
                  <th>מבקרים ייחודיים</th>
                  <th className={styles.actionsHeader}>פעולות</th>
                </tr>
              </thead>
              <tbody>
                {section.items.map((item) => (
                  <tr key={item._id}>
                    <td className={styles.titleCell}>
                      <strong>{item.title}</strong>
                    </td>
                    <td>
                      <span
                        className={`${styles.badge} ${
                          activeTab === "posts"
                            ? styles[item.status] || ""
                            : item.status === "active"
                              ? styles.published
                              : styles.draft
                        }`}
                      >
                        {activeTab === "posts"
                          ? postStatusLabel[item.status] || item.status
                          : item.status === "active"
                            ? "פעיל"
                            : "לא פעיל"}
                      </span>
                    </td>
                    <td className={styles.viewCell}>
                      <Eye size={13} className={styles.inlineIcon} />
                      <span>{item.views}</span>
                    </td>
                    <td className={styles.uniqueCell}>
                      <Users size={13} className={styles.inlineIcon} />
                      <span>{item.uniqueVisitors}</span>
                    </td>
                    <td className={styles.actionCell}>
                      <div className={styles.actionsWrapper}>
                        {activeTab === "posts" ? (
                          item.status === "published" && item.slug ? (
                            <Link
                              href={`/blog/${item.slug}`}
                              className={`${styles.btnAction} ${styles.btnView}`}
                              target="_blank"
                            >
                              <ExternalLink size={13} />
                              <span>צפה באתר</span>
                            </Link>
                          ) : (
                            <Link
                              href={`/admin/posts/${item._id}/edit`}
                              className={`${styles.btnAction} ${styles.btnEdit}`}
                            >
                              <Edit3 size={13} />
                              <span>ערוך פוסט</span>
                            </Link>
                          )
                        ) : item.status === "active" && item.slug ? (
                          <Link
                            href={`/shop/products/${item.slug}`}
                            className={`${styles.btnAction} ${styles.btnView}`}
                            target="_blank"
                          >
                            <ExternalLink size={13} />
                            <span>צפה באתר</span>
                          </Link>
                        ) : (
                          <Link
                            href={`/admin/products/${item._id}/edit`}
                            className={`${styles.btnAction} ${styles.btnEdit}`}
                          >
                            <Edit3 size={13} />
                            <span>ערוך מוצר</span>
                          </Link>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
      </div>
    </div>
  );
}
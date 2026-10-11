"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import styles from "./style.module.scss";
import layout from "../layoutShared.module.scss";
import { 
  FileText, 
  ShoppingBag, 
  Globe,
  Eye, 
  Users, 
  CheckCircle2, 
  Layers, 
  ExternalLink, 
  Edit3, 
  AlertCircle 
} from "lucide-react";
import { METRIC_RANGES } from "@/utils/metricsRange";

const TABS = [
  { id: "posts", label: "פוסטים", icon: FileText },
  { id: "products", label: "מוצרים", icon: ShoppingBag },
  { id: "pages", label: "עמודים", icon: Globe },
];

const postStatusLabel = {
  published: "מפורסם",
  draft: "טיוטה",
};

const dateFmt = new Intl.DateTimeFormat("he-IL", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "Asia/Jerusalem",
});

function formatBounds(range) {
  if (!range?.start) return "";
  const start = dateFmt.format(new Date(range.start));
  if (!range.end) return `${start} – היום`;
  const inclusiveEnd = new Date(new Date(range.end).getTime() - 1);
  return `${start} – ${dateFmt.format(inclusiveEnd)}`;
}

export default function MetricsPage() {
  const [activeTab, setActiveTab] = useState("posts");
  const [range, setRange] = useState("all");
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    setIsLoading(true);
    setError("");

    fetch(`/api/analytics/metrics?range=${encodeURIComponent(range)}`, {
      method: "GET",
      credentials: "include",
      signal: controller.signal,
    })
      .then((res) => res.json())
      .then((json) => {
        if (!json.success) throw new Error(json.error || "טעינת המדדים נכשלה");
        setData(json.data);
      })
      .catch((e) => {
        if (e.name === "AbortError") return;
        setError(e.message);
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false);
      });

    return () => controller.abort();
  }, [range]);

  const boundsLabel = data?.range?.id === range ? formatBounds(data.range) : "";
  const section = activeTab === "posts" ? data?.posts : activeTab === "products" ? data?.products : null;
  const pages = data?.pages;

  return (
    <div className={`${styles.metricsPage} ${layout.listPage}`}>
      <div className={layout.stickyChrome}>
        <div className={styles.pageHeader}>
          <h1 className={layout.pageTitle}>מדדים ואנליטיקה</h1>
          <p className={layout.pageSubtitle}>צפיות ומבקרים ייחודיים לפי סוג תוכן וטווח זמן</p>
        </div>

        <div className={styles.rangeBar} role="group" aria-label="טווח זמן" aria-busy={isLoading}>
          {METRIC_RANGES.map((option) => (
            <button
              key={option.id}
              type="button"
              className={`${styles.rangeBtn} ${range === option.id ? styles.rangeBtnActive : ""}`}
              aria-pressed={range === option.id}
              onClick={() => setRange(option.id)}
            >
              {option.label}
            </button>
          ))}
        </div>
        {range !== "all" && boundsLabel && (
          <p className={styles.rangeHint}>{boundsLabel}</p>
        )}

        <div className={styles.tabBar}>
          {TABS.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                type="button"
                className={`${styles.tab} ${activeTab === tab.id ? styles.tabActive : ""}`}
                aria-pressed={activeTab === tab.id}
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
        <div className={layout.errorMessage}>
          <AlertCircle size={20} />
          <span>שגיאה בטעינת הנתונים: {error}</span>
        </div>
      )}

      {isLoading && (
        <div className={styles.skeletonContainer}>
          <div className={styles.skeletonGrid}>
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className={styles.skeletonCard} />
            ))}
          </div>
          <div className={styles.skeletonTable} />
        </div>
      )}

      {!isLoading && !error && data?.site && (
        <section className={styles.siteStrip} aria-label="סיכום">
          <h2 className={styles.siteHeading}>האתר בטווח שנבחר</h2>
          <p className={styles.rangeHint}>
            צפיות בעמודים נספרות מעתה. מבקרים באתר כוללים גם מי שצפה בפוסט או במוצר בטווח הזה.
          </p>
          <div className={styles.summaryGrid}>
            <div className={styles.summaryCard}>
              <div className={`${styles.cardIcon} ${styles.warning}`}>
                <Users size={18} />
              </div>
              <div className={styles.cardInfo}>
                <span className={styles.summaryValue}>{data.site.visitors}</span>
                <span className={styles.summaryLabel}>מבקרים באתר</span>
              </div>
            </div>
            <div className={styles.summaryCard}>
              <div className={`${styles.cardIcon} ${styles.info}`}>
                <Eye size={18} />
              </div>
              <div className={styles.cardInfo}>
                <span className={styles.summaryValue}>{data.site.pageViews}</span>
                <span className={styles.summaryLabel}>צפיות בעמודים</span>
              </div>
            </div>
            {section && (
              <>
                <div className={styles.summaryCard}>
                  <div className={`${styles.cardIcon} ${styles.info}`}>
                    <Eye size={18} />
                  </div>
                  <div className={styles.cardInfo}>
                    <span className={styles.summaryValue}>{section.summary.totalViews}</span>
                    <span className={styles.summaryLabel}>סה״כ צפיות</span>
                  </div>
                </div>
                <div className={styles.summaryCard}>
                  <div className={`${styles.cardIcon} ${styles.warning}`}>
                    <Users size={18} />
                  </div>
                  <div className={styles.cardInfo}>
                    <span className={styles.summaryValue}>
                      {section.summary.totalUniqueVisitors}
                    </span>
                    <span className={styles.summaryLabel}>מבקרים ייחודיים</span>
                  </div>
                </div>
                <div className={styles.summaryCard}>
                  <div className={`${styles.cardIcon} ${styles.success}`}>
                    <CheckCircle2 size={18} />
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
                  <div className={`${styles.cardIcon} ${styles.error}`}>
                    <Layers size={18} />
                  </div>
                  <div className={styles.cardInfo}>
                    <span className={styles.summaryValue}>{section.summary.itemCount}</span>
                    <span className={styles.summaryLabel}>סה״כ פריטים</span>
                  </div>
                </div>
              </>
            )}
          </div>
        </section>
      )}

      {!isLoading && !error && activeTab === "pages" && pages && (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>עמוד</th>
                <th>נתיב</th>
                <th>צפיות</th>
                <th>מבקרים ייחודיים</th>
                <th className={styles.actionsHeader}>פעולות</th>
              </tr>
            </thead>
            <tbody>
              {pages.items.map((item) => (
                <tr key={item.path}>
                  <td className={styles.titleCell}>
                    <strong>{item.title}</strong>
                  </td>
                  <td className={styles.pathCell}>{item.path}</td>
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
                      <Link
                        href={item.path}
                        className={`${styles.btnAction} ${styles.btnView}`}
                        target="_blank"
                      >
                        <ExternalLink size={13} />
                        <span>צפה באתר</span>
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!isLoading && !error && section && (
        <>
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
                        className={`${layout.badge} ${
                          activeTab === "posts"
                            ? item.status === "published"
                              ? layout.badgeSuccess
                              : item.status === "draft"
                                ? layout.badgeWarning
                                : ""
                            : item.status === "active"
                              ? layout.badgeSuccess
                              : layout.badgeWarning
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
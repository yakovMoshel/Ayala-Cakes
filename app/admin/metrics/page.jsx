"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import styles from "./style.module.scss";

const TABS = [
  { id: "posts", label: "פוסטים" },
  { id: "products", label: "מוצרים" },
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
    <div className={styles.metricsPage}>
      <h1>מדדים ואנליטיקה</h1>
      <p className={styles.subtitle}>צפיות ומבקרים ייחודיים לפי סוג תוכן</p>

      <div className={styles.tabBar}>
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={`${styles.tab} ${activeTab === tab.id ? styles.tabActive : ""}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {isLoading && <p className={styles.loading}>טוען נתונים...</p>}
      {error && <p className={styles.error}>{error}</p>}

      {!isLoading && !error && section && (
        <>
          <div className={styles.summaryGrid}>
            <div className={styles.summaryCard}>
              <span className={styles.summaryValue}>{section.summary.totalViews}</span>
              <span className={styles.summaryLabel}>סה״כ צפיות</span>
            </div>
            <div className={styles.summaryCard}>
              <span className={styles.summaryValue}>
                {section.summary.totalUniqueVisitors}
              </span>
              <span className={styles.summaryLabel}>מבקרים ייחודיים</span>
            </div>
            <div className={styles.summaryCard}>
              <span className={styles.summaryValue}>
                {activeTab === "posts"
                  ? section.summary.publishedCount
                  : section.summary.activeCount}
              </span>
              <span className={styles.summaryLabel}>
                {activeTab === "posts" ? "מפורסמים" : "פעילים"}
              </span>
            </div>
            <div className={styles.summaryCard}>
              <span className={styles.summaryValue}>{section.summary.itemCount}</span>
              <span className={styles.summaryLabel}>סה״כ פריטים</span>
            </div>
          </div>

          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>שם</th>
                  <th>סטטוס</th>
                  <th>צפיות</th>
                  <th>מבקרים ייחודיים</th>
                  <th>פעולות</th>
                </tr>
              </thead>
              <tbody>
                {section.items.map((item) => (
                  <tr key={item._id}>
                    <td className={styles.titleCell}>{item.title}</td>
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
                    <td>{item.views}</td>
                    <td>{item.uniqueVisitors}</td>
                    <td>
                      {activeTab === "posts" ? (
                        item.status === "published" && item.slug ? (
                          <Link
                            href={`/blog/${item.slug}`}
                            className={styles.link}
                            target="_blank"
                          >
                            צפה
                          </Link>
                        ) : (
                          <Link
                            href={`/admin/posts/${item._id}/edit`}
                            className={styles.link}
                          >
                            ערוך
                          </Link>
                        )
                      ) : item.status === "active" && item.slug ? (
                        <Link
                          href={`/shop/products/${item.slug}`}
                          className={styles.link}
                          target="_blank"
                        >
                          צפה
                        </Link>
                      ) : (
                        <Link
                          href={`/admin/products/${item._id}/edit`}
                          className={styles.link}
                        >
                          ערוך
                        </Link>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

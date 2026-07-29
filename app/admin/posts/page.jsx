"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import styles from "./style.module.scss";
import layout from "../layoutShared.module.scss";
import Button from "@/Components/Button";
import { 
  FileText, 
  Plus, 
  Edit3, 
  Trash2, 
  CheckCircle, 
  Archive, 
  Eye, 
  Calendar, 
  TrendingUp, 
  AlertCircle 
} from "lucide-react";

const statusLabel = {
  published: "מפורסם",
  draft: "טיוטה",
};

export default function AdminPostsListPage() {
  const router = useRouter();
  const [posts, setPosts] = useState([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [actionId, setActionId] = useState(null);

  const loadPosts = useCallback(() => {
    setIsLoading(true);
    setError("");
    return fetch("/api/post/admin", { credentials: "include" })
      .then((res) => res.json())
      .then((json) => {
        if (!json.success) throw new Error(json.error || "Failed to load posts");
        setPosts(json.data);
      })
      .catch((e) => setError(e.message))
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  const updateStatus = async (e, postId, status) => {
    e.stopPropagation();
    setActionId(postId);
    try {
      await axios.put(`/api/post/${postId}`, { status });
      await loadPosts();
    } catch {
      setError("שגיאה בעדכון סטטוס הפוסט");
    } finally {
      setActionId(null);
    }
  };

  const deletePost = async (e, postId) => {
    e.stopPropagation();
    if (!window.confirm("האם למחוק את הפוסט? הוא יועבר לפח האשפה ויוסר מהאתר.")) return;
    setActionId(postId);
    try {
      await axios.put(`/api/post/${postId}`, { status: "deleted" });
      setPosts((prev) => prev.filter((p) => p._id !== postId));
    } catch {
      setError("שגיאה במחיקת הפוסט");
    } finally {
      setActionId(null);
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
    <div className={`${styles.postsSection} ${layout.listPage}`}>
      <div className={layout.stickyChrome}>
        <div className={layout.listToolbar}>
          <div className={layout.headerTitle}>
            <h1 className={layout.pageTitle}>ניהול פוסטים בבלוג</h1>
            <p className={layout.pageSubtitle}>כתבי, ערכי ונצלי פוסטים ומתכונים חדשים</p>
          </div>
          <Button href="/admin/posts/new" tone="admin">
            <Plus size={18} />
            <span>פוסט חדש</span>
          </Button>
        </div>
      </div>

      <div className={layout.listScroller}>
      {error && (
        <div className={layout.errorMessage}>
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {isLoading && (
        <div className={layout.skeletonList}>
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className={layout.skeletonRow}>
              <div className={layout.skeletonThumb} />
              <div className={layout.skeletonContent}>
                <div className={layout.skeletonTitle} />
                <div className={layout.skeletonMeta} />
              </div>
              <div className={layout.skeletonActions} />
            </div>
          ))}
        </div>
      )}

      {!isLoading && !error && posts.length === 0 && (
        <div className={layout.emptyState}>
          <FileText size={48} className={layout.emptyIcon} />
          <h3>אין פוסטים עדיין</h3>
          <p>כתבי את הפוסט הראשון שלך בבלוג כדי להציגו לקוראים באתר!</p>
          <Button href="/admin/posts/new" tone="admin">
            <Plus size={18} />
            <span>צרי פוסט חדש</span>
          </Button>
        </div>
      )}

      {!isLoading && !error && posts.length > 0 && (
        <div className={styles.postList}>
          {posts.map((post) => (
            <div
              key={post._id}
              className={styles.postRow}
              role="button"
              tabIndex={0}
              onClick={() => router.push(`/admin/posts/${post._id}/edit`)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  router.push(`/admin/posts/${post._id}/edit`);
                }
              }}
            >
              {post.image ? (
                <img src={post.image} alt="" className={styles.thumb} />
              ) : (
                <div className={styles.thumbPlaceholder}>
                  <FileText size={24} />
                </div>
              )}
              <div className={styles.postInfo}>
                <div className={styles.postTitle}>{post.title}</div>
                {post.summary && (
                  <div className={styles.postSummary}>{post.summary}</div>
                )}
                <div className={styles.postMeta}>
                  <span
                    className={`${layout.badge} ${
                      post.status === "published"
                        ? layout.badgeSuccess
                        : post.status === "draft"
                          ? layout.badgeWarning
                          : ""
                    }`}
                  >
                    {statusLabel[post.status] || post.status}
                  </span>
                  <span className={styles.metaItem}>
                    <Calendar size={13} />
                    <span>{formatDate(post.createdAt)}</span>
                  </span>
                  <span className={styles.metaItem}>
                    <TrendingUp size={13} />
                    <span>{post.views ?? 0} צפיות</span>
                  </span>
                </div>
              </div>
              <div
                className={layout.rowActions}
                onClick={(e) => e.stopPropagation()}
              >
                {post.status === "draft" ? (
                  <button
                    type="button"
                    className={layout.actionPublish}
                    disabled={actionId === post._id}
                    onClick={(e) => updateStatus(e, post._id, "published")}
                    title="פרסם פוסט באתר"
                  >
                    <CheckCircle size={14} />
                    <span>פרסם</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    className={layout.actionDraft}
                    disabled={actionId === post._id}
                    onClick={(e) => updateStatus(e, post._id, "draft")}
                    title="העבר לטיוטה"
                  >
                    <Archive size={14} />
                    <span>לטיוטה</span>
                  </button>
                )}
                <button
                  type="button"
                  className={layout.actionEdit}
                  onClick={(e) => {
                    e.stopPropagation();
                    router.push(`/admin/posts/${post._id}/edit`);
                  }}
                  title="ערוך פוסט"
                >
                  <Edit3 size={14} />
                  <span>עריכה</span>
                </button>
                <button
                  type="button"
                  className={layout.actionDelete}
                  disabled={actionId === post._id}
                  onClick={(e) => deletePost(e, post._id)}
                  title="מחק פוסט"
                >
                  <Trash2 size={14} />
                  <span>מחק</span>
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
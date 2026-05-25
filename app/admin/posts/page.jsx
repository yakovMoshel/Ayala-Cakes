"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import axios from "axios";
import styles from "./style.module.scss";

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
      setError("שגיאה בעדכון סטטוס");
    } finally {
      setActionId(null);
    }
  };

  const deletePost = async (e, postId) => {
    e.stopPropagation();
    if (!window.confirm("האם למחוק את הפוסט? הוא יוסר מהאתר.")) return;
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
    return new Date(date).toLocaleDateString("he-IL");
  };

  return (
    <div className={styles.postsSection}>
      <div className={styles.pageHeader}>
        <h1>כל הפוסטים</h1>
        <Link href="/admin/posts/new" className={styles.newPostButton}>
          + פוסט חדש
        </Link>
      </div>

      {isLoading && <p className={styles.loading}>טוען פוסטים...</p>}
      {error && <p className={styles.error}>{error}</p>}

      {!isLoading && !error && posts.length === 0 && (
        <p className={styles.empty}>אין פוסטים עדיין. צרי פוסט חדש כדי להתחיל.</p>
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
                <div className={styles.thumbPlaceholder} />
              )}
              <div className={styles.postInfo}>
                <div className={styles.postTitle}>{post.title}</div>
                {post.summary && (
                  <div className={styles.postSummary}>{post.summary}</div>
                )}
                <div className={styles.postMeta}>
                  <span className={`${styles.badge} ${styles[post.status] || ""}`}>
                    {statusLabel[post.status] || post.status}
                  </span>
                  <span>{formatDate(post.createdAt)}</span>
                  <span>{post.views ?? 0} צפיות</span>
                </div>
              </div>
              <div
                className={styles.rowActions}
                onClick={(e) => e.stopPropagation()}
              >
                {post.status === "draft" ? (
                  <button
                    type="button"
                    className={styles.actionPublish}
                    disabled={actionId === post._id}
                    onClick={(e) => updateStatus(e, post._id, "published")}
                  >
                    פרסם
                  </button>
                ) : (
                  <button
                    type="button"
                    className={styles.actionDraft}
                    disabled={actionId === post._id}
                    onClick={(e) => updateStatus(e, post._id, "draft")}
                  >
                    לטיוטה
                  </button>
                )}
                <button
                  type="button"
                  className={styles.actionEdit}
                  onClick={(e) => {
                    e.stopPropagation();
                    router.push(`/admin/posts/${post._id}/edit`);
                  }}
                >
                  עריכה
                </button>
                <button
                  type="button"
                  className={styles.actionDelete}
                  disabled={actionId === post._id}
                  onClick={(e) => deletePost(e, post._id)}
                >
                  מחק
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

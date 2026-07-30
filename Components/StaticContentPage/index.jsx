import styles from './style.module.scss';

/**
 * Shared layout for static public content pages (about, privacy, terms).
 * Server Component — no client JS. One h1; body uses @mixin rich-text.
 * Site shell already provides <main>; this renders <article>.
 * JSON-LD is a sibling of <article> (not nested) to avoid React
 * hydration removeChild errors with <script> tags.
 */
export default function StaticContentPage({
  title,
  updated,
  updatedDateTime,
  children,
  jsonLd,
}) {
  return (
    <>
      {jsonLd ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c'),
          }}
        />
      ) : null}
      <article className={styles.page}>
        <div className={styles.panel}>
          <h1 className={styles.title}>{title}</h1>
          <div className={styles.text}>
            {updated && (
              <p className={styles.updated}>
                {updatedDateTime ? (
                  <time dateTime={updatedDateTime}>{updated}</time>
                ) : (
                  updated
                )}
              </p>
            )}
            {children}
          </div>
        </div>
      </article>
    </>
  );
}

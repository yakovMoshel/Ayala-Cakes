import Button from '@/Components/Button';
import ProductItem from '@/Components/ProductItem';
import { isCtaEnabled, normalizePostCta } from '@/utils/postCta';
import { sanitizeEmbedHtml } from '@/utils/sanitizeHtml';
import styles from './style.module.scss';

export default function PostCtaBlock({
  cta,
  products = [],
  preview = false,
  hideAdminActions = true,
}) {
  if (!isCtaEnabled(cta)) {
    return null;
  }

  const data = normalizePostCta(cta);
  const safeEmbed = data.embedHtml ? sanitizeEmbedHtml(data.embedHtml) : '';

  return (
    <section
      className={styles.block}
      aria-label="קריאה לפעולה"
      data-cta-block={preview ? 'preview' : 'live'}
    >
      {preview && <span className={styles.previewLabel}>תצוגה מקדימה — סוף הפוסט</span>}

      {data.image && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={data.image} alt={data.title || ''} className={styles.image} />
      )}

      {data.title && <h2 className={styles.title}>{data.title}</h2>}

      {data.description && <p className={styles.description}>{data.description}</p>}

      {data.buttons.length > 0 && (
        <div className={styles.actions}>
          {data.buttons.map((btn, index) => (
            <Button
              key={`${btn.url}-${index}`}
              href={btn.url}
              external={btn.openInNewTab || btn.linkType === 'external'}
              variant={index === 0 ? 'primary' : 'secondary'}
            >
              {btn.label}
            </Button>
          ))}
        </div>
      )}

      {products.length > 0 && (
        <div className={styles.productRow} role="list" aria-label="מוצרים מומלצים">
          {products.map((product) => (
            <div key={product._id} role="listitem">
              <ProductItem product={product} hideAdminActions={hideAdminActions} />
            </div>
          ))}
        </div>
      )}

      {safeEmbed && (
        <div
          className={styles.embed}
          dangerouslySetInnerHTML={{ __html: safeEmbed }}
        />
      )}
    </section>
  );
}

"use client"
import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import styles from './style.module.scss';
import dynamic from 'next/dynamic';
import { FieldError, FieldLabel, FieldWarning, SlugChangeDialog } from '@/Components/FieldHelp';
import {
  ALT_HELP,
  DIMENSION_HELP,
  DIMENSION_REPEAT_NOTE,
  SEO_DESCRIPTION_HELP,
  SLUG_HELP,
  firstFieldKey,
  normalizeTypedSlug,
  parseDimensionField,
  seoDescriptionWarnings,
  validateImageAltsForPublish,
  validateSlug,
} from '@/utils/adminContentRules';
const MediaPickerModal = dynamic(() => import('@/Components/MediaPickerModal'), { ssr: false });

const imageItemFromStored = (url, meta, productName, legacyAlt, index) => {
  const stored = String(meta?.alt || (index === 0 ? legacyAlt : '') || '').trim();
  const decorative = Boolean(meta?.decorative);
  return {
    url,
    alt: stored || productName || '',
    decorative,
    altEdited: Boolean(stored),
    missingStored: !stored && !decorative,
  };
};

const PRODUCT_FIELD_ORDER = ['slug', 'diameter', 'height'];

const mapProductToForm = (product) => ({
  name: product.name || '',
  subtitle: product.subtitle || '',
  description: product.description || '',
  price: product.price?.toString() || '',
  categoryId:
    product.categoryId != null && product.categoryId !== ''
      ? String(
          typeof product.categoryId === 'object'
            ? product.categoryId._id || ''
            : product.categoryId
        )
      : '',
  colors: Array.isArray(product.colors) ? product.colors.join(', ') : '',
  flavors: Array.isArray(product.flavors) ? product.flavors.join(', ') : '',
  isActive: product.isActive ? 'true' : 'false',
  glutenContent: product.glutenFreeOption ? 'ללא גלוטן' : 'מכיל גלוטן',
  dairyContent: product.notDairyOption ? 'כן' : 'לא',
  height: product.height?.toString() || '',
  diameter: product.diameter?.toString() || '',
  slug: product.slug || '',
  seoTitle: product.seoTitle || '',
  metaDescription: product.metaDescription || '',
  focusKeyword: product.focusKeyword || '',
  secondaryKeywords: Array.isArray(product.secondaryKeywords)
    ? product.secondaryKeywords.join(', ')
    : '',
  altText: product.altText || '',
  imageTitle: product.imageTitle || '',
  tags: Array.isArray(product.tags) ? product.tags.join(', ') : '',
  canonicalUrl: product.canonicalUrl || '',
  ogImage: product.ogImage || '',
  twitterCard: product.twitterCard || 'summary_large_image',
});

export default function AddProductForm({ categories, productId }) {
  const router = useRouter();
  const [editingProductId, setEditingProductId] = useState(productId || null);
  const [isLoadingProduct, setIsLoadingProduct] = useState(!!productId);
  const [formData, setFormData] = useState({
    name: '',
    subtitle: '',
    description: '',
    price: '',
    categoryId: '',
    colors: '',
    flavors: '',
    isActive: 'true',
    glutenContent: '',
    dairyContent: '',
    height: '',
    diameter: '',
    slug: '',
    seoTitle: '',
    metaDescription: '',
    focusKeyword: '',
    secondaryKeywords: '',
    altText: '',
    imageTitle: '',
    tags: '',
    canonicalUrl: '',
    ogImage: '',
    twitterCard: 'summary_large_image'
  });

  const categoryById = useMemo(() => {
    const map = new Map();
    (categories || []).forEach((c) => {
      if (c?._id != null) map.set(String(c._id), c);
    });
    return map;
  }, [categories]);
  
  const [imageItems, setImageItems] = useState([]);
  const [fieldErrors, setFieldErrors] = useState({});
  const [savedSlug, setSavedSlug] = useState('');
  const [savedPublic, setSavedPublic] = useState(false);
  const [slugPrompt, setSlugPrompt] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingSEO, setIsGeneratingSEO] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', message: '' });
  const [showSEOSection, setShowSEOSection] = useState(false);
  const [showMediaPicker, setShowMediaPicker] = useState(false);
  // TODO: ADD FAQ state when needed in the future

  useEffect(() => {
    if (!productId) {
      setEditingProductId(null);
      setIsLoadingProduct(false);
      return;
    }

    setEditingProductId(productId);
    const loadProduct = async () => {
      setIsLoadingProduct(true);
      setFeedback({ type: '', message: '' });
      try {
        const response = await axios.get(`/api/product/${productId}`);
        if (response.data.success) {
          const product = response.data.data;
          setFormData(mapProductToForm(product));
          setImageItems((product.images || []).map((url, index) => imageItemFromStored(
            url,
            product.imageAlts?.[index],
            product.name || '',
            product.altText || '',
            index,
          )));
          setSavedSlug(product.slug || '');
          setSavedPublic(Boolean(product.isActive));
          setFieldErrors({});
        }
      } catch (error) {
        setFeedback({
          type: 'error',
          message: error.response?.data?.error || 'שגיאה בטעינת המוצר',
        });
      } finally {
        setIsLoadingProduct(false);
      }
    };

    loadProduct();
  }, [productId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (name === 'name') {
      setImageItems((items) => items.map((item) => (
        item.altEdited ? item : { ...item, alt: value }
      )));
    }
    setFieldErrors((errors) => {
      if (!errors[name]) return errors;
      const next = { ...errors };
      delete next[name];
      return next;
    });
  };

  const removeImage = (index) => {
    setImageItems((items) => items.filter((_, i) => i !== index));
  };

  const openMediaPicker = () => setShowMediaPicker(true);
  const closeMediaPicker = () => setShowMediaPicker(false);
  const handleMediaConfirm = (selection) => {
    const urls = selection.map(s => s.secure_url);
    setImageItems((items) => [
      ...items,
      ...urls.map((url) => imageItemFromStored(url, null, formData.name, '', 1)),
    ]);
    closeMediaPicker();
  };

  const generateSEO = async () => {
    if (!formData.name || !formData.description) {
      setFeedback({
        type: 'error',
        message: 'אנא מלא לפחות שם מוצר ותיאור לפני ג׳ינרוט SEO'
      });
      return;
    }

    setIsGeneratingSEO(true);
    setFeedback({ type: '', message: '' });

    try {
      const response = await axios.post('/api/generate-seo', {
        type: 'product',
        data: {
          name: formData.name,
          subtitle: formData.subtitle,
          description: formData.description,
          category: categoryById.get(String(formData.categoryId))?.name || '',
          price: formData.price,
          flavors: formData.flavors ? formData.flavors.split(',').map(f => f.trim()) : [],
          colors: formData.colors ? formData.colors.split(',').map(c => c.trim()) : []
        }
      });

      if (response.data.success) {
        const seoData = response.data.data;
        
        setFormData(prev => ({
          ...prev,
          slug: savedPublic && savedSlug ? prev.slug : (seoData.slug || prev.slug || ''),
          seoTitle: seoData.seoTitle || '',
          metaDescription: seoData.metaDescription || '',
          focusKeyword: seoData.focusKeyword || '',
          secondaryKeywords: seoData.secondaryKeywords ? seoData.secondaryKeywords.join(', ') : '',
          altText: seoData.altText || '',
          imageTitle: seoData.imageTitle || '',
          tags: seoData.tags ? seoData.tags.join(', ') : ''
        }));

        if (seoData.faqSection) {
          // TODO: ADD FAQ handling when needed
        }

        setShowSEOSection(true);
        setFeedback({
          type: 'success',
          message: 'תוכן SEO נוצר בהצלחה! אתה יכול לערוך אותו לפני שמירה.'
        });
      }
    } catch (error) {
      setFeedback({
        type: 'error',
        message: error.response?.data?.error || 'שגיאה בג׳ינרוט תוכן SEO'
      });
    } finally {
      setIsGeneratingSEO(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      subtitle: '',
      description: '',
      price: '',
      categoryId: '',
      colors: '',
      flavors: '',
      isActive: 'true',
      glutenContent: '',
      dairyContent: '',
      height: '',
      diameter: '',
      slug: '',
      seoTitle: '',
      metaDescription: '',
      focusKeyword: '',
      secondaryKeywords: '',
      altText: '',
      imageTitle: '',
      tags: '',
      canonicalUrl: '',
      ogImage: '',
      twitterCard: 'summary_large_image'
    });
    setImageItems([]);
    setFieldErrors({});
    setSavedSlug('');
    setSavedPublic(false);
          // TODO: ADD FAQ reset when needed
    setShowSEOSection(false);
  };

  const buildPayload = (isActive) => {
    const { glutenContent, dairyContent, isActive: _ignored, ...rest } = formData;
    return {
      ...rest,
      categoryId: formData.categoryId || null,
      price: parseFloat(formData.price),
      images: imageItems.map((item) => item.url),
      imageAlts: imageItems.map((item) => ({
        alt: item.alt.trim(),
        decorative: item.decorative,
      })),
      colors: formData.colors ? formData.colors.split(',').map((c) => c.trim()) : [],
      flavors: formData.flavors ? formData.flavors.split(',').map((f) => f.trim()) : [],
      isActive,
      height: parseDimensionField(formData.height).value,
      diameter: parseDimensionField(formData.diameter).value,
      slug: normalizeTypedSlug(formData.slug),
      glutenFreeOption: formData.glutenContent === 'ללא גלוטן',
      notDairyOption: formData.dairyContent === 'כן',
      secondaryKeywords: formData.secondaryKeywords
        ? formData.secondaryKeywords.split(',').map((k) => k.trim())
        : [],
      tags: formData.tags ? formData.tags.split(',').map((t) => t.trim()) : [],
    };
  };

  const collectProductErrors = (active) => {
    const errors = {};
    const slug = normalizeTypedSlug(formData.slug);
    if (editingProductId && !slug) {
      errors.slug = 'יש להזין כתובת.';
    } else if (slug && !(savedSlug && slug === savedSlug)) {
      const slugError = validateSlug(slug);
      if (slugError) errors.slug = slugError;
    }
    const diameter = parseDimensionField(formData.diameter);
    const height = parseDimensionField(formData.height);
    if (diameter.error) errors.diameter = diameter.error;
    if (height.error) errors.height = height.error;
    if (active) {
      Object.assign(errors, validateImageAltsForPublish(imageItems));
    }
    return errors;
  };

  const focusProductField = (key) => {
    const id = key.startsWith('imageAlt-')
      ? `product-image-alt-${key.slice('imageAlt-'.length)}`
      : { slug: 'product-slug', diameter: 'product-diameter', height: 'product-height' }[key];
    document.getElementById(id)?.focus();
  };

  const saveProduct = async (active, { slugConfirmed = false } = {}) => {
    const errors = collectProductErrors(active);
    if (Object.keys(errors).length) {
      setFieldErrors(errors);
      const order = [
        ...PRODUCT_FIELD_ORDER,
        ...imageItems.map((_, index) => `imageAlt-${index}`),
      ];
      focusProductField(firstFieldKey(errors, order));
      return;
    }
    setFieldErrors({});

    const nextSlug = normalizeTypedSlug(formData.slug);
    if (!slugConfirmed && savedPublic && savedSlug && nextSlug && nextSlug !== savedSlug) {
      setSlugPrompt(active);
      return;
    }

    setIsLoading(true);
    setFeedback({ type: '', message: '' });

    try {
      const formattedData = buildPayload(active);

      const response = editingProductId
        ? await axios.put(`/api/product/${editingProductId}`, formattedData)
        : await axios.post('/api/product', formattedData);

      if (!editingProductId && response.data?.data?._id) {
        setEditingProductId(response.data.data._id);
        router.replace(`/admin/products/${response.data.data._id}/edit`);
      }

      setFormData((prev) => ({ ...prev, isActive: active ? 'true' : 'false' }));
      setSavedPublic(active);
      if (formattedData.slug) setSavedSlug(formattedData.slug);
      setImageItems((items) => items.map((item) => ({
        ...item,
        missingStored: item.decorative ? false : !item.alt.trim(),
        altEdited: item.altEdited || Boolean(item.alt.trim()),
      })));

      setFeedback({
        type: 'success',
        message: active
          ? editingProductId
            ? 'המוצר עודכן ופעיל בחנות!'
            : 'המוצר נוסף ופעיל בחנות!'
          : editingProductId
            ? 'המוצר נשמר כלא פעיל.'
            : 'המוצר נשמר כלא פעיל.',
      });

      if (!editingProductId && !response.data?.data?._id) {
        resetForm();
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      const fields = error.response?.data?.fields;
      if (fields && typeof fields === 'object') {
        setFieldErrors(fields);
        focusProductField(firstFieldKey(fields, [
          ...PRODUCT_FIELD_ORDER,
          ...imageItems.map((_, index) => `imageAlt-${index}`),
        ]));
      }
      setFeedback({
        type: 'error',
        message: error.response?.data?.error || 'אירעה שגיאה בשמירת המוצר',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeactivate = async () => {
    if (!editingProductId) return;
    if (!window.confirm('האם להסיר את המוצר מהחנות?')) return;
    setIsLoading(true);
    try {
      await axios.put(`/api/product/${editingProductId}`, { isActive: false });
      router.push('/admin/products');
    } catch (error) {
      setFeedback({
        type: 'error',
        message: error.response?.data?.error || 'שגיאה בהסרת המוצר',
      });
      setIsLoading(false);
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    saveProduct(formData.isActive === 'true');
  };

  if (isLoadingProduct) {
    return (
      <div className={styles.formWrapper}>
        <p className={styles.loadingProduct}>טוען מוצר לעריכה...</p>
      </div>
    );
  }

  const isActive = formData.isActive === 'true';

  return (
    <div className={styles.formWrapper}>
      <div className={styles.editorToolbar}>
        <div className={styles.toolbarStart}>
          <span className={styles.toolbarLabel}>סטטוס</span>
          <span className={`${styles.statusBadge} ${isActive ? styles.statusActive : styles.statusInactive}`}>
            {isActive ? 'פעיל בחנות' : 'לא פעיל'}
          </span>
        </div>
        <div className={styles.toolbarActions}>
          {editingProductId && isActive && formData.slug && (
            <a
              href={`/shop/products/${formData.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.toolbarBtnGhost}
            >
              צפייה בחנות
            </a>
          )}
          <button
            type="button"
            className={styles.toolbarBtnDraft}
            onClick={() => saveProduct(false)}
            disabled={isLoading}
          >
            {isLoading ? 'שומר...' : isActive ? 'השבת מוצר' : 'שמור לא פעיל'}
          </button>
          <button
            type="button"
            className={styles.toolbarBtnPublish}
            onClick={() => saveProduct(true)}
            disabled={isLoading}
          >
            {isLoading ? 'שומר...' : isActive ? 'עדכן מוצר' : 'הפעל בחנות'}
          </button>
          {editingProductId && (
            <button
              type="button"
              className={styles.toolbarBtnDanger}
              onClick={handleDeactivate}
              disabled={isLoading}
            >
              הסר מהחנות
            </button>
          )}
        </div>
      </div>

      <div className={styles.formHeader}>
        <h3>{editingProductId ? 'עריכת מוצר' : 'הוספת מוצר חדש'}</h3>
        {feedback.message && (
          <div className={`${styles.feedback} ${styles[feedback.type]}`}>
            {feedback.message}
          </div>
        )}
      </div>

      <form onSubmit={handleFormSubmit} className={styles.form}>
        <div className={styles.formSection}>
          <h4>פרטים בסיסיים</h4>
          <div className={styles.formGrid}>
            <div className={styles.formField}>
              <label>שם המוצר</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="שם המוצר"
              />
            </div>
            
            <div className={styles.formField}>
              <FieldLabel htmlFor="product-slug" help={SLUG_HELP} helpLabel="הסבר על הכתובת">
                סלאג (כתובת URL)
              </FieldLabel>
              <input
                id="product-slug"
                type="text"
                name="slug"
                value={formData.slug}
                onChange={handleChange}
                placeholder="עוגת-בנטו-לב"
                aria-invalid={Boolean(fieldErrors.slug)}
                aria-describedby="product-slug-error"
              />
              <FieldError id="product-slug-error">{fieldErrors.slug}</FieldError>
            </div>

            <div className={styles.formField}>
              <label>כותרת משנה</label>
              <input
                type="text"
                name="subtitle"
                value={formData.subtitle}
                onChange={handleChange}
                placeholder="כותרת משנה"
              />
            </div>
          </div>

          <div className={styles.formField}>
            <label>תיאור המוצר</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              placeholder="תיאור מפורט של המוצר"
            ></textarea>
          </div>
        </div>

        <div className={styles.formSection}>
          <h4>מחיר וקטגוריה</h4>
          <div className={styles.formGrid}>
            <div className={styles.formField}>
              <label>מחיר</label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                required
                placeholder="מחיר בש״ח"
              />
            </div>
            
            <div className={styles.formField}>
              <label>קטגוריה</label>
              <select
                name="categoryId"
                value={formData.categoryId}
                onChange={handleChange}
                required
              >
                <option value="">בחר קטגוריה</option>
                {categories.map(category => (
                  <option key={category._id} value={category._id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className={styles.formSection}>
          <h4>העלאת תמונות</h4>
          <div className={styles.imageUploadContainer}>
            <button type="button" className={styles.generateSEOButton} onClick={openMediaPicker}>
              בחר תמונות מספריית המדיה
            </button>
            <div className={styles.selectedImages}>
              {imageItems.map((item, index) => (
                <div key={`${item.url}-${index}`} className={styles.imagePreview}>
                  <img src={item.url} alt={item.decorative ? '' : item.alt} />
                  <button type="button" onClick={() => removeImage(index)} aria-label={`הסרת תמונה ${index + 1}`}>
                    הסר
                  </button>
                  <FieldLabel htmlFor={`product-image-alt-${index}`} help={ALT_HELP} helpLabel="הסבר על טקסט חלופי">
                    טקסט חלופי
                  </FieldLabel>
                  <input
                    id={`product-image-alt-${index}`}
                    type="text"
                    value={item.alt}
                    disabled={item.decorative}
                    aria-invalid={Boolean(fieldErrors[`imageAlt-${index}`])}
                    aria-describedby={`product-image-alt-${index}-error`}
                    onChange={(event) => {
                      const value = event.target.value;
                      setImageItems((items) => items.map((current, itemIndex) => (
                        itemIndex === index
                          ? { ...current, alt: value, altEdited: true }
                          : current
                      )));
                      setFieldErrors((errors) => {
                        if (!errors[`imageAlt-${index}`]) return errors;
                        const next = { ...errors };
                        delete next[`imageAlt-${index}`];
                        return next;
                      });
                    }}
                  />
                  <label className={styles.fieldHint}>
                    <input
                      type="checkbox"
                      checked={item.decorative}
                      onChange={(event) => {
                        const decorative = event.target.checked;
                        setImageItems((items) => items.map((current, itemIndex) => (
                          itemIndex === index ? { ...current, decorative } : current
                        )));
                      }}
                    />
                    {' '}תמונה דקורטיבית
                  </label>
                  {item.missingStored && !item.decorative && (
                    <p className={styles.sectionNote}>לא נשמר עדיין טקסט חלופי לתמונה הזו. השדה מציג את שם המוצר.</p>
                  )}
                  <FieldError id={`product-image-alt-${index}-error`}>{fieldErrors[`imageAlt-${index}`]}</FieldError>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className={styles.formSection}>
          <h4>מפרט טכני</h4>
          <p className={styles.sectionNote}>{DIMENSION_REPEAT_NOTE}</p>
          <div className={styles.formGrid}>
            <div className={styles.formField}>
              <FieldLabel htmlFor="product-height" help={DIMENSION_HELP} helpLabel="הסבר על הגובה">
                גובה (בס״מ)
              </FieldLabel>
              <input
                id="product-height"
                type="number"
                name="height"
                min="0"
                step="any"
                value={formData.height}
                onChange={handleChange}
                placeholder="גובה"
                aria-invalid={Boolean(fieldErrors.height)}
                aria-describedby="product-height-error"
              />
              <FieldError id="product-height-error">{fieldErrors.height}</FieldError>
            </div>
            
            <div className={styles.formField}>
              <FieldLabel htmlFor="product-diameter" help={DIMENSION_HELP} helpLabel="הסבר על הקוטר">
                קוטר (בס״מ)
              </FieldLabel>
              <input
                id="product-diameter"
                type="number"
                name="diameter"
                min="0"
                step="any"
                value={formData.diameter}
                onChange={handleChange}
                placeholder="קוטר"
                aria-invalid={Boolean(fieldErrors.diameter)}
                aria-describedby="product-diameter-error"
              />
              <FieldError id="product-diameter-error">{fieldErrors.diameter}</FieldError>
            </div>
          </div>
        </div>

        <div className={styles.formSection}>
          <h4>תכונות נוספות</h4>
          <div className={styles.formGrid}>
            <div className={styles.formField}>
              <label>מכיל גלוטן?</label>
              <select
                name="glutenContent"
                value={formData.glutenContent}
                onChange={handleChange}
                required
              >
                <option value="">בחר אפשרות</option>
                <option value="מכיל גלוטן">מכיל גלוטן</option>
                <option value="ללא גלוטן">ללא גלוטן</option>
              </select>
            </div>
            
            <div className={styles.formField}>
              <label>אפשרות לפרווה?</label>
              <select
                name="dairyContent"
                value={formData.dairyContent}
                onChange={handleChange}
                required
              >
                <option value="">בחר אפשרות</option>
                <option value="כן">כן</option>
                <option value="לא">לא</option>
              </select>
            </div>
          </div>
        </div>

        <div className={styles.formSection}>
          <h4>מאפיינים חזותיים</h4>
          <div className={styles.formGrid}>
            <div className={styles.formField}>
              <label>צבעים זמינים</label>
              <input
                type="text"
                name="colors"
                value={formData.colors}
                onChange={handleChange}
                placeholder="צבעים מופרדים בפסיקים"
              />
            </div>
            
            <div className={styles.formField}>
              <label>טעמים זמינים</label>
              <input
                type="text"
                name="flavors"
                value={formData.flavors}
                onChange={handleChange}
                placeholder="טעמים מופרדים בפסיקים"
              />
            </div>
          </div>
          
          <div className={styles.formField}>
            <label>פעיל</label>
            <select
              name="isActive"
              value={formData.isActive}
              onChange={handleChange}
            >
              <option value="true">כן</option>
              <option value="false">לא</option>
            </select>
          </div>
        </div>

        <div className={styles.seoGenerateSection}>
          <div className={styles.seoHeader}>
            <h4>ג'ינרוט תוכן SEO אוטומטי</h4>
            <p>צור תוכן SEO מתקדם באמצעות AI עבור המוצר שלך</p>
          </div>
          <button
            type="button"
            onClick={generateSEO}
            disabled={isGeneratingSEO || !formData.name || !formData.description}
            className={styles.generateSEOButton}
          >
            {isGeneratingSEO ? 'מייצר תוכן SEO...' : '🤖 ייצר תוכן SEO באמצעות AI'}
          </button>
          {!formData.name || !formData.description ? (
            <p className={styles.requirement}>נדרש שם מוצר ותיאור לג'ינרוט SEO</p>
          ) : null}
        </div>

        {(showSEOSection || formData.seoTitle) && (
          <div className={styles.formSection}>
            <div className={styles.seoSectionHeader}>
              <h4>הגדרות SEO מתקדמות</h4>
              <button
                type="button"
                onClick={() => setShowSEOSection(!showSEOSection)}
                className={styles.toggleButton}
              >
                {showSEOSection ? 'הסתר' : 'הצג'}
              </button>
            </div>
            
            {showSEOSection && (
              <>
                <div className={styles.formGrid}>
                  <div className={styles.formField}>
                    <label>כותרת SEO</label>
                    <input
                      type="text"
                      name="seoTitle"
                      value={formData.seoTitle}
                      onChange={handleChange}
                      placeholder="כותרת למנועי חיפוש"
                    />
                    <small>{formData.seoTitle.length}/60 תווים</small>
                  </div>
                </div>

                <div className={styles.formField}>
                  <FieldLabel htmlFor="product-meta-description" help={SEO_DESCRIPTION_HELP} helpLabel="הסבר על תיאור החיפוש">
                    Meta Description
                  </FieldLabel>
                  <textarea
                    id="product-meta-description"
                    name="metaDescription"
                    value={formData.metaDescription}
                    onChange={handleChange}
                    placeholder="תיאור המוצר למנועי חיפוש"
                  ></textarea>
                  <small>{formData.metaDescription.length}/155 תווים</small>
                  <FieldWarning id="product-meta-warning">
                    {seoDescriptionWarnings({
                      text: formData.metaDescription,
                      siblingTexts: [formData.name, formData.seoTitle, (formData.description || '').split('\n')[0]],
                    })}
                  </FieldWarning>
                  <div className={styles.seoPreview}>
                    <strong>{formData.seoTitle || formData.name || 'כותרת המוצר'}</strong>
                    <span>{formData.metaDescription || 'באתר יוצג תיאור ברירת מחדל אם השדה ריק.'}</span>
                  </div>
                </div>

                <div className={styles.formGrid}>
                  <div className={styles.formField}>
                    <label>מילת מפתח ראשית</label>
                    <input
                      type="text"
                      name="focusKeyword"
                      value={formData.focusKeyword}
                      onChange={handleChange}
                      placeholder="מילת מפתח ראשית"
                    />
                  </div>
                  
                  <div className={styles.formField}>
                    <label>מילות מפתח משניות</label>
                    <input
                      type="text"
                      name="secondaryKeywords"
                      value={formData.secondaryKeywords}
                      onChange={handleChange}
                      placeholder="מופרדות בפסיקים"
                    />
                  </div>
                </div>

                <div className={styles.formGrid}>
                  <div className={styles.formField}>
                    <label>Alt Text לתמונה</label>
                    <p className={styles.sectionNote}>טקסט חלופי לכל תמונה נערך ליד התמונה עצמה.</p>
                    <input
                      type="text"
                      name="altText"
                      value={formData.altText}
                      onChange={handleChange}
                      placeholder="תיאור התמונה לנגישות"
                    />
                  </div>
                  
                  <div className={styles.formField}>
                    <label>כותרת התמונה</label>
                    <input
                      type="text"
                      name="imageTitle"
                      value={formData.imageTitle}
                      onChange={handleChange}
                      placeholder="כותרת התמונה"
                    />
                  </div>
                </div>

                <div className={styles.formField}>
                  <label>תגיות</label>
                  <input
                    type="text"
                    name="tags"
                    value={formData.tags}
                    onChange={handleChange}
                    placeholder="תגיות מופרדות בפסיקים"
                  />
                </div>

                {/* TODO: ADD FAQ display section when needed in the future */}
              </>
            )}
          </div>
        )}

        <p className={styles.toolbarHint}>
          שמירה והפעלה מתבצעות מהסרגל העליון.
        </p>
      </form>

      {slugPrompt !== null && (
        <SlugChangeDialog
          onCancel={() => setSlugPrompt(null)}
          onConfirm={() => {
            const active = slugPrompt;
            setSlugPrompt(null);
            saveProduct(active, { slugConfirmed: true });
          }}
        />
      )}

      {showMediaPicker && (
        <MediaPickerModal
          isOpen={showMediaPicker}
          onClose={closeMediaPicker}
          onConfirm={handleMediaConfirm}
          multiple
        />
      )}
    </div>
  );
}
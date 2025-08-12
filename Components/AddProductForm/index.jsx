"use client"
import { useState } from 'react';
import axios from 'axios';
import styles from './style.module.scss';
import dynamic from 'next/dynamic';
const MediaPickerModal = dynamic(() => import('@/Components/MediaPickerModal'), { ssr: false });

export default function AddProductForm({ categories }) {
  const [formData, setFormData] = useState({
    name: '',
    subtitle: '',
    description: '',
    price: '',
    category: '',
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
  
  const [selectedImages, setSelectedImages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingSEO, setIsGeneratingSEO] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', message: '' });
  const [showSEOSection, setShowSEOSection] = useState(false);
  const [showMediaPicker, setShowMediaPicker] = useState(false);
  const [selectedImageUrls, setSelectedImageUrls] = useState([]);
  // TODO: ADD FAQ state when needed in the future

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setSelectedImages(prevImages => [...prevImages, ...files]);
  };

  const removeImage = (index) => {
    setSelectedImages(prevImages => prevImages.filter((_, i) => i !== index));
    setSelectedImageUrls(prev => prev.filter((_, i) => i !== index));
  };

  const openMediaPicker = () => setShowMediaPicker(true);
  const closeMediaPicker = () => setShowMediaPicker(false);
  const handleMediaConfirm = (selection) => {
    const urls = selection.map(s => s.secure_url);
    setSelectedImageUrls(prev => [...prev, ...urls]);
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
          category: formData.category,
          price: formData.price,
          flavors: formData.flavors ? formData.flavors.split(',').map(f => f.trim()) : [],
          colors: formData.colors ? formData.colors.split(',').map(c => c.trim()) : []
        }
      });

      if (response.data.success) {
        const seoData = response.data.data;
        
        setFormData(prev => ({
          ...prev,
          slug: seoData.slug || '',
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
      category: '',
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
    setSelectedImages([]);
          // TODO: ADD FAQ reset when needed
    setShowSEOSection(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setFeedback({ type: '', message: '' });

    try {
      const imageUrls = [...selectedImageUrls];

      const formattedData = {
        ...formData,
        price: parseFloat(formData.price),
        images: imageUrls,
        colors: formData.colors ? formData.colors.split(',').map(color => color.trim()) : [],
        flavors: formData.flavors ? formData.flavors.split(',').map(flavor => flavor.trim()) : [],
        isActive: formData.isActive === 'true',
        height: parseFloat(formData.height),
        diameter: parseFloat(formData.diameter),
        notDairyOption: formData.dairyContent === 'כן',
        secondaryKeywords: formData.secondaryKeywords ? formData.secondaryKeywords.split(',').map(k => k.trim()) : [],
        tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()) : [],
        // TODO: ADD FAQ to submission when needed
      };

      const response = await axios.post('/api/product', formattedData);
      setFeedback({
        type: 'success',
        message: 'המוצר נוסף בהצלחה!'
      });
      resetForm();
    } catch (error) {
      setFeedback({
        type: 'error',
        message: error.response?.data?.error || 'אירעה שגיאה בהוספת המוצר'
      });
    } finally {
      setIsLoading(false);
      window.scrollTo({
        top: document.querySelector(`.${styles.feedback}`)?.offsetTop - 100,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className={styles.formWrapper}>
      <div className={styles.formHeader}>
        <h3>הוספת מוצר חדש</h3>
        {feedback.message && (
          <div className={`${styles.feedback} ${styles[feedback.type]}`}>
            {feedback.message}
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className={styles.form}>
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
                name="category"
                value={formData.category}
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
              {selectedImageUrls.map((url, index) => (
                <div key={index} className={styles.imagePreview}>
                  <img src={url} alt={`תמונה ${index + 1}`} />
                  <button type="button" onClick={() => removeImage(index)}>
                    הסר
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className={styles.formSection}>
          <h4>מפרט טכני</h4>
          <div className={styles.formGrid}>
            <div className={styles.formField}>
              <label>גובה (בס״מ)</label>
              <input
                type="number"
                name="height"
                value={formData.height}
                onChange={handleChange}
                required
                placeholder="גובה"
              />
            </div>
            
            <div className={styles.formField}>
              <label>קוטר (בס״מ)</label>
              <input
                type="number"
                name="diameter"
                value={formData.diameter}
                onChange={handleChange}
                required
                placeholder="קוטר"
              />
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
                    <label>Slug (כתובת URL)</label>
                    <input
                      type="text"
                      name="slug"
                      value={formData.slug}
                      onChange={handleChange}
                      placeholder="product-url-slug"
                    />
                  </div>
                  
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
                  <label>Meta Description</label>
                  <textarea
                    name="metaDescription"
                    value={formData.metaDescription}
                    onChange={handleChange}
                    placeholder="תיאור המוצר למנועי חיפוש"
                  ></textarea>
                  <small>{formData.metaDescription.length}/155 תווים</small>
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

        <div className={styles.formActions}>
          <button 
            type="submit" 
            className={styles.submitButton}
            disabled={isLoading}
          >
            {isLoading ? 'מוסיף מוצר...' : 'הוסף מוצר'}
          </button>
        </div>
      </form>

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
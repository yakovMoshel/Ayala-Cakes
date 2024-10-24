"use client"
import { useState } from 'react';
import axios from 'axios';
import styles from './style.module.scss';

export default function AddPostForm() {
  const [formData, setFormData] = useState({
    title: '',
    summary: '',
    content: '',
    author: '',
    image: '',
    slug: '',
    focusKeyword: '',
    secondaryKeywords: '',
    seoTitle: '',
    metaDescription: '',
    callToAction: '',
    socialImage: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formattedData = {
      ...formData,
      content: formData.content
        .split('\n')
        .map(paragraph => `<p>${paragraph}</p>`)
        .join(''),
      image: formData.image.trim(),
    };
    
    try {
      const response = await axios.post('/api/post', formattedData, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
  
      if (response.data.success) {
      } else {
      }
    } catch (error) {
    }
  };

  return (
    <div className={styles.topPosts}>
      <div className={styles.sideTitle}>
        הוספת פוסט חדש
      </div>
      <div className={styles.formContainer}>
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <input
                type="text"
                name="title"
                value={formData.title}
                placeholder="כותרת"
                onChange={handleChange}
                required
              />
            </div>
          </div>
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <textarea
                name="summary"
                value={formData.summary}
                placeholder="תקציר"
                onChange={handleChange}
                required
              ></textarea>
            </div>
          </div>
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <textarea
                name="content"
                value={formData.content}
                placeholder="תוכן"
                onChange={handleChange}
                required
                className={styles.contentTextarea}
              ></textarea>
            </div>
          </div>
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <input
                type="text"
                name="author"
                value={formData.author}
                placeholder="מחבר"
                onChange={handleChange}
                required
              />
            </div>
          </div>
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <input
                type="text"
                name="image"
                value={formData.image}
                placeholder="תמונה (URL)"
                onChange={handleChange}
              />
            </div>
          </div>
          {/* שדות נוספים ללא REQUIRED */}
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <input
                type="text"
                name="slug"
                value={formData.slug}
                placeholder="Slug"
                onChange={handleChange}
              />
            </div>
          </div>
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <input
                type="text"
                name="focusKeyword"
                value={formData.focusKeyword}
                placeholder="מילת מפתח"
                onChange={handleChange}
              />
            </div>
          </div>
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <input
                type="text"
                name="secondaryKeywords"
                value={formData.secondaryKeywords}
                placeholder="מילות מפתח משניות"
                onChange={handleChange}
              />
            </div>
          </div>
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <input
                type="text"
                name="seoTitle"
                value={formData.seoTitle}
                placeholder="כותרת SEO"
                onChange={handleChange}
              />
            </div>
          </div>
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <textarea
                name="metaDescription"
                value={formData.metaDescription}
                placeholder="Meta Description"
                onChange={handleChange}
              ></textarea>
            </div>
          </div>
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <textarea
                name="callToAction"
                value={formData.callToAction}
                placeholder="קריאה לפעולה"
                onChange={handleChange}
              ></textarea>
            </div>
          </div>
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <input
                type="text"
                name="socialImage"
                value={formData.socialImage}
                placeholder="תמונה לרשתות חברתיות"
                onChange={handleChange}
              />
            </div>
          </div>
          <button type="submit" className={styles.submitButton}>הוסף פוסט</button>
        </form>
      </div>
    </div>
  );
}

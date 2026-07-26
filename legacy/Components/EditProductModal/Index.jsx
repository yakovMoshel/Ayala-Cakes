import { useState, useEffect } from 'react';
import axios from 'axios';
import styles from './style.module.scss';

export default function EditProductModal({ product, closeModal }) {
  const [formData, setFormData] = useState({
    name: product.name,
    subtitle: product.subtitle,
    description: product.description,
    price: product.price,
    categoryId:
      product.categoryId != null
        ? String(
            typeof product.categoryId === 'object'
              ? product.categoryId._id || ''
              : product.categoryId
          )
        : '',
    images: product.images.join(','),
    colors: product.colors.join(','),
    flavors: product.flavors.join(','),
    isActive: product.isActive
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
      categoryId: formData.categoryId || null,
      price: parseFloat(formData.price),
      images: formData.images.split(','),
      colors: formData.colors.split(','),
      flavors: formData.flavors.split(','),
      isActive: formData.isActive
    };

    try {
      const response = await axios.put(`/api/product/${product._id}`, formattedData);
      closeModal();
    } catch (error) {
    }
  };

  return (
    <div className={styles.modal}>
      <div className={styles.modalContent}>
        <button onClick={closeModal} className={styles.closeButton}>X</button>
        <form onSubmit={handleSubmit}>
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <input
                type="text"
                name="name"
                value={formData.name}
                placeholder="שם המוצר"
                onChange={handleChange}
                required
              />
            </div>
            <div className={styles.formGroup}>
              <input
                type="text"
                name="subtitle"
                value={formData.subtitle}
                placeholder="כותרת משנה"
                onChange={handleChange}
              />
            </div>
          </div>
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <textarea
                name="description"
                value={formData.description}
                placeholder="תיאור המוצר"
                onChange={handleChange}
                required
              ></textarea>
            </div>
          </div>
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <input
                type="number"
                name="price"
                value={formData.price}
                placeholder="מחיר"
                onChange={handleChange}
                required
              />
            </div>
            <div className={styles.formGroup}>
              <input
                type="text"
                name="categoryId"
                value={formData.categoryId}
                placeholder="מזהה קטגוריה"
                onChange={handleChange}
                required
              />
            </div>
          </div>
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <input
                type="text"
                name="images"
                value={formData.images}
                placeholder="תמונות (מופרדות בפסיקים)"
                onChange={handleChange}
                required
              />
            </div>
          </div>
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <input
                type="text"
                name="colors"
                value={formData.colors}
                placeholder="צבעים (מופרדים בפסיקים)"
                onChange={handleChange}
              />
            </div>
            <div className={styles.formGroup}>
              <input
                type="text"
                name="flavors"
                value={formData.flavors}
                placeholder="טעמים (מופרדים בפסיקים)"
                onChange={handleChange}
              />
            </div>
          </div>
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label>
                פעיל:
                <select
                  name="isActive"
                  value={formData.isActive}
                  onChange={handleChange}
                >
                  <option value={true}>כן</option>
                  <option value={false}>לא</option>
                </select>
              </label>
            </div>
          </div>
          <button type="submit">עדכן מוצר</button>
        </form>
      </div>
    </div>
  );
}

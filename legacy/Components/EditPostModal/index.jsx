import React, { useState } from 'react';
import styles from './style.module.scss';
import axios from 'axios';

export default function EditPostModal({ post, closeModal }) {
  const [formData, setFormData] = useState({
    title: post.title,
    summary: post.summary,
    content: post.content,
    image: post.image,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.put(`/api/post/${post._id}`, formData);
      if (response.data.success) {
        closeModal();
      }
    } catch (error) {
    }
  };

  return (
    <div className={styles.modal}>
      <div className={styles.modalContent}>
        <h2>ערוך פוסט</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="כותרת"
          />
          <textarea
            name="summary"
            value={formData.summary}
            onChange={handleChange}
            placeholder="תקציר"
          ></textarea>
          <textarea
            name="content"
            value={formData.content}
            onChange={handleChange}
            placeholder="תוכן"
          ></textarea>
          <input
            type="text"
            name="image"
            value={formData.image}
            onChange={handleChange}
            placeholder="תמונה (URL)"
          />
          <button type="submit">שמור</button>
          <button type="button" onClick={closeModal}>ביטול</button>
        </form>
      </div>
    </div>
  );
}

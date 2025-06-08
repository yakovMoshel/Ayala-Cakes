"use client"
import { useState } from 'react';
import axios from 'axios';
import styles from './style.module.scss';

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
    diameter: ''
  });
  
  const [selectedImages, setSelectedImages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', message: '' });

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
      diameter: ''
    });
    setSelectedImages([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setFeedback({ type: '', message: '' });

    try {
      // העלאת התמונות לשרת
      const imageUrls = [];
      for (const image of selectedImages) {
        const formData = new FormData();
        formData.append('file', image);
        
        const response = await axios.post('/api/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        
        imageUrls.push(response.data.url);
      }

      const formattedData = {
        ...formData,
        price: parseFloat(formData.price),
        images: imageUrls,
        colors: formData.colors ? formData.colors.split(',').map(color => color.trim()) : [],
        flavors: formData.flavors ? formData.flavors.split(',').map(flavor => flavor.trim()) : [],
        isActive: formData.isActive === 'true',
        height: parseFloat(formData.height),
        diameter: parseFloat(formData.diameter),
        notDairyOption: formData.dairyContent === 'כן'
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
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageChange}
              className={styles.fileInput}
            />
            <div className={styles.selectedImages}>
              {selectedImages.map((image, index) => (
                <div key={index} className={styles.imagePreview}>
                  <img src={URL.createObjectURL(image)} alt={`תמונה ${index + 1}`} />
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
            <div className={styles.formGroup}>
              <label>
                פעיל:
                <select
                  name="isActive"
                  value={formData.isActive}
                  onChange={handleChange}
                >
                  <option value="true">כן</option>
                  <option value="false">לא</option>
                </select>
              </label>
            </div>
          </div>
        </div>

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
    </div>
  );
}


// "use client"
// import { useState } from 'react';
// import axios from 'axios';
// import styles from './style.module.scss';

// export default function AddProductForm({ categories }) {
//   const [formData, setFormData] = useState({
//     name: '',
//     subtitle: '',
//     description: '',
//     price: '',
//     category: '',
//     images: '',
//     colors: '',
//     flavors: '',
//     isActive: true,
//     glutenContent: '',
//     dairyContent: '',
//     height: '',
//     diameter: ''
//   });
//   const [error, setError] = useState(null);

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData((prevData) => ({
//       ...prevData,
//       [name]: value
//     }));
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setError(null);
//     const formattedData = {
//       ...formData,
//       price: parseFloat(formData.price),
//       images: formData.images.split(',').map(img => img.trim()),
//       colors: formData.colors.split(',').map(color => color.trim()),
//       flavors: formData.flavors.split(',').map(flavor => flavor.trim()),
//       isActive: formData.isActive === 'true',
//       height: parseFloat(formData.height),
//       diameter: parseFloat(formData.diameter),
//       notDairyOption: formData.dairyContent === 'כן'
//     };

//     try {
//       console.log('Sending data:', JSON.stringify(formattedData, null, 2));
//       const response = await axios.post('/api/product', formattedData);
//       console.log('Server response:', response.data);
//       // Handle success (e.g., clear form, show success message)
//     } catch (error) {
//       console.error('Error submitting form:', error.response?.data || error.message);
//       setError(error.response?.data?.error || 'An error occurred while submitting the form.');
//     }
//   };

//   return (
//     <div className={styles.topProducts}>
//       <div className={styles.sideTitle}>
//         הוספת מוצר חדש
//       </div>
//       <div className={styles.formContainer}>
//         <form onSubmit={handleSubmit} className={styles.form}>
//           <div className={styles.formRow}>
//             <div className={styles.formGroup}>
//               <input
//                 type="text"
//                 name="name"
//                 value={formData.name}
//                 placeholder="שם המוצר"
//                 onChange={handleChange}
//                 required
//               />
//             </div>
//             <div className={styles.formGroup}>
//               <input
//                 type="text"
//                 name="subtitle"
//                 value={formData.subtitle}
//                 placeholder="כותרת משנה"
//                 onChange={handleChange}
//               />
//             </div>
//           </div>
//           <div className={styles.formRow}>
//             <div className={styles.formGroup}>
//               <textarea
//                 name="description"
//                 value={formData.description}
//                 placeholder="תיאור המוצר"
//                 onChange={handleChange}
//                 required
//               ></textarea>
//             </div>
//           </div>
//           <div className={styles.formRow}>
//             <div className={styles.formGroup}>
//               <input
//                 type="number"
//                 name="price"
//                 value={formData.price}
//                 placeholder="מחיר"
//                 onChange={handleChange}
//                 required
//               />
//             </div>
//             <div className={styles.formGroup}>
//               <select
//                 name="category"
//                 value={formData.category}
//                 onChange={handleChange}
//                 required
//               >
//                 <option value="">בחר קטגוריה</option>
//                 {categories.map(category => (
//                   <option key={category._id} value={category._id}>{category.name}</option>
//                 ))}
//               </select>
//             </div>
//           </div>
//           <div className={styles.formRow}>
//             <div className={styles.formGroup}>
//               <input
//                 type="text"
//                 name="images"
//                 value={formData.images}
//                 placeholder="תמונות (מופרדות בפסיקים)"
//                 onChange={handleChange}
//                 required
//               />
//             </div>
//           </div>
//           <div className={styles.formRow}>
//             <div className={styles.formGroup}>
//               <input
//                 type="text"
//                 name="colors"
//                 value={formData.colors}
//                 placeholder="צבעים (מופרדים בפסיקים)"
//                 onChange={handleChange}
//               />
//             </div>
//             <div className={styles.formGroup}>
//               <input
//                 type="text"
//                 name="flavors"
//                 value={formData.flavors}
//                 placeholder="טעמים (מופרדים בפסיקים)"
//                 onChange={handleChange}
//               />
//             </div>
//           </div>
//           <div className={styles.formRow}>
//             <div className={styles.formGroup}>
//               <label>
//                 פעיל:
//                 <select
//                   name="isActive"
//                   value={formData.isActive}
//                   onChange={handleChange}
//                 >
//                   <option value="true">כן</option>
//                   <option value="false">לא</option>
//                 </select>
//               </label>
//             </div>
//           </div>
//           <div className={styles.formRow}>
//             <div className={styles.formGroup}>
//               <select
//                 name="glutenContent"
//                 value={formData.glutenContent}
//                 onChange={handleChange}
//                 required
//               >
//                 <option value="">מכיל גלוטן?</option>
//                 <option value="מכיל גלוטן">מכיל גלוטן</option>
//                 <option value="ללא גלוטן">ללא גלוטן</option>
//               </select>
//             </div>
//             <div className={styles.formGroup}>
//               <select
//                 name="dairyContent"
//                 value={formData.dairyContent}
//                 onChange={handleChange}
//                 required
//               >
//                 <option value="">אופציה לפרווה?</option>
//                 <option value="כן">כן</option>
//                 <option value="לא">לא</option>
//               </select>
//             </div>
//           </div>
//           <div className={styles.formRow}>
//             <div className={styles.formGroup}>
//               <input
//                 type="number"
//                 name="height"
//                 value={formData.height}
//                 placeholder="גובה"
//                 onChange={handleChange}
//                 required
//               />
//             </div>
//             <div className={styles.formGroup}>
//               <input
//                 type="number"
//                 name="diameter"
//                 value={formData.diameter}
//                 placeholder="קוטר"
//                 onChange={handleChange}
//                 required
//               />
//             </div>
//           </div>
//           {error && <div className={styles.error}>{error}</div>}
//           <button type="submit" className={styles.submitButton}>הוסף מוצר</button>
//         </form>
//       </div>
//     </div>
//   );
// }
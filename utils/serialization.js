// utils/serialization.js

/**
 * ממיר אובייקט של מונגו לאובייקט פשוט שניתן להעביר בין Server ל-Client Components
 * @param {Object} obj - אובייקט MongoDB או כל אובייקט אחר
 * @returns {Object} - אובייקט ניתן לסריאליזציה
 */
export function serializeData(obj) {
    if (!obj) return null;
    
    // אם זה מערך, מטפל בכל אובייקט במערך
    if (Array.isArray(obj)) {
      return obj.map(item => serializeData(item));
    }
    
    // אם זה לא אובייקט או הוא null, להחזיר כמו שהוא
    if (typeof obj !== 'object' || obj === null) {
      return obj;
    }
    
    // המרה לאובייקט רגיל באמצעות JSON.stringify/parse
    // זה מטפל בהמרה של ObjectId, Date ושדות אחרים שלא ניתנים לסריאליזציה
    try {
      return JSON.parse(JSON.stringify(obj));
    } catch (error) {
      console.error('Serialization error:', error);
      
      // אם יש שגיאה בהמרה, ננסה לבצע המרה ידנית של שדות נפוצים
      const result = {};
      
      for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
          const value = obj[key];
          
          // טיפול ב-ObjectId
          if (key === '_id' && value && typeof value.toString === 'function') {
            result[key] = value.toString();
          }
          // טיפול ב-Date
          else if (value instanceof Date) {
            result[key] = value.toISOString();
          }
          // טיפול רקורסיבי לאובייקטים מקוננים
          else if (typeof value === 'object' && value !== null) {
            result[key] = serializeData(value);
          }
          // שדות רגילים
          else {
            result[key] = value;
          }
        }
      }
      
      return result;
    }
  }
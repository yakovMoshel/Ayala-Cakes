import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * פונקציה לג'ינרוט SEO תוכן למוצרים
 */
export const generateProductSEO = async ({ name, subtitle, description, category, price, flavors, colors }) => {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `
    אני צריך שתוליד תוכן SEO בעברית למוצר קונדיטוריה בחנות "עוגות איילה".

    פרטי המוצר:
    - שם: ${name}
    - כותרת משנה: ${subtitle || ''}
    - תיאור: ${description}
    - קטגוריה: ${category}
    - מחיר: ${price} ש"ח
    - טעמים: ${flavors?.join(', ') || ''}
    - צבעים: ${colors?.join(', ') || ''}

    אנא צור עבורי:
    1. SEO Title (50-60 תווים)
    2. Meta Description (120-155 תווים)
    3. Focus Keyword (מילת מפתח ראשית)
    4. Secondary Keywords (3-5 מילות מפתח משניות)
    5. Slug באנגלית (פשוט ונגיש)
    6. Alt Text לתמונה
    7. Image Title
    8. Tags (5-7 תגיות רלוונטיות)
    9. Structured Data (JSON-LD למוצר)

    // TODO: ADD FAQ generation in the future when displaying FAQs to customers

    החזר תשובה בפורמט JSON הבא:
    {
      "seoTitle": "...",
      "metaDescription": "...",
      "focusKeyword": "...",
      "secondaryKeywords": ["...", "...", "..."],
      "slug": "...",
      "altText": "...",
      "imageTitle": "...",
      "tags": ["...", "...", "..."],
      "structuredData": {...}
    }

    הקפד על:
    - השמדה על איכות התוכן והרלוונטיות לקונדיטוריה
    - השתמש במילים חיוביות ומזמינות
    - התמקד ביתרונות המוצר
    - הוסף מילות מפתח מקומיות אם רלוונטי
    - ה-slug צריך להיות באנגלית פשוטה וקצרה
    `;

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();
    
    // Try to parse JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    
    throw new Error('לא ניתן לפרש את התגובה מ-Gemini');
    
  } catch (error) {
    console.error('Error generating product SEO:', error);
    throw new Error('שגיאה ביצירת תוכן SEO: ' + error.message);
  }
};

/**
 * פונקציה לג'ינרוט SEO תוכן לפוסטים
 */
export const generatePostSEO = async ({ title, summary, content, author }) => {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    // Count words in content for reading time calculation
    const wordCount = content.replace(/<[^>]*>/g, '').split(/\s+/).length;
    const readingTime = Math.ceil(wordCount / 200); // Average reading speed

    const prompt = `
    אני צריך שתוליד תוכן SEO בעברית לפוסט בבלוג של "עוגות איילה".

    פרטי הפוסט:
    - כותרת: ${title}
    - תקציר: ${summary}
    - תוכן: ${content.substring(0, 500)}... (קטע מהתוכן)
    - מחבר: ${author}

    אנא צור עבורי:
    1. SEO Title (50-60 תווים)
    2. Meta Description (120-155 תווים)
    3. Focus Keyword (מילת מפתח ראשית)
    4. Secondary Keywords (3-5 מילות מפתח משניות)
    5. Slug באנגלית (פשוט ונגיש)
    6. Alt Text לתמונה
    7. Image Title
    8. Tags (5-7 תגיות רלוונטיות)
    9. Structured Data (JSON-LD לפוסט)
    10. Call to Action
    11. OG Image description

    // TODO: ADD FAQ generation in the future when displaying FAQs to customers

    החזר תשובה בפורמט JSON הבא:
    {
      "seoTitle": "...",
      "metaDescription": "...",
      "focusKeyword": "...",
      "secondaryKeywords": ["...", "...", "..."],
      "slug": "...",
      "altText": "...",
      "imageTitle": "...",
      "tags": ["...", "...", "..."],
      "structuredData": {...},
      "callToAction": "...",
      "ogImageDescription": "...",
      "readingTime": ${readingTime}
    }

    הקפד על:
    - איכות התוכן והרלוונטיות לקונדיטוריה ואפייה
    - השתמש במילים חיוביות ומזמינות
    - התמקד בערך המוסף לקורא
    - הוסף מילות מפתח מקומיות אם רלוונטי
    - ה-slug צריך להיות באנגלית פשוטה וקצרה
    - הקריאה לפעולה צריכה להיות מעודדת ורלוונטית
    `;

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();
    
    // Try to parse JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    
    throw new Error('לא ניתן לפרש את התגובה מ-Gemini');
    
  } catch (error) {
    console.error('Error generating post SEO:', error);
    throw new Error('שגיאה ביצירת תוכן SEO: ' + error.message);
  }
};

/**
 * פונקציה לג'ינרוט slug באנגלית
 */
export const generateSlug = async (title) => {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `
    אני צריך שתמיר את הכותרת הבאה לslug באנגלית:
    "${title}"

    הslug צריך להיות:
    - באנגלית פשוטה
    - קצר ותמציתי
    - ללא רווחים (השתמש במקפים)
    - ללא תווים מיוחדים
    - SEO friendly
    - מתאים לחנות קונדיטוריה

    החזר רק את הslug, ללא הסבר נוסף.
    `;

    const result = await model.generateContent(prompt);
    const response = result.response;
    const slug = response.text().trim().toLowerCase();
    
    // Clean up the slug
    return slug
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
    
  } catch (error) {
    console.error('Error generating slug:', error);
    // Fallback: create a simple slug from title
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '-')
      .substring(0, 50);
  }
}; 
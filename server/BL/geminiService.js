import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// JSON mode: guaranteed-parseable output, lower temperature for consistent SEO fields
const JSON_MODEL_CONFIG = {
  model: 'gemini-1.5-flash',
  generationConfig: {
    responseMimeType: 'application/json',
    temperature: 0.4,
    maxOutputTokens: 2048,
  },
};

// Strip HTML and collapse whitespace so excerpts spend tokens on text, not markup
const toPlainExcerpt = (html, maxChars = 800) =>
  (html || '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;|&amp;|&lt;|&gt;|&quot;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .substring(0, maxChars);

const parseJsonResponse = (text) => {
  try {
    return JSON.parse(text);
  } catch {
    // Fallback for any stray text around the JSON
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) return JSON.parse(jsonMatch[0]);
    throw new Error('לא ניתן לפרש את התגובה מ-Gemini');
  }
};

/**
 * פונקציה לג'ינרוט SEO תוכן למוצרים
 */
export const generateProductSEO = async ({ name, subtitle, description, category, price, flavors, colors }) => {
  try {
    const model = genAI.getGenerativeModel(JSON_MODEL_CONFIG);

    const prompt = `אתה מומחה SEO לקונדיטוריות בישראל. צור תוכן SEO בעברית למוצר בחנות "עוגות איילה" (ayacakes.biz, אזור הקריות).

מוצר:
שם: ${name}
כותרת משנה: ${subtitle || '-'}
תיאור: ${toPlainExcerpt(description, 400)}
קטגוריה: ${category}
מחיר: ${price} ש"ח
טעמים: ${flavors?.join(', ') || '-'}
צבעים: ${colors?.join(', ') || '-'}

החזר JSON בלבד במבנה המדויק:
{"seoTitle":"50-60 תווים","metaDescription":"120-155 תווים","focusKeyword":"מילת מפתח ראשית","secondaryKeywords":["3-5 מילות מפתח"],"slug":"english-with-hyphens","altText":"טקסט חלופי לתמונה","imageTitle":"כותרת תמונה","tags":["5-7 תגיות"],"structuredData":{"@context":"https://schema.org","@type":"Product"}}

כללים: טון חיובי ומזמין, מילות מפתח מקומיות (קריות/חיפה) אם רלוונטי, slug באנגלית פשוטה, structuredData מלא כולל offers במטבע ILS.`;

    const result = await model.generateContent(prompt);
    return parseJsonResponse(result.response.text());
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
    const model = genAI.getGenerativeModel(JSON_MODEL_CONFIG);

    // Count words in content for reading time calculation
    const wordCount = (content || '').replace(/<[^>]*>/g, ' ').split(/\s+/).filter(Boolean).length;
    const readingTime = Math.ceil(wordCount / 200); // Average reading speed

    const prompt = `אתה מומחה SEO לקונדיטוריות בישראל. צור תוכן SEO בעברית לפוסט בבלוג של "עוגות איילה" (ayacakes.biz).

פוסט:
כותרת: ${title}
תקציר: ${summary}
תוכן (קטע): ${toPlainExcerpt(content, 800)}
מחבר: ${author}

החזר JSON בלבד במבנה המדויק:
{"seoTitle":"50-60 תווים","metaDescription":"120-155 תווים","focusKeyword":"מילת מפתח ראשית","secondaryKeywords":["3-5 מילות מפתח"],"slug":"english-with-hyphens","altText":"טקסט חלופי לתמונה","imageTitle":"כותרת תמונה","tags":["5-7 תגיות"],"structuredData":{"@context":"https://schema.org","@type":"BlogPosting"},"callToAction":"קריאה לפעולה מעודדת","ogImageDescription":"תיאור תמונת שיתוף","readingTime":${readingTime}}

כללים: טון חיובי, ערך מוסף לקורא, מילות מפתח מקומיות אם רלוונטי, slug באנגלית פשוטה וקצרה, structuredData מלא (author: ${author || 'אילה אברהם'}).`;

    const result = await model.generateContent(prompt);
    return parseJsonResponse(result.response.text());
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
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      generationConfig: { temperature: 0.2, maxOutputTokens: 64 },
    });

    const prompt = `המר את הכותרת לslug באנגלית פשוטה: קצר, מקפים במקום רווחים, ללא תווים מיוחדים, SEO friendly, מתאים לקונדיטוריה. החזר רק את הslug.
כותרת: "${title}"`;

    const result = await model.generateContent(prompt);
    const slug = result.response.text().trim().toLowerCase();

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

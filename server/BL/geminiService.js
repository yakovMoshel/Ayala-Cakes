import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai';
import { getBusinessContextPromptBlock, getWritingStylePromptBlock } from './businessContext';
import { getFullBlogSeoRulesBlock, getPostSeoFieldsRulesBlock } from './seoPromptRules';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-3.5-flash';

const JSON_MODEL_CONFIG = {
  model: GEMINI_MODEL,
  generationConfig: {
    responseMimeType: 'application/json',
    temperature: 0.4,
    maxOutputTokens: 4096,
    thinkingConfig: { thinkingLevel: 'minimal' },
  },
};

const POST_SEO_SCHEMA = {
  type: SchemaType.OBJECT,
  properties: {
    seoTitle: { type: SchemaType.STRING },
    metaDescription: { type: SchemaType.STRING },
    focusKeyword: { type: SchemaType.STRING },
    secondaryKeywords: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
    longtailKeywords: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
    slug: { type: SchemaType.STRING },
    callToAction: { type: SchemaType.STRING },
    tags: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
  },
  required: ['seoTitle', 'metaDescription', 'focusKeyword', 'slug'],
};

const POST_SEO_CONFIG = {
  model: GEMINI_MODEL,
  generationConfig: {
    responseMimeType: 'application/json',
    responseSchema: POST_SEO_SCHEMA,
    temperature: 0.4,
    maxOutputTokens: 4096,
    thinkingConfig: { thinkingLevel: 'minimal' },
  },
};

const FULL_BLOG_CONTENT_SCHEMA = {
  type: SchemaType.OBJECT,
  properties: {
    title: { type: SchemaType.STRING },
    summary: { type: SchemaType.STRING },
    content: { type: SchemaType.STRING },
    author: { type: SchemaType.STRING },
  },
  required: ['title', 'summary', 'content'],
};

const FULL_BLOG_CONTENT_CONFIG = {
  model: GEMINI_MODEL,
  generationConfig: {
    responseMimeType: 'application/json',
    responseSchema: FULL_BLOG_CONTENT_SCHEMA,
    temperature: 0.5,
    maxOutputTokens: 16384,
    thinkingConfig: { thinkingLevel: 'minimal' },
  },
};

const toPlainExcerpt = (html, maxChars = 800) =>
  (html || '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;|&amp;|&lt;|&gt;|&quot;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .substring(0, maxChars);

const stripMarkdownFences = (text) =>
  String(text || '')
    .trim()
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();

const extractJsonObject = (text) => {
  const cleaned = stripMarkdownFences(text);
  try {
    return JSON.parse(cleaned);
  } catch {
    const start = cleaned.indexOf('{');
    if (start === -1) return null;

    let depth = 0;
    let inString = false;
    let escaped = false;

    for (let i = start; i < cleaned.length; i += 1) {
      const ch = cleaned[i];
      if (escaped) {
        escaped = false;
        continue;
      }
      if (ch === '\\' && inString) {
        escaped = true;
        continue;
      }
      if (ch === '"') {
        inString = !inString;
        continue;
      }
      if (inString) continue;
      if (ch === '{') depth += 1;
      if (ch === '}') {
        depth -= 1;
        if (depth === 0) {
          return JSON.parse(cleaned.slice(start, i + 1));
        }
      }
    }
    return null;
  }
};

const parseJsonResponse = (text, context = 'Gemini') => {
  const parsed = extractJsonObject(text);
  if (parsed) return parsed;

  const preview = String(text || '').slice(0, 200);
  console.error(`[${context}] Failed to parse JSON. Length=${String(text || '').length}. Preview:`, preview);
  throw new Error('לא ניתן לפרש את התגובה מ-Gemini');
};

const getResponseText = (result) => {
  const response = result?.response;
  if (!response) return '';

  try {
    const text = response.text();
    if (text?.trim()) return text;
  } catch {
    // fall through to parts
  }

  const parts = response.candidates?.[0]?.content?.parts || [];
  return parts
    .map((part) => part.text || '')
    .join('')
    .trim();
};

const normalizeKeywordArray = (value) => {
  if (Array.isArray(value)) {
    return value.map((k) => String(k).trim()).filter(Boolean);
  }
  if (typeof value === 'string' && value.trim()) {
    return value.split(',').map((k) => k.trim()).filter(Boolean);
  }
  return [];
};

const sanitizeBlogContent = (html) => {
  if (!html || typeof html !== 'string') return '';
  return html
    .replace(/<h1[\s>][\s\S]*?<\/h1>/gi, '')
    .replace(/<a[\s>][\s\S]*?<\/a>/gi, (match) => {
      const inner = match.replace(/<a[^>]*>/i, '').replace(/<\/a>/i, '');
      return inner;
    })
    .replace(/<img[^>]*>/gi, '')
    .trim();
};

const countWords = (html) =>
  (html || '').replace(/<[^>]*>/g, ' ').split(/\s+/).filter(Boolean).length;

/**
 * פונקציה לג'ינרוט SEO תוכן למוצרים
 */
export const generateProductSEO = async ({ name, subtitle, description, category, price, flavors, colors }) => {
  try {
    const model = genAI.getGenerativeModel(JSON_MODEL_CONFIG);

    const prompt = `אתה מומחה SEO לקונדיטוריות בישראל. צור תוכן SEO בעברית למוצר בחנות.

${getBusinessContextPromptBlock()}

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
    return parseJsonResponse(getResponseText(result), 'product SEO');
  } catch (error) {
    console.error('Error generating product SEO:', error);
    throw new Error('שגיאה ביצירת תוכן SEO: ' + error.message);
  }
};

/**
 * פונקציה לג'ינרוט SEO תוכן לפוסטים (שדות בלבד מתוכן קיים)
 */
export const generatePostSEO = async ({ title, summary, content, author, compact = false }) => {
  try {
    const model = genAI.getGenerativeModel(POST_SEO_CONFIG);

    const wordCount = countWords(content);
    const readingTime = Math.ceil(wordCount / 200);

    const styleBlock = compact ? '' : `\n${getWritingStylePromptBlock()}\n`;

    const prompt = `אתה מומחה SEO לקונדיטוריות בישראל. צור שדות SEO בעברית לפוסט בבלוג.

${getBusinessContextPromptBlock()}
${styleBlock}
${getPostSeoFieldsRulesBlock()}

פוסט:
כותרת: ${title}
תקציר: ${summary}
תוכן (קטע): ${toPlainExcerpt(content, 800)}
מחבר: ${author}

החזר JSON בלבד עם השדות: seoTitle, metaDescription, focusKeyword, secondaryKeywords, longtailKeywords, slug, callToAction, tags.
אל תכלול structuredData — ייבנה בנפרד.`;

    const result = await model.generateContent(prompt);
    const parsed = parseJsonResponse(getResponseText(result), 'post SEO');
    return { ...parsed, readingTime };
  } catch (error) {
    console.error('Error generating post SEO:', error);
    throw new Error('שגיאה ביצירת תוכן SEO: ' + error.message);
  }
};

/**
 * יצירת פוסט בלוג מלא מנושא + מילות מפתח/הערות
 */
export const generateFullBlogPost = async ({
  topic,
  userKeywords = '',
  userNotes = '',
  author = 'אילה',
}) => {
  try {
    const keywordsLine = Array.isArray(userKeywords)
      ? userKeywords.join(', ')
      : String(userKeywords || '').trim();

    const contentModel = genAI.getGenerativeModel(FULL_BLOG_CONTENT_CONFIG);

    const contentPrompt = `אתה כותב תוכן מקצועי לבלוג של קונדיטוריה בישראל. צור פוסט בלוג מלא בעברית, מותאם SEO ו-AIO.

${getBusinessContextPromptBlock()}

${getWritingStylePromptBlock()}

${getFullBlogSeoRulesBlock()}

בקשת המשתמש:
נושא / רעיון: ${topic}
מילות מפתח / ביטויים רצויים: ${keywordsLine || '— (בחר מתאימות לנושא)'}
הערות נוספות: ${userNotes || '—'}
מחבר: ${author}

החזר JSON בלבד עם השדות: title, summary, content, author.
- title: כותרת הפוסט (30-70 תווים)
- summary: תקציר 100-155 תווים
- content: HTML מלא לפי הכללים (800-1000 מילים)
- author: "${author}"

חשוב: content חייב להיות HTML תקין — רק <p>, <h2>, <h3>, <ul>, <ol>, <li>, <strong>, <em>. ללא קישורים וללא תמונות.`;

    const contentResult = await contentModel.generateContent(contentPrompt);
    const contentRaw = parseJsonResponse(getResponseText(contentResult), 'full blog content');

    const title = String(contentRaw.title || topic).trim();
    const summary = String(contentRaw.summary || '').trim();
    const content = sanitizeBlogContent(contentRaw.content);
    const postAuthor = String(contentRaw.author || author).trim();

    if (!content) {
      throw new Error('המודל לא החזיר תוכן לפוסט');
    }

    const seo = await generatePostSEO({
      title,
      summary,
      content,
      author: postAuthor,
      compact: true,
    });

    const readingTime = seo.readingTime || Math.ceil(countWords(content) / 200);

    return {
      title,
      summary,
      content,
      author: postAuthor,
      seoTitle: String(seo.seoTitle || title).trim(),
      metaDescription: String(seo.metaDescription || '').trim(),
      focusKeyword: String(seo.focusKeyword || '').trim(),
      secondaryKeywords: normalizeKeywordArray(seo.secondaryKeywords),
      longtailKeywords: normalizeKeywordArray(seo.longtailKeywords),
      slug: String(seo.slug || '').trim(),
      callToAction: String(seo.callToAction || '').trim(),
      tags: normalizeKeywordArray(seo.tags),
      readingTime,
    };
  } catch (error) {
    console.error('Error generating full blog post:', error);
    throw new Error('שגיאה ביצירת פוסט מלא: ' + error.message);
  }
};

/**
 * פונקציה לג'ינרוט slug באנגלית
 */
export const generateSlug = async (title) => {
  try {
    const model = genAI.getGenerativeModel({
      model: GEMINI_MODEL,
      generationConfig: { temperature: 0.2, maxOutputTokens: 64 },
    });

    const prompt = `המר את הכותרת לslug באנגלית פשוטה: קצר, מקפים במקום רווחים, ללא תווים מיוחדים, SEO friendly, מתאים לקונדיטוריה. החזר רק את הslug.
כותרת: "${title}"`;

    const result = await model.generateContent(prompt);
    const slug = getResponseText(result).trim().toLowerCase();

    return slug
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  } catch (error) {
    console.error('Error generating slug:', error);
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '-')
      .substring(0, 50);
  }
};

/**
 * Compact SEO/AIO rules for Gemini prompts — mirrors utils/seoScore.js / SEO-AIO-Scoring.md
 */
export function getFullBlogSeoRulesBlock() {
  return `כללי SEO/AIO לפוסט (חובה לעמוד בהם כדי להשיג ציון גבוה):

תוכן:
- אורך: 800–1000 מילים (מינימום 300)
- פסקת פתיחה ראשונה: 40–120 מילים, תשובה ישירה לשאלת החיפוש, כוללת את מילת המפתח המרכזית
- כותרות: 3–5 כותרות H2 ואופציונלי H3 — אסור H1 בתוך התוכן (כותרת הפוסט היא ה-H1)
- לפחות רשימה אחת (<ul> או <ol>)
- פסקאות קצרות (עד ~150 מילים לפסקה), משפטים קצרים
- אסור לכלול קישורים (<a>) בתוכן — המנהלת תוסיף ידנית
- אסור לכלול תמונות (<img>) בתוכן — תמונה ראשית נבחרת בנפרד

מילות מפתח:
- focusKeyword: ביטוי מרכזי אחד (1–4 מילים)
- secondaryKeywords: 2–4 מילים קצרות קשורות
- longtailKeywords: 2–4 ביטויי long-tail (3+ מילים)
- צפיפות מילת מפתח טבעית (~0.5%–3%), בכותרת, בתקציר, בפסקה הראשונה ובגוף

מטא-דאטה:
- title: 30–70 תווים, מזמין וברור
- seoTitle: 50–60 תווים (יכול להיות דומה ל-title)
- summary: 100–155 תווים
- metaDescription: 120–155 תווים, כולל מילת מפתח
- slug: באנגלית, מקפים, קצר, SEO-friendly

פורמט content: HTML תקין לעורך Quill — רק <p>, <h2>, <h3>, <ul>, <ol>, <li>, <strong>, <em>.`;
}

export function getPostSeoFieldsRulesBlock() {
  return `כללי SEO: seoTitle 50–60 תווים, metaDescription 120–155 תווים, slug באנגלית, secondaryKeywords קצרות, longtailKeywords ביטויים ארוכים.`;
}

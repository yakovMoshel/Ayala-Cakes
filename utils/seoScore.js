// Pure client-side SEO/AIO scoring for blog posts (Hebrew-aware).
// Returns the exact state shapes consumed by Components/AddPostForm:
//   { analysis, scores: { overall, keyword, content, metadata, ux }, recommendations }

export const SEO_GUIDELINES = {
  title: { min: 30, max: 70, optimal: 55 },
  seoTitle: { min: 30, max: 70, optimal: 55 },
  metaDescription: { min: 120, max: 155, optimal: 145 },
  content: { min: 300, max: null, optimal: 900 }, // words
  summary: { min: 100, max: 155, optimal: 130 },
  focusKeyword: { min: 1, max: 4, optimal: 2 }, // words
  headings: { min: 2, max: null, optimal: 4 },
  internalLinks: { min: 2, max: null, optimal: 4 },
  externalLinks: { min: 1, max: null, optimal: 2 },
  paragraphLength: { max: 150 }, // words per paragraph
  sentenceLength: { max: 25 }, // words per sentence
  keywordDensity: { min: 0.5, max: 3.0, optimal: 1.5 }, // percent
  directAnswer: { minWords: 40, maxWords: 120 }, // opening paragraph
};

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function stripHtml(html) {
  return (html || '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;|&amp;|&lt;|&gt;|&quot;|&#39;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function wordCount(text) {
  return text ? text.split(/\s+/).filter(Boolean).length : 0;
}

// JS \b never matches around Hebrew letters (they are not \w), so we use
// Unicode letter/number lookarounds instead. Attached Hebrew prefixes
// (ו/ב/ל/מ/ש/כ/ה, e.g. "לעוגת בנטו") still count as a match.
function countKeyword(text, keyword) {
  if (!text || !keyword) return 0;
  const esc = escapeRegex(keyword.trim().toLowerCase());
  try {
    const re = new RegExp(
      `(?<![\\p{L}\\p{N}])[ובלמשכה]{0,2}${esc}(?![\\p{L}\\p{N}])`,
      'gu'
    );
    return (text.toLowerCase().match(re) || []).length;
  } catch {
    // Very old engines without lookbehind: naive substring count
    return text.toLowerCase().split(keyword.trim().toLowerCase()).length - 1;
  }
}

function includesKeyword(text, keyword) {
  if (!text || !keyword) return false;
  return text.toLowerCase().includes(keyword.trim().toLowerCase());
}

function lengthStatus(field, value) {
  const guideline = SEO_GUIDELINES[field];
  if (!guideline) return { status: 'neutral', message: '' };

  const isWordCountField = field === 'focusKeyword' || field === 'content';
  const text = field === 'content' ? stripHtml(value) : value || '';
  const actualLength = isWordCountField ? wordCount(text) : text.length;
  const unit = isWordCountField ? 'מילים' : 'תווים';

  if (actualLength === 0) {
    return { status: 'pending', message: 'לא הוזן תוכן' };
  }
  if (actualLength < guideline.min) {
    return { status: 'bad', message: `קצר מדי (${actualLength} ${unit}, מינימום ${guideline.min})` };
  }
  if (guideline.max && actualLength > guideline.max) {
    return { status: 'warning', message: `ארוך מדי (${actualLength} ${unit}, מקסימום ${guideline.max})` };
  }
  if (Math.abs(actualLength - guideline.optimal) <= guideline.optimal * 0.1) {
    return { status: 'good', message: `אורך אופטימלי (${actualLength} ${unit})` };
  }
  return { status: 'ok', message: `אורך טוב (${actualLength} ${unit})` };
}

// First paragraph with real text (skips empty Quill artifacts like <p><br></p>)
function firstParagraphText(content) {
  const blocks = (content || '').match(/<p[^>]*>[\s\S]*?<\/p>/g) || [];
  for (const block of blocks) {
    const text = stripHtml(block);
    if (text) return text;
  }
  return stripHtml(content).split(/\s+/).slice(0, 60).join(' ');
}

export function analyzePost(formData) {
  const {
    title = '',
    seoTitle = '',
    metaDescription = '',
    content = '',
    summary = '',
    focusKeyword = '',
    slug = '',
    image = '',
    socialImage = '',
  } = formData;

  const plainText = stripHtml(content);
  const totalWords = wordCount(plainText);

  // ---- Field lengths -------------------------------------------------------
  const titleLength = lengthStatus('title', title);
  const seoTitleLength = lengthStatus('seoTitle', seoTitle || title);
  const descriptionLength = lengthStatus('metaDescription', metaDescription);
  const contentLength = lengthStatus('content', content);
  const summaryLength = lengthStatus('summary', summary);
  const focusKeywordCount = lengthStatus('focusKeyword', focusKeyword);

  // ---- Keyword signals -----------------------------------------------------
  const keywordOccurrences = countKeyword(plainText, focusKeyword);
  const keywordDensity = totalWords > 0 ? (keywordOccurrences / totalWords) * 100 : 0;
  const keywordInTitle = includesKeyword(title, focusKeyword);
  const keywordInDescription = includesKeyword(metaDescription, focusKeyword);
  const keywordInContent = keywordOccurrences > 0 || includesKeyword(plainText, focusKeyword);
  const firstParagraph = firstParagraphText(content);
  const keywordInFirstParagraph = includesKeyword(firstParagraph, focusKeyword);
  const urlSlugOptimal = Boolean(
    slug && focusKeyword &&
    slug.toLowerCase().includes(focusKeyword.trim().toLowerCase().replace(/\s+/g, '-'))
  );

  const { min: dMin, max: dMax } = SEO_GUIDELINES.keywordDensity;
  const densityInRange = keywordDensity >= dMin && keywordDensity <= dMax;
  const keywordDensityStatus = !focusKeyword
    ? { status: 'pending', message: 'הוסף מילת מפתח להערכה' }
    : keywordOccurrences === 0
      ? { status: 'bad', message: 'מילת המפתח לא נמצאה בתוכן — שלבי אותה באופן טבעי' }
      : keywordDensity < dMin
        ? { status: 'warning', message: `צפיפות מילת מפתח נמוכה (${keywordDensity.toFixed(1)}%) — שלבי אותה עוד כמה פעמים` }
        : keywordDensity > dMax
          ? { status: 'warning', message: `צפיפות מילת מפתח גבוהה מדי (${keywordDensity.toFixed(1)}%) — הורידי חזרות` }
          : { status: 'good', message: `צפיפות מילת מפתח אופטימלית (${keywordDensity.toFixed(1)}%)` };

  // Stuffing: over-density, or the keyword repeated inside title / meta description
  const keywordInTitleCount = countKeyword(title, focusKeyword);
  const keywordInDescCount = countKeyword(metaDescription, focusKeyword);
  const isStuffing = Boolean(
    focusKeyword && (keywordDensity > dMax || keywordInTitleCount >= 2 || keywordInDescCount >= 2)
  );
  const keywordStuffing = !focusKeyword
    ? { status: 'pending', message: 'הוסף מילת מפתח להערכה' }
    : isStuffing
      ? { status: 'bad', message: 'זוהתה דחיסת מילות מפתח — הפחיתי חזרות בכותרת, בתיאור ובתוכן' }
      : { status: 'good', message: 'אין דחיסת מילות מפתח' };

  // ---- Structure -----------------------------------------------------------
  const h1Count = (content.match(/<h1[\s>]/g) || []).length;
  const h2Count = (content.match(/<h2[\s>]/g) || []).length;
  const h3Count = (content.match(/<h3[\s>]/g) || []).length;
  const totalHeadings = h2Count + h3Count;
  const headingHierarchyOk = !(h3Count > 0 && h2Count === 0);

  const headings = totalHeadings < SEO_GUIDELINES.headings.min
    ? { status: 'warning', message: `יש להוסיף כותרות משנה (יש ${totalHeadings}, מומלץ לפחות ${SEO_GUIDELINES.headings.min})` }
    : !headingHierarchyOk
      ? { status: 'warning', message: 'יש H3 ללא H2 — שמרי על היררכיית כותרות תקינה' }
      : { status: 'good', message: `מבנה כותרות תקין (${h2Count} H2, ${h3Count} H3)` };

  const h1InContent = h1Count > 0
    ? { status: 'bad', message: `הסירי ${h1Count === 1 ? 'כותרת H1' : `${h1Count} כותרות H1`} מהתוכן — כותרת הפוסט היא ה-H1 של העמוד` }
    : { status: 'good', message: 'אין H1 כפול בתוכן' };

  const headingTexts = (content.match(/<h[23][^>]*>[\s\S]*?<\/h[23]>/g) || []).map(stripHtml);
  const questionHeadingCount = headingTexts.filter((t) => t.includes('?')).length;
  const questionHeadings = totalHeadings === 0
    ? { status: 'neutral', message: 'אין כותרות משנה לבדיקה' }
    : questionHeadingCount > 0
      ? { status: 'good', message: `${questionHeadingCount} כותרות בניסוח שאלה — מצוין למנועי AI ולמקטעים מומלצים` }
      : { status: 'info', message: 'שקלי לנסח כותרת משנה אחת כשאלה (משפר חילוץ ע"י מנועי AI)' };

  // ---- AIO: direct answer + scannability -----------------------------------
  const fpWords = wordCount(firstParagraph);
  const { minWords, maxWords } = SEO_GUIDELINES.directAnswer;
  const directAnswerOk =
    fpWords >= minWords && fpWords <= maxWords && (!focusKeyword || keywordInFirstParagraph);
  const directAnswer = fpWords === 0
    ? { status: 'pending', message: 'אין פסקת פתיחה לבדיקה' }
    : directAnswerOk
      ? { status: 'good', message: 'פסקת הפתיחה מספקת תשובה ישירה — מעולה ל-Google ולמנועי AI' }
      : {
          status: 'warning',
          message: `פסקת הפתיחה צריכה לענות ישירות על שאלת החיפוש: ${minWords}-${maxWords} מילים (יש ${fpWords})${focusKeyword && !keywordInFirstParagraph ? ', ולכלול את מילת המפתח' : ''}`,
        };

  const hasList = /<[ou]l[\s>]/.test(content);
  const lists = hasList
    ? { status: 'good', message: 'התוכן כולל רשימה — טוב לסריקה ע"י משתמשים ומנועי AI' }
    : { status: 'warning', message: 'הוסיפי רשימת נקודות או רשימה ממוספרת — תוכן מובנה נסרק היטב ע"י מנועי AI' };

  // ---- Links (internal vs external) ----------------------------------------
  const linkHrefs = [...(content || '').matchAll(/<a[^>]+href="([^"]*)"/g)].map((m) => m[1]);
  const internalCount = linkHrefs.filter(
    (h) => h.startsWith('/') || h.includes('ayacakes.biz')
  ).length;
  const externalCount = linkHrefs.length - internalCount;

  const internalLinks = internalCount >= SEO_GUIDELINES.internalLinks.min
    ? { status: 'good', message: `קישורים פנימיים: ${internalCount}` }
    : { status: 'warning', message: `הוסיפי קישורים פנימיים לחנות או לפוסטים (יש ${internalCount}, מומלץ ${SEO_GUIDELINES.internalLinks.min}+)` };

  const externalLinks = externalCount >= SEO_GUIDELINES.externalLinks.min
    ? { status: 'good', message: `קישורים חיצוניים: ${externalCount}` }
    : { status: 'info', message: 'שקלי להוסיף קישור חיצוני למקור סמכותי' };

  const links = linkHrefs.length === 0
    ? { status: 'warning', message: 'אין קישורים בתוכן' }
    : { status: 'good', message: `סה"כ קישורים: ${linkHrefs.length} (${internalCount} פנימיים, ${externalCount} חיצוניים)` };

  // ---- Readability ----------------------------------------------------------
  const paragraphTexts = ((content || '').match(/<p[^>]*>[\s\S]*?<\/p>/g) || [])
    .map(stripHtml)
    .filter(Boolean);
  const paragraphCount = paragraphTexts.length;
  const longParagraphs = paragraphTexts.filter(
    (p) => wordCount(p) > SEO_GUIDELINES.paragraphLength.max
  );
  const paragraphLength = paragraphCount === 0
    ? { status: 'pending', message: 'לא הוזן תוכן' }
    : longParagraphs.length > 0
      ? { status: 'warning', message: `${longParagraphs.length} פסקאות ארוכות מדי (מעל ${SEO_GUIDELINES.paragraphLength.max} מילים) — פצלי אותן` }
      : { status: 'good', message: 'אורך הפסקאות טוב לקריאות' };

  const sentences = plainText.split(/[.!?]+/).map((s) => s.trim()).filter(Boolean);
  const longSentences = sentences.filter(
    (s) => wordCount(s) > SEO_GUIDELINES.sentenceLength.max
  );
  const sentenceLength = sentences.length === 0
    ? { status: 'pending', message: 'לא הוזן תוכן' }
    : longSentences.length > sentences.length * 0.2
      ? { status: 'warning', message: `יותר מדי משפטים ארוכים (${longSentences.length}/${sentences.length}) — קצרי מתחת ל-${SEO_GUIDELINES.sentenceLength.max} מילים` }
      : { status: 'good', message: 'אורך המשפטים טוב לקריאות' };

  // ---- Media -----------------------------------------------------------------
  const imagesCount = ((content || '').match(/<img/g) || []).length;
  const hasImages = imagesCount > 0;
  const imagesWithAlt = ((content || '').match(/alt="[^"]+"/g) || []).length;
  const allImagesHaveAlt = imagesCount === 0 || imagesWithAlt >= imagesCount;

  const images = image
    ? { status: 'good', message: 'תמונה ראשית קיימת' }
    : { status: 'warning', message: 'חסרה תמונה ראשית' };
  const imageAlt = hasImages && !allImagesHaveAlt
    ? { status: 'warning', message: `לא לכל התמונות בתוכן יש טקסט חלופי (${imagesWithAlt}/${imagesCount})` }
    : hasImages
      ? { status: 'good', message: 'כל התמונות כוללות טקסט חלופי' }
      : { status: 'neutral', message: 'אין תמונות בתוכן' };
  const socialImageStatus = socialImage
    ? { status: 'good', message: 'תמונה לרשתות חברתיות קיימת' }
    : { status: 'warning', message: 'חסרה תמונה לרשתות חברתיות' };

  // ---- Scores ---------------------------------------------------------------
  let keywordScore = 0;
  if (keywordInTitle) keywordScore += 20;
  if (keywordInDescription) keywordScore += 15;
  if (keywordInContent) keywordScore += 10;
  if (keywordInFirstParagraph) keywordScore += 15;
  if (urlSlugOptimal) keywordScore += 10;
  if (densityInRange) keywordScore += 30;
  if (isStuffing) keywordScore -= 25; // active penalty, not just a warning
  keywordScore = Math.max(0, Math.min(100, keywordScore));

  let contentScore = 0;
  if (contentLength.status === 'good') contentScore += 20;
  else if (contentLength.status === 'ok') contentScore += 12;
  if (totalHeadings >= SEO_GUIDELINES.headings.min && headingHierarchyOk) contentScore += 10;
  if (h1Count === 0) contentScore += 5;
  if (directAnswerOk) contentScore += 15;
  if (hasList) contentScore += 10;
  if (hasImages) contentScore += 10;
  if (allImagesHaveAlt) contentScore += 10;
  if (internalCount >= SEO_GUIDELINES.internalLinks.min) contentScore += 10;
  if (externalCount >= SEO_GUIDELINES.externalLinks.min) contentScore += 5;
  if (paragraphCount >= 3) contentScore += 5;
  contentScore = Math.min(100, contentScore);

  let metadataScore = 0;
  if (titleLength.status === 'good') metadataScore += 20;
  else if (titleLength.status === 'ok') metadataScore += 15;
  if (descriptionLength.status === 'good') metadataScore += 20;
  else if (descriptionLength.status === 'ok') metadataScore += 15;
  if (slug) metadataScore += 20;
  if (image) metadataScore += 20;
  if (socialImage) metadataScore += 20;
  metadataScore = Math.min(100, metadataScore);

  let uxScore = 0;
  if (summaryLength.status === 'good' || summaryLength.status === 'ok') uxScore += 30;
  if (sentences.length > 0 && longSentences.length <= sentences.length * 0.1) uxScore += 25;
  if (paragraphCount >= 5) uxScore += 20;
  if (paragraphCount > 0 && longParagraphs.length === 0) uxScore += 25;
  uxScore = Math.min(100, uxScore);

  const overall = Math.round(
    keywordScore * 0.25 + contentScore * 0.3 + metadataScore * 0.25 + uxScore * 0.2
  );

  // ---- Prioritized recommendations (impact = sub-points × category weight) ----
  const candidates = [
    { failed: isStuffing, status: 'bad', message: keywordStuffing.message, impact: 6.25 },
    { failed: Boolean(focusKeyword) && !densityInRange && !isStuffing, status: 'warning', message: keywordDensityStatus.message, impact: 7.5 },
    { failed: contentLength.status === 'bad', status: 'bad', message: `התוכן קצר מדי — הרחיבי לפחות ל-${SEO_GUIDELINES.content.min} מילים`, impact: 6 },
    { failed: Boolean(focusKeyword) && !keywordInTitle, status: 'bad', message: 'הוסיפי את מילת המפתח לכותרת הפוסט', impact: 5 },
    { failed: descriptionLength.status === 'bad' || descriptionLength.status === 'pending', status: 'warning', message: `כתבי Meta Description באורך ${SEO_GUIDELINES.metaDescription.min}-${SEO_GUIDELINES.metaDescription.max} תווים`, impact: 5 },
    { failed: descriptionLength.status === 'warning', status: 'warning', message: descriptionLength.message ? `Meta Description ${descriptionLength.message}` : `קצרי את ה-Meta Description מתחת ל-${SEO_GUIDELINES.metaDescription.max} תווים`, impact: 5 },
    { failed: !image, status: 'warning', message: 'הוסיפי תמונה ראשית לפוסט', impact: 5 },
    { failed: !socialImage, status: 'warning', message: 'הוסיפי תמונה לשיתוף ברשתות חברתיות', impact: 5 },
    { failed: fpWords > 0 && !directAnswerOk, status: 'warning', message: directAnswer.message, impact: 4.5 },
    { failed: h1Count > 0, status: 'bad', message: h1InContent.message, impact: 4 },
    { failed: Boolean(focusKeyword) && !keywordInFirstParagraph, status: 'bad', message: 'שלבי את מילת המפתח בפסקה הראשונה', impact: 3.75 },
    { failed: Boolean(focusKeyword) && !keywordInDescription, status: 'warning', message: 'שלבי את מילת המפתח ב-Meta Description', impact: 3.75 },
    { failed: totalHeadings < SEO_GUIDELINES.headings.min, status: 'warning', message: `הוסיפי כותרות משנה (H2) לחלוקת התוכן — יש ${totalHeadings}, מומלץ ${SEO_GUIDELINES.headings.min}+`, impact: 3 },
    { failed: !hasList, status: 'warning', message: lists.message, impact: 3 },
    { failed: internalCount < SEO_GUIDELINES.internalLinks.min, status: 'warning', message: internalLinks.message, impact: 3 },
    { failed: hasImages && !allImagesHaveAlt, status: 'warning', message: imageAlt.message, impact: 3 },
    { failed: paragraphCount > 0 && longParagraphs.length > 0, status: 'warning', message: paragraphLength.message, impact: 5 },
  ];

  const recommendations = candidates
    .filter((c) => c.failed)
    .sort((a, b) => b.impact - a.impact)
    .slice(0, 5)
    .map(({ status, message }) => ({ status, message }));

  const analysis = {
    keywordDensity,
    keywordDensityStatus,
    keywordStuffing,
    keywordInTitle,
    keywordInDescription,
    keywordInContent,
    keywordInFirstParagraph,
    urlSlugOptimal,
    titleLength,
    seoTitleLength,
    descriptionLength,
    contentLength,
    summaryLength,
    focusKeywordCount,
    headings,
    h1InContent,
    questionHeadings,
    directAnswer,
    lists,
    images,
    imageAlt,
    links,
    internalLinks,
    externalLinks,
    sentenceLength,
    paragraphLength,
    socialImage: socialImageStatus,
    mobileOptimization: { status: 'info', message: 'יש לבדוק תאימות למובייל ומהירות טעינה' },
  };

  return {
    analysis,
    scores: {
      overall,
      keyword: keywordScore,
      content: contentScore,
      metadata: metadataScore,
      ux: uxScore,
    },
    recommendations,
  };
}

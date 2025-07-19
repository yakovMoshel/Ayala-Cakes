/**
 * פונקציה ליצירת slug מטקסט עברי
 * @param {string} text - הטקסט ליצירת slug 
 * @returns {string} - slug נקי
 */
export function createSlugFromHebrew(text) {
  if (!text) return '';
  
  // מיפוי אותיות עברית לאנגלית
  const hebrewToEnglish = {
    'א': 'a', 'ב': 'b', 'ג': 'g', 'ד': 'd', 'ה': 'h', 'ו': 'v', 'ז': 'z',
    'ח': 'ch', 'ט': 't', 'י': 'y', 'כ': 'k', 'ך': 'k', 'ל': 'l', 'מ': 'm',
    'ם': 'm', 'נ': 'n', 'ן': 'n', 'ס': 's', 'ע': 'a', 'פ': 'p', 'ף': 'p',
    'צ': 'tz', 'ץ': 'tz', 'ק': 'k', 'ר': 'r', 'ש': 'sh', 'ת': 't'
  };

  return text
    .toLowerCase()
    // החלפת אותיות עברית באנגלית
    .split('')
    .map(char => hebrewToEnglish[char] || char)
    .join('')
    // הסרת רווחים וסימני פיסוק
    .replace(/[^\w\s-]/g, '')
    // החלפת רווחים במינוס
    .replace(/\s+/g, '-')
    // הסרת מינוסים מרובים
    .replace(/-+/g, '-')
    // הסרת מינוסים מההתחלה והסוף
    .replace(/^-|-$/g, '');
}

/**
 * פונקציה לווידוא ייחודיות של slug
 * @param {string} baseSlug - ה-slug הבסיסי
 * @param {Function} checkExists - פונקציה לבדיקת קיום slug
 * @returns {Promise<string>} - slug ייחודי
 */
export async function ensureUniqueSlug(baseSlug, checkExists) {
  let slug = baseSlug;
  let counter = 1;
  
  while (await checkExists(slug)) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }
  
  return slug;
} 
/**
 * Normalize a document that has a populated (or raw) categoryId ref
 * so clients always get:
 *   - categoryId: string id
 *   - category: display name (prop name unchanged for filters/UI)
 */
export function withCategoryFields(doc, refKey = 'categoryId') {
  if (!doc) return doc;

  const raw = doc[refKey];
  let categoryId = '';
  let category = typeof doc.category === 'string' ? doc.category : '';

  if (raw && typeof raw === 'object' && !Array.isArray(raw)) {
    categoryId = raw._id != null ? String(raw._id) : '';
    if (raw.name) category = raw.name;
  } else if (raw != null && raw !== '') {
    categoryId = String(raw);
  }

  return {
    ...doc,
    categoryId,
    category,
  };
}

export function withCategoryFieldsList(docs, refKey = 'categoryId') {
  if (!Array.isArray(docs)) return [];
  return docs.map((doc) => withCategoryFields(doc, refKey));
}

/**
 * Build a Map of category id → category doc for O(1) lookups.
 */
export function buildCategoryByIdMap(categories = []) {
  const map = new Map();
  for (const cat of categories || []) {
    if (cat?._id != null) map.set(String(cat._id), cat);
  }
  return map;
}

/**
 * Prepare write payload: keep categoryId, drop legacy `category` string.
 * Empty string becomes null (optional refs).
 */
export function normalizeCategoryIdWrite(data) {
  if (!data || typeof data !== 'object') return data;
  const { category, categoryId, ...rest } = data;
  if (categoryId === undefined && category === undefined) return rest;

  const raw = categoryId !== undefined ? categoryId : category;
  if (raw == null || raw === '') {
    return { ...rest, categoryId: null };
  }
  return { ...rest, categoryId: String(raw) };
}

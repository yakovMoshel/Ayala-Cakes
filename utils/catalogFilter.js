/**
 * Shared chip + search filtering for shop/blog catalog UIs.
 */

/**
 * Category names that are actually used by at least one item.
 * Empty categories are omitted from the filter bar.
 *
 * @param {{ _id?: string, name?: string }[]} categories
 * @param {{ categoryId?: string | { _id?: string }, category?: string }[]} items
 * @returns {string[]}
 */
export function getUsedCategoryNames(categories = [], items = []) {
  const byId = new Map(
    (categories || [])
      .filter((cat) => cat && cat._id && cat.name)
      .map((cat) => [String(cat._id), String(cat.name).trim()])
  );

  const used = new Set();
  for (const item of items || []) {
    if (!item) continue;
    const id =
      item.categoryId && typeof item.categoryId === 'object'
        ? item.categoryId._id
        : item.categoryId;
    const fromId = id ? byId.get(String(id)) : '';
    if (fromId) {
      used.add(fromId);
      continue;
    }
    if (typeof item.category === 'string' && item.category.trim()) {
      used.add(item.category.trim());
    }
  }

  return [...used];
}

/**
 * @param {string[]} values
 * @returns {{ label: string, value: string, icon: null }[]}
 */
export function buildFilterChips(values) {
  const unique = [
    ...new Set(
      (values || [])
        .map((v) => (typeof v === 'string' ? v.trim() : ''))
        .filter(Boolean)
    ),
  ].sort((a, b) => a.localeCompare(b, 'he'));

  return [
    { label: 'הכל', icon: null, value: '' },
    ...unique.map((value) => ({ label: value, icon: null, value })),
  ];
}

/**
 * @template T
 * @param {T[]} items
 * @param {{
 *   chip: string,
 *   searchTerm: string,
 *   matchesChip: (item: T, chip: string) => boolean,
 *   matchesSearch: (item: T, term: string) => boolean,
 * }} options
 * @returns {T[]}
 */
export function filterByChipAndSearch(items, { chip, searchTerm, matchesChip, matchesSearch }) {
  const term = (searchTerm || '').trim().toLowerCase();
  const list = Array.isArray(items) ? items : [];

  return list.filter((item) => {
    if (chip && !matchesChip(item, chip)) return false;
    if (term && !matchesSearch(item, term)) return false;
    return true;
  });
}

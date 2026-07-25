/**
 * Shared chip + search filtering for shop/blog catalog UIs.
 */

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

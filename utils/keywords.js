export function normalizeKeywordsList(value) {
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean);
  }
  if (typeof value === 'string' && value.trim()) {
    return value.split(',').map((item) => item.trim()).filter(Boolean);
  }
  return [];
}

export function addKeywordToList(list, rawKeyword) {
  const keyword = String(rawKeyword || '').trim();
  if (!keyword) return list;

  const exists = list.some(
    (item) => item.toLowerCase() === keyword.toLowerCase()
  );
  if (exists) return list;

  return [...list, keyword];
}

export function removeKeywordFromList(list, index) {
  return list.filter((_, i) => i !== index);
}

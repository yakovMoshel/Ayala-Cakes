export async function duplicateSlugMessage(model, slug, excludeId) {
  if (!slug || !model) return '';
  const query = excludeId ? { slug, _id: { $ne: excludeId } } : { slug };
  const existing = await model.exists(query);
  return existing ? 'הכתובת כבר בשימוש. בחרו כתובת אחרת.' : '';
}

export function fieldsErrorResponse(fields) {
  const message = Object.values(fields)[0] || 'יש לתקן את השדות המסומנים.';
  return { success: false, error: message, fields };
}

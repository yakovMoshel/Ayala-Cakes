import {
  normalizeTypedSlug,
  validateSlug,
  parseDimensionField,
  resolveImageAlts,
  validateImageAltsForPublish,
} from '@/utils/adminContentRules';

export function applyProductWrite(data, { publishing, isCreate }) {
  const fields = {};
  if (typeof data.slug === 'string' || isCreate) {
    data.slug = normalizeTypedSlug(data.slug);
    if (data.slug) {
      const slugError = validateSlug(data.slug);
      if (slugError) fields.slug = slugError;
    } else if (!isCreate) {
      fields.slug = 'יש להזין כתובת.';
    }
  }

  for (const key of ['diameter', 'height']) {
    if (!Object.prototype.hasOwnProperty.call(data, key)) continue;
    const parsed = parseDimensionField(data[key]);
    if (parsed.error) fields[key] = parsed.error;
    else data[key] = parsed.value;
  }

  if (Array.isArray(data.images)) {
    data.imageAlts = resolveImageAlts(data.images, data.imageAlts, data.altText);
    if (publishing) Object.assign(fields, validateImageAltsForPublish(data.imageAlts));
  }

  return fields;
}

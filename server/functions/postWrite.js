import {
  EMBEDDED_IMAGE_ERROR,
  hasEmbeddedDataImage,
  normalizeTypedSlug,
  slugFromTitle,
  validateSlug,
} from '@/utils/adminContentRules';

export function applyPostWrite(data, { isCreate }) {
  const fields = {};
  const slugWasSent = typeof data.slug === 'string' || isCreate;
  if (slugWasSent) {
    const typed = normalizeTypedSlug(data.slug);
    data.slug = typed || (isCreate ? slugFromTitle(data.title) : '');
    data.slugGenerated = !typed && Boolean(data.slug);
    if (data.slug) {
      const slugError = validateSlug(data.slug);
      if (slugError) fields.slug = slugError;
    } else if (typed === '' && (isCreate || slugWasSent)) {
      fields.slug = 'יש להזין כתובת.';
    }
  }

  if (hasEmbeddedDataImage(data.content)) {
    fields.content = EMBEDDED_IMAGE_ERROR;
  }

  return fields;
}

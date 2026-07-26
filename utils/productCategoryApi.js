import { NextResponse } from 'next/server';

const NAME_MAX = 80;
const SLUG_MAX = 80;
const DESC_MAX = 500;
const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/i;

/**
 * Validates product-category write payloads (includes required image).
 */
export function parseProductCategoryBody(body) {
  if (!body || typeof body !== 'object') {
    return {
      ok: false,
      response: NextResponse.json(
        { success: false, error: 'Invalid request body' },
        { status: 400 }
      ),
    };
  }

  const name = typeof body.name === 'string' ? body.name.trim() : '';
  const slug = typeof body.slug === 'string' ? body.slug.trim() : '';
  const description =
    typeof body.description === 'string' ? body.description.trim() : '';
  const image = typeof body.image === 'string' ? body.image.trim() : '';

  if (!name || !slug || !image) {
    return {
      ok: false,
      response: NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      ),
    };
  }

  if (
    name.length > NAME_MAX ||
    slug.length > SLUG_MAX ||
    description.length > DESC_MAX
  ) {
    return {
      ok: false,
      response: NextResponse.json(
        { success: false, error: 'Invalid field length' },
        { status: 400 }
      ),
    };
  }

  if (!SLUG_PATTERN.test(slug)) {
    return {
      ok: false,
      response: NextResponse.json(
        { success: false, error: 'Invalid slug format' },
        { status: 400 }
      ),
    };
  }

  return {
    ok: true,
    data: { name, slug, description, image },
  };
}

export function categoryErrorResponse(error, context = 'category') {
  console.error(`[${context}]`, error?.code || error?.name, error?.message);

  if (error?.code === 'CATEGORY_IN_USE') {
    return NextResponse.json(
      {
        success: false,
        error: `Cannot delete: ${error.count} product(s) still use this category`,
      },
      { status: 409 }
    );
  }

  if (error?.code === 11000) {
    return NextResponse.json(
      { success: false, error: 'Category name or slug already exists' },
      { status: 409 }
    );
  }

  if (error?.name === 'CastError' || error?.name === 'ValidationError') {
    return NextResponse.json(
      { success: false, error: 'Invalid request' },
      { status: 400 }
    );
  }

  return NextResponse.json(
    { success: false, error: 'Request failed' },
    { status: 500 }
  );
}

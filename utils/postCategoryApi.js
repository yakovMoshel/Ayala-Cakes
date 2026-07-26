import mongoose from 'mongoose';
import { NextResponse } from 'next/server';

const NAME_MAX = 80;
const SLUG_MAX = 80;
const DESC_MAX = 500;
const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/i;

/**
 * Validates and normalizes post-category write payloads.
 * @returns {{ ok: true, data } | { ok: false, response: NextResponse }}
 */
export function parsePostCategoryBody(body) {
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

  if (!name || !slug) {
    return {
      ok: false,
      response: NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      ),
    };
  }

  if (name.length > NAME_MAX || slug.length > SLUG_MAX || description.length > DESC_MAX) {
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
    data: { name, slug, description },
  };
}

export function isValidObjectId(id) {
  return typeof id === 'string' && mongoose.Types.ObjectId.isValid(id);
}

/**
 * Maps known DB errors to safe client responses; logs the rest.
 */
export function postCategoryErrorResponse(error, context = 'post-category') {
  console.error(`[${context}]`, error?.code || error?.name, error?.message);

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

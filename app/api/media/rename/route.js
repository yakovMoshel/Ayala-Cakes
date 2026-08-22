import { NextResponse } from 'next/server';
import cloudinary from '@/utils/cloudinary';
import { verifyAdminSession } from '@/server/functions/verifyAdminSession';
import {
  buildPublicIdFromBasename,
  getPublicIdBasename,
  sanitizePublicIdBasename,
} from '@/utils/cloudinaryPublicId';

export async function POST(req) {
  const auth = await verifyAdminSession();
  if (!auth.ok) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: auth.status });
  }

  try {
    const body = await req.json();
    const publicId = String(body.public_id || '').trim();
    const newBasename = String(body.new_basename || body.new_public_id || '').trim();

    if (!publicId || !newBasename) {
      return NextResponse.json({ error: 'Missing public_id or new name' }, { status: 400 });
    }

    const sanitizedBasename = sanitizePublicIdBasename(newBasename);
    if (!sanitizedBasename) {
      return NextResponse.json({ error: 'Invalid file name' }, { status: 400 });
    }

    const newPublicId = buildPublicIdFromBasename(publicId, sanitizedBasename);
    if (!newPublicId) {
      return NextResponse.json({ error: 'Invalid file name' }, { status: 400 });
    }

    if (getPublicIdBasename(publicId) === sanitizedBasename) {
      return NextResponse.json({
        success: true,
        public_id: publicId,
        secure_url: body.secure_url || null,
        unchanged: true,
      });
    }

    const result = await cloudinary.uploader.rename(publicId, newPublicId, {
      overwrite: false,
      invalidate: true,
    });

    return NextResponse.json({
      success: true,
      public_id: result.public_id,
      secure_url: result.secure_url,
    });
  } catch (error) {
    console.error('Cloudinary rename error:', error);
    const message = error?.http_code === 409 ? 'Name already in use' : 'Failed to rename file';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

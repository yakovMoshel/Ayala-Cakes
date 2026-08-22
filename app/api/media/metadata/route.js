import { NextResponse } from 'next/server';
import cloudinary from '@/utils/cloudinary';
import { verifyAdminSession } from '@/server/functions/verifyAdminSession';
import { buildCloudinaryContext } from '@/utils/cloudinaryContext';

export async function POST(req) {
  const auth = await verifyAdminSession();
  if (!auth.ok) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: auth.status });
  }

  try {
    const body = await req.json();
    const publicId = String(body.public_id || '').trim();
    const alt = String(body.alt || '').trim();

    if (!publicId) {
      return NextResponse.json({ error: 'Missing public_id' }, { status: 400 });
    }

    const context = buildCloudinaryContext(alt);
    await cloudinary.uploader.explicit(publicId, {
      type: 'upload',
      context: context || '',
    });

    return NextResponse.json({ success: true, public_id: publicId, alt });
  } catch (error) {
    console.error('Cloudinary metadata error:', error);
    return NextResponse.json({ error: 'Failed to update image metadata' }, { status: 500 });
  }
}

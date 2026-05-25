import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { randomUUID } from 'crypto';
import { connectToMongo } from '@/server/DL/connectToMongo';
import { postModel } from '@/server/DL/Models/postModel';
import { postViewModel } from '@/server/DL/Models/postViewModel';
import { productModel } from '@/server/DL/Models/productModel';
import { productViewModel } from '@/server/DL/Models/productViewModel';

const VISITOR_COOKIE = 'visitor_id';
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

async function getVisitorId() {
  const jar = await cookies();
  let visitorId = jar.get(VISITOR_COOKIE)?.value;
  if (!visitorId) {
    visitorId = randomUUID();
  }
  return visitorId;
}

function setVisitorCookie(response, visitorId) {
  response.cookies.set(VISITOR_COOKIE, visitorId, {
    maxAge: COOKIE_MAX_AGE,
    path: '/',
    sameSite: 'lax',
    httpOnly: true,
  });
}

export async function POST(req) {
  try {
    const { slug, type = 'post' } = await req.json();
    if (!slug) {
      return NextResponse.json({ success: false, error: 'slug is required' }, { status: 400 });
    }

    await connectToMongo();
    const visitorId = await getVisitorId();

    if (type === 'product') {
      const product = await productModel
        .findOne({ slug, isActive: true })
        .select('_id')
        .lean();
      if (!product) {
        return NextResponse.json({ success: false, error: 'Product not found' }, { status: 404 });
      }

      await productModel.findByIdAndUpdate(product._id, { $inc: { views: 1 } });

      const existing = await productViewModel.findOne({
        productId: product._id,
        visitorId,
      });

      if (existing) {
        existing.lastViewedAt = new Date();
        await existing.save();
      } else {
        await productViewModel.create({ productId: product._id, visitorId });
      }
    } else {
      const post = await postModel
        .findOne({ slug, status: 'published' })
        .select('_id')
        .lean();
      if (!post) {
        return NextResponse.json({ success: false, error: 'Post not found' }, { status: 404 });
      }

      await postModel.findByIdAndUpdate(post._id, { $inc: { views: 1 } });

      const existing = await postViewModel.findOne({
        postId: post._id,
        visitorId,
      });

      if (existing) {
        existing.lastViewedAt = new Date();
        await existing.save();
      } else {
        await postViewModel.create({ postId: post._id, visitorId });
      }
    }

    const response = NextResponse.json({ success: true });
    setVisitorCookie(response, visitorId);
    return response;
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to record view' },
      { status: 500 }
    );
  }
}

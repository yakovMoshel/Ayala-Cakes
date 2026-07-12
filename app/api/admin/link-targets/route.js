import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { connectToMongo } from '@/server/DL/connectToMongo';
import { postModel } from '@/server/DL/Models/postModel';
import { productModel } from '@/server/DL/Models/productModel';
import { verifyAdminSession } from '@/server/functions/verifyAdminSession';
import { getStaticPages } from '@/utils/siteLinks';

function matchesQuery(item, query) {
  if (!query) return true;
  const q = query.toLowerCase();
  const haystack = [item.title, item.subtitle, item.url, item.status]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
  return haystack.includes(q);
}

function sortItems(items, sort, order) {
  const dir = order === 'asc' ? 1 : -1;
  return [...items].sort((a, b) => {
    if (sort === 'views') {
      return ((a.views || 0) - (b.views || 0)) * dir;
    }
    if (sort === 'date') {
      const aTime = a.date ? new Date(a.date).getTime() : 0;
      const bTime = b.date ? new Date(b.date).getTime() : 0;
      return (aTime - bTime) * dir;
    }
    return a.title.localeCompare(b.title, 'he') * dir;
  });
}

export async function GET(req) {
  const auth = await verifyAdminSession();
  if (!auth.ok) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized' },
      { status: auth.status }
    );
  }

  const { searchParams } = new URL(req.url);
  const q = (searchParams.get('q') || '').trim();
  const type = searchParams.get('type') || 'all';
  const sort = searchParams.get('sort') || 'title';
  const order = searchParams.get('order') || 'asc';
  const excludePostId = searchParams.get('excludePostId') || '';

  try {
    await connectToMongo();

    const [posts, products] = await Promise.all([
      type === 'all' || type === 'post'
        ? postModel
            .find({
              status: { $ne: 'deleted' },
              ...(excludePostId && mongoose.Types.ObjectId.isValid(excludePostId)
                ? { _id: { $ne: excludePostId } }
                : {}),
            })
            .select('title slug status createdAt publishDate views summary')
            .lean()
        : [],
      type === 'all' || type === 'product'
        ? productModel
            .find()
            .select('name slug isActive createdAt views price category')
            .lean()
        : [],
    ]);

    let items = [];

    if (type === 'all' || type === 'page') {
      items = items.concat(getStaticPages());
    }

    if (type === 'all' || type === 'post') {
      items = items.concat(
        posts.map((post) => ({
          id: String(post._id),
          type: 'post',
          title: post.title,
          url: `/blog/${post.slug}`,
          subtitle: post.summary || post.slug,
          date: post.publishDate || post.createdAt,
          views: post.views || 0,
          status: post.status,
        }))
      );
    }

    if (type === 'all' || type === 'product') {
      items = items.concat(
        products.map((product) => ({
          id: String(product._id),
          type: 'product',
          title: product.name,
          url: `/shop/products/${product.slug}`,
          subtitle: product.category || product.slug,
          date: product.createdAt,
          views: product.views || 0,
          status: product.isActive ? 'active' : 'inactive',
        }))
      );
    }

    if (q) {
      items = items.filter((item) => matchesQuery(item, q));
    }

    items = sortItems(items, sort, order);

    return NextResponse.json({ success: true, data: items });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to load link targets' },
      { status: 500 }
    );
  }
}

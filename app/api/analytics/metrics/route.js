import { NextResponse } from 'next/server';
import { connectToMongo } from '@/server/DL/connectToMongo';
import { postModel } from '@/server/DL/Models/postModel';
import { postViewModel } from '@/server/DL/Models/postViewModel';
import { productModel } from '@/server/DL/Models/productModel';
import { productViewModel } from '@/server/DL/Models/productViewModel';
import { verifyAdminSession } from '@/server/functions/verifyAdminSession';

export async function GET() {
  const auth = await verifyAdminSession();
  if (!auth.ok) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized' },
      { status: auth.status }
    );
  }

  try {
    await connectToMongo();

    const posts = await postModel
      .find({ status: { $ne: 'deleted' } })
      .select('title slug views status createdAt')
      .sort({ views: -1 })
      .lean();

    const uniqueByPost = await postViewModel.aggregate([
      { $group: { _id: '$postId', uniqueVisitors: { $sum: 1 } } },
    ]);
    const postUniqueMap = new Map(
      uniqueByPost.map((row) => [String(row._id), row.uniqueVisitors])
    );

    const postItems = posts.map((post) => ({
      _id: post._id,
      title: post.title,
      slug: post.slug,
      status: post.status,
      views: post.views ?? 0,
      uniqueVisitors: postUniqueMap.get(String(post._id)) ?? 0,
      createdAt: post.createdAt,
    }));

    const products = await productModel
      .find()
      .select('name slug views isActive createdAt')
      .sort({ views: -1 })
      .lean();

    const uniqueByProduct = await productViewModel.aggregate([
      { $group: { _id: '$productId', uniqueVisitors: { $sum: 1 } } },
    ]);
    const productUniqueMap = new Map(
      uniqueByProduct.map((row) => [String(row._id), row.uniqueVisitors])
    );

    const productItems = products.map((product) => ({
      _id: product._id,
      title: product.name,
      slug: product.slug,
      status: product.isActive ? 'active' : 'inactive',
      views: product.views ?? 0,
      uniqueVisitors: productUniqueMap.get(String(product._id)) ?? 0,
      createdAt: product.createdAt,
    }));

    const postTotalViews = postItems.reduce((sum, p) => sum + p.views, 0);
    const productTotalViews = productItems.reduce((sum, p) => sum + p.views, 0);

    return NextResponse.json({
      success: true,
      data: {
        posts: {
          summary: {
            totalViews: postTotalViews,
            totalUniqueVisitors: await postViewModel.distinct('visitorId').then((ids) => ids.length),
            publishedCount: postItems.filter((p) => p.status === 'published').length,
            itemCount: postItems.length,
          },
          items: postItems,
        },
        products: {
          summary: {
            totalViews: productTotalViews,
            totalUniqueVisitors: await productViewModel.distinct('visitorId').then((ids) => ids.length),
            activeCount: productItems.filter((p) => p.status === 'active').length,
            itemCount: productItems.length,
          },
          items: productItems,
        },
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to load metrics' },
      { status: 500 }
    );
  }
}

import { NextResponse } from 'next/server';
import { connectToMongo } from '@/server/DL/connectToMongo';
import { productModel } from '@/server/DL/Models/productModel';
import { verifyAdminSession } from '@/server/functions/verifyAdminSession';

export async function GET(req) {
  try {
    await connectToMongo();
    const { searchParams } = new URL(req.url);
    const idsParam = searchParams.get('ids') || '';
    const ids = idsParam
      .split(',')
      .map((id) => id.trim())
      .filter(Boolean)
      .slice(0, 2);

    if (!ids.length) {
      return NextResponse.json({ success: true, data: [] });
    }

    const session = await verifyAdminSession();
    const query = { _id: { $in: ids } };
    if (!session.ok) {
      query.isActive = true;
    }

    const products = await productModel
      .find(query)
      .select('name subtitle images slug price isActive')
      .lean();

    return NextResponse.json({ success: true, data: products });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to load products' },
      { status: 500 }
    );
  }
}

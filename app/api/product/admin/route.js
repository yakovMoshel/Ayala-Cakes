import { NextResponse } from 'next/server';
import { connectToMongo } from '@/server/DL/connectToMongo';
import { productModel } from '@/server/DL/Models/productModel';
import { verifyAdminSession } from '@/server/functions/verifyAdminSession';
import { withCategoryFieldsList } from '@/utils/categoryRef';
import { serializeData } from '@/utils/serialization';

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
    const products = await productModel
      .find()
      .select('name slug isActive createdAt views images price categoryId')
      .populate({ path: 'categoryId', select: 'name' })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      data: withCategoryFieldsList(serializeData(products)),
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to load products' },
      { status: 500 }
    );
  }
}

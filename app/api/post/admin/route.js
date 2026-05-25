import { NextResponse } from 'next/server';
import { connectToMongo } from '@/server/DL/connectToMongo';
import { postModel } from '@/server/DL/Models/postModel';
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
      .select('title slug status createdAt views image summary')
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ success: true, data: posts });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to load posts' },
      { status: 500 }
    );
  }
}

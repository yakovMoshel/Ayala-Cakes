import { NextResponse } from "next/server";
import { postModel } from "@/server/DL/Models/postModel";
import "@/server/DL/Models/postCategoryModel";
import { connectToMongo } from "@/server/DL/connectToMongo";
import { revalidatePublicContent } from '@/server/functions/revalidatePublicContent';
import { verifyAdminSession } from "@/server/functions/verifyAdminSession";
import { normalizeCategoryIdWrite, withCategoryFields } from "@/utils/categoryRef";
import { serializeData } from "@/utils/serialization";
import { preparePostWritePayload } from '@/utils/postWritePayload';

export async function GET(req, { params }) {
  const auth = await verifyAdminSession();
  if (!auth.ok) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: auth.status });
  }

  await connectToMongo();
  const { id } = params;

  try {
    const post = await postModel
      .findOne({ _id: id, status: { $ne: 'deleted' } })
      .populate({ path: 'categoryId', select: 'name' })
      .lean();
    if (!post) {
      return NextResponse.json({ success: false, error: 'Post not found' }, { status: 404 });
    }
    return NextResponse.json({
      success: true,
      data: withCategoryFields(serializeData(post)),
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

export async function PUT(req, { params }) {
  const auth = await verifyAdminSession();
  if (!auth.ok) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: auth.status });
  }

  await connectToMongo();
  const { id } = params;
  const data = await preparePostWritePayload(normalizeCategoryIdWrite(await req.json()));

  try {
    const previous = await postModel.findById(id).select('slug').lean();
    data.updatedAt = new Date();
    const post = await postModel.findByIdAndUpdate(id, data, { new: true });
    revalidatePublicContent([
      '/blog',
      previous?.slug ? `/blog/${previous.slug}` : null,
      post?.slug ? `/blog/${post.slug}` : null,
    ]);
    return NextResponse.json({ success: true, data: post });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

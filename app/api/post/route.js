import { NextResponse } from "next/server";
import { postModel } from "@/server/DL/Models/postModel";
import "@/server/DL/Models/postCategoryModel";
import { connectToMongo } from "@/server/DL/connectToMongo";
import { revalidatePublicContent } from '@/server/functions/revalidatePublicContent';
import { verifyAdminSession } from "@/server/functions/verifyAdminSession";
import { normalizeCategoryIdWrite, withCategoryFields } from "@/utils/categoryRef";
import { serializeData } from "@/utils/serialization";
import { preparePostWritePayload } from '@/utils/postWritePayload';

function withCategoryFieldsListSafe(posts) {
  return (posts || []).map((p) => withCategoryFields(serializeData(p)));
}

export const GET = async () => {
  await connectToMongo();
  const posts = await postModel
    .find({ status: 'published' })
    .populate({ path: 'categoryId', select: 'name' })
    .sort({ publishDate: -1, createdAt: -1 })
    .lean();

  return NextResponse.json({
    success: true,
    data: withCategoryFieldsListSafe(posts),
  });
};

export async function POST(req) {
  const auth = await verifyAdminSession();
  if (!auth.ok) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: auth.status });
  }

  await connectToMongo();
  const data = await preparePostWritePayload(normalizeCategoryIdWrite(await req.json()));

  try {
    data.updatedAt = new Date();
    const post = await postModel.create(data);
    revalidatePublicContent(['/blog', post?.slug ? `/blog/${post.slug}` : null]);
    return NextResponse.json({ success: true, data: post });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

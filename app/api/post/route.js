import { NextResponse } from "next/server";
import { postModel } from "@/server/DL/Models/postModel";
import { connectToMongo } from "@/server/DL/connectToMongo";
import { revalidatePath } from 'next/cache';
import { verifyAdminSession } from "@/server/functions/verifyAdminSession";
import { normalizeCategoryIdWrite, withCategoryFields } from "@/utils/categoryRef";
import { serializeData } from "@/utils/serialization";
import { sanitizeBlogHtml, sanitizeEmbedHtml } from "@/utils/sanitizeHtml";

function withCategoryFieldsListSafe(posts) {
  return (posts || []).map((p) => withCategoryFields(serializeData(p)));
}

function sanitizePostWritePayload(data) {
  if (!data || typeof data !== 'object') return data;
  const next = { ...data };

  if (typeof next.content === 'string') {
    next.content = sanitizeBlogHtml(next.content);
  }

  if (next.postCta && typeof next.postCta === 'object') {
    next.postCta = { ...next.postCta };
    if (typeof next.postCta.embedHtml === 'string') {
      next.postCta.embedHtml = sanitizeEmbedHtml(next.postCta.embedHtml);
    }
  }

  return next;
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
  const data = sanitizePostWritePayload(normalizeCategoryIdWrite(await req.json()));

  try {
    const post = await postModel.create(data);
    revalidatePath('/blog');
    return NextResponse.json({ success: true, data: post });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

import { NextResponse } from "next/server";
import { postModel } from "@/server/DL/Models/postModel";
import { connectToMongo } from "@/server/DL/connectToMongo";
import { revalidatePath } from 'next/cache';
import { verifyAdminSession } from "@/server/functions/verifyAdminSession";
import { normalizeCategoryIdWrite, withCategoryFields } from "@/utils/categoryRef";
import { serializeData } from "@/utils/serialization";
import { sanitizeBlogHtml, sanitizeEmbedHtml } from "@/utils/sanitizeHtml";

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
  const data = sanitizePostWritePayload(normalizeCategoryIdWrite(await req.json()));

  try {
    const post = await postModel.findByIdAndUpdate(id, data, { new: true });
    revalidatePath('/blog');
    if (post?.slug) {
      revalidatePath(`/blog/${post.slug}`);
    }
    return NextResponse.json({ success: true, data: post });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

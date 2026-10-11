import { NextResponse } from "next/server";
import { postModel } from "@/server/DL/Models/postModel";
import "@/server/DL/Models/postCategoryModel";
import { connectToMongo } from "@/server/DL/connectToMongo";
import { revalidatePublicContent } from '@/server/functions/revalidatePublicContent';
import { verifyAdminSession } from "@/server/functions/verifyAdminSession";
import { normalizeCategoryIdWrite, withCategoryFields } from "@/utils/categoryRef";
import { serializeData } from "@/utils/serialization";
import { preparePostWritePayload } from '@/utils/postWritePayload';
import { contentChanged, POST_CONTENT_KEYS } from '@/utils/adminContentRules';
import { applyPostWrite } from '@/server/functions/postWrite';
import { duplicateSlugMessage, fieldsErrorResponse } from '@/server/functions/uniqueSlug';

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
    console.error('Post read failed:', error);
    return NextResponse.json({ success: false, error: 'Request failed' }, { status: 400 });
  }
}

export async function PUT(req, { params }) {
  const auth = await verifyAdminSession();
  if (!auth.ok) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: auth.status });
  }

  await connectToMongo();
  const { id } = params;
  let data;
  try {
    data = await preparePostWritePayload(normalizeCategoryIdWrite(await req.json()));
    const previous = await postModel.findById(id).lean();
    const fields = applyPostWrite(data, { isCreate: false });
    delete data.slugGenerated;
    if (previous?.slug && data.slug === previous.slug) delete fields.slug;
    if (data.slug && !fields.slug) {
      const duplicate = await duplicateSlugMessage(postModel, data.slug, id);
      if (duplicate) fields.slug = duplicate;
    }
    if (Object.keys(fields).length) {
      return NextResponse.json(fieldsErrorResponse(fields), { status: 400 });
    }

    if (contentChanged(previous, data, POST_CONTENT_KEYS)) {
      data.updatedAt = new Date();
    }
    const post = await postModel.findByIdAndUpdate(id, data, { new: true });
    revalidatePublicContent([
      '/blog',
      previous?.slug ? `/blog/${previous.slug}` : null,
      post?.slug ? `/blog/${post.slug}` : null,
    ]);
    return NextResponse.json({ success: true, data: post });
  } catch (error) {
    if (error?.fields) {
      return NextResponse.json(fieldsErrorResponse(error.fields), { status: 400 });
    }
    console.error('Post update failed:', error);
    if (error?.code === 11000) {
      return NextResponse.json(fieldsErrorResponse({ slug: 'הכתובת כבר בשימוש. בחרו כתובת אחרת.' }), { status: 400 });
    }
    return NextResponse.json({ success: false, error: 'Request failed' }, { status: 400 });
  }
}

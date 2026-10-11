import { NextResponse } from "next/server";
import { postModel } from "@/server/DL/Models/postModel";
import "@/server/DL/Models/postCategoryModel";
import { connectToMongo } from "@/server/DL/connectToMongo";
import { revalidatePublicContent } from '@/server/functions/revalidatePublicContent';
import { verifyAdminSession } from "@/server/functions/verifyAdminSession";
import { normalizeCategoryIdWrite, withCategoryFields } from "@/utils/categoryRef";
import { serializeData } from "@/utils/serialization";
import { preparePostWritePayload } from '@/utils/postWritePayload';
import { applyPostWrite } from '@/server/functions/postWrite';
import { duplicateSlugMessage, fieldsErrorResponse } from '@/server/functions/uniqueSlug';
import { ensureUniqueSlug } from '@/utils/slugUtils';

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
  let data;
  try {
    data = await preparePostWritePayload(normalizeCategoryIdWrite(await req.json()));
    const fields = applyPostWrite(data, { isCreate: true });
    if (data.slug && !fields.slug && data.slugGenerated) {
      data.slug = await ensureUniqueSlug(data.slug, async (slug) => Boolean(await postModel.exists({ slug })));
    } else if (data.slug && !fields.slug) {
      const duplicate = await duplicateSlugMessage(postModel, data.slug);
      if (duplicate) fields.slug = duplicate;
    }
    delete data.slugGenerated;
    if (Object.keys(fields).length) {
      return NextResponse.json(fieldsErrorResponse(fields), { status: 400 });
    }

    const post = await postModel.create(data);
    revalidatePublicContent(['/blog', post?.slug ? `/blog/${post.slug}` : null]);
    return NextResponse.json({ success: true, data: post });
  } catch (error) {
    if (error?.fields) {
      return NextResponse.json(fieldsErrorResponse(error.fields), { status: 400 });
    }
    console.error('Post create failed:', error);
    if (error?.code === 11000) {
      return NextResponse.json(fieldsErrorResponse({ slug: 'הכתובת כבר בשימוש. בחרו כתובת אחרת.' }), { status: 400 });
    }
    return NextResponse.json({ success: false, error: 'Request failed' }, { status: 400 });
  }
}

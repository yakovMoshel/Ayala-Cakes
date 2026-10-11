import { NextResponse } from "next/server";
import { productModel } from "@/server/DL/Models/productModel";
import { connectToMongo } from "@/server/DL/connectToMongo";
import { generateUniqueSlug } from "@/server/BL/productService";
import { verifyAdminSession } from "@/server/functions/verifyAdminSession";
import { revalidatePublicContent } from "@/server/functions/revalidatePublicContent";
import { normalizeCategoryIdWrite } from "@/utils/categoryRef";
import { validateSlug } from "@/utils/adminContentRules";
import { applyProductWrite } from "@/server/functions/productWrite";
import { duplicateSlugMessage, fieldsErrorResponse } from "@/server/functions/uniqueSlug";

export const GET = async () => {
  return NextResponse.json({ success: true });
};

export async function POST(req) {
  const auth = await verifyAdminSession();
  if (!auth.ok) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: auth.status });
  }

  await connectToMongo();
  const data = normalizeCategoryIdWrite(await req.json());

  try {
    const fields = applyProductWrite(data, { publishing: data.isActive === true, isCreate: true });
    if (!data.slug && data.name) {
      data.slug = await generateUniqueSlug(data.name);
    }
    if (!fields.slug) {
      const slugError = validateSlug(data.slug);
      if (slugError) fields.slug = slugError;
    }
    if (data.slug && !fields.slug) {
      const duplicate = await duplicateSlugMessage(productModel, data.slug);
      if (duplicate) fields.slug = duplicate;
    }
    if (Object.keys(fields).length) {
      return NextResponse.json(fieldsErrorResponse(fields), { status: 400 });
    }

    if (!data.categoryId) {
      return NextResponse.json(
        { success: false, error: 'Missing categoryId' },
        { status: 400 }
      );
    }

    const product = await productModel.create(data);
    revalidatePublicContent([
      '/shop',
      '/',
      product?.slug ? `/shop/products/${product.slug}` : null,
    ]);
    return NextResponse.json({ success: true, data: product });
  } catch (error) {
    console.error('Product create failed:', error);
    if (error?.code === 11000) {
      return NextResponse.json(fieldsErrorResponse({ slug: 'הכתובת כבר בשימוש. בחרו כתובת אחרת.' }), { status: 400 });
    }
    return NextResponse.json({ success: false, error: 'Request failed' }, { status: 400 });
  }
}

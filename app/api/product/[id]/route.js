import { NextResponse } from "next/server";
import { productModel } from "@/server/DL/Models/productModel";
import { connectToMongo } from "@/server/DL/connectToMongo";
import { verifyAdminSession } from "@/server/functions/verifyAdminSession";
import { revalidatePublicContent } from "@/server/functions/revalidatePublicContent";
import { normalizeCategoryIdWrite, withCategoryFields } from "@/utils/categoryRef";
import { serializeData } from "@/utils/serialization";
import { contentChanged, PRODUCT_CONTENT_KEYS } from "@/utils/adminContentRules";
import { applyProductWrite } from "@/server/functions/productWrite";
import { duplicateSlugMessage, fieldsErrorResponse } from "@/server/functions/uniqueSlug";

export async function GET(req, { params }) {
  await connectToMongo();
  const { id } = params;

  try {
    const product = await productModel
      .findById(id)
      .populate({ path: 'categoryId', select: 'name' })
      .lean();
    if (!product) {
      return NextResponse.json({ success: false, error: 'Product not found' }, { status: 404 });
    }
    return NextResponse.json({
      success: true,
      data: withCategoryFields(serializeData(product)),
    });
  } catch (error) {
    console.error('Product read failed:', error);
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
  const data = normalizeCategoryIdWrite(await req.json());

  try {
    if (data.categoryId === null) {
      return NextResponse.json(
        { success: false, error: 'Missing categoryId' },
        { status: 400 }
      );
    }

    const previous = await productModel.findById(id).lean();
    const fields = applyProductWrite(data, { publishing: data.isActive === true, isCreate: false });
    if (previous?.slug && data.slug === previous.slug) delete fields.slug;
    if (data.slug && !fields.slug) {
      const duplicate = await duplicateSlugMessage(productModel, data.slug, id);
      if (duplicate) fields.slug = duplicate;
    }
    if (Object.keys(fields).length) {
      return NextResponse.json(fieldsErrorResponse(fields), { status: 400 });
    }

    if (contentChanged(previous, data, PRODUCT_CONTENT_KEYS)) {
      data.updatedAt = new Date();
    }
    const product = await productModel.findByIdAndUpdate(id, data, { new: true });
    revalidatePublicContent([
      '/shop',
      '/',
      previous?.slug ? `/shop/products/${previous.slug}` : null,
      product?.slug ? `/shop/products/${product.slug}` : null,
    ]);
    return NextResponse.json({ success: true, data: product });
  } catch (error) {
    console.error('Product update failed:', error);
    if (error?.code === 11000) {
      return NextResponse.json(fieldsErrorResponse({ slug: 'הכתובת כבר בשימוש. בחרו כתובת אחרת.' }), { status: 400 });
    }
    return NextResponse.json({ success: false, error: 'Request failed' }, { status: 400 });
  }
}

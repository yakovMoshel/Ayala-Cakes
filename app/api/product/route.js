import { NextResponse } from "next/server";
import { productModel } from "@/server/DL/Models/productModel";
import { connectToMongo } from "@/server/DL/connectToMongo";
import { generateUniqueSlug } from "@/server/BL/productService";
import { verifyAdminSession } from "@/server/functions/verifyAdminSession";
import { revalidatePublicContent } from "@/server/functions/revalidatePublicContent";
import { normalizeCategoryIdWrite } from "@/utils/categoryRef";

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
    if (typeof data.slug === 'string') {
      data.slug = data.slug.trim();
    }
    if (data.name && !data.slug) {
      data.slug = await generateUniqueSlug(data.name);
    }

    if (!data.categoryId) {
      return NextResponse.json(
        { success: false, error: 'Missing categoryId' },
        { status: 400 }
      );
    }

    data.updatedAt = new Date();
    const product = await productModel.create(data);
    revalidatePublicContent([
      '/shop',
      '/',
      product?.slug ? `/shop/products/${product.slug}` : null,
    ]);
    return NextResponse.json({ success: true, data: product });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

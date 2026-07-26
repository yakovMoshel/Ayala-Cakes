import { NextResponse } from "next/server";
import { productModel } from "@/server/DL/Models/productModel";
import { connectToMongo } from "@/server/DL/connectToMongo";
import { verifyAdminSession } from "@/server/functions/verifyAdminSession";
import { revalidatePath } from "next/cache";
import { normalizeCategoryIdWrite, withCategoryFields } from "@/utils/categoryRef";
import { serializeData } from "@/utils/serialization";

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
  const data = normalizeCategoryIdWrite(await req.json());

  try {
    if (data.categoryId === null) {
      return NextResponse.json(
        { success: false, error: 'Missing categoryId' },
        { status: 400 }
      );
    }

    const product = await productModel.findByIdAndUpdate(id, data, { new: true });
    revalidatePath('/shop');
    revalidatePath('/');
    if (product?.slug) {
      revalidatePath(`/shop/products/${product.slug}`);
    }
    return NextResponse.json({ success: true, data: product });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

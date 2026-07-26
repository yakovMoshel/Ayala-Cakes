import { NextResponse } from "next/server";
import {
  getAllCategories,
  newCategory,
} from "@/server/BL/categoryService";
import { connectToMongo } from "@/server/DL/connectToMongo";
import { verifyAdminSession } from "@/server/functions/verifyAdminSession";
import { revalidatePath } from "next/cache";
import {
  parseProductCategoryBody,
  categoryErrorResponse,
} from "@/utils/productCategoryApi";

export async function GET() {
  await connectToMongo();
  try {
    const categories = await getAllCategories();
    return NextResponse.json({ success: true, data: categories });
  } catch (error) {
    return categoryErrorResponse(error, 'category GET');
  }
}

export async function POST(request) {
  const auth = await verifyAdminSession();
  if (!auth.ok) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: auth.status });
  }

  await connectToMongo();
  try {
    const body = await request.json();
    const parsed = parseProductCategoryBody(body);
    if (!parsed.ok) return parsed.response;

    const category = await newCategory(parsed.data);
    revalidatePath('/shop');
    revalidatePath('/admin/categories');
    return NextResponse.json({ success: true, data: category }, { status: 201 });
  } catch (error) {
    return categoryErrorResponse(error, 'category POST');
  }
}

import { NextResponse } from "next/server";
import { editCategory, removeCategory } from "@/server/BL/categoryService";
import { connectToMongo } from "@/server/DL/connectToMongo";
import { verifyAdminSession } from "@/server/functions/verifyAdminSession";
import { revalidatePath } from "next/cache";
import {
  parseProductCategoryBody,
  categoryErrorResponse,
} from "@/utils/productCategoryApi";
import { isValidObjectId } from "@/utils/postCategoryApi";

export async function PUT(request, { params }) {
  const auth = await verifyAdminSession();
  if (!auth.ok) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: auth.status });
  }

  if (!isValidObjectId(params.id)) {
    return NextResponse.json({ success: false, error: 'Invalid category id' }, { status: 400 });
  }

  await connectToMongo();
  try {
    const body = await request.json();
    const parsed = parseProductCategoryBody(body);
    if (!parsed.ok) return parsed.response;

    const updated = await editCategory(params.id, parsed.data);
    if (!updated) {
      return NextResponse.json({ success: false, error: 'Category not found' }, { status: 404 });
    }

    revalidatePath('/shop');
    revalidatePath('/admin/categories');
    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    return categoryErrorResponse(error, 'category PUT');
  }
}

export async function DELETE(request, { params }) {
  const auth = await verifyAdminSession();
  if (!auth.ok) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: auth.status });
  }

  if (!isValidObjectId(params.id)) {
    return NextResponse.json({ success: false, error: 'Invalid category id' }, { status: 400 });
  }

  await connectToMongo();
  try {
    const deleted = await removeCategory(params.id);
    if (!deleted) {
      return NextResponse.json({ success: false, error: 'Category not found' }, { status: 404 });
    }

    revalidatePath('/shop');
    revalidatePath('/admin/categories');
    return NextResponse.json({ success: true, data: deleted });
  } catch (error) {
    return categoryErrorResponse(error, 'category DELETE');
  }
}

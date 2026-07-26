import { NextResponse } from "next/server";
import { connectToMongo } from "@/server/DL/connectToMongo";
import { getAllPostCategories, newPostCategory } from "@/server/BL/postCategoryService";
import { verifyAdminSession } from "@/server/functions/verifyAdminSession";
import { revalidatePath } from "next/cache";
import {
  parsePostCategoryBody,
  postCategoryErrorResponse,
} from "@/utils/postCategoryApi";

export async function GET() {
  await connectToMongo();
  try {
    const categories = await getAllPostCategories();
    return NextResponse.json({ success: true, data: categories });
  } catch (error) {
    return postCategoryErrorResponse(error, 'post-category GET');
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
    const parsed = parsePostCategoryBody(body);
    if (!parsed.ok) return parsed.response;

    const category = await newPostCategory(parsed.data);

    revalidatePath('/blog');
    return NextResponse.json({ success: true, data: category }, { status: 201 });
  } catch (error) {
    return postCategoryErrorResponse(error, 'post-category POST');
  }
}

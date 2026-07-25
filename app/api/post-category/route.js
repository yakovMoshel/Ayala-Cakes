import { NextResponse } from "next/server";
import { connectToMongo } from "@/server/DL/connectToMongo";
import { getAllPostCategories, newPostCategory } from "@/server/BL/postCategoryService";
import { verifyAdminSession } from "@/server/functions/verifyAdminSession";
import { revalidatePath } from "next/cache";

export async function GET() {
  await connectToMongo();
  try {
    const categories = await getAllPostCategories();
    return NextResponse.json({ success: true, data: categories });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

export async function POST(request) {
  const auth = await verifyAdminSession();
  if (!auth.ok) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: auth.status });
  }

  await connectToMongo();
  try {
    const { name, description, slug } = await request.json();
    if (!name || !slug) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const category = await newPostCategory({
      name: name.trim(),
      description: description?.trim() || '',
      slug: slug.trim(),
    });

    revalidatePath('/blog');
    return NextResponse.json({ success: true, data: category }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

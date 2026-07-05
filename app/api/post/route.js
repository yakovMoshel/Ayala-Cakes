import { NextResponse } from "next/server";
import { postModel } from "@/server/DL/Models/postModel";
import { connectToMongo } from "@/server/DL/connectToMongo";
import { revalidatePath } from 'next/cache';
import { verifyAdminSession } from "@/server/functions/verifyAdminSession";

export const GET = async () => {
  await connectToMongo();
  const posts = await postModel
    .find({ status: 'published' })
    .sort({ publishDate: -1, createdAt: -1 });

  return NextResponse.json({ success: true, data: posts });
};

export async function POST(req) {
  const auth = await verifyAdminSession();
  if (!auth.ok) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: auth.status });
  }

  await connectToMongo();
  const data = await req.json();

  try {
      const post = await postModel.create(data);
              revalidatePath('/blog');
      return NextResponse.json({ success: true, data: post });
  } catch (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
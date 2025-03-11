import { NextResponse } from "next/server";
import { postModel } from "@/server/DL/Models/postModel";
import { connectToMongo } from "@/server/DL/connectToMongo";
import { revalidatePath } from 'next/cache';

export const GET = async () => {
  await connectToMongo();
  const posts = await postModel.find().sort({ createdAt: 1 });

  // const headers = new Headers({
  //   "Cache-Control": "no-store",
  // });

  return NextResponse.json({ success: true, data: posts }, { headers });
};

export async function POST(req) {
  await connectToMongo();
  const data = await req.json();

  try {
      const post = await postModel.create(data);
      revalidatePath('/Blog');
      return NextResponse.json({ success: true, data: post });
  } catch (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
import { NextResponse } from "next/server";
import { productModel } from "@/server/DL/Models/productModel";
import { connectToMongo } from "@/server/DL/connectToMongo";
import { generateUniqueSlug } from "@/server/BL/productService";

export const GET =async ()=>{
    return NextResponse.json({success: true});
}

export async function POST(req) {
  await connectToMongo();
  const data = await req.json();

  try {
      // יצירת slug אוטומטית מהשם
      if (data.name && !data.slug) {
        data.slug = await generateUniqueSlug(data.name);
      }

      const product = await productModel.create(data);
      return NextResponse.json({ success: true, data: product });
  } catch (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

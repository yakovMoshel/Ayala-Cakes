import { NextResponse } from "next/server";
import { postModel } from "@/server/DL/Models/postModel";
import { connectToMongo } from "@/server/DL/connectToMongo";
import { revalidatePath } from 'next/cache';

export async function PUT(req, { params }) {
    await connectToMongo();
    const { id } = params;
    const data = await req.json();

    try {
        const post = await postModel.findByIdAndUpdate(id, data, { new: true });
        revalidatePath('/blog');
        return NextResponse.json({ success: true, data: post });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
}
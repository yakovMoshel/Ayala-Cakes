import { NextResponse } from "next/server";
import { postModel } from "@/server/DL/Models/postModel";
import { connectToMongo } from "@/server/DL/connectToMongo";
import { revalidatePath } from 'next/cache';
import { verifyAdminSession } from "@/server/functions/verifyAdminSession";

export async function GET(req, { params }) {
    await connectToMongo();
    const { id } = params;

    try {
        const post = await postModel.findById(id).lean();
        if (!post) {
            return NextResponse.json({ success: false, error: 'Post not found' }, { status: 404 });
        }
        return NextResponse.json({ success: true, data: post });
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
    const data = await req.json();

    try {
        const post = await postModel.findByIdAndUpdate(id, data, { new: true });
        revalidatePath('/blog');
        if (post?.slug) {
            revalidatePath(`/blog/${post.slug}`);
        }
        return NextResponse.json({ success: true, data: post });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
}
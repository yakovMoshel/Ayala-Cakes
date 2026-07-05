import { NextResponse } from "next/server";
import { getAllCategories,newCategory } from "@/server/BL/categoryService";
import { connectToMongo } from "@/server/DL/connectToMongo";
import { verifyAdminSession } from "@/server/functions/verifyAdminSession";

export async function GET() {
    await connectToMongo();
    try {
        const categories = await getAllCategories();
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
        const { name, description, slug, image } = await request.json();
        if (!name || !slug || !image) {
            return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
        }
        const Category = await newCategory({ name, description, slug, image });
        return NextResponse.json({ success: true, data: Category }, { status: 201 });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
}
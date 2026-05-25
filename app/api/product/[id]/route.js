import { NextResponse } from "next/server";
import { productModel } from "@/server/DL/Models/productModel";
import { connectToMongo } from "@/server/DL/connectToMongo";

export async function GET(req, { params }) {
    await connectToMongo();
    const { id } = params;

    try {
        const product = await productModel.findById(id).lean();
        if (!product) {
            return NextResponse.json({ success: false, error: 'Product not found' }, { status: 404 });
        }
        return NextResponse.json({ success: true, data: product });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
}

export async function PUT(req, { params }) {
    await connectToMongo();
    const { id } = params;
    const data = await req.json();

    try {
        const product = await productModel.findByIdAndUpdate(id, data, { new: true });
        return NextResponse.json({ success: true, data: product });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
}

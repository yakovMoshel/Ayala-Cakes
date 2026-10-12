import { NextResponse } from 'next/server';
import {
    deleteLandingPage,
    getLandingPageById,
    updateLandingPage,
} from '@/server/BL/landingPageService';
import { verifyAdminSession } from '@/server/functions/verifyAdminSession';
import { fieldsErrorResponse } from '@/server/functions/uniqueSlug';
import { isValidObjectId } from '@/utils/postCategoryApi';
import { serializeData } from '@/utils/serialization';

export async function GET(_req, { params }) {
    const auth = await verifyAdminSession();
    if (!auth.ok) {
        return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: auth.status });
    }
    if (!isValidObjectId(params.id)) {
        return NextResponse.json({ success: false, error: 'Invalid id' }, { status: 400 });
    }

    try {
        const page = await getLandingPageById(params.id);
        if (!page) {
            return NextResponse.json({ success: false, error: 'Landing page not found' }, { status: 404 });
        }
        return NextResponse.json({ success: true, data: serializeData(page) });
    } catch (error) {
        console.error('Landing page read failed:', error);
        return NextResponse.json({ success: false, error: 'Request failed' }, { status: 500 });
    }
}

export async function PUT(req, { params }) {
    const auth = await verifyAdminSession();
    if (!auth.ok) {
        return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: auth.status });
    }
    if (!isValidObjectId(params.id)) {
        return NextResponse.json({ success: false, error: 'Invalid id' }, { status: 400 });
    }

    try {
        const body = await req.json();
        const result = await updateLandingPage(params.id, body);
        if (result.notFound) {
            return NextResponse.json({ success: false, error: 'Landing page not found' }, { status: 404 });
        }
        if (!result.ok) {
            return NextResponse.json(fieldsErrorResponse(result.fields), { status: 400 });
        }
        return NextResponse.json({ success: true, data: serializeData(result.page) });
    } catch (error) {
        console.error('Landing page update failed:', error);
        if (error?.code === 11000) {
            return NextResponse.json(
                fieldsErrorResponse({ slug: 'הכתובת כבר בשימוש. בחרו כתובת אחרת.' }),
                { status: 400 }
            );
        }
        return NextResponse.json({ success: false, error: 'Request failed' }, { status: 500 });
    }
}

export async function DELETE(_req, { params }) {
    const auth = await verifyAdminSession();
    if (!auth.ok) {
        return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: auth.status });
    }
    if (!isValidObjectId(params.id)) {
        return NextResponse.json({ success: false, error: 'Invalid id' }, { status: 400 });
    }

    try {
        const result = await deleteLandingPage(params.id);
        if (result.notFound) {
            return NextResponse.json({ success: false, error: 'Landing page not found' }, { status: 404 });
        }
        return NextResponse.json({ success: true, data: { id: params.id } });
    } catch (error) {
        console.error('Landing page delete failed:', error);
        return NextResponse.json({ success: false, error: 'Request failed' }, { status: 500 });
    }
}

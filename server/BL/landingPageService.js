import { landingPageModel } from '@/server/DL/Models/landingPageModel';
import { connectToMongo } from '@/server/DL/connectToMongo';
import { revalidatePublicContent } from '@/server/functions/revalidatePublicContent';
import {
    LANDING_TEMPLATES,
    landingPublicPath,
    normalizeWorkshopContent,
    validateLandingSlug,
} from '@/utils/landingPageContent';

const TITLE_MAX = 160;

function asTitle(value) {
    return typeof value === 'string' ? value.trim().slice(0, TITLE_MAX) : '';
}

function publicPathsFor(page, extraSlug) {
    const paths = new Set();
    if (page?.slug) paths.add(landingPublicPath(page.slug));
    for (const slug of page?.previousSlugs || []) paths.add(landingPublicPath(slug));
    if (extraSlug) paths.add(landingPublicPath(extraSlug));
    return [...paths];
}

function revalidateLanding(page, extraSlug) {
    revalidatePublicContent(publicPathsFor(page, extraSlug));
}

async function slugTaken(slug, excludeId) {
    const existing = await landingPageModel
        .findOne({ slug, ...(excludeId ? { _id: { $ne: excludeId } } : {}) })
        .select('_id')
        .lean();
    return existing ? 'הכתובת כבר בשימוש. בחרו כתובת אחרת.' : '';
}

async function releasePreviousSlug(slug, excludeId) {
    await landingPageModel.updateMany(
        {
            previousSlugs: slug,
            ...(excludeId ? { _id: { $ne: excludeId } } : {}),
        },
        { $pull: { previousSlugs: slug } }
    );
}

function nextPreviousSlugs(existing, nextSlug) {
    const previous = new Set(existing?.previousSlugs || []);
    if (existing?.status === 'published' && existing.slug && existing.slug !== nextSlug) {
        previous.add(existing.slug);
    }
    previous.delete(nextSlug);
    return [...previous];
}

async function assertSlug(slug, excludeId) {
    const formatError = validateLandingSlug(slug);
    if (formatError) return formatError;
    return slugTaken(slug, excludeId);
}

export async function listLandingPages() {
    await connectToMongo();
    return landingPageModel
        .find()
        .select('title slug status template updatedAt createdAt content.hero.image')
        .sort({ updatedAt: -1 })
        .lean();
}

export async function getLandingPageById(id) {
    await connectToMongo();
    return landingPageModel.findById(id).lean();
}

export async function getPublishedLandingBySlug(slug) {
    await connectToMongo();
    return landingPageModel.findOne({ slug, status: 'published' }).lean();
}

export async function getPublicLanding(slug) {
    await connectToMongo();
    const page = await getPublishedLandingBySlug(slug);
    if (page) return { page, redirectSlug: '' };
    const redirected = await landingPageModel
        .findOne({ previousSlugs: slug, status: 'published' })
        .lean();
    if (!redirected) return null;
    return { page: redirected, redirectSlug: redirected.slug };
}

export async function getPublishedLandingPages() {
    await connectToMongo();
    return landingPageModel
        .find({ status: 'published' })
        .select('title slug updatedAt createdAt')
        .sort({ title: 1 })
        .lean();
}

export async function createLandingPage(body) {
    await connectToMongo();
    const fields = {};
    const title = asTitle(body?.title);
    const slug = typeof body?.slug === 'string' ? body.slug.trim() : '';
    const template = body?.template || 'workshop';
    if (!title) fields.title = 'יש להזין שם לדף';
    if (!LANDING_TEMPLATES.includes(template)) fields.template = 'התבנית לא נתמכת';
    const slugError = await assertSlug(slug);
    if (slugError) fields.slug = slugError;
    if (Object.keys(fields).length) return { ok: false, fields };
    await releasePreviousSlug(slug);

    const page = await landingPageModel.create({
        title,
        template,
        slug,
        previousSlugs: [],
        status: 'draft',
        content: normalizeWorkshopContent(body?.content),
    });
    return { ok: true, page: page.toObject() };
}

export async function updateLandingPage(id, body) {
    await connectToMongo();
    const existing = await landingPageModel.findById(id);
    if (!existing) return { ok: false, notFound: true };

    const fields = {};
    const title = body?.title !== undefined ? asTitle(body.title) : existing.title;
    const slug = body?.slug !== undefined ? String(body.slug).trim() : existing.slug;
    const template = body?.template !== undefined ? body.template : existing.template;
    const status = body?.status !== undefined ? body.status : existing.status;
    if (!title) fields.title = 'יש להזין שם לדף';
    if (!LANDING_TEMPLATES.includes(template)) fields.template = 'התבנית לא נתמכת';
    if (status !== 'draft' && status !== 'published') fields.status = 'סטטוס לא תקין';
    if (slug !== existing.slug || body?.slug !== undefined) {
        const slugError = await assertSlug(slug, existing._id);
        if (slugError) fields.slug = slugError;
    }
    if (Object.keys(fields).length) return { ok: false, fields };
    await releasePreviousSlug(slug, existing._id);

    const original = existing.toObject();
    existing.title = title;
    existing.template = template;
    existing.slug = slug;
    existing.status = status;
    existing.previousSlugs = nextPreviousSlugs(original, slug);
    if (body?.content !== undefined) {
        existing.content = normalizeWorkshopContent(body.content);
        existing.markModified('content');
    }
    await existing.save();

    const page = existing.toObject();
    if (original.status === 'published' || page.status === 'published') {
        revalidateLanding(page, original.slug);
    }
    return { ok: true, page };
}

export async function deleteLandingPage(id) {
    await connectToMongo();
    const existing = await landingPageModel.findById(id).lean();
    if (!existing) return { ok: false, notFound: true };
    await landingPageModel.deleteOne({ _id: id });
    if (existing.status === 'published') revalidateLanding(existing);
    return { ok: true };
}

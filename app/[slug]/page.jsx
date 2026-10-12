import { notFound, permanentRedirect } from 'next/navigation';
import LandingPageView from '@/Components/LandingPageView';
import { getPublicLanding } from '@/server/BL/landingPageService';
import { connectToMongo } from '@/server/DL/connectToMongo';
import { buildLandingMetadata } from '@/utils/landingPageContent';
import { serializeData } from '@/utils/serialization';

export const revalidate = 3600;

export async function generateMetadata({ params }) {
    await connectToMongo();
    const resolved = await getPublicLanding(params.slug);
    if (!resolved?.page || resolved.redirectSlug || resolved.page.template !== 'workshop') return {};
    return buildLandingMetadata(resolved.page);
}

export default async function LandingSlugPage({ params }) {
    await connectToMongo();
    const resolved = await getPublicLanding(params.slug);
    if (!resolved?.page || resolved.page.template !== 'workshop') notFound();
    if (resolved.redirectSlug) permanentRedirect(`/${resolved.redirectSlug}`);
    return <LandingPageView page={serializeData(resolved.page)} />;
}

import { notFound } from 'next/navigation';
import LandingPageForm from '@/Components/LandingPageForm';
import { getLandingPageById } from '@/server/BL/landingPageService';
import { isValidObjectId } from '@/utils/postCategoryApi';
import { serializeData } from '@/utils/serialization';

export const dynamic = 'force-dynamic';

export default async function EditLandingPage({ params }) {
    if (!isValidObjectId(params.id)) notFound();
    const page = await getLandingPageById(params.id);
    if (!page) notFound();
    return <LandingPageForm initial={serializeData(page)} />;
}

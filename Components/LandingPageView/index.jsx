import WorkshopLanding from '@/Components/WorkshopLanding';
import { buildLandingSchema, preparePublicContent } from '@/utils/landingPageContent';
import { jsonLd } from '@/utils/siteUrl';

export default function LandingPageView({ page }) {
    if (page?.template !== 'workshop') return null;
    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: jsonLd(buildLandingSchema(page)) }}
            />
            <WorkshopLanding content={preparePublicContent(page)} />
        </>
    );
}

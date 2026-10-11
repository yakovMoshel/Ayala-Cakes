import WorkshopLanding from '@/Components/WorkshopLanding';
import { bentoWorkshop } from '@/content/workshops/bento';
import { jsonLd, toAbsoluteSiteUrl } from '@/utils/siteUrl';

export const metadata = {
    title: bentoWorkshop.seo.title,
    description: bentoWorkshop.seo.description,
    openGraph: {
        title: bentoWorkshop.seo.title,
        description: bentoWorkshop.seo.description,
        type: 'website',
        url: bentoWorkshop.seo.canonical,
        images: [
            {
                url: bentoWorkshop.hero.image,
                alt: bentoWorkshop.hero.imageAlt,
            },
        ],
    },
    alternates: {
        canonical: bentoWorkshop.seo.canonical,
    },
};

const workshopSchema = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: bentoWorkshop.seo.serviceName,
    description: bentoWorkshop.seo.description,
    url: toAbsoluteSiteUrl(bentoWorkshop.seo.canonical),
    image: toAbsoluteSiteUrl(bentoWorkshop.hero.image),
    provider: {
        '@type': 'Bakery',
        name: 'Ayala Cakes',
        url: toAbsoluteSiteUrl('/'),
    },
};

export default function BentoWorkshopPage() {
    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: jsonLd(workshopSchema),
                }}
            />
            <WorkshopLanding content={bentoWorkshop} />
        </>
    );
}

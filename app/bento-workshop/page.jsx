import WorkshopLanding from '@/Components/WorkshopLanding';
import { bentoWorkshop } from '@/content/workshops/bento';

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.ayacakes.biz';

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
    url: `${baseUrl}${bentoWorkshop.seo.canonical}`,
    image: `${baseUrl}${bentoWorkshop.hero.image}`,
    provider: {
        '@type': 'Bakery',
        name: 'Ayala Cakes',
        url: baseUrl,
    },
};

export default function BentoWorkshopPage() {
    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify(workshopSchema).replace(/</g, '\\u003c'),
                }}
            />
            <WorkshopLanding content={bentoWorkshop} />
        </>
    );
}

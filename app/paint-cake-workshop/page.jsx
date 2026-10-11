import WorkshopLanding from '@/Components/WorkshopLanding';
import { paintCakeWorkshop } from '@/content/workshops/paintCake';
import { jsonLd, toAbsoluteSiteUrl } from '@/utils/siteUrl';

const shareImage = paintCakeWorkshop.hero.image || paintCakeWorkshop.instructor.image;

export const metadata = {
    title: paintCakeWorkshop.seo.title,
    description: paintCakeWorkshop.seo.description,
    openGraph: {
        title: paintCakeWorkshop.seo.title,
        description: paintCakeWorkshop.seo.description,
        type: 'website',
        url: paintCakeWorkshop.seo.canonical,
        images: [
            {
                url: shareImage,
                alt: paintCakeWorkshop.hero.image
                    ? paintCakeWorkshop.hero.imageAlt
                    : paintCakeWorkshop.instructor.imageAlt,
            },
        ],
    },
    alternates: {
        canonical: paintCakeWorkshop.seo.canonical,
    },
};

const workshopSchema = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: paintCakeWorkshop.seo.serviceName,
    description: paintCakeWorkshop.seo.description,
    url: toAbsoluteSiteUrl(paintCakeWorkshop.seo.canonical),
    image: toAbsoluteSiteUrl(shareImage),
    provider: {
        '@type': 'Bakery',
        name: 'Ayala Cakes',
        url: toAbsoluteSiteUrl('/'),
    },
};

export default function PaintCakeWorkshopPage() {
    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: jsonLd(workshopSchema),
                }}
            />
            <WorkshopLanding content={paintCakeWorkshop} />
        </>
    );
}

import WorkshopLanding from '@/Components/WorkshopLanding';
import { summerCourse } from '@/content/workshops/summer';
import { jsonLd, toAbsoluteSiteUrl } from '@/utils/siteUrl';

export const metadata = {
    title: summerCourse.seo.title,
    description: summerCourse.seo.description,
    openGraph: {
        title: summerCourse.seo.title,
        description: summerCourse.seo.description,
        type: 'website',
        url: summerCourse.seo.canonical,
        images: [
            {
                url: summerCourse.hero.image,
                alt: summerCourse.hero.imageAlt,
            },
        ],
    },
    alternates: {
        canonical: summerCourse.seo.canonical,
    },
};

const courseSchema = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: summerCourse.seo.serviceName,
    description: summerCourse.seo.description,
    url: toAbsoluteSiteUrl(summerCourse.seo.canonical),
    image: toAbsoluteSiteUrl(summerCourse.hero.image),
    provider: {
        '@type': 'Bakery',
        name: 'Ayala Cakes',
        url: toAbsoluteSiteUrl('/'),
    },
};

export default function SummerPage() {
    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: jsonLd(courseSchema),
                }}
            />
            <WorkshopLanding content={summerCourse} />
        </>
    );
}

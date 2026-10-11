import SummerLandingPage from './SummerClient';

const canonical = '/summer';

export const metadata = {
  title: 'קורס קונדיטוריה לקיץ לנוער | Ayala Cakes',
  description:
    'תכנית קיץ מקצועית לבני ובנות נוער: לומדים לאפות, מזלפים, מקשטים ויוצאים עם תעודה, מתכונים ועוגה מעוצבת. Ayala Cakes.',
  openGraph: {
    title: 'קורס קונדיטוריה לקיץ לנוער | Ayala Cakes',
    description:
      'תכנית קיץ מקצועית לבני ובנות נוער: אפייה, זילוף ועיצוב עוגות, עם תעודה ועוגה מעוצבת בסיום.',
    type: 'website',
    url: canonical,
    images: [
      {
        url: '/images/summer-hero.png',
        alt: 'קורס קונדיטוריה לנוער',
      },
    ],
  },
  alternates: {
    canonical,
  },
};

export default function SummerPage() {
  return <SummerLandingPage />;
}

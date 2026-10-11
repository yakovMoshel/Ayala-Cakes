import { Assistant } from "next/font/google";
import "./globals.css";
import Providers from "@/Components/Providers";
import ConditionalSiteShell from "@/Components/ConditionalSiteShell";
import { SITE_ENTITY_ID, SITE_URL, jsonLd, toAbsoluteSiteUrl } from "@/utils/siteUrl";

const assistant = Assistant({ subsets: ["hebrew", "latin"], display: "swap" });

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: "Ayala Cakes | עוגות בנטו, עוגות מעוצבות וסדנאות חווייתיות בקריות",
  description:
    "עוגות בנטו טרנדיות, עוגות מעוצבות פרימיום לאירועים וסדנאות בנטו חווייתיות (למסיבות רווקות, ימי הולדת וגיבוש) בקריות והסביבה. Ayala Cakes - אילה אברהם.",
  openGraph: {
    siteName: "Ayala Cakes",
    locale: "he_IL",
    type: "website",
    title: "Ayala Cakes | עוגות בנטו, עוגות מעוצבות וסדנאות חווייתיות בקריות",
    description: "עוגות בנטו, עוגות מעוצבות וסדנאות אפייה חווייתיות בקריות והסביבה.",
  },
};

const localBusinessSchema = {
  '@context': 'https://schema.org',
  '@type': 'Bakery',
  '@id': SITE_ENTITY_ID,
  name: 'Ayala Cakes',
  alternateName: 'אילה קייקס',
  description:
    'קונדיטוריית בוטיק בקריות המתמחית בעוגות בנטו טרנדיות, עוגות מעוצבות פרימיום לאירועים, וסדנאות בנטו חווייתיות למסיבות רווקות, ימי הולדת וימי גיבוש בהנחיית אילה אברהם.',
  url: toAbsoluteSiteUrl('/'),
  logo: toAbsoluteSiteUrl('/ayala-cakes-logo.png'),
  image: toAbsoluteSiteUrl('/ayala-avraham.webp'),
  telephone: '+972-58-7995083',
  email: 'ayalapastry@gmail.com',
  founder: { '@type': 'Person', name: 'אילה אברהם' },
  areaServed: [
    { '@type': 'Place', name: 'הקריות' },
    { '@type': 'Place', name: 'חיפה והסביבה' }
  ],
  address: { '@type': 'PostalAddress', addressCountry: 'IL', addressLocality: 'קריות' },
  priceRange: '₪₪',
  sameAs: [
    'https://www.instagram.com/ayala_cakes',
    'https://www.tiktok.com/@ayala_cakes1',
  ].filter(Boolean),
};

export default function RootLayout({ children }) {
  return (
    <html lang="he" dir="rtl">
      <body className={assistant.className} suppressHydrationWarning>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLd(localBusinessSchema) }}
        />
        <Providers>
          <ConditionalSiteShell>{children}</ConditionalSiteShell>
        </Providers>
      </body>
    </html>
  );
}
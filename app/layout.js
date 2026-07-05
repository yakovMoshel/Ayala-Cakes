import { Assistant } from "next/font/google";
import "./globals.css";
import ConditionalSiteShell from "@/Components/ConditionalSiteShell";

// Variable font — a single file covers all weights (200-800), Hebrew included
const assistant = Assistant({ subsets: ["hebrew", "latin"], display: "swap" });

export const metadata = {
  metadataBase: new URL("https://www.ayacakes.biz"),
  title: "Ayala Cakes | עוגות מעוצבות בהתאמה אישית בקריות",
  description:
    "עוגות שהן פשוט ואו - עוגות מעוצבות, עוגות בנטו ומארזים בהתאמה אישית מאת אילה אברהם, קונדיטורית מוסמכת בקריות והסביבה",
  openGraph: {
    siteName: "Ayala Cakes",
    locale: "he_IL",
    type: "website",
  },
};

const localBusinessSchema = {
  '@context': 'https://schema.org',
  '@type': 'Bakery',
  name: 'Ayala Cakes',
  alternateName: 'עוגות איילה',
  description:
    'עוגות מעוצבות, עוגות בנטו ומארזים בהתאמה אישית מאת אילה אברהם, קונדיטורית מוסמכת',
  url: 'https://www.ayacakes.biz',
  logo: 'https://www.ayacakes.biz/AYALA CAKES LOGO.png',
  image: 'https://www.ayacakes.biz/ayala-avraham.webp',
  telephone: '+972-58-7990503',
  email: 'ayalapastry@gmail.com',
  founder: { '@type': 'Person', name: 'אילה אברהם' },
  areaServed: { '@type': 'Place', name: 'הקריות והסביבה, ישראל' },
  address: { '@type': 'PostalAddress', addressCountry: 'IL' },
  priceRange: '₪₪',
  sameAs: [
    'https://www.instagram.com/ayala_cakes',
    'https://www.tiktok.com/@ayala_cakes1',
    'https://www.facebook.com',
  ],
};

export default function RootLayout({ children }) {
  return (
    <html lang="he" dir="rtl">
      <body className={assistant.className} suppressHydrationWarning>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
        />
        <ConditionalSiteShell>{children}</ConditionalSiteShell>
      </body>
    </html>
  );
}
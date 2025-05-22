import { Poppins } from "next/font/google";
import "./globals.css";
import Header from "../Components/Header";
import Footer from "../Components/Footer";

const poppins = Poppins({ subsets: ["latin"], weight: ['100', '200', '400', '800'] });

export const metadata = {
  title: "Ayala Cakes",
  description: "עוגות שהן פשוט ואו",
};

export default function RootLayout({ children }) {
  return (
    <html lang="he" dir="rtl">
      <body className={poppins.className} suppressHydrationWarning>
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}
import { Poppins } from "next/font/google";
import "./globals.css";
import Header from "../Componnets/Header";
import Footer from "../Componnets/Footer";
import Roni from "./(test)/roni/page";

const poppins = Poppins({ subsets: ["latin"], weight: ['100', '200', '400', '800'] });

export const metadata = {
  title: "Shopy",
  description: "Generated by create next app",
};

export default function RootLayout({ children }) {
  return (
    <html lang="he" dir="rtl">
      <body className={poppins.className}>


        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}

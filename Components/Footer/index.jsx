"use client"
import React from 'react';
import { usePathname } from 'next/navigation';
import styles from './style.module.scss';
import Link from 'next/link';

import { FaRegCopyright } from "react-icons/fa6";
import { FaInstagram } from "react-icons/fa6";
import { CiTwitter } from "react-icons/ci";
import { FaFacebookF, FaWhatsapp } from "react-icons/fa";
import { AiOutlineTikTok } from "react-icons/ai";
import ContactForm from '../ContactForm';

export default function Footer() {
  const path = usePathname();
  const links = [
    { name: "בית", path: "/" },
    { name: "אודות", path: "/about" },
    { name: "חנות", path: "/shop" },
            { name: "בלוג", path: "/blog" },
    { name: "מועדפים", path: "/Favorites" }
  ];

  return (
    <div className={styles.container}>
      <div className={styles.footerContent}>
        <div className={styles.column}>
          <h3 className={styles.title}>קצת עליי</h3>
          <div className={styles.about}>
            היי, אני אילה, קונדיטורית מוסמכת ומעצבת עוגות, עם תשוקה ליצור עוגות ייחודיות וקסומות שיהפכו כל אירוע לחגיגה בלתי נשכחת          
          </div>
        </div>

        <div className={styles.column}>
          <h3 className={styles.title}>ניווט כללי</h3>
          <div className={styles.linkWrapper}>
            <div className={styles.linkColumn}>
              {links.slice(0, 3).map((item, index) => (
                <Link
                  key={index}
                  href={item.path}
                  className={
                    path === item.path ? `${styles.link} ${styles.active}` : `${styles.link} ${styles.noActive}`
                  }
                >
                  {item.name}
                </Link>
              ))}
            </div>
            <div className={styles.linkColumn}>
              {links.slice(3).map((item, index) => (
                <Link
                  key={index}
                  href={item.path}
                  className={
                    path === item.path ? `${styles.link} ${styles.active}` : `${styles.link} ${styles.noActive}`
                  }
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className={styles.column}>
          <h3 className={styles.title}>יצירת קשר</h3>
          <div className={styles.contactInfo}>
            <a href="tel:+972587990503" className={styles.link}>058-7990503</a>
            <a href="mailto:ayalapastry@gmail.com" className={styles.link}>Ayalapastry@gmail.com</a>
          </div>
        </div>

        <div className={styles.column}>
          <h3 className={styles.title}>רשתות חברתיות</h3>
          <div className={styles.socialIcons}>
            <Link href="https://www.facebook.com" target="_blank" className={styles.icon}><FaFacebookF /></Link>
            <Link href="https://api.whatsapp.com/send?phone=972587995083&text=%D7%94%D7%99%D7%99%20%D7%90%D7%A0%D7%99%20%D7%94%D7%92%D7%A2%D7%AA%D7%99%20%D7%9E%D7%94%D7%90%D7%99%D7%A0%D7%A1%D7%98%D7%92%D7%A8%D7%9D%20%D7%95%D7%A8%D7%95%D7%A6%D7%94%20%D7%9C%D7%94%D7%AA%D7%A2%D7%A0%D7%99%D7%99%D7%9F%20%D7%91%D7%A7%D7%A9%D7%A8%20%D7%9C" target="_blank" className={styles.icon}><FaWhatsapp /></Link>
            <Link href="https://www.instagram.com/ayala_cakes?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==" target="_blank" className={styles.icon}><FaInstagram /></Link>
            <Link href="https://www.tiktok.com/@ayala_cakes1?_t=8grXDy64YbA&_r=1" target="_blank" className={styles.icon}><AiOutlineTikTok /></Link>
          </div>
        </div>
      </div>
      <div className={styles.formContainer}>
        <ContactForm />
      </div>
      <div className={styles.endFooter}>
        <p>
          כל הזכויות שמורות <FaRegCopyright /> 2024
        </p>
      </div>
    </div>
  );
}
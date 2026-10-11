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
import { GENERAL_WHATSAPP_URL } from '@/utils/whatsapp';

export default function Footer() {
  const path = usePathname();
  const year = new Date().getFullYear();
  const links = [
    { name: "בית", path: "/" },
    { name: "אודות", path: "/about" },
    { name: "חנות", path: "/shop" },
            { name: "בלוג", path: "/blog" },
    { name: "מועדפים", path: "/favorites" }
  ];

  return (
    <footer className={styles.container}>
      <div className={styles.footerContent}>
        <div className={styles.column}>
          <h3 className={styles.title}>קצת עליי</h3>
          <div className={styles.about}>
            אני אילה, מעצבת עוגות וקונדיטורית מוסמכת, והאהבה הכי גדולה שלי היא עוגות מיוחדות וקסומות. אני מאמינה שהתפקיד של העוגה הוא קודם כל לעורר חוויה. בין אם אתם מפתיעים את בת הזוג או חוגגים יום הולדת, המטרה שלי היא שהעוגה תהיה ה-WOW של האירוע.
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
            <a href="tel:+972587995083" className={styles.link}>058-7995083</a>
            <a href="mailto:ayalapastry@gmail.com" className={styles.link}>Ayalapastry@gmail.com</a>
          </div>
        </div>

        <div className={styles.column}>
          <h3 className={styles.title}>רשתות חברתיות</h3>
          <div className={styles.socialIcons}>
            <Link href="https://www.facebook.com/Ayalacake/" target="_blank" className={styles.icon}><FaFacebookF /></Link>
            <Link href={GENERAL_WHATSAPP_URL} target="_blank" className={styles.icon} aria-label="שליחת הודעה בוואטסאפ"><FaWhatsapp /></Link>
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
          כל הזכויות שמורות <FaRegCopyright className={styles.copyMark} /> {year}
          <span className={styles.policySep} aria-hidden="true"> · </span>
          <Link href="/privacy" className={styles.policyLink}>
            מדיניות פרטיות
          </Link>
          <span className={styles.policySep} aria-hidden="true"> · </span>
          <Link href="/terms" className={styles.policyLink}>
            תקנון האתר
          </Link>
        </p>
      </div>
    </footer>
  );
}
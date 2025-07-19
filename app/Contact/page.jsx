import React from 'react';
import styles from './style.module.scss';
import { FaPhone, FaFacebook } from 'react-icons/fa';
import { FaLocationDot } from 'react-icons/fa6';
import { MdEmail } from 'react-icons/md';
import ContactDetails from '@/Components/ContactDetails';
import ContactForm from '@/Components/ContactForm';
import SocialLinks from '@/Components/SocialLinks';

// מטא-דטה לדף יצירת קשר
export const metadata = {
  title: 'יצירת קשר - אילה קונדיטורית | הזמנת עוגות מעוצבות בקריות',
  description: 'צרו קשר עם אילה הקונדיטורית להזמנת עוגות מעוצבות ומפתיעות. זמינה לשירות אישי בקריות והסביבה. טלפון: 058-7990503',
  keywords: 'יצירת קשר, הזמנת עוגות, קונדיטורית בקריות, אילה אברהם, עוגות מעוצבות הזמנה',
  openGraph: {
    title: 'יצירת קשר - אילה קונדיטורית',
    description: 'צרו קשר עם אילה הקונדיטורית להזמנת עוגות מעוצבות ומפתיעות בקריות והסביבה',
    type: 'website',
  },
  alternates: {
    canonical: '/contact'
  }
};

export default function Contact() {
  return (
    <div className={styles.contact}>
      <h2>יצירת קשר</h2>
      <div className={styles.contactContent}>
        <div className={styles.contactDetails}>
          <ContactDetails />
        </div>
        <div className={styles.contactForm}>
          <ContactForm type="square" />
        </div>
      </div>
      <div className={styles.socialLinks}>
        <SocialLinks />
      </div>
    </div>
  );
}

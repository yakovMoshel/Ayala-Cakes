"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import styles from "./style.module.scss";
import axios from "axios";

export default function ContactForm({ type = "line" }) {
  const initialFormData = {
    name: "",
    email: "",
    phone: "",
    message: "",
  };

  const [formData, setFormData] = useState(initialFormData);
  const [isLoading, setIsLoading] = useState(false);
  const [showMessage, setShowMessage] = useState(false);
  const [message, setMessage] = useState('');

  const formClassName = type === "square" ? styles.squareForm : styles.lineForm;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const sendContactForm = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await axios.post('/api/send-email', {
        type: 'contact',
        orderDetails: { ...formData }
      });
      if (response.data.success) {
        setMessage('ההודעה שלך נשלחה ! ניצור איתך קשר בהקדם.');
        setFormData(initialFormData);
        setShowMessage(true);
        
        setTimeout(() => {
          setShowMessage(false);
          setMessage('');
        }, 2000);
      } else {
        setMessage('שגיאה בשליחת ההודעה. אנא נסה שוב.');
        setShowMessage(true);
        
        setTimeout(() => {
          setShowMessage(false);
          setMessage('');
        }, 2000);
      }
    } catch (error) {
      console.error("Error sending form:", error);
      setMessage('שגיאה בשליחת ההודעה. אנא נסה שוב.');
      setShowMessage(true);
      
      setTimeout(() => {
        setShowMessage(false);
        setMessage('');
      }, 3000);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={formClassName}>
      {showMessage ? (
        <div className={styles.messageContainer}>
          <div className={styles.popupMessage}>
            {message}
          </div>
        </div>
      ) : (
        <form onSubmit={sendContactForm}>
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <input
                type="text"
                id="name"
                name="name"
                placeholder="שם"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className={styles.formGroup}>
              <input 
                type="email"
                id="email"
                name="email"
                value={formData.email}
                placeholder="אימייל"
                onChange={handleInputChange}
                required 
              />
            </div>
            <div className={styles.formGroup}>
              <input
                type="tel"
                id="phone"
                name="phone"
                placeholder="טלפון"
                value={formData.phone}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <textarea
                id="message"
                name="message"
                placeholder="הודעה"
                value={formData.message}
                onChange={handleInputChange}
                required
              ></textarea>
            </div>
            <button type="submit" className={styles.submitButton} disabled={isLoading || !formData.name || !formData.phone || !formData.message}>
              {isLoading ? (
                <div className={styles.loader}></div>
              ) : (
                'שליחה'
              )}
            </button>
          </div>
          <p className={styles.consent}>
            בשליחת הטופס אני מסכים/ה ל<Link href="/privacy">מדיניות הפרטיות</Link>
          </p>
        </form>
      )}
    </div>
  );
}
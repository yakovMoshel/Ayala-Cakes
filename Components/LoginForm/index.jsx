"use client";
import React, { useState } from 'react';
import styles from './style.module.scss';
import { useRouter } from 'next/navigation';
import useStore from '../../useStore';
import { Mail, Lock, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const { setAuthenticated, setUser } = useStore();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    setLoading(true);

    try {
      // שליחת נתוני התחברות לשרת
      const res = await fetch('/api/auth/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      
      if (data.success) {
        // The server sets HttpOnly cookie. Now verify via API to get user payload.
        try {
          const verifyRes = await fetch('/api/auth/verify-token', { method: 'POST' });
          const verifyData = await verifyRes.json();
          if (verifyData?.success) {
            setUser(verifyData.user);
          } else {
            setUser(null);
          }
        } catch (e) {
          setUser(null);
        }

        // הצגת הודעת הצלחה
        setSuccessMessage('התחברת בהצלחה! מעביר אותך ללוח הבקרה...');
        setAuthenticated(true);
        // מעבר לעמוד Admin
        setTimeout(() => {
          router.push('/admin');
        }, 1200);
      } else {
        // טיפול בשגיאה
        setErrorMessage(data.message || 'אימייל או סיסמה שגויים');
      }
    } catch (err) {
      setErrorMessage('אירעה שגיאה בחיבור לשרת. נסה שוב מאוחר יותר.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.loginPageContainer}>
      <div className={styles.squareForm}>
        <div className={styles.loginHeader}>
          <div className={styles.logoRing}>
            <img src="/AYALA CAKES LOGO.png" alt="AYALA CAKES LOGO" />
          </div>
          <h2>אילה שוקולד ועוגות</h2>
          <p>התחברי לממשק הניהול כדי לעדכן מוצרים, קטגוריות ופוסטים</p>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label htmlFor="email">כתובת אימייל</label>
              <div className={styles.inputWrapper}>
                <Mail className={styles.inputIcon} size={18} />
                <input
                  type="email"
                  id="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="password">סיסמה</label>
              <div className={styles.inputWrapper}>
                <Lock className={styles.inputIcon} size={18} />
                <input
                  type="password"
                  id="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
            </div>
          </div>

          {errorMessage && (
            <div className={styles.errorMessage}>
              <AlertCircle size={18} />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className={styles.successMessage}>
              <CheckCircle2 size={18} />
              <span>{successMessage}</span>
            </div>
          )}

          <button 
            type="submit" 
            className={styles.submitButton}
            disabled={!email || !password || loading}
          >
            {loading ? (
              <>
                <Loader2 className={styles.buttonSpinner} size={18} />
                <span>מתחבר...</span>
              </>
            ) : (
              <span>התחברי עכשיו</span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
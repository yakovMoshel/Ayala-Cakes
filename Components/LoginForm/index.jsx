"use client";
import React, { useState } from 'react';
import styles from './style.module.scss';
import { useRouter } from 'next/navigation';
import useStore from '../../useStore';


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
    setLoading(true);

    // שליחת נתוני התחברות לשרת
    const res = await fetch('/api/auth/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();
    setLoading(false);

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
      setSuccessMessage('Login successful');
      setAuthenticated(true);
      // מעבר לעמוד Admin
      setTimeout(() => {
        router.push('/admin');
      }, 500);
    } else {
      // טיפול בשגיאה
      setErrorMessage(data.message);
    }
  };

  return (
    <div className={styles.squareForm}>
      <form onSubmit={handleSubmit}>
        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label htmlFor="email">Email:</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="password">Password:</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
        </div>
        {errorMessage && <div className={styles.errorMessage}>{errorMessage}</div>}
        {successMessage && <div className={styles.successMessage}>{successMessage}</div>}
        <button type="submit" disabled={!email || !password || loading}>
          התחבר
        </button>
        {loading && <div className={styles.loader}></div>}
      </form>
    </div>
  );
}

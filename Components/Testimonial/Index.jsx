"use client"
import React, { useState, useEffect, useRef, useCallback } from 'react';
import styles from './style.module.scss';
import { BiChevronLeft, BiChevronRight } from 'react-icons/bi';

const AUTO_INTERVAL_MS = 5500;

const FALLBACK_TESTIMONIALS = [
  {
    id: 1,
    name: 'רותי לוי',
    review: 'היה מדהים! העוגה היתה מדהימה ואני ממליצה על אילה בחום.',
  },
  {
    id: 2,
    name: 'אילנה כהן',
    review: 'שירות מעולה ועוגות טעימות ויפות מאוד. בהחלט מומלץ.',
  },
  {
    id: 3,
    name: 'מיכל ברק',
    review: 'המארז היה בול לטעמי, הגיע בזמן והאיכות הייתה מצוינת. ממליצה בחום!',
  },
];

function GoogleMark({ className }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      width="18"
      height="18"
      aria-hidden="true"
      focusable="false"
    >
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}

function prefersReducedMotion() {
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

const Testimonial = ({ reviews = null, mapsUri = null }) => {
  const testimonials =
    Array.isArray(reviews) && reviews.length > 0 ? reviews : FALLBACK_TESTIMONIALS;
  const fromGoogle = Array.isArray(reviews) && reviews.length > 0;

  const [current, setCurrent] = useState(0);
  const length = testimonials.length;

  const timerRef = useRef(null);
  const lengthRef = useRef(length);
  const pausedRef = useRef(false);
  const reduceMotionRef = useRef(false);

  lengthRef.current = length;

  const clearAuto = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const startAuto = useCallback(() => {
    clearAuto();
    if (reduceMotionRef.current || pausedRef.current || lengthRef.current <= 1) {
      return;
    }
    timerRef.current = setInterval(() => {
      setCurrent((prev) =>
        prev === lengthRef.current - 1 ? 0 : prev + 1
      );
    }, AUTO_INTERVAL_MS);
  }, [clearAuto]);

  useEffect(() => {
    reduceMotionRef.current = prefersReducedMotion();
    startAuto();

    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onMotionChange = () => {
      reduceMotionRef.current = mq.matches;
      if (mq.matches) clearAuto();
      else startAuto();
    };
    mq.addEventListener?.('change', onMotionChange);

    return () => {
      clearAuto();
      mq.removeEventListener?.('change', onMotionChange);
    };
  }, [length, startAuto, clearAuto]);

  const handlePrev = () => {
    setCurrent((prev) => (prev === 0 ? length - 1 : prev - 1));
    startAuto();
  };

  const handleNext = () => {
    setCurrent((prev) => (prev === length - 1 ? 0 : prev + 1));
    startAuto();
  };

  const pauseAuto = () => {
    pausedRef.current = true;
    clearAuto();
  };

  const resumeAuto = () => {
    pausedRef.current = false;
    startAuto();
  };

  if (!Array.isArray(testimonials) || testimonials.length <= 0) {
    return null;
  }

  const active = testimonials[current] || testimonials[0];

  return (
    <div
      className={styles.testimonialCarousel}
      onMouseEnter={pauseAuto}
      onMouseLeave={resumeAuto}
      onFocusCapture={pauseAuto}
      onBlurCapture={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) {
          resumeAuto();
        }
      }}
    >
      <div className={styles.row}>
        <button type="button" className={styles.leftArrow} onClick={handlePrev} aria-label="הקודם">
          <BiChevronRight />
        </button>

        <div className={styles.slides}>
          {testimonials.map((testimonial, index) => (
            <div
              className={index === current ? `${styles.slide} ${styles.active}` : styles.slide}
              key={testimonial.id}
              aria-hidden={index !== current}
            >
              <div className={styles.testimonial}>
                <p className={styles.review}>&ldquo;{testimonial.review}&rdquo;</p>
                <p className={styles.customer}>- {testimonial.name}</p>
              </div>
            </div>
          ))}
        </div>

        <button type="button" className={styles.rightArrow} onClick={handleNext} aria-label="הבא">
          <BiChevronLeft />
        </button>
      </div>

      <div className={styles.liveRegion} aria-live="polite" aria-atomic="true">
        {`"${active.review}" — ${active.name}`}
      </div>

      {fromGoogle && (
        <p className={styles.attribution}>
          {mapsUri ? (
            <a href={mapsUri} target="_blank" rel="noopener noreferrer">
              <GoogleMark className={styles.googleMark} />
              <span>ביקורות מ־Google</span>
            </a>
          ) : (
            <>
              <GoogleMark className={styles.googleMark} />
              <span>ביקורות מ־Google</span>
            </>
          )}
        </p>
      )}
    </div>
  );
};

export default Testimonial;

export const COOKIE_CONSENT_KEY = 'cookie_consent';
export const COOKIE_CONSENT_EVENT = 'cookie-consent-changed';

/** @returns {'accepted' | 'declined' | null} */
export function getCookieConsent() {
  if (typeof window === 'undefined') return null;
  try {
    const value = window.localStorage.getItem(COOKIE_CONSENT_KEY);
    if (value === 'accepted' || value === 'declined') return value;
  } catch {
    // localStorage may be blocked
  }
  return null;
}

/** @param {'accepted' | 'declined'} value */
export function setCookieConsent(value) {
  if (typeof window === 'undefined') return;
  if (value !== 'accepted' && value !== 'declined') return;
  try {
    window.localStorage.setItem(COOKIE_CONSENT_KEY, value);
    window.dispatchEvent(
      new CustomEvent(COOKIE_CONSENT_EVENT, { detail: { value } })
    );
  } catch {
    // ignore write failures
  }
}

export function hasAnalyticsConsent() {
  return getCookieConsent() === 'accepted';
}

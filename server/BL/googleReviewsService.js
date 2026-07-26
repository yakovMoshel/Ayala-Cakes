/**
 * Fetches up to 5 Google Place reviews via Places API (New).
 * Returns null on any failure so the UI can fall back to static testimonials.
 */
export async function getGoogleReviews() {
  const apiKey = process.env.PLACES_API_KEY;
  const placeId = process.env.PLACE_ID;

  if (!apiKey || !placeId) {
    console.warn('[googleReviews] Missing PLACES_API_KEY or PLACE_ID');
    return null;
  }

  try {
    const res = await fetch(
      `https://places.googleapis.com/v1/places/${encodeURIComponent(placeId)}`,
      {
        headers: {
          'X-Goog-Api-Key': apiKey,
          'X-Goog-FieldMask': 'reviews,googleMapsUri',
        },
        next: { revalidate: 3600 },
      }
    );

    if (!res.ok) {
      const body = await res.text().catch(() => '');
      console.error(
        '[googleReviews] Places API error:',
        res.status,
        body.slice(0, 200)
      );
      return null;
    }

    const data = await res.json();
    const reviews = Array.isArray(data.reviews) ? data.reviews : [];
    const mapsUri =
      data.googleMapsUri ||
      `https://www.google.com/maps/place/?q=place_id:${placeId}`;

    const mapped = reviews
      .map((r, index) => {
        const original = r?.originalText?.text?.trim() || '';
        const translated = r?.text?.text?.trim() || '';
        const text = original || translated;
        const name = r?.authorAttribution?.displayName?.trim() || '';
        if (!text || !name) return null;
        return {
          id: r.name || `google-review-${index}`,
          name,
          review: text,
          rating: typeof r?.rating === 'number' ? r.rating : null,
        };
      })
      .filter(Boolean);

    if (mapped.length === 0) return null;

    return { reviews: mapped, mapsUri };
  } catch (err) {
    console.error('[googleReviews] Fetch failed:', err);
    return null;
  }
}

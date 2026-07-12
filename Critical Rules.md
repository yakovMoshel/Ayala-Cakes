# Critical Rules — Ayala Cakes (Next.js 14)

**Definitive development & architecture guideline.** Any agent or developer MUST read this before modifying the codebase. Violations cause SEO regressions, security holes, billing abuse, or production runtime errors.

---

## 1. Architecture Rules

### App Router only
- This project uses **Next.js 14 App Router** (`app/`). Do not introduce Pages Router patterns (`pages/`, `getServerSideProps`, `_document`).
- **Never use `next/head`** in `app/` routes. It is silently ignored. Use `export const metadata` or `export async function generateMetadata()`.

### Server vs. Client components
| Pattern | Rule |
|---------|------|
| Data fetching from MongoDB | **Server Component** only |
| `useState`, `useEffect`, browser APIs, Zustand | **`'use client'`** island only |
| Public catalog/listing pages | Server-fetch → pass serialized props to a client island |

**Canonical pattern (shop):**
```
app/shop/page.jsx          → async server component, fetches data, exports metadata + revalidate
app/shop/ShopClient.jsx    → 'use client', filtering/UI only, receives products as props
```

- Do **not** fetch MongoDB data inside `useEffect` on public SEO-critical pages. Crawlers and LLMs must receive product/post HTML in the initial response.

### Metadata
- Root layout (`app/layout.js`) MUST define:
  - `metadataBase: new URL('https://www.ayacakes.biz')`
  - Default `title`, `description`, and `openGraph` (`siteName`, `locale: 'he_IL'`)
- Every public page MUST export page-level `metadata` or `generateMetadata` with:
  - `title`, `description`
  - `alternates.canonical` (relative path, e.g. `'/shop'`)
  - `openGraph` where applicable
- Client components **cannot** export metadata. If a route is `'use client'`, place metadata in a parent server `layout.js` or convert the page to a server component.

### Routing & casing
- Routes are **lowercase**: `/contact`, `/about`, `/shop` — not `/Contact`.
- Legacy `/Contact` is permanently redirected to `/contact` via `next.config.mjs`. Do not reintroduce capitalized route folders.
- On Windows, rename case-sensitive folders via two-step `git mv` (e.g. `Contact` → `contact-tmp` → `contact`).

### Middleware
- `middleware.js` protects `/admin/:path*` at the edge via JWT verification (`jose` + `SECRET_CODE`).
- Client-side `AdminWrapper` auth check is a **second layer**, not a replacement for server/API protection.

### Admin shell
- Public pages render inside `ConditionalSiteShell` (Header + main + Footer).
- `/admin` and `/login` use `admin-shell` body class — no public Header/Footer.

---

## 2. Security & API Protection

### Mandatory auth on mutating routes
Every **write** API route MUST call `verifyAdminSession()` from `@/server/functions/verifyAdminSession` before any DB or external service call:

```js
const auth = await verifyAdminSession();
if (!auth.ok) {
  return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: auth.status });
}
```

**Protected routes (non-exhaustive — extend this list when adding new write endpoints):**
- `POST/PUT` `/api/product`, `/api/product/[id]`
- `POST/PUT` `/api/post`, `/api/post/[id]`
- `POST` `/api/category`
- `POST` `/api/upload`
- `POST` `/api/media/delete`
- `GET` `/api/media/list`
- `POST` `/api/generate-seo`

**Intentionally public (do NOT admin-gate):**
- `POST` `/api/send-email` — used by contact form and order popup
- `POST` `/api/analytics/view` — public view tracking
- `GET` `/api/post` — published posts list

### Rate limiting
Use `@/utils/rateLimit` (`isRateLimited`, `getClientIp`). In-memory only — sufficient for accidental-loop protection; not a DDoS solution.

| Route | Limit | Rationale |
|-------|-------|-----------|
| `POST /api/generate-seo` (`post`, `product`, `slug`) | 5 req / IP / minute | Gemini API; admin-gated |
| `POST /api/generate-seo` (`post-full`) | 2 req / IP / minute | Full blog uses more tokens |
| `POST /api/send-email` | 5 req / IP / 10 minutes | Spam relay prevention |

```js
import { isRateLimited, getClientIp } from '@/utils/rateLimit';

if (isRateLimited(`route-name:${getClientIp(req)}`, { windowMs: 60_000, max: 5 })) {
  return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
}
```

### Input sanitization
- **`/api/send-email`**: All user fields MUST be HTML-escaped (`&`, `<`, `>`, `"`, `'`) and length-capped before interpolation into email HTML. Never echo raw `error.message` to clients.
- **Rich content** (`post.content`, `structuredData`): Rendered via `dangerouslySetInnerHTML` on public pages. Only admin-gated APIs may write this content. Never expose unauthenticated write endpoints.

### Session & cookies
- Admin session: HttpOnly `sessionToken` cookie, `secure: true`, `sameSite: 'strict'`, set in `POST /api/auth`.
- JWT secret: `process.env.SECRET_CODE`. Never hardcode or commit secrets.

### Cloudinary
- Upload and delete are admin-only. Never expose unauthenticated Cloudinary write access.

---

## 3. SEO & AIO Standards

### Semantic HTML (mandatory on public pages)
| Element | Usage |
|---------|-------|
| `<header>` | Site header (`Components/Header`) |
| `<nav>` | Desktop and mobile menu containers |
| `<main>` | Page content wrapper — use `style={{ display: 'contents' }}` in `ConditionalSiteShell` to avoid breaking body flex layout |
| `<footer>` | Site footer |
| `<h1>` | One per page — homepage hero, product name, blog post title, blog index, about page |
| `<h2>` / `<h3>` | Section titles and card names where appropriate |

**When converting `div` → heading:** Keep the existing CSS class. If UA heading styles conflict, use `style={{ font: 'inherit', margin: 0 }}` on `<h1>`.

**Do not** change class names or DOM hierarchy in ways that break SCSS selectors (`.headTitle`, `.sideTitle`, `.name`, etc.).

### Schema.org JSON-LD
| Location | Schema |
|----------|--------|
| `app/layout.js` | `Bakery` (LocalBusiness) — site-wide, static |
| `app/shop/products/[slug]/page.jsx` | `Product` + `Offer` — use `item.structuredData` from DB when present; **always** emit fallback via `buildProductSchema()` |
| `app/blog/[slug]/page.jsx` | `item.structuredData` from DB when present |

Inject via:
```jsx
<script
  type="application/ld+json"
  dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
/>
```

### Canonical URLs
- Set `alternates.canonical` in metadata (relative paths; resolved via `metadataBase`).
- Sitemap lives at `app/sitemap.js` (dynamic). **Do not** add `next-sitemap` or a static `public/sitemap.xml` that shadows it.

### robots.txt (`public/robots.txt`)
```
Disallow: /admin
Disallow: /login
Disallow: /UniquePost
Sitemap: https://www.ayacakes.biz/sitemap.xml
```

### Sitemap coverage
Static entries MUST include: `/`, `/about`, `/contact`, `/shop`, `/blog`, `/bento-workshop`, `/summer`, plus dynamic product and blog slugs from MongoDB.

### AIO (LLM optimization)
- Public pages MUST server-render meaningful text content (product names, descriptions, blog body) — not empty shells filled by client JS.
- One clear `<h1>` per page with human-readable Hebrew copy.
- Structured data gives LLMs machine-readable business and product facts.

### Legacy routes
- `/UniquePost/[id]` exists only for slug-less post redirects. Blocked in `robots.txt`. Prefer `/blog/[slug]` for all new posts.

---

## 4. Performance & Caching

### `next/image` (mandatory on public site)
- Replace raw `<img>` on all public-facing components: homepage, Header, ProductItem, PostItem, SinglePost, ImageGallery.
- Admin-only UI may keep `<img>` if low risk, but prefer consistency.

**Rules:**
| Case | Requirement |
|------|-------------|
| LCP / hero | `priority` prop |
| Above-fold product main image | `priority` |
| Logo | `priority`, explicit `width`/`height`, `style={{ width: 'auto' }}` if CSS sets height |
| Responsive layouts | `sizes` prop |
| Fill layouts | `fill` inside `position: relative` parent (see PostItem) |

### Remote image hosts (`next.config.mjs`)
Every external hostname used in DB or code MUST be in `images.remotePatterns`:

```js
remotePatterns: [
  { protocol: 'https', hostname: 'res.cloudinary.com' },
  { protocol: 'https', hostname: 'i.imgur.com' },
  { protocol: 'https', hostname: 'i.ibb.co' },
],
```

**After adding a host, restart the dev server.** Missing hosts cause runtime: `hostname "X" is not configured`.

### Static assets
- Hero image: `/ayala-avraham.webp` (WebP). Single DOM element; responsive sizing via CSS media queries on one `.image` container — never duplicate hero `<img>`/`<Image>` for desktop/mobile.
- Prefer WebP for new local assets. Use `sharp` for conversion.

### Fonts
- Root font: **Assistant** via `next/font/google`
- Config: `subsets: ['hebrew', 'latin']`, `display: 'swap'`
- Assistant is a variable font — do not load multiple weight files
- Do not reintroduce Poppins or Latin-only subsets on a Hebrew site

### ISR & on-demand revalidation
**Time-based ISR** — add to server-rendered public data pages:
```js
export const revalidate = 3600; // 1 hour
```
Applied to: `/`, `/shop`, `/blog`, `/blog/[slug]`, `/shop/products/[slug]`.

**On-demand revalidation** — MUST call `revalidatePath` in mutation APIs so admin edits appear immediately:

| Mutation | Paths to revalidate |
|----------|---------------------|
| Product create/update | `/shop`, `/`, `/shop/products/{slug}` |
| Post create/update | `/blog`, `/blog/{slug}` |

```js
import { revalidatePath } from 'next/cache';
revalidatePath('/shop');
revalidatePath(`/shop/products/${product.slug}`);
```

Never rely on ISR alone for admin-published content without `revalidatePath` on writes.

---

## 5. Database & Error Handling

### Connection (`server/DL/connectToMongo.js`)
- **Always** use `connectToMongo()` before Mongoose queries in server components and API routes.
- Connection promise is cached globally (`global._mongooseCache`) to prevent parallel connection races.
- `serverSelectionTimeoutMS: 10000` — fail fast; do not rely on Mongoose query buffering.

### DNS / SRV workaround (dev machines)
`mongodb+srv://` requires SRV DNS lookup. If Node's resolver is `127.0.0.1` and refuses SRV queries, `connectToMongo` retries once with public DNS (`1.1.1.1`, `8.8.8.8`). Do not remove this fallback without verifying all deployment environments resolve SRV correctly.

### Error handling rules
- **Never** swallow connection errors with `console.log` and continue — pages will render empty and fail opaquely at query time.
- On connection failure: clear `cached.promise` so the next request retries.
- API routes: return structured JSON errors; do not leak stack traces or internal messages to public clients.

### Serialization
- Pass MongoDB documents to client components via `JSON.parse(JSON.stringify(...))` or `@/utils/serialization` — Mongoose objects are not serializable across the server/client boundary.

### Draft content
- Public post reads (`getPostBySlug`, blog pages) should filter `status: 'published'` for anonymous users. Admin routes use `/api/post/admin` or authenticated PUT.

---

## Quick Regression Checklist

Before merging any PR, verify:

- [ ] No `next/head` imports in `app/`
- [ ] No unauthenticated `POST`/`PUT`/`DELETE` on product, post, category, upload, or media routes
- [ ] New external image domains added to `next.config.mjs` `remotePatterns`
- [ ] Public pages use `next/image`, not raw `<img>`
- [ ] Metadata + canonical on every new public route
- [ ] `revalidatePath` called on any content mutation API
- [ ] No `next-sitemap` package or `postbuild` sitemap script
- [ ] Route folders are lowercase (`/contact`, not `/Contact`)
- [ ] Semantic landmarks preserved (`header`, `nav`, `main`, `footer`, one `h1` per page)

---

*Last updated: audit implementation — Steps 1–4 (Security, SEO, Performance, Schema, ISR).*

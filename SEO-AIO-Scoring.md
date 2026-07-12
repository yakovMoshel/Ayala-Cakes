# SEO & AIO Scoring — Source of Truth

**Purpose:** Definitive reference for the blog post SEO/AIO scoring engine.  
**If you change scoring rules, update this file and `utils/seoScore.js` together.**

---

## Architecture Overview

```
Components/AddPostForm/index.js   ← UI only (sidebar, indicators, score widget)
        │
        │  analyzePost(formData) on every formData change
        ▼
utils/seoScore.js               ← ALL scoring logic lives here (single source of truth)
```

| Concern | Location | Notes |
|---------|----------|-------|
| **Scoring / grading** | `utils/seoScore.js` | Client-side, free, real-time |
| **SEO field generation** | `server/BL/geminiService.js` via `POST /api/generate-seo` | Gemini API; does **not** compute the score |
| **Rate limit (Gemini)** | `app/api/generate-seo/route.js` | 5 req / IP / minute + admin auth |

The score is **not** AI-generated. Gemini only fills fields (`seoTitle`, `metaDescription`, `slug`, etc.). The numeric score and Hebrew directives are computed locally.

---

## Public API

### `analyzePost(formData)`

**Input:** subset of post form fields:

| Field | Used for |
|-------|----------|
| `title` | Length, keyword placement |
| `seoTitle` | Length (falls back to `title`) |
| `metaDescription` | Length, keyword, stuffing |
| `content` | HTML body (Quill output) |
| `summary` | Length (UX score) |
| `focusKeyword` | All keyword checks |
| `slug` | URL keyword check |
| `image` | Featured image (metadata) |
| `socialImage` | OG image (metadata) |

**Output:**

```js
{
  analysis: { /* per-check status + message objects */ },
  scores: { overall, keyword, content, metadata, ux },  // each 0–100
  recommendations: [ /* top 5 failed checks by impact */ ]
}
```

### `SEO_GUIDELINES`

Exported constant in `utils/seoScore.js`. **Change thresholds here first**, then update this doc.

```js
title:            { min: 30,  max: 70,  optimal: 55 }   // characters
seoTitle:         { min: 30,  max: 70,  optimal: 55 }   // characters
metaDescription:  { min: 120, max: 155, optimal: 145 }  // characters
content:          { min: 300, max: null, optimal: 900 }  // words
summary:          { min: 100, max: 155, optimal: 130 }   // characters
focusKeyword:     { min: 1,   max: 4,   optimal: 2 }    // words
headings:         { min: 2,   max: null, optimal: 4 }   // H2 + H3 count
internalLinks:    { min: 2,   max: null, optimal: 4 }
externalLinks:      { min: 1,   max: null, optimal: 2 }
paragraphLength:  { max: 150 }                            // words per <p>
sentenceLength:   { max: 25 }                             // words per sentence
keywordDensity:   { min: 0.5, max: 3.0, optimal: 1.5 }   // percent
directAnswer:     { minWords: 40, maxWords: 120 }         // opening paragraph
```

---

## Text Processing Rules

### HTML stripping (`stripHtml`)

1. Replace all HTML tags with a space (prevents word fusion at tag boundaries).
2. Replace common entities (`&nbsp;`, `&amp;`, etc.) with space.
3. Collapse whitespace.

Used for: word counts, keyword density, readability, first-paragraph extraction.

### Word count

Split on whitespace; filter empty tokens. Applied to plain text after stripping.

### Length status (`lengthStatus`)

For each measured field:

| Condition | Status | UI color class |
|-----------|--------|----------------|
| Empty | `pending` | gray |
| Below `min` | `bad` | red |
| Above `max` | `warning` | yellow |
| Within ±10% of `optimal` | `good` | green |
| Between min/max but not optimal band | `ok` | light green |

**Word-count fields:** `content`, `focusKeyword`  
**Character-count fields:** everything else

### First paragraph extraction

1. Find all `<p>...</p>` blocks in order.
2. Return text of the **first non-empty** block (skips Quill artifacts like `<p><br></p>`).
3. Fallback: first 60 words of stripped full content.

Used for: keyword-in-first-paragraph, direct-answer (AIO) check.

---

## Hebrew Keyword Matching

JavaScript `\b` word boundaries **do not work** for Hebrew (Hebrew letters are not `\w`). The engine uses Unicode lookarounds instead.

### `countKeyword(text, keyword)`

Regex pattern (simplified):

```
(?<![\p{L}\p{N}])[ובלמשכה]{0,2}{keyword}(?![\p{L}\p{N}])
```

- Keyword is regex-escaped.
- Optional Hebrew prefixes (ו/ב/ל/מ/ש/כ/ה) before the keyword still count as a match.  
  Example: keyword `עוגת בנטו` matches `לעוגת בנטו`.
- Fallback on engines without lookbehind: naive substring count.

### `includesKeyword(text, keyword)`

Case-insensitive substring check. Used for title, meta description, first paragraph presence (not density).

### Keyword density formula

```
density = (keywordOccurrences / totalWords) * 100
```

- `keywordOccurrences` = `countKeyword(plainText, focusKeyword)`
- `totalWords` = word count of stripped content
- Optimal range: **0.5% – 3.0%**

**Note:** Multi-word keywords use the same density math as single words (industry-standard; may slightly understate density for long phrases).

---

## Per-Check Reference

Each check returns `{ status, message }` unless noted as boolean.

### Keywords

| Check | Pass condition | Fail message (Hebrew) |
|-------|----------------|---------------------|
| Keyword in title | `includesKeyword(title, focusKeyword)` | הוסיפי את מילת המפתח לכותרת הפוסט |
| Keyword in meta description | `includesKeyword(metaDescription, focusKeyword)` | שלבי את מילת המפתח ב-Meta Description |
| Keyword in content | `countKeyword > 0` or substring in plain text | מילת המפתח לא נמצאה בתוכן |
| Keyword in first paragraph | keyword in `firstParagraphText(content)` | שלבי את מילת המפתח בפסקה הראשונה |
| Keyword in slug | slug contains keyword with spaces → hyphens | הוסף את מילת המפתח ל-URL |
| Density in range | 0.5% ≤ density ≤ 3.0% | נמוכה/גבוהה מדי + percentage |
| **Keyword stuffing** | NOT (density > 3% OR keyword ≥2× in title OR ≥2× in meta) | זוהתה דחיסת מילות מפתח |

Stuffing is the only check that **actively deducts points** from the keyword sub-score (−25).

### Structure (HTML in Quill content)

| Check | Pass condition |
|-------|----------------|
| Headings (H2/H3) | `h2Count + h3Count >= 2` AND valid hierarchy |
| Heading hierarchy | NOT (`h3Count > 0` AND `h2Count === 0`) |
| No H1 in content | `h1Count === 0` — post title is the page `<h1>` |
| Question headings | Bonus/info only: any H2/H3 text contains `?` |

Quill toolbar allows H1/H2/H3. **Admins should use H2/H3 only** in body content.

### AIO (AI / LLM optimization)

| Check | Pass condition |
|-------|----------------|
| **Direct answer** | First paragraph: 40–120 words AND (no keyword set OR keyword present) |
| **Lists** | Content contains `<ul>` or `<ol>` |
| Question headings | Informational; not scored, shown as `good` or `info` |

Direct answer targets LLM chunk extraction: the opening paragraph should answer the search intent immediately.

### Links

Parsed from `<a href="...">` in content:

| Type | Classification |
|------|----------------|
| Internal | `href` starts with `/` OR contains `ayacakes.biz` |
| External | everything else |

Minimums: **2 internal**, **1 external** (external is `info` if missing, not hard fail).

### Readability

| Check | Pass condition |
|-------|----------------|
| Sentence length | ≤20% of sentences exceed 25 words |
| Paragraph length | No `<p>` block exceeds 150 words |
| Paragraph count | ≥3 paragraphs helps content score; ≥5 helps UX score |

Sentence split: `.`, `!`, `?`

### Media

| Check | Field | Pass condition |
|-------|-------|----------------|
| Featured image | `formData.image` | non-empty URL |
| Social / OG image | `formData.socialImage` | non-empty |
| In-content images | HTML `<img>` | optional; alt text checked if present |
| Alt text | in-content images | every `<img>` has non-empty `alt="..."` |

### Mobile optimization

Static reminder only (`status: info`). Not measured. Message: יש לבדוק תאימות למובייל ומהירות טעינה.

---

## Scoring Model

Four sub-scores (each capped 0–100), combined into **overall**:

```
overall = round(keyword × 0.25 + content × 0.30 + metadata × 0.25 + ux × 0.20)
```

UI thresholds (same as before upgrade):

| Overall | Color |
|---------|-------|
| ≥ 80 | green (`good`) |
| ≥ 50 | yellow (`ok`) |
| < 50 | red (`bad`) |

### Keyword sub-score (max 100)

| Signal | Points |
|--------|--------|
| Keyword in title | +20 |
| Keyword in meta description | +15 |
| Keyword in content | +10 |
| Keyword in first paragraph | +15 |
| Keyword in slug | +10 |
| Density in range (0.5–3%) | +30 |
| **Keyword stuffing detected** | **−25** |

Final: `clamp(0, 100)`.

### Content sub-score (max 100)

| Signal | Points |
|--------|--------|
| Content length `good` | +20 |
| Content length `ok` | +12 |
| Headings ≥ min AND hierarchy OK | +10 |
| No H1 in content | +5 |
| Direct answer OK | +15 |
| Has list (`<ul>`/`<ol>`) | +10 |
| Has in-content images | +10 |
| All in-content images have alt | +10 |
| Internal links ≥ 2 | +10 |
| External links ≥ 1 | +5 |
| Paragraph count ≥ 3 | +5 |

Final: `min(100)`.

### Metadata sub-score (max 100)

| Signal | Points |
|--------|--------|
| Title length `good` | +20 |
| Title length `ok` | +15 |
| Meta description `good` | +20 |
| Meta description `ok` | +15 |
| Slug present | +20 |
| Featured image present | +20 |
| Social image present | +20 |

Final: `min(100)`.

### UX sub-score (max 100)

| Signal | Points |
|--------|--------|
| Summary length `good` or `ok` | +30 |
| ≤10% long sentences (>25 words) | +25 |
| Paragraph count ≥ 5 | +20 |
| No paragraphs over 150 words | +25 |

Final: `min(100)`.

---

## Recommendations ("מה לתקן קודם")

When checks fail, candidates are ranked by **estimated impact on overall score**:

```
impact = subScorePoints × categoryWeight
```

Example: stuffing penalty = 25 pts × 0.25 keyword weight = **6.25 impact**.

Top **5** failing checks are returned as `recommendations[]` and rendered at the top of the ניתוח SEO panel in `AddPostForm`.

### Impact priority table (highest first)

| Impact | Check |
|--------|-------|
| 7.5 | Density out of range (not stuffing) |
| 6.25 | Keyword stuffing |
| 6.0 | Content too short (< 300 words) |
| 5.0 | Keyword missing from title |
| 5.0 | Meta description missing / wrong length |
| 5.0 | Missing featured image |
| 5.0 | Missing social image |
| 4.5 | Direct answer paragraph fails |
| 4.0 | H1 inside content |
| 3.75 | Keyword missing from first paragraph |
| 3.75 | Keyword missing from meta description |
| 3.0 | Too few H2/H3 headings |
| 3.0 | No lists |
| 3.0 | Too few internal links |
| 3.0 | Missing alt text on in-content images |
| 5.0 | Long paragraphs (>150 words) |

To change recommendation priority, edit the `candidates` array in `analyzePost()` (`utils/seoScore.js`).

---

## UI Integration (`Components/AddPostForm/index.js`)

### When analysis runs

```js
useEffect(() => {
  analyzeSEO();
}, [formData, analyzeSEO]);
```

Every keystroke / Quill change re-runs scoring (client-only, no debounce).

### State mapping

| State | Source |
|-------|--------|
| `seoAnalysis` | `result.analysis` |
| `seoScores` | `result.scores` |
| `seoRecommendations` | `result.recommendations` |

### Indicator statuses → CSS

`SeoStatusIndicator` maps status to icon + `styles[status]`:

`good` | `ok` | `bad` | `warning` | `pending` | `info` | `neutral`

Do not rename statuses without updating SCSS in `Components/AddPostForm/style.module.scss`.

### Sidebar sections using analysis

1. **מה לתקן קודם** — `seoRecommendations` (top 5)
2. **מילות מפתח** — boolean checks + density + stuffing
3. **מבנה התוכן** — length, headings, H1, direct answer, lists, links, readability
4. **מדיה** — featured, alt, social
5. **התאמה למובייל** — static info
6. **Score breakdown** — four sub-scores

Per-field indicators (title, summary, content, meta description) also read from `seoAnalysis.*Length`.

---

## Gemini AI Generation (separate from scoring)

Files:
- `server/BL/geminiService.js` — API calls
- `server/BL/context/business.md` — עסק, קהל יעד, איסורים (נערך ידנית)
- `server/BL/context/writingStyle.md` — טון, סגנון ניסוח, דוגמאות (נערך ידנית)
- `server/BL/context/loadContext.js` — טוען את קבצי ה-MD לפרומפט
- `server/BL/seoPromptRules.js` — SEO/AIO checklist for full-blog prompts
- `app/api/generate-seo/route.js` — admin API

| Setting | SEO fields (`post`) | Full blog (`post-full`) |
|---------|---------------------|-------------------------|
| Model | `GEMINI_MODEL` env or `gemini-3.5-flash` | same |
| `responseMimeType` | `application/json` | `application/json` |
| `temperature` | 0.4 | 0.5 |
| `maxOutputTokens` | 2048 | 8192 |
| Rate limit | 5 req / IP / minute | 2 req / IP / minute |

### API types (`POST /api/generate-seo`)

| `type` | Purpose | Required input |
|--------|---------|----------------|
| `post` | SEO fields from existing content | `title`, `summary`, `content`, `author` |
| `post-full` | Full new blog post | `topic`, optional `userKeywords`, `userNotes`, `author` |
| `product` | Product SEO fields | product data |
| `slug` | English slug from title | `title` |

Full blog output fills title, summary, content (HTML), all SEO keyword fields, slug, CTA. **No links or images** in generated HTML — admin adds manually.

Generation runs in **two steps**: (1) blog content HTML, (2) SEO fields from that content — avoids truncated JSON on long posts.

Generated fields populate the form; **scoring runs client-side** via `analyzePost()` after fill. AI does not compute the numeric score.

**Do not** move scoring into Gemini — it adds latency, cost, and non-deterministic grades.

Override model via `.env`: `GEMINI_MODEL=gemini-3.5-flash`

---

## How to Change Rules Safely

1. Edit `SEO_GUIDELINES` and/or scoring blocks in `utils/seoScore.js`.
2. Update this document to match.
3. Verify in admin: `/admin/posts/new` or edit an existing post.
4. Confirm:
   - Sub-scores still 0–100
   - Overall widget color thresholds still make sense
   - Recommendation order reflects your intent
5. Run `npm run build` (no server changes needed for scoring-only edits).

### Common change examples

| Goal | What to edit |
|------|--------------|
| Require longer posts | `SEO_GUIDELINES.content.min` |
| Stricter meta description | `SEO_GUIDELINES.metaDescription.max` |
| More keyword weight in overall | Increase `0.25` keyword multiplier in overall formula |
| New check (e.g. FAQ block) | Add detection in `analyzePost`, add points to a sub-score, add to `candidates` for recommendations, add UI row in `AddPostForm` |
| Softer stuffing penalty | Change `keywordScore -= 25` |

---

## Known Limitations

1. **Hebrew density for multi-word keywords** — counted as occurrences / total words, not per-phrase industry TF-IDF.
2. **Link detection** — only double-quoted `href="..."`; single quotes not parsed.
3. **Alt text** — counts `alt="..."` presence, not quality or keyword relevance.
4. **Mobile / CWV** — not measured in editor; site-level concern (see `Critical Rules.md`).
5. **No debounce** — large posts re-score on every formData change (acceptable for admin use).
6. **Product posts** — this engine is **blog-only**; product SEO uses Gemini generation without this score UI.

---

## Related Files

| File | Role |
|------|------|
| `utils/seoScore.js` | Scoring engine (edit here) |
| `Components/AddPostForm/index.js` | Admin UI consumer |
| `Components/AddPostForm/style.module.scss` | Indicator / score widget styles |
| `server/BL/geminiService.js` | AI field generation |
| `app/api/generate-seo/route.js` | API + rate limit |
| `Critical Rules.md` | Site-wide SEO/architecture rules |

---

*Last synced with codebase: SEO/AIO scoring upgrade (utils/seoScore.js).*

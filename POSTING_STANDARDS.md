# Posting Standards

> **All posts must be written in English.** The blog targets global English-speaking investors via Google Search.

---

## Core Principle: Google E-E-A-T

Google AdSense permits AI-generated content provided it demonstrates **Experience, Expertise, Authoritativeness, and Trustworthiness (E-E-A-T)**. Every post must satisfy all four dimensions.

| Dimension | What It Means | How to Apply |
|-----------|--------------|--------------|
| **Experience** | Real-world context, not generic statements | Reference specific price levels, dates, earnings figures, analyst estimates with sources |
| **Expertise** | Deep subject-matter knowledge | Use precise financial terminology; explain *why* a metric matters, not just what it is |
| **Authoritativeness** | Content others would cite or trust | Cite official sources (SEC filings, IR pages, FactSet, Bloomberg); link to primary data |
| **Trustworthiness** | Honest, accurate, transparent | Always include data date; distinguish fact from opinion; include disclaimer; never exaggerate |

**Any post that fails E-E-A-T standards must not be published.**

---

## Duplicate Post Prevention (MANDATORY)

**Before selecting any post topic, you MUST check the existing published posts and avoid duplicates.**

- Do NOT write a post on the same company + same event (e.g., "Netflix Q1 2026 Earnings" cannot be posted twice)
- Do NOT write a post with a substantially similar title or thesis to an existing post
- If a topic has already been covered, choose a different angle, different company, or different time period
- The list of existing posts will be provided at runtime — treat it as a strict exclusion list

**Rule:** If a proposed topic overlaps with any existing post title by more than 50% in subject matter, discard it and pick a different topic.

---

## Category Balance (MANDATORY)

**Before selecting topics, analyze the category distribution of existing posts and prioritize underrepresented categories.**

Available categories and their slugs:
| Category | Slug |
|----------|------|
| Stock Analysis | `stock-analysis` |
| Market Trend | `market-trend` |
| Earnings | `earnings` |
| ETF Analysis | `etf-analysis` |
| Investment Strategy | `investment-strategy` |

**Rules:**
1. Count how many posts exist in each category from the provided post list
2. Rank categories from least to most posts
3. The topic proposals **must prioritize** the 1–2 categories with the fewest posts
4. If two categories are tied, alternate between them across runs
5. Do NOT write another post in the most-populated category unless all others have been covered

**Example:** If existing posts are 6 earnings, 4 stock-analysis, 2 market-trend, 1 etf-analysis, 1 investment-strategy → today's topics should come from `etf-analysis` and `investment-strategy` first.

This ensures balanced, diversified content that covers all investor interests and improves SEO breadth.

---

## 1. E-E-A-T Writing Rules

### Experience
- Every analysis must be grounded in **specific, verifiable data points** with a stated date
  - ✅ "Goldman Sachs reported Q1 2026 EPS of $17.55, beating the $14.21 consensus estimate (FactSet, April 14 2026)"
  - ❌ "Goldman Sachs had a great quarter recently"
- Reference real market events, earnings calls, macroeconomic context
- Include at least one **forward-looking perspective** based on stated assumptions

### Expertise
- Use correct financial terminology: EPS, ROE, P/E, NII, CAGR, free cash flow, etc.
- Explain the *significance* of each metric — don't just report numbers
- Provide sector context: compare to industry peers or historical averages

### Authoritativeness
- Cite at least **2 named sources** per post (e.g., FactSet, Bloomberg, company IR, CNBC, Reuters)
- Reference consensus analyst estimates when discussing expectations
- When quoting management, attribute to the person and the occasion

### Trustworthiness
- State the data date clearly in the post (e.g., "as of April 16, 2026")
- Distinguish between **reported figures** and **estimates/forecasts**
- Include the standard disclaimer on every post
- Never overstate certainty: use "suggests," "indicates," "analysts expect" — not "will" or "guaranteed"

---

## 2. Thumbnail & Cover Image

### 🎨 Thumbnail Generation Method

**Thumbnails are Canvas-composited images uploaded to R2 CDN.**

- **Background**: Content-relevant Unsplash photo (topic-matched, e.g. chip fab for TSMC, stock chart for investment posts)
- **Composite layers**: dark gradient overlay + badge + logo + headline + subtext + divider + tags/date
- **Tool**: Node.js `canvas` package (`generate_real_thumbnails.js`)
- **Storage**: Cloudflare R2 via `/api/upload/image` → `cover_image_url`
- **Format**: 1200×630px PNG

### Unsplash Background URL Format

```
https://images.unsplash.com/photo-{PHOTO_ID}?w=1200&q=80&fm=jpg
```

Pick a photo relevant to the post topic. Always verify the URL loads before using.

### Canvas Composite Layers (top to bottom)

1. Background photo (full 1200×630)
2. Dark linear gradient overlay (top: rgba(0,0,0,0.55) → bottom: rgba(0,0,0,0.80))
3. Sentiment glow (radial, bottom-left corner)
4. Badge rect + text top-left (PRE-MARKET / ANALYSIS / MARKET CLOSE — **no emojis**)
5. Logo text top-right ("USStockStory")
6. Headline (bold, max 2 lines, 60px white)
7. Subtext (30px gray #CBD5E1)
8. Divider line (bottom area)
9. Tags + date footer

### ⚠️ CRITICAL: R2 URL Requirement

**❌ DO NOT use raw Unsplash URLs as cover_image_url.**
**✅ MUST: Generate Canvas composite → upload to R2 → use R2 URL (`https://pub-xxxxxx.r2.dev/images/...`)**

See `THUMBNAIL_GENERATION-8.md` for full Canvas implementation details.

---

## 3. Content Length & Structure

- **Body text: 1,000–1,500 words** (English)
- Structure with 3–4 subheadings (`##`)
- Include at least **1 data table** for key metrics
- Every section must add analytical value — no filler paragraphs

---

## 4. In-Body Image (REQUIRED)

- Insert **EXACTLY 1 related image** in the middle of the post body
- Position: after the key data table, before the next analysis section
- Markdown format: `![alt text describing image](unsplash-url)`
- **Source**: Unsplash stable URL format:
  ```
  https://images.unsplash.com/photo-{PHOTO_ID}?w=1200&q=80&fm=jpg
  ```
- Choose a photo relevant to the post topic (same photo selection logic as thumbnail background)
- Alt text: descriptive English text for SEO

---

## 5. Data Verification

| Item | Source |
|------|--------|
| Stock/ETF price | Yahoo Finance, stockanalysis.com |
| Earnings data | Official IR, SEC filing, Bloomberg, Reuters |
| Analyst estimates | FactSet, Visible Alpha, Wall Street consensus |
| Market indices | CNBC, MarketWatch |
| Date reference | Must specify date in post |

- Data older than **7 days** must be updated before use

---

## 6. Post Structure Template

```markdown
## Overview
[2–3 sentences: what happened, why it matters now. Include specific figures.]

*Sources: [Source 1], [Source 2]*

---

## Key Data (as of YYYY Month DD)

| Metric | Value | vs. Estimate / YoY |
|--------|-------|--------------------|
| EPS | $XX.XX | Beat by X% |
| Revenue | $XXB | +XX% YoY |

---

## [Analysis Section 1]

[200–300 words. Explain what the numbers mean.]

![related image description](https://images.unsplash.com/photo-{ID}?w=1200&q=80&fm=jpg)

---

## [Analysis Section 2 — Forward Outlook]

[200–300 words. Forward guidance, analyst expectations, key risks.]

---

## Risk Factors

- **Risk 1**: [specific explanation]
- **Risk 2**: [specific explanation]
- **Risk 3**: [specific explanation]

---

## Investment Outlook

[100–150 words. Balanced conclusion.]

> **Disclaimer**: This content is for informational purposes only and was produced with AI assistance. It does not constitute financial advice. All investment decisions carry risk and are solely your own responsibility. Past performance is not indicative of future results.
```

---

## 7. Metadata Checklist

### Post Content
- [ ] `title`: includes key ticker/keyword, under 60 characters
- [ ] `excerpt`: under 160 characters, includes a concrete fact/number
- [ ] `category`: stock-analysis / market-trend / earnings / etf-analysis / investment-strategy
- [ ] `tags`: 3–5 tags (must exist in DB)
- [ ] `reading_time_mins`: 4–6 minutes

### Thumbnail
- [ ] `thumbnail_headline`: max 44 chars
- [ ] `thumbnail_subtext`: max 30 chars
- [ ] `thumbnail_sentiment`: bullish / bearish / neutral
- [ ] `trigger_type`: morning / afternoon / evening
- [ ] **`cover_image_url` is an R2 CDN URL** (`https://pub-xxxxxx.r2.dev/images/...`)

### Body Content
- [ ] `content_md` includes **exactly 1 in-body image**: `![description](unsplash-url)`
- [ ] Unsplash URL is stable format (`?w=1200&q=80&fm=jpg`)

### CRITICAL IMAGE CHECK
- [ ] ✅ `cover_image_url` = R2 URL (Canvas composite uploaded to R2)
- [ ] ✅ In-body image present in `content_md` with Unsplash URL
- [ ] ✅ Both URLs verified as accessible before publishing

---

## 8. SEO Guidelines

- Include ticker symbol in the title (e.g., SMH, NVDA, TSLA)
- Slug must be in English (e.g., `tsmc-q1-2024-earnings-ai-demand`)
- Target long-tail keywords English-speaking investors search for
- Meta excerpt should include a specific data point

---

## 9. Language Rule

- **All posts: English only**
- No Korean text in titles, excerpts, body, or tags
- Tone: professional but accessible — like a knowledgeable analyst writing for retail investors

---

## 10. E-E-A-T Self-Check Before Publishing

- [ ] At least 2 named sources cited?
- [ ] Every key number tied to a specific date?
- [ ] Analysis explains *why* data matters (not just what)?
- [ ] Estimates clearly labeled as estimates?
- [ ] Disclaimer included?
- [ ] `cover_image_url` is an R2 CDN URL?
- [ ] Exactly 1 in-body image in `content_md`?

If any box is unchecked, revise before publishing.

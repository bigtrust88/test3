# Posting Standards

> **All posts must be written in English.** The blog targets global English-speaking investors via Google Search.

---

## 1. Thumbnail & Cover Image

- **1 image** serves as both the card thumbnail (post list) and cover image (top of post)
- Choose an image **directly related to the post's stock/topic**:
  - Stock Analysis: company logo or product/business image
  - ETF Analysis: semiconductor chip, chart, or finance-related image
  - Market Trend: stock ticker board, exchange floor image
  - Earnings: company HQ, product image
- Image source: Unsplash (royalty-free), official company IR images
- Resolution: minimum 1200×630px (recommended OG Image ratio)
- Upload to R2, then save the URL in `cover_image_url`

---

## 2. Content Length

- **Body text: 1,000–1,500 words** (English)
- Structure with 3–4 subheadings (`##`)
- Include at least **1 table** for key data/metrics

---

## 3. In-Body Image

- Insert **1 related image** in the middle of the post body
- Position: right after key data is introduced, or before a new analysis section
- Markdown format: `![description](imageURL)`
- Image source: Unsplash free images or chart screenshots
- Alt text: descriptive English text for SEO

---

## 4. Data Verification

Always verify the following before publishing:

| Item | Source |
|------|--------|
| Stock/ETF price | Yahoo Finance, stockanalysis.com (real-time) |
| Earnings data | Official IR, Bloomberg, Reuters |
| Market indices | CNBC, MarketWatch |
| Date reference | Must specify date in post (e.g., "as of April 2026") |

- Data older than 7 days must be updated before use
- Estimates must cite their source

---

## 5. Post Structure Template

```markdown
## Overview
[2–3 sentence summary. Why this stock/ETF right now?]

---

## Key Data (as of YYYY Month)

| Metric | Value |
|--------|-------|
| Price | $XXX |
| YTD Return | +XX% |
| ...  | ... |

---

## [Analysis Section 1]

[200–300 word analysis]

![related image description](imageURL)

---

## [Analysis Section 2]

[200–300 word analysis]

---

## Risk Factors

- **Risk 1**: explanation
- **Risk 2**: explanation

---

## Investment Outlook

[Conclusion and investment perspective, 100–150 words]

> **Disclaimer**: This content is for informational purposes only and does not constitute financial advice. All investment decisions are your own responsibility.
```

---

## 6. Metadata Checklist

- [ ] `title`: includes key ticker/keyword, under 60 characters
- [ ] `excerpt`: 1–2 sentence summary, under 160 characters
- [ ] `category`: stock-analysis / market-trend / earnings / etf-analysis / investment-strategy
- [ ] `tags`: related ticker symbols + topic keywords, 3–5 tags
- [ ] `cover_image_url`: R2 upload URL
- [ ] `is_published`: true
- [ ] `reading_time_mins`: 4–6 minutes based on content length

---

## 7. SEO Guidelines

- Include ticker symbol in the title (e.g., SMH, NVDA, TSLA)
- Naturally incorporate key keywords in the first paragraph
- Slug must be in English (e.g., `smh-etf-ai-semiconductor-analysis-0415`)
- Target long-tail keywords English-speaking investors search for (e.g., "NVDA earnings Q1 2026 analysis")

---

## 8. Language Rule

- **All posts: English only**
- No Korean text in titles, excerpts, body, or tags
- Write for a global audience — avoid region-specific references (e.g., no "Korean won exchange rate" sections)
- Tone: professional but accessible — like a knowledgeable analyst writing for retail investors

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
- Avoid vague language like "stocks could go up or down"

### Authoritativeness
- Cite at least **2 named sources** per post (e.g., FactSet, Bloomberg, company IR, CNBC, Reuters)
- Reference consensus analyst estimates when discussing expectations
- When quoting management, attribute to the person and the occasion (e.g., "CEO Jamie Dimon, Q1 2026 earnings call")

### Trustworthiness
- State the data date clearly in the post (e.g., "as of April 16, 2026")
- Distinguish between **reported figures** and **estimates/forecasts**
- Mark AI-assisted content transparently — the site already tags posts as AI-generated
- Include the standard disclaimer on every post (see template below)
- Never overstate certainty: use "suggests," "indicates," "analysts expect" — not "will" or "guaranteed"

---

## 2. Thumbnail & Cover Image (AI-Generated via Canvas)

### 📐 Thumbnail Generation Method

**All thumbnails are auto-generated using NestJS Canvas (skia-canvas) service.**

- **Cost**: $0/month (no Bannerbear fees)
- **Speed**: <100ms per image
- **Format**: 1200×630px (16:9 OG Image standard)
- **Quality**: Professional, content-aware design

### How It Works

When you create a post, provide these thumbnail parameters in the payload:

```json
{
  "thumbnail_headline": "TSMC Q1 2024: Record Revenue",      // max 44 chars
  "thumbnail_subtext": "AI chip demand drives growth",         // max 30 chars
  "thumbnail_sentiment": "bullish",                           // bullish|bearish|neutral
  "highlight_keywords": ["TSMC", "AI", "semiconductors"],    // for design emphasis
  "category_slug": "stock-analysis",                          // determines badge color
  "trigger_type": "morning"                                   // morning|afternoon|evening
}
```

### Canvas Design Features

- **Background**: Time-based theme (morning blue, afternoon green, evening yellow)
- **Badge**: Category + sentiment indicator (top-left)
- **Logo**: "USStockStory" branding (top-right)
- **Headline**: Bold, 2-line max (main content)
- **Subtext**: Secondary message (gray text)
- **Footer**: Tags + publication date
- **Accent Colors**: Bullish (green), Bearish (red), Neutral (blue)

### ✅ What NOT to Do

❌ Do NOT upload custom images to R2 manually  
❌ Do NOT use Unsplash links  
❌ Do NOT manually set cover_image_url

Canvas handles all of this automatically!

### 📝 Reference

See `THUMBNAIL_GENERATION-CANVAS.md` for technical implementation details.

---

## 3. Content Length & Structure

- **Body text: 1,000–1,500 words** (English)
- Structure with 3–4 subheadings (`##`)
- Include at least **1 data table** for key metrics
- Every section must add analytical value — no filler paragraphs

---

## 4. In-Body Image (필수 — MUST HAVE)

- Insert **EXACTLY 1 related image** in the middle of the post body — **this is REQUIRED, not optional**
- Position: right after key data is introduced (e.g., after data table), or before a new analysis section
- Markdown format: `![description](imageURL)` — **must be in content_md, not optional**
- Image source: Unsplash free images (https://unsplash.com) or official company images
- Alt text: descriptive English text for SEO
- Resolution: minimum 1200x630px
- **CRITICAL CHECK**: Without this image in content_md, the post will not display correctly. Always verify the image URL is included BEFORE uploading to API.

---

## 5. Data Verification

Always verify the following before publishing:

| Item | Source |
|------|--------|
| Stock/ETF price | Yahoo Finance, stockanalysis.com (real-time) |
| Earnings data | Official IR, SEC filing, Bloomberg, Reuters |
| Analyst estimates | FactSet, Visible Alpha, Wall Street consensus |
| Market indices | CNBC, MarketWatch |
| Date reference | Must specify date in post (e.g., "as of April 2026") |

- Data older than **7 days** must be updated before use
- Estimates must cite their source explicitly in the text

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
| [Metric] | [Value] | [Context] |

---

## [Analysis Section 1 — e.g., Segment Breakdown]

[200–300 words. Explain what the numbers mean, not just what they are.
Cite sources. Compare to peers or history.]

![related image description](imageURL)

---

## [Analysis Section 2 — e.g., Forward Outlook]

[200–300 words. Forward guidance, analyst expectations, key risks ahead.
Distinguish estimates from facts.]

---

## Risk Factors

- **Risk 1**: [specific, concrete explanation]
- **Risk 2**: [specific, concrete explanation]
- **Risk 3**: [specific, concrete explanation]

---

## Investment Outlook

[100–150 words. Balanced conclusion. State assumptions clearly.
Avoid definitive predictions.]

> **Disclaimer**: This content is for informational purposes only and was produced with AI assistance. It does not constitute financial advice. All investment decisions carry risk and are solely your own responsibility. Past performance is not indicative of future results.
```

---

## 7. Metadata Checklist

### Post Content
- [ ] `title`: includes key ticker/keyword, under 60 characters
- [ ] `excerpt`: 1–2 sentence summary, under 160 characters — must state a concrete fact
- [ ] `category`: stock-analysis / market-trend / earnings / etf-analysis / investment-strategy
- [ ] `tags`: related ticker symbols + topic keywords, 3–5 tags (must exist in DB)
- [ ] `is_published`: true
- [ ] `reading_time_mins`: 4–6 minutes based on content length
- [ ] At least 2 named sources cited in body
- [ ] Data date stated in post
- [ ] Disclaimer included

### Thumbnail (Canvas Auto-Generation)
- [ ] `thumbnail_headline`: max 44 chars, engaging headline
- [ ] `thumbnail_subtext`: max 30 chars, supporting message
- [ ] `thumbnail_sentiment`: bullish / bearish / neutral
- [ ] `trigger_type`: morning / afternoon / evening
- [ ] `highlight_keywords`: 3–5 important keywords from post

### Body Content
- [ ] `content_md`: **includes 1 in-body image with markdown format ![description](URL)**
- [ ] All images have valid, stable Unsplash URLs (ixlib=rb-4.0.3 format)

### **CRITICAL CHECK**
- [ ] ✅ thumbnail_headline and thumbnail_subtext are provided (Canvas will auto-generate cover_image_url)
- [ ] ✅ in-body image is present in content_md
- [ ] ✅ All image URLs use stable format (ixlib=rb-4.0.3&auto=format&fit=crop)

---

## 8. SEO Guidelines

- Include ticker symbol in the title (e.g., SMH, NVDA, TSLA)
- Naturally incorporate key keywords in the first paragraph
- Slug must be in English (e.g., `smh-etf-ai-semiconductor-analysis-0415`)
- Target long-tail keywords English-speaking investors search for (e.g., "NVDA earnings Q1 2026 analysis")
- Meta excerpt should include a specific data point (number, percentage, or date) — this improves CTR

---

## 9. Language Rule

- **All posts: English only**
- No Korean text in titles, excerpts, body, or tags
- Write for a global audience — avoid region-specific references
- Tone: professional but accessible — like a knowledgeable analyst writing for retail investors

---

## 10. E-E-A-T Self-Check Before Publishing

Before hitting publish, confirm every item:

- [ ] Does the post cite **at least 2 named sources**?
- [ ] Is every key number tied to a **specific date**?
- [ ] Does the analysis explain **why** the data matters (not just what it is)?
- [ ] Are estimates clearly labeled as estimates, not facts?
- [ ] Does the post avoid exaggerated claims or certainty?
- [ ] Is the disclaimer included at the end?
- [ ] Would a knowledgeable investor find this genuinely useful?
- [ ] **CRITICAL**: Is cover_image_url present and valid (1200x630px minimum)?
- [ ] **CRITICAL**: Is EXACTLY 1 in-body image present in content_md with markdown format `![description](URL)`?

If any box is unchecked, revise before publishing.

/**
 * auto_post.js
 * 매일 아침 9시 자동 포스팅 스크립트
 * - Anthropic Claude API로 오늘의 주제 선정 + 본문 생성
 * - Node.js Canvas로 썸네일 합성 (Unsplash 배경 + 텍스트 오버레이)
 * - R2에 썸네일 업로드 → api.bigtrust.site에 포스트 게시
 */

const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');
const { createCanvas, loadImage } = require('canvas');
const FormData = require('form-data');
const { marked } = require('marked');
const Anthropic = require('@anthropic-ai/sdk');

const EMAIL    = process.env.BIGTRUST_EMAIL;
const PASSWORD = process.env.BIGTRUST_PASSWORD;
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

if (!EMAIL || !PASSWORD || !ANTHROPIC_API_KEY) {
  console.error('❌ 환경변수 누락: BIGTRUST_EMAIL, BIGTRUST_PASSWORD, ANTHROPIC_API_KEY 필요');
  process.exit(1);
}

const anthropic = new Anthropic({ apiKey: ANTHROPIC_API_KEY });
const API_HOST  = 'api.bigtrust.site';
const CANVAS_W  = 1200;
const CANVAS_H  = 630;

// ── 포스팅 기준 문서 로드 (Claude 프롬프트에 주입) ─────────────────────
const DOCS_DIR = path.join(__dirname, '..');
const POSTING_STANDARDS    = fs.readFileSync(path.join(DOCS_DIR, 'POSTING_STANDARDS.md'), 'utf8');
const THUMBNAIL_GENERATION = fs.readFileSync(path.join(DOCS_DIR, 'THUMBNAIL_GENERATION-8.md'), 'utf8');

// ── 주제별 Unsplash 배경 이미지 (하락 차트 이미지 절대 사용 금지) ──────
const PHOTO_MAP = {
  semiconductor:   'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&q=80&fm=jpg',
  gpu:             'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1200&q=80&fm=jpg',
  datacenter:      'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=1200&q=80&fm=jpg',
  finance:         'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=1200&q=80&fm=jpg',
  bank:            'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200&q=80&fm=jpg',
  streaming:       'https://images.unsplash.com/photo-1522869635100-9f4c5e86aa37?w=1200&q=80&fm=jpg',
  technology:      'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=1200&q=80&fm=jpg',
  'electric-vehicle': 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=1200&q=80&fm=jpg',
  biotech:         'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=1200&q=80&fm=jpg',
  energy:          'https://images.unsplash.com/photo-1466611653911-95081537e5b7?w=1200&q=80&fm=jpg',
  retail:          'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&q=80&fm=jpg',
  cloud:           'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=1200&q=80&fm=jpg',
};

// ── HTTP 헬퍼 ──────────────────────────────────────────────────────────
function apiRequest(options, body) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => { try { resolve(JSON.parse(d)); } catch { resolve({ error: d }); } });
    });
    req.on('error', reject);
    if (body) req.write(body);
    req.end();
  });
}

function downloadImage(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    client.get(url, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302)
        return downloadImage(res.headers.location).then(resolve).catch(reject);
      if (res.statusCode !== 200)
        return reject(new Error(`이미지 다운로드 실패: HTTP ${res.statusCode} — ${url}`));
      const chunks = [];
      res.on('data', c => chunks.push(c));
      res.on('end', () => resolve(Buffer.concat(chunks)));
    }).on('error', reject);
  });
}

// ── 1. 로그인 → 토큰 발급 ─────────────────────────────────────────────
async function login() {
  console.log(`  📧 시도 이메일: ${EMAIL}`);
  console.log(`  🔑 비밀번호 길이: ${PASSWORD ? PASSWORD.length : 0}자`);
  const body = JSON.stringify({ email: EMAIL, password: PASSWORD });
  const result = await apiRequest({
    hostname: API_HOST,
    path: '/api/auth/login',
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) },
  }, body);

  if (!result.access_token) throw new Error('로그인 실패: ' + JSON.stringify(result));
  console.log('  ✅ 로그인 성공');
  return result.access_token;
}

// ── 2. 카테고리 & 태그 조회 ──────────────────────────────────────────
async function getCategories(token) {
  const res = await apiRequest({ hostname: API_HOST, path: '/api/categories', headers: { Authorization: 'Bearer ' + token } });
  const list = res.data || res;
  const map = {};
  list.forEach(c => { map[c.slug] = c.id; });
  return map;
}

async function getTags(token) {
  const res = await apiRequest({ hostname: API_HOST, path: '/api/tags?limit=100', headers: { Authorization: 'Bearer ' + token } });
  const list = res.data || res;
  const map = {};
  list.forEach(t => { map[t.name.toLowerCase()] = t.id; map[t.slug] = t.id; });
  return map;
}

// ── 3. Claude — 오늘의 3개 주제 선정 ────────────────────────────────
async function generateTopics(today) {
  console.log('  🤖 Claude에게 오늘의 주제 요청 중...');

  const msg = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1500,
    system: `You are the content strategist for USStockStory.com, a US stock investment blog.
You must follow these posting standards at all times:

--- POSTING_STANDARDS.md ---
${POSTING_STANDARDS}

--- THUMBNAIL_GENERATION-8.md ---
${THUMBNAIL_GENERATION}`,
    messages: [{
      role: 'user',
      content: `Today is ${today}. Generate 3 distinct US stock investment blog post topics for USStockStory.com.

Follow the POSTING_STANDARDS.md and THUMBNAIL_GENERATION-8.md guidelines above.
Vary the categories (earnings, sector analysis, investment strategy, market trend).

Return ONLY a JSON array (no markdown, no explanation) with exactly 3 objects, each having:
{
  "title": "SEO title under 60 chars with ticker symbol",
  "slug": "url-slug-in-english-with-ticker",
  "excerpt": "1-2 sentence summary under 160 chars with specific number/metric",
  "category_slug": "earnings|stock-analysis|investment-strategy|market-trend|etf-analysis",
  "suggested_tags": ["tag1","tag2","tag3"],
  "thumbnail_headline": "max 44 chars — punchy, specific number if possible",
  "thumbnail_subtext": "max 30 chars — key metric or supporting stat",
  "sentiment": "bullish|bearish|neutral",
  "trigger_type": "morning",
  "photo_category": "semiconductor|gpu|datacenter|finance|bank|streaming|technology|electric-vehicle|biotech|energy|retail|cloud",
  "body_photo_category": "semiconductor|gpu|datacenter|finance|bank|streaming|technology|electric-vehicle|biotech|energy|retail|cloud"
}

THUMBNAIL RULES (from THUMBNAIL_GENERATION-8.md):
- thumbnail_headline: max 44 chars
- thumbnail_subtext: max 30 chars
- photo_category must NOT use declining/downward chart images
- sentiment glow: bullish=#10B981, bearish=#EF4444, neutral=#3B82F6

Available tags (use exact names): NVIDIA, TSMC, semiconductors, AI semiconductors, AMD, Netflix, Goldman Sachs, banks, Tesla, Q1 2026, earnings, earnings season, S&P 500, SMH, ETF, streaming`
    }]
  });

  const text = msg.content[0].text.trim();
  const jsonStr = text.replace(/^```json?\n?/, '').replace(/\n?```$/, '');
  return JSON.parse(jsonStr);
}

// ── 4. Claude — 포스트 본문 생성 ─────────────────────────────────────
async function generateContent(topic, today, bodyImageUrl) {
  console.log(`  🤖 본문 생성 중: "${topic.title}"`);

  const msg = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 4000,
    system: `You are an expert US stock investment analyst writing for USStockStory.com.
You must follow these standards exactly:

--- POSTING_STANDARDS.md ---
${POSTING_STANDARDS}`,
    messages: [{
      role: 'user',
      content: `Write a US stock investment blog post strictly following POSTING_STANDARDS.md above.

POST DETAILS:
- Title: ${topic.title}
- Today's date: ${today}
- Sentiment: ${topic.sentiment}
- Category: ${topic.category_slug}

REQUIRED STRUCTURE (Section 6 of POSTING_STANDARDS.md):
1. ## Overview — 2-3 sentences with specific figures. End with: *Sources: [Source1], [Source2]*
2. ---
3. ## Key Metrics (as of ${today}) — markdown table, 6-8 rows
4. ---
5. ## [Analysis Section 1] — 200-300 words explaining WHY the numbers matter
6. Insert EXACTLY this image on its own line:
   ![${topic.title} — market analysis and key data](${bodyImageUrl})
7. ---
8. ## [Analysis Section 2 — Forward Outlook] — 200-300 words
9. ---
10. ## Risk Factors — 3 bullet points with bold labels
11. ---
12. ## Investment Outlook — 100-150 words, balanced conclusion
13. > **Disclaimer**: This content is for informational purposes only and was produced with AI assistance. It does not constitute financial advice. All investment decisions carry risk and are solely your own responsibility. Past performance is not indicative of future results.

E-E-A-T CHECKLIST (mandatory):
- Cite at least 2 named sources (FactSet, Bloomberg, company IR, CNBC, Reuters, Morgan Stanley)
- Every number tied to a specific date
- Use "suggests," "indicates," "analysts expect" — never "will" or "guaranteed"
- 1000-1500 words total
- English ONLY

Return ONLY the markdown. No title heading. Start directly with ## Overview.`
    }]
  });

  return msg.content[0].text.trim();
}

// ── 5. Canvas 썸네일 합성 ────────────────────────────────────────────
async function composeThumbnail(bgUrl, topic) {
  const canvas = createCanvas(CANVAS_W, CANVAS_H);
  const ctx = canvas.getContext('2d');

  // 배경
  const imgBuf = await downloadImage(bgUrl);
  const bgImg = await loadImage(imgBuf);
  ctx.drawImage(bgImg, 0, 0, CANVAS_W, CANVAS_H);

  // 어두운 그라디언트 오버레이
  const overlay = ctx.createLinearGradient(0, 0, 0, CANVAS_H);
  overlay.addColorStop(0, 'rgba(0,0,0,0.55)');
  overlay.addColorStop(0.5, 'rgba(0,0,0,0.65)');
  overlay.addColorStop(1, 'rgba(0,0,0,0.80)');
  ctx.fillStyle = overlay;
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

  // Sentiment 글로우 (좌하단)
  const accentColor = { bullish: '#10B981', bearish: '#EF4444', neutral: '#3B82F6' }[topic.sentiment] || '#3B82F6';
  const glow = ctx.createRadialGradient(0, CANVAS_H, 0, 0, CANVAS_H, 500);
  glow.addColorStop(0, accentColor + '33');
  glow.addColorStop(1, 'transparent');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

  // Badge (좌상단) — 이모지 없이 순수 텍스트
  const badgeLabels = { morning: 'PRE-MARKET', afternoon: 'ANALYSIS', evening: 'MARKET CLOSE' };
  const badgeColors = { morning: '#3B82F6', afternoon: '#10B981', evening: '#FBBF24' };
  const badgeLabel = badgeLabels[topic.trigger_type] || 'NEWS';
  const badgeColor = badgeColors[topic.trigger_type] || '#3B82F6';
  ctx.font = 'bold 20px Arial';
  const badgeW = ctx.measureText(badgeLabel).width + 32;
  ctx.fillStyle = badgeColor;
  ctx.fillRect(48, 36, badgeW, 40);
  ctx.fillStyle = '#FFFFFF';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(badgeLabel, 64, 56);

  // 로고 (우상단)
  ctx.font = 'bold 24px Arial';
  ctx.fillStyle = '#FFFFFF';
  ctx.textAlign = 'right';
  ctx.textBaseline = 'middle';
  ctx.fillText('USStockStory', CANVAS_W - 48, 56);

  // 메인 제목 (최대 2줄, 60px)
  ctx.font = 'bold 60px Arial';
  ctx.fillStyle = '#FFFFFF';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  const words = topic.thumbnail_headline.split(' ');
  const maxW = CANVAS_W - 96;
  let lines = [], cur = '';
  for (const w of words) {
    const test = cur ? cur + ' ' + w : w;
    if (ctx.measureText(test).width > maxW && cur) { lines.push(cur); cur = w; }
    else cur = test;
  }
  if (cur) lines.push(cur);
  lines.slice(0, 2).forEach((line, i) => ctx.fillText(line, 48, 150 + i * 78));

  // 서브텍스트 (30px)
  ctx.font = '30px Arial';
  ctx.fillStyle = '#CBD5E1';
  ctx.textBaseline = 'top';
  ctx.fillText(topic.thumbnail_subtext, 48, 340);

  // 구분선
  ctx.strokeStyle = 'rgba(255,255,255,0.25)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(48, CANVAS_H - 100);
  ctx.lineTo(CANVAS_W - 48, CANVAS_H - 100);
  ctx.stroke();

  // 태그 + 날짜 (하단)
  const tagText = (topic.suggested_tags || []).slice(0, 3).map(t => '#' + t).join('   ');
  ctx.font = '20px Arial';
  ctx.fillStyle = '#94A3B8';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(tagText, 48, CANVAS_H - 52);
  ctx.textAlign = 'right';
  const d = new Date();
  ctx.fillText(
    `${String(d.getMonth()+1).padStart(2,'0')}/${String(d.getDate()).padStart(2,'0')}/${d.getFullYear()}`,
    CANVAS_W - 48, CANVAS_H - 52
  );

  return canvas.toBuffer('image/png');
}

// ── 6. 썸네일 R2 업로드 ──────────────────────────────────────────────
async function uploadThumbnail(buffer, filename, token) {
  return new Promise((resolve, reject) => {
    const form = new FormData();
    form.append('file', buffer, { filename, contentType: 'image/png' });
    const req = https.request({
      hostname: API_HOST,
      path: '/api/upload/image',
      method: 'POST',
      headers: { Authorization: 'Bearer ' + token, ...form.getHeaders() },
    }, (res) => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => { try { resolve(JSON.parse(d)); } catch { resolve({ error: d }); } });
    });
    req.on('error', reject);
    form.pipe(req);
  });
}

// ── 7. 포스트 생성 API ────────────────────────────────────────────────
async function createPost(payload, token) {
  const body = JSON.stringify(payload);
  return apiRequest({
    hostname: API_HOST,
    path: '/api/posts',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + token,
      'Content-Length': Buffer.byteLength(body),
    },
  }, body);
}

// ── 메인 실행 ─────────────────────────────────────────────────────────
async function run() {
  const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  console.log(`\n🚀 USStockStory 자동 포스팅 — ${today}\n`);

  // 1. 로그인
  const token = await login();

  // 2. 카테고리 & 태그 맵 조회
  const categoryMap = await getCategories(token);
  const tagMap      = await getTags(token);

  // 3. 오늘의 주제 3개 선정
  const topics = await generateTopics(today);
  console.log(`  ✅ 주제 ${topics.length}개 선정 완료\n`);

  let successCount = 0;

  for (const [i, topic] of topics.entries()) {
    console.log(`\n── [${i+1}/3] ${topic.title}`);

    try {
      // 4. 배경 이미지 URL 결정
      const bgUrl   = PHOTO_MAP[topic.photo_category]   || PHOTO_MAP.finance;
      const bodyUrl = PHOTO_MAP[topic.body_photo_category] || PHOTO_MAP.technology;

      // 5. 본문 생성
      const content_md = await generateContent(topic, today, bodyUrl);
      const content_html = marked(content_md);

      // 6. Canvas 썸네일 합성
      console.log('  🖼️  썸네일 Canvas 합성 중...');
      const thumbBuffer = await composeThumbnail(bgUrl, topic);
      console.log(`  ✅ Canvas 합성 완료 (${(thumbBuffer.length/1024).toFixed(0)}KB)`);

      // 7. 썸네일 R2 업로드
      const thumbResult = await uploadThumbnail(thumbBuffer, `thumb-${topic.slug}.png`, token);
      if (!thumbResult.url) throw new Error('썸네일 업로드 실패: ' + JSON.stringify(thumbResult));
      console.log(`  ✅ 썸네일 R2: ${thumbResult.url}`);

      // 8. 태그 ID 매핑 (존재하는 것만)
      const tag_ids = (topic.suggested_tags || [])
        .map(name => tagMap[name.toLowerCase()] || tagMap[name])
        .filter(Boolean);

      // 9. 카테고리 ID
      const category_id = categoryMap[topic.category_slug];
      if (!category_id) throw new Error(`카테고리 없음: ${topic.category_slug}`);

      // 10. 포스트 게시
      const result = await createPost({
        title:           topic.title,
        slug:            topic.slug,
        excerpt:         topic.excerpt,
        content_md,
        content_html,
        category_id,
        tag_ids,
        cover_image_url: thumbResult.url,
        is_published:    true,
        reading_time_mins: 5,
      }, token);

      if (result.id) {
        console.log(`  ✅ 게시 완료! → https://bigtrust.site/post/${topic.slug}`);
        successCount++;
      } else {
        console.log(`  ❌ 게시 실패: ${JSON.stringify(result).substring(0, 200)}`);
      }

    } catch (e) {
      console.error(`  ❌ 오류: ${e.message}`);
    }
  }

  console.log(`\n🎉 완료: ${successCount}/3 포스팅 성공`);
  if (successCount < topics.length) process.exit(1); // CI 실패 표시
}

run().catch(e => { console.error(e); process.exit(1); });

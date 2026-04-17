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

// ── Unsplash 사진 목록 (id, url, 설명) — 하락 차트 절대 사용 금지 ──────
const PHOTOS = [
  { id: '1518770660439-4636190af475', desc: 'circuit board / semiconductor chip',         url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&q=80&fm=jpg' },
  { id: '1526374965328-7f61d4dc18c5', desc: 'GPU / graphics card / AI hardware',          url: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1200&q=80&fm=jpg' },
  { id: '1558494949-ef010cbdcc31',    desc: 'server rack / data center / cloud',           url: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=1200&q=80&fm=jpg' },
  { id: '1590283603385-17ffb3a7f29f', desc: 'upward stock chart / green market gains',    url: 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=1200&q=80&fm=jpg' },
  { id: '1486406146926-c627a92ad1ab', desc: 'bank building / financial institution',       url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200&q=80&fm=jpg' },
  { id: '1522869635100-9f4c5e86aa37', desc: 'streaming / entertainment / media screen',   url: 'https://images.unsplash.com/photo-1522869635100-9f4c5e86aa37?w=1200&q=80&fm=jpg' },
  { id: '1581091226825-a6a2a5aee158', desc: 'laptop / technology / software',              url: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=1200&q=80&fm=jpg' },
  { id: '1593941707882-a5bba14938c7', desc: 'electric vehicle / EV / Tesla',               url: 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=1200&q=80&fm=jpg' },
  { id: '1532187863486-abf9dbad1b69', desc: 'biotech / laboratory / pharmaceutical',       url: 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=1200&q=80&fm=jpg' },
  { id: '1466611653911-95081537e5b7', desc: 'energy / solar / wind / oil',                 url: 'https://images.unsplash.com/photo-1466611653911-95081537e5b7?w=1200&q=80&fm=jpg' },
  { id: '1441986300917-64674bd600d8', desc: 'retail / shopping / consumer goods',          url: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&q=80&fm=jpg' },
  { id: '1544197150-b99a580bb7a8',    desc: 'cloud computing / internet / SaaS',           url: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=1200&q=80&fm=jpg' },
];

// 하위 호환용 (composeThumbnail 등에서 url 조회 시 사용)
const PHOTO_MAP = Object.fromEntries(PHOTOS.map(p => [p.id, p.url]));

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

// ── 2. 기존 포스팅 목록 조회 (중복 방지) ────────────────────────────
async function getExistingPosts(token) {
  const res = await apiRequest({
    hostname: API_HOST,
    path: '/api/posts?limit=100&sort=newest',
    headers: { Authorization: 'Bearer ' + token },
  });
  const list = res.data || [];
  return list.map(p => ({ title: p.title, slug: p.slug, category_slug: p.category?.slug || '', content_md: p.content_md || '' }));
}

// ── 3. 카테고리 & 태그 조회 ──────────────────────────────────────────
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

// ── content_md에서 이미 사용된 Unsplash photo ID 집계 ───────────────
// 썸네일 배경: <!-- thumbnail_bg: ID --> 주석으로 기록됨
// 본문 이미지: ![...](https://images.unsplash.com/photo-ID?...) 형식
function getUsedPhotoIds(existingPosts) {
  const used = new Set();
  existingPosts.forEach(p => {
    const md = p.content_md || '';
    // 썸네일 배경 photo ID (HTML 주석)
    const bgMatches = md.matchAll(/<!--\s*thumbnail_bg:\s*([\w-]+)\s*-->/g);
    for (const m of bgMatches) used.add(m[1]);
    // 본문 이미지 photo ID (Unsplash URL)
    const bodyMatches = md.matchAll(/photo-([\w-]+)\?/g);
    for (const m of bodyMatches) used.add(m[1]);
  });
  return used;
}

// ── 미사용 사진 목록 반환 (미사용 먼저, 이미 쓴 건 뒤로) ──────────────
function getAvailablePhotos(existingPosts) {
  const used = getUsedPhotoIds(existingPosts);
  const unused = PHOTOS.filter(p => !used.has(p.id));
  const usedList = PHOTOS.filter(p => used.has(p.id));
  // 미사용 사진이 충분하면 미사용만, 부족하면 사용된 것도 뒤에 추가
  return [...unused, ...usedList];
}

// ── 카테고리 분포 분석 → 부족한 카테고리 우선 순위 계산 ───────────────
function analyzeCategoryBalance(existingPosts) {
  const ALL_CATEGORIES = ['earnings', 'stock-analysis', 'investment-strategy', 'market-trend', 'etf-analysis'];
  const counts = {};
  ALL_CATEGORIES.forEach(c => { counts[c] = 0; });
  existingPosts.forEach(p => {
    if (p.category_slug && counts[p.category_slug] !== undefined) counts[p.category_slug]++;
  });
  const ranked = [...ALL_CATEGORIES].sort((a, b) => counts[a] - counts[b]);
  return { counts, prioritized: ranked };
}

// ── 3. Claude — 오늘의 3개 주제 선정 ────────────────────────────────
async function generateTopics(today, existingPosts) {
  console.log('  🤖 Claude에게 오늘의 주제 요청 중...');

  const existingList = existingPosts.length > 0
    ? existingPosts.map((p, i) => `${i + 1}. [${p.category_slug || 'unknown'}] ${p.title}`).join('\n')
    : '(없음)';

  // 카테고리 분포 분석
  const { counts, prioritized } = analyzeCategoryBalance(existingPosts);
  const categoryStats = Object.entries(counts)
    .sort((a, b) => a[1] - b[1])
    .map(([slug, n]) => `  - ${slug}: ${n} posts`)
    .join('\n');
  const topPriority = prioritized.slice(0, 2).join(', ');

  console.log(`  📊 카테고리 분포:\n${categoryStats}`);
  console.log(`  🎯 우선순위 카테고리: ${topPriority}`);

  // 미사용 사진 목록 (미사용 먼저, 중복 방지)
  const availablePhotos = getAvailablePhotos(existingPosts);
  const unusedCount = availablePhotos.filter(p => !getUsedPhotoIds(existingPosts).has(p.id)).length;
  const photoOptions = availablePhotos.slice(0, Math.max(8, unusedCount))
    .map(p => `  - id: "${p.id}" — ${p.desc}`)
    .join('\n');
  console.log(`  🖼️  사용 가능 사진 ${availablePhotos.length}개 (미사용 ${unusedCount}개)`);


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

EXISTING POSTS (MUST NOT DUPLICATE — strictly forbidden):
${existingList}

CATEGORY DISTRIBUTION (current post counts):
${categoryStats}

PRIORITY CATEGORIES (fewest posts — at least 2 of 3 topics must use these): ${topPriority}

CATEGORY BALANCE RULES:
- At least 2 of the 3 topics MUST come from the priority categories above
- Do NOT add more posts to the most-populated category unless all others are covered

AVAILABLE PHOTO CATEGORIES (choose ONLY from this list — these are not yet used or least used across existing posts):
${availablePhotos.join(', ')}

PHOTO RULES:
- Each topic's photo_category and body_photo_category MUST be chosen from the AVAILABLE list above
- All 3 topics must use DIFFERENT photo_categories from each other
- Choose the photo_category that best fits the post topic/concept from the available options
- Do NOT use any photo_category not listed in the available list above

AVAILABLE PHOTOS (choose ONLY from this list — unused photos are listed first):
${photoOptions}

PHOTO RULES:
- bg_photo_id: pick the photo whose description best matches the post topic
- body_photo_id: pick a DIFFERENT photo that also fits the post topic
- All 3 posts must use different bg_photo_ids
- MUST pick from the list above — do not invent photo IDs

Return ONLY a JSON array (no markdown, no explanation) with exactly 3 objects:
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
  "bg_photo_id": "unsplash-photo-id-from-list-above",
  "body_photo_id": "different-unsplash-photo-id-from-list-above"
}

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

  // 2. 기존 포스팅 목록 조회 (중복 방지)
  const existingPosts = await getExistingPosts(token);
  console.log(`  📋 기존 포스팅 ${existingPosts.length}개 확인 완료`);

  // 3. 카테고리 & 태그 맵 조회
  const categoryMap = await getCategories(token);
  const tagMap      = await getTags(token);

  // 4. 오늘의 주제 선정 (POST_COUNT 환경변수로 개수 조정 가능, 기본 3)
  const POST_COUNT = parseInt(process.env.POST_COUNT || '3', 10);
  const topics = await generateTopics(today, existingPosts);
  const selectedTopics = topics.slice(0, POST_COUNT);
  console.log(`  ✅ 주제 ${selectedTopics.length}개 선정 완료`);

  let successCount = 0;

  for (const [i, topic] of selectedTopics.entries()) {
    console.log(`\n── [${i+1}/3] ${topic.title}`);

    try {
      // 사진은 generateTopics에서 Claude가 선택한 photo_id로 배정
      const bgPhoto   = PHOTOS.find(p => p.id === topic.bg_photo_id)   || PHOTOS[i];
      const bodyPhoto = PHOTOS.find(p => p.id === topic.body_photo_id) || PHOTOS[i + 1] || PHOTOS[i];
      const bgUrl   = bgPhoto.url;
      const bodyUrl = bodyPhoto.url;

      // 5. 본문 생성
      let content_md = await generateContent(topic, today, bodyUrl);
      // 썸네일 배경 photo ID를 content_md에 주석으로 기록 → 다음 실행에서 중복 방지에 활용
      content_md = `<!-- thumbnail_bg: ${bgPhoto.id} -->\n` + content_md;
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

  console.log(`\n🎉 완료: ${successCount}/${selectedTopics.length} 포스팅 성공`);
  if (successCount < selectedTopics.length) process.exit(1); // CI 실패 표시
}

run().catch(e => { console.error(e); process.exit(1); });

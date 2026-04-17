/**
 * generate_sitemap.js
 * bigtrust.site 사이트맵 생성 → public/sitemap.xml
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

const EMAIL    = process.env.BIGTRUST_EMAIL;
const PASSWORD = process.env.BIGTRUST_PASSWORD;
const BASE_URL = 'https://bigtrust.site';

function apiRequest(options, body) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let d = ''; res.on('data', c => d += c);
      res.on('end', () => { try { resolve(JSON.parse(d)); } catch { resolve({ _raw: d }); } });
    });
    req.on('error', reject);
    if (body) req.write(body);
    req.end();
  });
}

function toW3CDate(dateStr) {
  return new Date(dateStr).toISOString().split('T')[0];
}

function urlEntry({ loc, lastmod, changefreq, priority }) {
  return [
    '  <url>',
    `    <loc>${loc}</loc>`,
    lastmod    ? `    <lastmod>${lastmod}</lastmod>` : '',
    changefreq ? `    <changefreq>${changefreq}</changefreq>` : '',
    priority   ? `    <priority>${priority}</priority>` : '',
    '  </url>',
  ].filter(Boolean).join('\n');
}

async function main() {
  console.log('🗺️  사이트맵 생성 시작...\n');

  // 로그인
  const lb = JSON.stringify({ email: EMAIL, password: PASSWORD });
  const login = await apiRequest({
    hostname: 'api.bigtrust.site', path: '/api/auth/login', method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(lb) }
  }, lb);
  const token = login.access_token;

  // 포스트 목록
  const postsRes = await apiRequest({
    hostname: 'api.bigtrust.site', path: '/api/posts?limit=100',
    headers: { Authorization: 'Bearer ' + token }
  });
  const posts = postsRes.data || [];

  // 카테고리 목록
  const catsRes = await apiRequest({
    hostname: 'api.bigtrust.site', path: '/api/categories',
    headers: { Authorization: 'Bearer ' + token }
  });
  const categories = (catsRes.data || catsRes || []).filter(c => /^[a-z]/.test(c.slug)); // 영문 slug만

  const today = new Date().toISOString().split('T')[0];
  const entries = [];

  // 홈페이지
  entries.push(urlEntry({
    loc: BASE_URL,
    lastmod: today,
    changefreq: 'daily',
    priority: '1.0',
  }));

  // 카테고리 페이지
  for (const cat of categories) {
    entries.push(urlEntry({
      loc: `${BASE_URL}/${cat.slug}`,
      lastmod: today,
      changefreq: 'daily',
      priority: '0.8',
    }));
  }

  // 포스트 페이지
  for (const post of posts) {
    entries.push(urlEntry({
      loc: `${BASE_URL}/post/${post.slug}`,
      lastmod: toW3CDate(post.updated_at || post.created_at),
      changefreq: 'weekly',
      priority: '0.7',
    }));
  }

  const sitemap = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...entries,
    '</urlset>',
  ].join('\n');

  // frontend/public/sitemap.xml 에 저장
  const outPath = path.join(__dirname, 'frontend', 'public', 'sitemap.xml');
  fs.writeFileSync(outPath, sitemap, 'utf8');

  console.log(`✅ 생성 완료: ${outPath}`);
  console.log(`   - 홈페이지: 1개`);
  console.log(`   - 카테고리: ${categories.length}개`);
  console.log(`   - 포스트:   ${posts.length}개`);
  console.log(`   - 총 URL:   ${1 + categories.length + posts.length}개`);
  console.log(`\n📋 사이트맵 URL: ${BASE_URL}/sitemap.xml`);
}

main().catch(console.error);

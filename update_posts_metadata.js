const https = require('https');
const fs = require('fs');
const TOKEN = fs.readFileSync('C:/Users/User/AppData/Local/Temp/token.txt', 'utf8').trim();

function apiRequest(method, path, body) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const options = {
      hostname: 'api.bigtrust.site',
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + TOKEN,
        'Content-Length': Buffer.byteLength(data),
      }
    };
    const req = https.request(options, (res) => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => {
        try { resolve(JSON.parse(d)); } catch { resolve({error: d}); }
      });
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

const updates = [
  {
    id: '3a2da41e-2157-4a92-a708-7e74cb14e94b',
    name: 'TSMC Q1 2024',
    reading_time_mins: 5,
    thumbnail_headline: 'TSMC Q1 2024: Record Revenue from AI',
    thumbnail_subtext: 'NT$686.7B revenue, 57.9% margin',
    thumbnail_sentiment: 'bullish',
    trigger_type: 'morning',
    highlight_keywords: ['TSMC', 'semiconductors', 'AI', 'earnings']
  },
  {
    id: 'fc64b1e3-8f65-44ca-a369-c4646302b34f',
    name: 'Long-Term Semiconductor Investment',
    reading_time_mins: 6,
    thumbnail_headline: 'The 3-Pillar Semiconductor Framework',
    thumbnail_subtext: 'TSMC, NVIDIA, Broadcom allocation',
    thumbnail_sentiment: 'bullish',
    trigger_type: 'afternoon',
    highlight_keywords: ['semiconductors', 'investment', 'portfolio', 'AI']
  },
  {
    id: '20eb2ff4-482b-4ea8-805d-3507b0a2d30c',
    name: 'Broadcom Q1 2024',
    reading_time_mins: 5,
    thumbnail_headline: 'Broadcom Q1: AI Networking Accelerates',
    thumbnail_subtext: '$8.47B revenue, custom silicon growth',
    thumbnail_sentiment: 'bullish',
    trigger_type: 'morning',
    highlight_keywords: ['Broadcom', 'semiconductors', 'networking', 'AI']
  }
];

async function run() {
  console.log('🔄 업데이트 중...\n');

  for (const post of updates) {
    const updateData = {
      reading_time_mins: post.reading_time_mins,
      thumbnail_headline: post.thumbnail_headline,
      thumbnail_subtext: post.thumbnail_subtext,
      thumbnail_sentiment: post.thumbnail_sentiment,
      trigger_type: post.trigger_type,
      highlight_keywords: post.highlight_keywords
    };

    console.log(`📝 ${post.name}`);
    console.log(`   reading_time_mins: ${post.reading_time_mins}`);
    console.log(`   thumbnail_headline: ${post.thumbnail_headline}`);
    console.log(`   sentiment: ${post.thumbnail_sentiment}`);
    console.log(`   trigger_type: ${post.trigger_type}`);

    try {
      const result = await apiRequest('PUT', `/api/posts/${post.id}`, updateData);
      if (result.id) {
        console.log(`   ✅ Updated\n`);
      } else {
        console.log(`   ❌ Error: ${JSON.stringify(result).substring(0, 200)}\n`);
      }
    } catch (e) {
      console.log(`   ❌ Request failed: ${e.message}\n`);
    }
  }

  console.log('✅ 메타데이터 업데이트 완료!');
  console.log('\n다음 단계:');
  console.log('1. Canvas ThumbnailService 구현 필요');
  console.log('2. NestJS에서 thumbnail_* 필드를 받아 자동으로 썸네일 생성');
  console.log('3. 생성된 이미지를 R2에 저장하고 cover_image_url 업데이트');
}

run();

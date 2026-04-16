const https = require('https');
const fs = require('fs');
const { marked } = require('./backend/node_modules/marked/lib/marked.cjs');
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

// 새로운 안정적인 이미지 URL들 (테스트됨)
// 참고: source.unsplash.com은 매번 다른 이미지를 반환하므로 정확한 photo ID 사용

const updates = [
  {
    id: '3a2da41e-2157-4a92-a708-7e74cb14e94b',
    name: 'TSMC Q1 2024',
    cover_image_url: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=630&q=80',
    // 기존 content_md 유지, 본문 이미지는 이미 있음
  },
  {
    id: 'fc64b1e3-8f65-44ca-a369-c4646302b34f',
    name: 'Long-Term Semiconductor Investment',
    cover_image_url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=630&q=80',
  },
  {
    id: '20eb2ff4-482b-4ea8-805d-3507b0a2d30c',
    name: 'Broadcom Q1 2024',
    cover_image_url: 'https://images.unsplash.com/photo-1537203436285-52aa264d8f01?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=630&q=80',
  }
];

async function run() {
  for (const post of updates) {
    console.log(`\nUpdating thumbnail: ${post.name}...`);
    console.log(`New cover_image_url: ${post.cover_image_url}`);
    try {
      const result = await apiRequest('PUT', `/api/posts/${post.id}`, {
        cover_image_url: post.cover_image_url
      });
      if (result.id) {
        console.log(`✅ Updated thumbnail - ID: ${result.id.substring(0, 8)}`);
      } else {
        console.log(`❌ Error: ${JSON.stringify(result).substring(0, 300)}`);
      }
    } catch (e) {
      console.log(`❌ Request failed: ${e.message}`);
    }
  }
  console.log('\n✅ Thumbnail update complete');
}

run();

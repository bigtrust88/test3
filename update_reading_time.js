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
  { id: '3a2da41e-2157-4a92-a708-7e74cb14e94b', name: 'TSMC Q1 2024', mins: 5 },
  { id: 'fc64b1e3-8f65-44ca-a369-c4646302b34f', name: 'Long-Term Investment', mins: 6 },
  { id: '20eb2ff4-482b-4ea8-805d-3507b0a2d30c', name: 'Broadcom Q1 2024', mins: 5 }
];

async function run() {
  console.log('📚 읽기 시간 업데이트 중...\n');

  for (const post of updates) {
    console.log(`📝 ${post.name}`);
    try {
      const result = await apiRequest('PUT', `/api/posts/${post.id}`, {
        reading_time_mins: post.mins
      });
      if (result.id) {
        console.log(`   ✅ ${post.mins}분으로 설정됨\n`);
      } else {
        console.log(`   ❌ Error: ${JSON.stringify(result).substring(0, 150)}\n`);
      }
    } catch (e) {
      console.log(`   ❌ Request failed: ${e.message}\n`);
    }
  }
  console.log('✅ 완료!');
}

run();

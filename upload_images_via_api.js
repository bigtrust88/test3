const https = require('https');
const http = require('http');
const fs = require('fs');
const FormData = require('form-data');
const TOKEN = fs.readFileSync('C:/Users/User/AppData/Local/Temp/token.txt', 'utf8').trim();

function downloadImage(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    client.get(url, (res) => {
      let data = Buffer.alloc(0);
      res.on('data', chunk => data = Buffer.concat([data, chunk]));
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

function uploadViaAPI(imageBuffer, filename) {
  return new Promise((resolve, reject) => {
    const form = new FormData();
    form.append('file', imageBuffer, filename);

    const options = {
      hostname: 'api.bigtrust.site',
      path: '/api/upload/image',
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + TOKEN,
        ...form.getHeaders()
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          resolve(result);
        } catch {
          resolve({error: data});
        }
      });
    });

    req.on('error', reject);
    form.pipe(req);
  });
}

function updatePost(postId, coverImageUrl) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({ cover_image_url: coverImageUrl });
    const options = {
      hostname: 'api.bigtrust.site',
      path: `/api/posts/${postId}`,
      method: 'PUT',
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

const posts = [
  {
    id: '3a2da41e-2157-4a92-a708-7e74cb14e94b',
    name: 'TSMC Q1 2024',
    unsplashUrl: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1200&q=80&fm=jpg',
    filename: 'tsmc-q1-2024.jpg'
  },
  {
    id: 'fc64b1e3-8f65-44ca-a369-c4646302b34f',
    name: 'Long-Term Investment Strategy',
    unsplashUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&q=80&fm=jpg',
    filename: 'semiconductor-investment.jpg'
  },
  {
    id: '20eb2ff4-482b-4ea8-805d-3507b0a2d30c',
    name: 'Broadcom Q1 2024',
    unsplashUrl: 'https://images.unsplash.com/photo-1537203436285-52aa264d8f01?w=1200&q=80&fm=jpg',
    filename: 'broadcom-q1-2024.jpg'
  }
];

async function run() {
  console.log('\n📸 Unsplash → 백엔드 upload API → R2 업로드\n');

  for (const post of posts) {
    console.log(`📝 ${post.name}`);
    try {
      console.log('  ⬇️  Unsplash에서 다운로드...');
      const imageBuffer = await downloadImage(post.unsplashUrl);
      console.log(`  ✅ ${imageBuffer.length} bytes`);

      console.log('  ⬆️  백엔드 upload API로 R2 업로드...');
      const uploadResult = await uploadViaAPI(imageBuffer, post.filename);

      if (uploadResult.url) {
        console.log(`  ✅ R2 URL: ${uploadResult.url}`);

        console.log('  🔗 포스트 업데이트...');
        const updateResult = await updatePost(post.id, uploadResult.url);
        if (updateResult.id) {
          console.log(`  ✅ 완료!\n`);
        } else {
          console.log(`  ⚠️  포스트 업데이트 실패\n`);
        }
      } else {
        console.log(`  ❌ 업로드 실패: ${uploadResult.error || uploadResult.message}\n`);
      }
    } catch (e) {
      console.log(`  ❌ 에러: ${e.message}\n`);
    }
  }

  console.log('✅ 완료!');
}

run();

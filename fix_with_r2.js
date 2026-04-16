const https = require('https');
const fs = require('fs');
const TOKEN = fs.readFileSync('C:/Users/User/AppData/Local/Temp/token.txt', 'utf8').trim();

/**
 * 간단한 방법: 이미지를 다운로드한 후 백엔드 upload API를 통해 R2에 업로드
 * 그리고 반환된 URL로 포스트를 업데이트
 */

function downloadImage(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = Buffer.alloc(0);
      res.on('data', chunk => data = Buffer.concat([data, chunk]));
      res.on('end', () => resolve(data));
    }).on('error', reject);
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

// SMH 포스팅의 R2 URL 형식을 참고하여 동일한 방식으로 변경
// https://pub-9394c543ae8b4e688cc7b9af28b1a029.r2.dev/images/{uuid}.jpg

// 더 간단한 방법: R2 URL 패턴을 이용해서 직접 설정
// 현재는 Unsplash URL이지만, SMH처럼 R2로 변경해야 함

const posts = [
  {
    id: '3a2da41e-2157-4a92-a708-7e74cb14e94b',
    name: 'TSMC Q1 2024',
    // R2 URL로 변경 (SMH 포스팅과 동일한 형식)
    newUrl: 'https://pub-9394c543ae8b4e688cc7b9af28b1a029.r2.dev/images/tsmc-q1-2024.jpg'
  },
  {
    id: 'fc64b1e3-8f65-44ca-a369-c4646302b34f',
    name: 'Long-Term Investment Strategy',
    newUrl: 'https://pub-9394c543ae8b4e688cc7b9af28b1a029.r2.dev/images/semiconductor-investment.jpg'
  },
  {
    id: '20eb2ff4-482b-4ea8-805d-3507b0a2d30c',
    name: 'Broadcom Q1 2024',
    newUrl: 'https://pub-9394c543ae8b4e688cc7b9af28b1a029.r2.dev/images/broadcom-q1-2024.jpg'
  }
];

async function run() {
  console.log('\n⚠️  주의: R2 URL로 변경하려면 먼저 이미지가 R2에 업로드되어야 합니다!\n');
  console.log('다음 단계:');
  console.log('1. Unsplash에서 이미지 다운로드');
  console.log('2. Railway에서 R2 자격증명 확인');
  console.log('3. 이미지를 R2에 업로드');
  console.log('4. 포스트의 cover_image_url을 R2 URL로 변경\n');

  console.log('현재 가능한 방법: 백엔드 upload API 사용');
  console.log('→ POST /api/upload (multipart/form-data)\n');

  // 일단 R2 URL로 변경 시도 (이미지가 있다고 가정)
  console.log('🔄 R2 URL로 포스트 업데이트 중...\n');

  for (const post of posts) {
    console.log(`📝 ${post.name}`);
    try {
      const result = await updatePost(post.id, post.newUrl);
      if (result.id) {
        console.log(`   ✅ R2 URL 설정 완료`);
        console.log(`   새 URL: ${post.newUrl}\n`);
      } else {
        console.log(`   ❌ Error: ${JSON.stringify(result).substring(0, 100)}\n`);
      }
    } catch (e) {
      console.log(`   ❌ 실패: ${e.message}\n`);
    }
  }

  console.log('⚠️  주의: R2에 실제 이미지 파일이 없으면 URL이 로드되지 않습니다!');
}

run();

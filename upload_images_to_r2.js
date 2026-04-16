const https = require('https');
const fs = require('fs');
const crypto = require('crypto');
const AWS = require('aws-sdk');

// R2 환경 변수 확인
const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID;
const R2_ACCESS_KEY = process.env.R2_ACCESS_KEY_ID;
const R2_SECRET = process.env.R2_SECRET_ACCESS_KEY;
const R2_BUCKET = process.env.R2_BUCKET || 'bigtrust-thumbnails';
const R2_PUBLIC_URL = process.env.R2_PUBLIC_URL;

console.log('🔐 R2 설정 확인:');
console.log('  Account ID:', R2_ACCOUNT_ID ? '✅' : '❌ 누락');
console.log('  Access Key:', R2_ACCESS_KEY ? '✅' : '❌ 누락');
console.log('  Secret:', R2_SECRET ? '✅' : '❌ 누락');
console.log('  Bucket:', R2_BUCKET);
console.log('  Public URL:', R2_PUBLIC_URL || '❌ 누락 (중요!)');

if (!R2_ACCOUNT_ID || !R2_ACCESS_KEY || !R2_SECRET || !R2_PUBLIC_URL) {
  console.error('\n❌ R2 환경 변수가 모두 설정되어야 합니다!');
  console.error('Railway Variables에서 확인하세요:');
  console.error('  - R2_ACCOUNT_ID');
  console.error('  - R2_ACCESS_KEY_ID');
  console.error('  - R2_SECRET_ACCESS_KEY');
  console.error('  - R2_BUCKET');
  console.error('  - R2_PUBLIC_URL (중요!)');
  process.exit(1);
}

// AWS SDK로 R2 클라이언트 설정
const s3 = new AWS.S3({
  accessKeyId: R2_ACCESS_KEY,
  secretAccessKey: R2_SECRET,
  endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflareclient.com`,
  s3ForcePathStyle: true,
  region: 'us-east-1'
});

// Unsplash 이미지 다운로드
function downloadImage(unsplashUrl) {
  return new Promise((resolve, reject) => {
    https.get(unsplashUrl, (res) => {
      let data = Buffer.alloc(0);
      res.on('data', chunk => {
        data = Buffer.concat([data, chunk]);
      });
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

// R2 업로드
async function uploadToR2(imageBuffer, filename) {
  const params = {
    Bucket: R2_BUCKET,
    Key: `images/${filename}`,
    Body: imageBuffer,
    ContentType: 'image/jpeg',
  };

  try {
    const result = await s3.upload(params).promise();
    const publicUrl = `${R2_PUBLIC_URL}/images/${filename}`;
    return publicUrl;
  } catch (error) {
    throw new Error(`R2 업로드 실패: ${error.message}`);
  }
}

// 포스트 업데이트
function updatePost(postId, coverImageUrl) {
  return new Promise((resolve, reject) => {
    const TOKEN = fs.readFileSync('C:/Users/User/AppData/Local/Temp/token.txt', 'utf8').trim();
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
  console.log('\n📸 R2로 이미지 업로드 시작...\n');

  for (const post of posts) {
    console.log(`📝 ${post.name}`);
    try {
      console.log('  ⬇️  Unsplash에서 이미지 다운로드 중...');
      const imageBuffer = await downloadImage(post.unsplashUrl);
      console.log(`  ✅ ${imageBuffer.length} bytes 다운로드됨`);

      console.log('  ⬆️  R2에 업로드 중...');
      const r2Url = await uploadToR2(imageBuffer, post.filename);
      console.log(`  ✅ R2 URL: ${r2Url}`);

      console.log('  🔗 포스트 업데이트 중...');
      const result = await updatePost(post.id, r2Url);
      if (result.id) {
        console.log(`  ✅ 업데이트 완료!\n`);
      } else {
        console.log(`  ❌ Error: ${JSON.stringify(result).substring(0, 150)}\n`);
      }
    } catch (e) {
      console.log(`  ❌ 실패: ${e.message}\n`);
    }
  }
  console.log('✅ 모든 작업 완료!');
}

run();

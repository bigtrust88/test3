/** @type {import('next').NextConfig} */
const nextConfig = {
  // 이미지 최적화
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: '**',
      },
    ],
  },

  // 환경 변수
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
    NEXT_PUBLIC_ADSENSE_ID: process.env.NEXT_PUBLIC_ADSENSE_ID || 'ca-pub-3811219422484638',
  },

  // TypeScript 타입 체크
  typescript: {
    tsconfigPath: './tsconfig.json',
  },

  // ESLint 설정
  eslint: {
    dirs: ['app', 'components', 'lib', 'hooks'],
  },
};

module.exports = nextConfig;

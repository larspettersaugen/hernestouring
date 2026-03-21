/** @type {import('next').NextConfig} */
const withPWA = require('@ducanh2912/next-pwa').default({
  dest: 'public',
  disable: false,
  register: true,
  skipWaiting: true,
});

const nextConfig = {
  reactStrictMode: true,
  staticPageGenerationTimeout: 180,
};

// PWA disabled by default - set ENABLE_PWA=true to enable (can cause terser issues on some systems)
module.exports = process.env.ENABLE_PWA === 'true' ? withPWA(nextConfig) : nextConfig;

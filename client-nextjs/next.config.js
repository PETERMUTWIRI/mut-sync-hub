// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // --- webpack fix (keep if you use onnxruntime-node) -----------------
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals.push({
        'onnxruntime-node': 'commonjs onnxruntime-node',
      });
    }
    return config;
  },

  // --- CORS headers (Vercel → Render) ---------------------------------
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: process.env.VERCEL_URL || 'https://mut-sync-hub-petermutwiris-projects.vercel.app' },
          { key: 'Access-Control-Allow-Methods', value: 'GET, POST, PUT, DELETE, OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization' },
        ],
      },
    ];
  },

  // --- images ---------------------------------------------------------
  images: {
    remotePatterns: [{ protocol: 'https', hostname: 'utfs.io', pathname: '/f/**' }],
    domains: ['localhost'],
  },

  // --- misc -----------------------------------------------------------
  compiler: { removeConsole: { exclude: ['error'] } },
  async redirects() {
    return [{ source: '/old-path', destination: '/', permanent: false }];
  },
};

module.exports = nextConfig;
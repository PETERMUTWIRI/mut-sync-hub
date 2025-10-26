// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: { optimizeCss: false }, // 1.  tell Next “don’t touch CSS”

  webpack(config, { isServer }) {
    /* 2.  ERASE the built-in CssMinimizerPlugin (cssnano-simple) */
    if (!isServer) {
      const idx = config.optimization.minimizer.findIndex(
        (m) => m.constructor.name === 'CssMinimizerPlugin'
      );
      if (idx !== -1) config.optimization.minimizer.splice(idx, 1);
    }

    if (isServer) {
      config.externals.push({ 'onnxruntime-node': 'commonjs onnxruntime-node' });
    }
    return config;
  },

  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: process.env.VERCEL_URL || 'https://mut-sync-hub.vercel.app',
          },
          { key: 'Access-Control-Allow-Methods', value: 'GET, POST, PUT, DELETE, OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization' },
        ],
      },
    ];
  },

  images: {
    remotePatterns: [{ protocol: 'https', hostname: 'utfs.io', pathname: '/f/**' }],
    domains: ['localhost'],
  },

  compiler: { removeConsole: { exclude: ['error'] } },

  async redirects() {
    return [{ source: '/old-path', destination: '/', permanent: false }];
  },
};

module.exports = nextConfig;
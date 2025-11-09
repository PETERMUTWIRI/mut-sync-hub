const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const LightningCSS = require('lightningcss');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: { optimizeCss: false },
  turbo: false, 
  webpack(config) {
    // replace cssnano-simple with lightningcss
    config.optimization.minimizer.push(
      new CssMinimizerPlugin({
        minify: CssMinimizerPlugin.lightningCssMinify,
        minimizerOptions: {
          targets: LightningCSS.browserslistToTargets(['defaults']),
        },
      })
    );
    return config;
  },
}
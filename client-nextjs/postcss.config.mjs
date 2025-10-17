// client-nextjs/postcss.config.js
module.exports = {
  plugins: [
    'tailwindcss',
    'autoprefixer',
    require('./postcss-kill-length-final.js'), // ➜  strips bare “length”
  ],
};
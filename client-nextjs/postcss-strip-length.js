// client-nextjs/postcss-strip-length.js
module.exports = () => ({
  postcssPlugin: 'strip-length',
  Declaration(decl) {
    // delete any value that is exactly the word “length”
    if (decl.value === 'length') decl.remove();
  },
});
module.exports.postcss = true;
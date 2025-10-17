// client-nextjs/postcss-kill-length.js
module.exports = () => ({
  postcssPlugin: 'kill-length',
  Declaration(decl) {
    if (decl.value === 'length') {
      console.warn('>>> KILLED bare “length” <<<', `${decl.prop}: ${decl.value};`);
      decl.remove(); // delete the declaration
    }
  },
});
module.exports.postcss = true;
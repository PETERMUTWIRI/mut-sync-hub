// client-nextjs/postcss-debug-length.js
module.exports = () => ({
  postcssPlugin: 'debug-length',
  Declaration(decl) {
    if (decl.value && decl.value.includes('length') && !decl.value.match(/length[%a-zA-Z-]/)) {
      console.error('>>> BAD CSS RULE FOUND <<<');
      console.error('file :', decl.source?.input?.file || 'unknown');
      console.error('line :', decl.source?.start?.line);
      console.error('rule :', `${decl.prop}: ${decl.value};`);
      decl.remove(); // delete the bad rule so build passes
    }
  },
});
module.exports.postcss = true;
module.exports = () => ({
  postcssPlugin: 'debug-bad-css',
  Once(root) {
    root.walkDecls((decl) => {
      if (decl.value?.includes('length') && !decl.value.match(/length[%a-z-]/i)) {
        console.warn('>>> BARE LENGTH FOUND <<<');
        console.warn('decl :', `${decl.prop}: ${decl.value};`);
        decl.remove();
      }
    });
  },
});
module.exports.postcss = true;

// postcss-debug-bad-css.js
module.exports = () => ({
  postcssPlugin: 'debug-bad-css',
  Once(root) {
    root.walkRules((rule) => {
      try {
        // force-parse the selector – if it throws, we caught the culprit
        rule.selector;
      } catch (e) {
        console.error('>>> BAD CSS RULE FOUND <<<');
        console.error('file :', rule.source?.input?.file || 'unknown');
        console.error('line :', rule.source?.start?.line);
        console.error('rule :', rule.selector);
        rule.remove(); // delete the bad rule so build passes
      }
    });
    root.walkDecls((decl) => {
      // also catch bare “length” or any value that crashes unit()
      if (decl.value?.includes('length') && !decl.value.match(/length[%a-z-]/i)) {
        console.error('>>> BARE LENGTH FOUND <<<');
        console.error('decl :', `${decl.prop}: ${decl.value};`);
        decl.remove();
      }
    });
  },
});
module.exports.postcss = true;
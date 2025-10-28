#!/usr/bin/env node
/**
 * Hot-fix for Next.js bundled postcss-value-parser
 * Guards the unit() helper against undefined .length
 */
const fs = require('fs');
const path = 'node_modules/next/dist/compiled/postcss-value-parser/index.js';

let src = fs.readFileSync(path, 'utf8');

// match any whitespace flavour inside the bundle
const alreadyPatched = src.includes('if(!e||typeof e.length!=="number")');

if (!alreadyPatched) {
  src = src.replace(
    /e\.exports=function\s*\(\s*e\s*\)\s*\{/,
    'e.exports=function(e){if(!e||typeof e.length!=="number")return{number:"",unit:""};'
  );
  fs.writeFileSync(path, src);
  console.log('[PATCH] postcss-value-parser guard applied ✅');
} else {
  console.log('[PATCH] postcss-value-parser already patched ⏭');
}
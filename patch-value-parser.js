const fs = require('fs');
const file = 'node_modules/next/dist/compiled/postcss-value-parser/index.js';
let src = fs.readFileSync(file, 'utf8');
src = src.replace(
  /e\.exports=function\(e\)\s*\{/,
  'e.exports=function(e){if(!e||typeof e.length!=="number")return{number:"",unit:""};'
);
fs.writeFileSync(file, src);
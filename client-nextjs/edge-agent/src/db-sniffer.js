const fs = require('fs');
const path = require('path');
module.exports = function detect() {
  const candidates = [
    { type:'sqlite', file:'C:\\POS\\Database\\sales.db' },
    { type:'sqlite', file:'C:\\ProgramData\\POS\\local.db' },
    { type:'sqlserver', server:'(localdb)\\MSSQLLocalDB', db:'POS' },
    { type:'mysql', host:'127.0.0.1', port:3306, user:'root', db:'pos' },
    { type:'csv', dir:'C:\\POS\\DailySales' }
  ];
  for (const c of candidates) {
    if (c.file && fs.existsSync(c.file)) return { engine:c.type, path:c.file };
    if (c.dir  && fs.existsSync(c.dir))  return { engine:'csv', dir:c.dir };
  }
  return null;
};

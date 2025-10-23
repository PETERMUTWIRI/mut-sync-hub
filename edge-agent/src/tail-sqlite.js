const Database = require('better-sqlite3');
module.exports = function tailSQLite(file, sinceId, onRow) {
  const db = new Database(file);
  const stmt = db.prepare('SELECT * FROM sales WHERE id > ? ORDER BY id LIMIT 200');
  setInterval(() => {
    const rows = stmt.all(sinceId);
    rows.forEach(r => onRow(r));
    if (rows.length) sinceId = rows[rows.length-1].id;
  }, 3000);
};

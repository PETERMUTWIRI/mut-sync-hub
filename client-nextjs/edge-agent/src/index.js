const { detect } = require('./db-sniffer');
const { connect, uploadBatch } = require('./uploader');
const fs = require('fs');
const path = require('path');

// 1-time config rewrite
const cfgPath = path.join(__dirname, 'config.json');
if (!fs.existsSync(cfgPath)) {
  const tpl = fs.readFileSync(path.join(__dirname, 'config.json.tpl'), 'utf8');
  fs.writeFileSync(cfgPath, tpl
    .replace('%%SERVER%%', 'https://yourdomain.com')
    .replace('%%ORG_ID%%', 'POS-DEMO')
    .replace('%%API_KEY%%', 'demo-key'));
}
const config = JSON.parse(fs.readFileSync(cfgPath, 'utf8'));

// Windows service wrapper (node-windows is bundled)
if (require('os').platform() === 'win32') {
  const Service = require('node-windows').Service;
  const svc = new Service({
    name: 'AnalyticsEdge',
    description: 'Real-time POS tunnel',
    script: __filename,
    nodeOptions: ['--max-old-space-size=128'],
  });
  svc.on('install', () => svc.start());
  if (!svc.exists) svc.install();
}

// main loop
async function start() {
  await connect(config);
  const source = detect();
  if (!source) { console.error('No POS detected'); return; }
  let since = 0;
  if (source.engine === 'sqlite') {
    const tail = require('./tail-sqlite');
    tail(source.path, since, row => uploadBatch([row]));
  }
  if (source.engine === 'csv') {
    const chokidar = require('chokidar');
    chokidar.watch(source.dir + '/*.csv')
      .on('add', p => {
        const rows = fs.readFileSync(p, 'utf8').split('\n').filter(Boolean).map(JSON.parse);
        uploadBatch(rows);
      });
  }
}
start();

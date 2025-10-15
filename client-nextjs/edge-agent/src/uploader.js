const io = require('socket.io-client');
let socket;
function connect(cfg) {
  socket = io(cfg.serverUrl + '/analytics', {
    auth: { token: cfg.apiKey },
    query: { orgId: cfg.orgId }
  });
  socket.on('connect', () => console.log('[agent] tunnel open'));
  socket.on('disconnect', () => console.log('[agent] tunnel closed'));
}
function uploadBatch(rows) {
  if (!socket?.connected) return false;
  socket.emit('agentData', { orgId: socket.io.opts.query.orgId, rows });
  return true;
}
module.exports = { connect, uploadBatch };

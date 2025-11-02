import { io, Socket } from 'socket.io-client';
import { toast } from 'react-hot-toast';

let socket: Socket | null = null;
let orgIdCache: string | null = null;

/** Fetch orgId once from your existing /api/org-profile */
async function getOrgId(): Promise<string> {
  if (orgIdCache) return orgIdCache;
  const res = await fetch('/api/org-profile');
  if (!res.ok) throw new Error('Not authenticated');
  const data = await res.json();
  orgIdCache = data.orgId; // ← from your org-profile API
  if (!orgIdCache) throw new Error('Organization ID not found');
  return orgIdCache;
}

function getSocket(): Socket {
  if (!socket) {
    socket = io('https://mutsynchub.onrender.com', {
    path: '/socket.io',
    transports: ['polling', 'websocket'],
    query: async () => ({ orgId: await getOrgId() }),
    extraHeaders: { 'x-api-key': 'dev-analytics-key-123' },
    });

    socket.on('notification:new', (notif) => {
      const toastType = notif.type?.toLowerCase() || 'info';
      if (toastType === 'success') toast.success(notif.message, { icon: '🔔' });
      else if (toastType === 'error') toast.error(notif.message, { icon: '🔔' });
      else if (toastType === 'loading') toast.loading(notif.message, { icon: '🔔' });
      else toast(notif.message, { icon: '🔔' });

      if (Notification.permission === 'granted') {
        new Notification(notif.title, { body: notif.message, icon: '/favicon.ico' });
      } else if (Notification.permission !== 'denied') {
        Notification.requestPermission().then((perm) => {
          if (perm === 'granted') new Notification(notif.title, { body: notif.message, icon: '/favicon.ico' });
        });
      }
    });
  }
  return socket;
}

export const DataGateway = {
  broadcastToOrg(orgId: string, event: string, payload: any) {
    getSocket().emit('broadcast', { orgId, event, payload });
  },

  connect(orgId: string): Socket {
    const s = getSocket();
    if (orgId) s.emit('join-org', orgId);
    return s;
  },

  disconnect(orgId?: string) {
    if (!socket) return;
    if (orgId) socket.emit('leave-org', orgId);
    socket.disconnect();
    socket = null;
    orgIdCache = null;
  },
} as const;
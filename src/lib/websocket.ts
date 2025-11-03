// src/lib/websocket.ts
import { io, Socket } from 'socket.io-client';
import { toast } from 'react-hot-toast';

let socket: Socket | null = null;

function getSocket(): Socket {
  if (!socket) {
    socket = io('https://mutsynchub.onrender.com', {   // ← direct to Render
      path: '/socket.io',
      transports: ['polling', 'websocket'],
      // no orgId in query – Render fetches it once from Vercel
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
  },
} as const;
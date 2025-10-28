import { io, Socket } from 'socket.io-client';
import { toast } from 'react-hot-toast';

let socket: Socket | null = null;

function getSocket(): Socket {
  if (!socket) {
    socket = io(`${process.env.NEXT_PUBLIC_WS_URL}/socket.io`, { // Use the correct endpoint
      auth: { token: document.cookie.match(/stack-session=([^;]+)/)?.[1] || '' },
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      extraHeaders: { 'x-api-key': process.env.NEXT_PUBLIC_ANALYTICS_KEY ?? 'dev-analytics-key-123' },
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
  /** Emit an event to every socket in the given org room. */
  broadcastToOrg(orgId: string, event: string, payload: any) {
    getSocket().emit('broadcast', { orgId, event, payload });
  },

  /** Join org room and return the socket instance. */
  connect(orgId: string): Socket {
    const s = getSocket();
    if (orgId) s.emit('join-org', orgId);
    return s;
  },

  /** Leave org room (if provided) and disconnect socket. */
  disconnect(orgId?: string) {
    if (!socket) return;
    if (orgId) socket.emit('leave-org', orgId);
    socket.disconnect();
    socket = null;
  },
} as const;
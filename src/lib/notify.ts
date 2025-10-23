// src/lib/notify.ts
export function safeNotify(title: string, body: string) {
  if (!('Notification' in window)) return;                // old browser
  if (Notification.permission === 'granted') {
    new Notification(title, { body, icon: '/favicon.ico' });
    return;
  }
  if (Notification.permission !== 'denied') {
    Notification.requestPermission().then((perm) => {
      if (perm === 'granted') new Notification(title, { body, icon: '/favicon.ico' });
    });
  }
  // fallback toast
  import('react-hot-toast').then(({ toast }) => toast(body));
}
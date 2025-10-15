"use client";
import SendNotificationForm from '@/components/admin/components/SendNotificationForm';
import SentNotificationsList from '@/components/admin/components/SentNotificationsList';

const NotificationsPage: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto py-12 px-4 md:px-8">
      <h1 className="text-4xl font-extrabold text-white mb-8 tracking-tight drop-shadow-lg">Notifications</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="rounded-2xl shadow-2xl bg-gradient-to-br from-yellow-700 to-orange-900 p-8">
          <SendNotificationForm />
        </div>
        <div className="rounded-2xl shadow-2xl bg-gradient-to-br from-blue-800 to-indigo-900 p-8">
          <SentNotificationsList />
        </div>
      </div>
    </div>
  );
};

export default NotificationsPage;

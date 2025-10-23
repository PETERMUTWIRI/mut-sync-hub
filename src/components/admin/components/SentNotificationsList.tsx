import React from 'react';

const SentNotificationsList: React.FC = () => {
  // Placeholder data
  const notifications = [
    { id: 1, title: 'System Update', message: 'System will be down at midnight.' },
    { id: 2, title: 'Welcome', message: 'Welcome to the admin dashboard!' },
  ];

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Sent Notifications</h2>
      <ul>
        {notifications.map((n) => (
          <li key={n.id} className="mb-2 p-2 bg-gray-800 rounded">
            <div className="font-semibold">{n.title}</div>
            <div className="text-sm text-gray-300">{n.message}</div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SentNotificationsList;

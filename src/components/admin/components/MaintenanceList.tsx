import React from 'react';

const MaintenanceList: React.FC = () => {
  // Placeholder data
  const maintenances = [
    { id: 1, title: 'Database Upgrade', date: '2025-08-05', status: 'Scheduled' },
    { id: 2, title: 'Server Patch', date: '2025-08-10', status: 'Completed' },
  ];

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Maintenance</h2>
      <ul>
        {maintenances.map((m) => (
          <li key={m.id} className="mb-2 p-2 bg-gray-800 rounded">
            <div className="font-semibold">{m.title}</div>
            <div className="text-sm text-gray-300">{m.date} - {m.status}</div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default MaintenanceList;

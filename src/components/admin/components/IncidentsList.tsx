import React from 'react';

const IncidentsList: React.FC = () => {
  // Placeholder data
  const incidents = [
    { id: 1, title: 'API Outage', date: '2025-08-01', status: 'Resolved' },
    { id: 2, title: 'Login Issue', date: '2025-08-02', status: 'Investigating' },
  ];

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Incidents</h2>
      <ul>
        {incidents.map((i) => (
          <li key={i.id} className="mb-2 p-2 bg-gray-800 rounded">
            <div className="font-semibold">{i.title}</div>
            <div className="text-sm text-gray-300">{i.date} - {i.status}</div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default IncidentsList;

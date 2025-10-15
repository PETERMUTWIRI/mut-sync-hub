import React from 'react';

const SupportTicketsTable: React.FC = () => {
  // Placeholder data
  const tickets = [
    { id: 1, subject: 'Login Issue', status: 'Open', user: 'Alice', date: '2025-08-01' },
    { id: 2, subject: 'Payment Failed', status: 'Resolved', user: 'Bob', date: '2025-08-02' },
  ];

  return (
    <table className="w-full text-left text-gray-200">
      <thead>
        <tr>
          <th className="py-2 px-4">User</th>
          <th className="py-2 px-4">Subject</th>
          <th className="py-2 px-4">Status</th>
          <th className="py-2 px-4">Date</th>
        </tr>
      </thead>
      <tbody>
        {tickets.map((t) => (
          <tr key={t.id} className="border-b border-gray-700">
            <td className="py-2 px-4">{t.user}</td>
            <td className="py-2 px-4">{t.subject}</td>
            <td className="py-2 px-4">{t.status}</td>
            <td className="py-2 px-4">{t.date}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default SupportTicketsTable;

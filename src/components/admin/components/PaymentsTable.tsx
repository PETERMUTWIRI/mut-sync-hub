import React from 'react';

const PaymentsTable: React.FC = () => {
  // Placeholder data
  const payments = [
    { id: 1, user: 'Alice', amount: 1200, date: '2025-08-01' },
    { id: 2, user: 'Bob', amount: 800, date: '2025-08-02' },
  ];

  return (
    <table className="w-full text-left text-gray-200">
      <thead>
        <tr>
          <th className="py-2 px-4">User</th>
          <th className="py-2 px-4">Amount</th>
          <th className="py-2 px-4">Date</th>
        </tr>
      </thead>
      <tbody>
        {payments.map((p) => (
          <tr key={p.id} className="border-b border-gray-700">
            <td className="py-2 px-4">{p.user}</td>
            <td className="py-2 px-4">KES {p.amount.toLocaleString()}</td>
            <td className="py-2 px-4">{p.date}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default PaymentsTable;

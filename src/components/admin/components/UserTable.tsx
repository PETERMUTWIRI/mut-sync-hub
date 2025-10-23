import React from 'react';

const UserTable: React.FC = () => {
  // Placeholder data
  const users = [
    { id: 1, name: 'Alice', email: 'alice@example.com', role: 'Admin' },
    { id: 2, name: 'Bob', email: 'bob@example.com', role: 'User' },
  ];

  return (
    <table className="w-full text-left text-gray-200">
      <thead>
        <tr>
          <th className="py-2 px-4">Name</th>
          <th className="py-2 px-4">Email</th>
          <th className="py-2 px-4">Role</th>
        </tr>
      </thead>
      <tbody>
        {users.map((u) => (
          <tr key={u.id} className="border-b border-gray-700">
            <td className="py-2 px-4">{u.name}</td>
            <td className="py-2 px-4">{u.email}</td>
            <td className="py-2 px-4">{u.role}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default UserTable;

import React from 'react';

const SettingsTabs: React.FC = () => {
  return (
    <div className="flex gap-4 mb-4">
      <button className="px-4 py-2 bg-blue-700 text-white rounded">General</button>
      <button className="px-4 py-2 bg-blue-700 text-white rounded">Security</button>
      <button className="px-4 py-2 bg-blue-700 text-white rounded">Notifications</button>
    </div>
  );
};

export default SettingsTabs;

"use client";
import SettingsTabs from '@/components/admin/components/SettingsTabs';

const SystemSettingsPage: React.FC = () => {
  return (
    <div className="max-w-6xl mx-auto py-12 px-4 md:px-8">
      <h1 className="text-4xl font-extrabold text-white mb-8 tracking-tight drop-shadow-lg">System Settings</h1>
      <div className="rounded-2xl shadow-2xl bg-gradient-to-br from-blue-800 to-indigo-900 p-8">
        <SettingsTabs />
      </div>
    </div>
  );
};

export default SystemSettingsPage;

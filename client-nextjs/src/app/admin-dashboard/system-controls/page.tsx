"use client";
import { useState, useEffect } from 'react';
import { getSystemControls, updateSystemControls } from '@/lib/user';

const SystemControls: React.FC = () => {
  const [maintenance, setMaintenance] = useState(false);
  const [signups, setSignups] = useState(true);
  const [apiEnabled, setApiEnabled] = useState(true);
  const [scheduleAnalytics, setScheduleAnalytics] = useState(true);
  const [queryAI, setQueryAI] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [modal, setModal] = useState<null | 'webhooks' | 'apikeys' | 'integrations'>(null);

  // Fetch current system controls from backend
  useEffect(() => {
    setLoading(true);
    getSystemControls()
      .then(res => {
        const d = res.data;
        setMaintenance(!!d.maintenance);
        setSignups(!!d.signups);
        setApiEnabled(!!d.apiEnabled);
        setScheduleAnalytics(!!d.scheduleAnalytics);
        setQueryAI(!!d.queryAI);
        setError(null);
      })
      .catch(() => setError('Failed to load system controls.'))
      .finally(() => setLoading(false));
  }, []);

  // Save to backend
  const saveControls = async (next: any) => {
    setSaving(true);
    setError(null);
    try {
      await updateSystemControls(next);
    } catch {
      setError('Failed to update system controls.');
    } finally {
      setSaving(false);
    }
  };

  // Handler for toggles
  const handleToggle = (key: string, value: boolean) => {
    const next = {
      maintenance,
      signups,
      apiEnabled,
      scheduleAnalytics,
      queryAI,
      [key]: value,
    };
    // Optimistic update
    switch (key) {
      case 'maintenance': setMaintenance(value); break;
      case 'signups': setSignups(value); break;
      case 'apiEnabled': setApiEnabled(value); break;
      case 'scheduleAnalytics': setScheduleAnalytics(value); break;
      case 'queryAI': setQueryAI(value); break;
    }
    saveControls(next);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px] text-gray-300">Loading system controls...</div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto pt-4 pb-8">
      <h1 className="text-3xl font-extrabold text-white mb-6">System Controls</h1>
      <div className="rounded-2xl shadow-2xl bg-gradient-to-br from-emerald-800 to-green-900 p-8">
        {error && <div className="mb-4 text-red-400 font-semibold">{error}</div>}
        <div className="mb-8">
          <h2 className="text-lg font-bold text-emerald-200 mb-4">Platform Toggles</h2>
          <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <span className="text-gray-200 font-semibold">Maintenance Mode</span>
              <button
                className={`w-14 h-7 flex items-center rounded-full p-1 transition-colors duration-200 ${maintenance ? 'bg-red-500' : 'bg-gray-600'}`}
                onClick={() => handleToggle('maintenance', !maintenance)}
                aria-pressed={maintenance}
                disabled={saving}
              >
                <span className={`h-5 w-5 bg-white rounded-full shadow transform transition-transform duration-200 ${maintenance ? 'translate-x-7' : ''}`}></span>
              </button>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-200 font-semibold">Enable User Signups</span>
              <button
                className={`w-14 h-7 flex items-center rounded-full p-1 transition-colors duration-200 ${signups ? 'bg-green-500' : 'bg-gray-600'}`}
                onClick={() => handleToggle('signups', !signups)}
                aria-pressed={signups}
                disabled={saving}
              >
                <span className={`h-5 w-5 bg-white rounded-full shadow transform transition-transform duration-200 ${signups ? 'translate-x-7' : ''}`}></span>
              </button>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-200 font-semibold">Enable Public API</span>
              <button
                className={`w-14 h-7 flex items-center rounded-full p-1 transition-colors duration-200 ${apiEnabled ? 'bg-green-500' : 'bg-gray-600'}`}
                onClick={() => handleToggle('apiEnabled', !apiEnabled)}
                aria-pressed={apiEnabled}
                disabled={saving}
              >
                <span className={`h-5 w-5 bg-white rounded-full shadow transform transition-transform duration-200 ${apiEnabled ? 'translate-x-7' : ''}`}></span>
              </button>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-200 font-semibold">Schedule Analytics</span>
              <button
                className={`w-14 h-7 flex items-center rounded-full p-1 transition-colors duration-200 ${scheduleAnalytics ? 'bg-green-500' : 'bg-gray-600'}`}
                onClick={() => handleToggle('scheduleAnalytics', !scheduleAnalytics)}
                aria-pressed={scheduleAnalytics}
                disabled={saving}
              >
                <span className={`h-5 w-5 bg-white rounded-full shadow transform transition-transform duration-200 ${scheduleAnalytics ? 'translate-x-7' : ''}`}></span>
              </button>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-200 font-semibold">Query AI</span>
              <button
                className={`w-14 h-7 flex items-center rounded-full p-1 transition-colors duration-200 ${queryAI ? 'bg-green-500' : 'bg-gray-600'}`}
                onClick={() => handleToggle('queryAI', !queryAI)}
                aria-pressed={queryAI}
                disabled={saving}
              >
                <span className={`h-5 w-5 bg-white rounded-full shadow transform transition-transform duration-200 ${queryAI ? 'translate-x-7' : ''}`}></span>
              </button>
            </div>
          </div>
        </div>
        <div>
          <h2 className="text-lg font-bold text-emerald-200 mb-4">Integrations</h2>
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-200">Webhooks</span>
              <button className="px-3 py-1 rounded bg-[#232347] text-emerald-300 font-semibold hover:bg-[#282A36]" onClick={() => setModal('webhooks')}>Manage</button>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-200">API Keys</span>
              <button className="px-3 py-1 rounded bg-[#232347] text-emerald-300 font-semibold hover:bg-[#282A36]" onClick={() => setModal('apikeys')}>Manage</button>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-200">Third-Party Integrations</span>
              <button className="px-3 py-1 rounded bg-[#232347] text-emerald-300 font-semibold hover:bg-[#282A36]" onClick={() => setModal('integrations')}>Manage</button>
            </div>
          </div>
        </div>

        {/* Modal Dialogs for Integrations */}
        {modal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-[#232347] rounded-2xl shadow-2xl p-8 w-full max-w-lg relative animate-fade-in">
              <button className="absolute top-3 right-3 text-gray-400 hover:text-emerald-300 text-xl" onClick={() => setModal(null)}>&times;</button>
              {modal === 'webhooks' && (
                <>
                  <h3 className="text-xl font-bold text-emerald-200 mb-4">Manage Webhooks</h3>
                  <div className="text-gray-300 mb-4">Configure webhook endpoints for system events. (Coming soon)</div>
                  <button className="px-4 py-2 rounded bg-emerald-600 text-white font-semibold hover:bg-emerald-700" disabled>Save</button>
                </>
              )}
              {modal === 'apikeys' && (
                <>
                  <h3 className="text-xl font-bold text-emerald-200 mb-4">Manage API Keys</h3>
                  <div className="text-gray-300 mb-4">View, create, and revoke API keys for integrations. (Coming soon)</div>
                  <button className="px-4 py-2 rounded bg-emerald-600 text-white font-semibold hover:bg-emerald-700" disabled>Save</button>
                </>
              )}
              {modal === 'integrations' && (
                <>
                  <h3 className="text-xl font-bold text-emerald-200 mb-4">Manage Third-Party Integrations</h3>
                  <div className="text-gray-300 mb-4">Connect and manage third-party services. (Coming soon)</div>
                  <button className="px-4 py-2 rounded bg-emerald-600 text-white font-semibold hover:bg-emerald-700" disabled>Save</button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SystemControls;

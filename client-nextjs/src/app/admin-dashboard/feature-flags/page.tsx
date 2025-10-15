"use client";
import { useEffect, useState } from 'react';
import { getFeatureFlags, updateFeatureFlag, getUserFeatureFlags, setUserFeatureFlags, getUsers } from '@/lib/user';

const flagLabels: Record<string, string> = {
  betaDashboard: 'Beta Dashboard',
  aiAssistant: 'AI Assistant',
  newBilling: 'New Billing System',
  advancedReports: 'Advanced Reports',
};


const FeatureFlags: React.FC = () => {
  const [flags, setFlags] = useState<{ key: string; label: string; enabled: boolean }[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // User targeting state
  const [userQuery, setUserQuery] = useState('');
  const [userResults, setUserResults] = useState<{ id: string; email: string }[]>([]);
  const [selectedUser, setSelectedUser] = useState<{ id: string; email: string } | null>(null);
  const [userFlags, setUserFlags] = useState<Record<string, boolean>>({});
  const [userLoading, setUserLoading] = useState(false);
  const [userError, setUserError] = useState<string | null>(null);
  // User search handler
  const handleUserSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setUserLoading(true);
    setUserError(null);
    try {
      const res = await getUsers({ email: userQuery });
      setUserResults(res.data || []);
    } catch {
      setUserError('Failed to search users');
    } finally {
      setUserLoading(false);
    }
  };

  // Select user and load their flags
  const handleSelectUser = async (user: { id: string; email: string }) => {
    setSelectedUser(user);
    setUserLoading(true);
    setUserError(null);
    try {
      const res = await getUserFeatureFlags(user.id);
      setUserFlags(res.data || {});
    } catch {
      setUserError('Failed to load user flags');
      setUserFlags({});
    } finally {
      setUserLoading(false);
    }
  };

  // Toggle user flag
  const handleToggleUserFlag = async (key: string) => {
    if (!selectedUser) return;
    const newFlags = { ...userFlags, [key]: !userFlags[key] };
    setUserFlags(newFlags);
    try {
      await setUserFeatureFlags(selectedUser.id, newFlags);
    } catch {
      setUserError('Failed to update user flag');
      setUserFlags(flags => ({ ...flags, [key]: !flags[key] }));
    }
  };

  useEffect(() => {
    setLoading(true);
    getFeatureFlags()
      .then(res => {
        // Map backend flags to UI format, fill in missing with defaults
        const backendFlags: Record<string, any>[] = res.data || [];
        const allKeys = Array.from(new Set([...Object.keys(flagLabels), ...backendFlags.map(f => f.key)]));
        setFlags(
          allKeys.map(key => ({
            key,
            label: flagLabels[key] || key,
            enabled:
              backendFlags.find(f => f.key === key)?.value === true ||
              backendFlags.find(f => f.key === key)?.value === 'true',
          }))
        );
        setError(null);
      })
      .catch(() => setError('Failed to load feature flags'))
      .finally(() => setLoading(false));
  }, []);

  const toggleFlag = async (key: string) => {
    setFlags(flags => flags.map(f => f.key === key ? { ...f, enabled: !f.enabled } : f));
    try {
      await updateFeatureFlag(key, !flags.find(f => f.key === key)?.enabled);
    } catch {
      setError('Failed to update flag');
      // Revert UI
      setFlags(flags => flags.map(f => f.key === key ? { ...f, enabled: !f.enabled } : f));
    }
  };


  return (
    <div className="max-w-3xl mx-auto pt-4 pb-8">
      <h1 className="text-3xl font-extrabold text-white mb-6">Feature Flags</h1>
      <div className="rounded-2xl shadow-2xl bg-gradient-to-br from-fuchsia-800 to-indigo-900 p-8">
        {error && <div className="text-red-400 mb-4">{error}</div>}
        <div className="mb-8">
          <h2 className="text-lg font-bold text-fuchsia-200 mb-4">Platform Feature Flags</h2>
          {loading ? (
            <div className="text-gray-300">Loading...</div>
          ) : (
            <div className="flex flex-col gap-6">
              {flags.map(flag => (
                <div key={flag.key} className="flex items-center justify-between">
                  <span className="text-gray-200 font-semibold">{flag.label}</span>
                  <button
                    className={`w-14 h-7 flex items-center rounded-full p-1 transition-colors duration-200 ${flag.enabled ? 'bg-green-500' : 'bg-gray-600'}`}
                    onClick={() => toggleFlag(flag.key)}
                    aria-pressed={flag.enabled}
                  >
                    <span className={`h-5 w-5 bg-white rounded-full shadow transform transition-transform duration-200 ${flag.enabled ? 'translate-x-7' : ''}`}></span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
        <div>
          <h2 className="text-lg font-bold text-fuchsia-200 mb-4">User Targeting</h2>
          <form onSubmit={handleUserSearch} className="flex gap-2 mb-4">
            <input
              type="text"
              placeholder="Search user by email..."
              value={userQuery}
              onChange={e => setUserQuery(e.target.value)}
              className="px-3 py-2 rounded-lg bg-[#232347] text-white border border-[#282A36] focus:outline-none"
            />
            <button type="submit" className="px-4 py-2 rounded-lg bg-amber-500 text-white font-bold">Search</button>
          </form>
          {userLoading && <div className="text-gray-300">Loading...</div>}
          {userError && <div className="text-red-400 mb-2">{userError}</div>}
          {!selectedUser && userResults.length > 0 && (
            <div className="mb-4">
              <div className="text-gray-300 mb-2">Select a user:</div>
              <ul className="bg-[#232347] rounded-lg divide-y divide-[#282A36]">
                {userResults.map(u => (
                  <li key={u.id} className="px-4 py-2 hover:bg-[#282A36] cursor-pointer text-white" onClick={() => handleSelectUser(u)}>
                    {u.email}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {selectedUser && (
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-gray-200 font-semibold">User:</span>
                <span className="text-amber-300">{selectedUser.email}</span>
                <button className="ml-2 px-2 py-1 text-xs bg-gray-600 text-white rounded" onClick={() => { setSelectedUser(null); setUserResults([]); setUserFlags({}); }}>Clear</button>
              </div>
              <div className="flex flex-col gap-4">
                {Object.keys(flagLabels).map(key => (
                  <div key={key} className="flex items-center justify-between">
                    <span className="text-gray-200 font-semibold">{flagLabels[key]}</span>
                    <button
                      className={`w-14 h-7 flex items-center rounded-full p-1 transition-colors duration-200 ${userFlags[key] ? 'bg-green-500' : 'bg-gray-600'}`}
                      onClick={() => handleToggleUserFlag(key)}
                      aria-pressed={userFlags[key]}
                    >
                      <span className={`h-5 w-5 bg-white rounded-full shadow transform transition-transform duration-200 ${userFlags[key] ? 'translate-x-7' : ''}`}></span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FeatureFlags;

'use client';

import React, { useEffect, useState } from 'react';
import { useUser } from '@stackframe/stack';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import { Toaster, toast } from 'react-hot-toast';
import { Tooltip } from 'react-tooltip';
import { getProfile, updateProfile, getTeamMembers, removeTeamMember, getNotificationSettings, updateNotificationSettings } from '@/lib/user';

// Dynamic imports
const Card = dynamic(() => import('@/components/ui/card').then((mod) => mod.Card), { ssr: false });
const CardHeader = dynamic(() => import('@/components/ui/card').then((mod) => mod.CardHeader), { ssr: false });
const CardTitle = dynamic(() => import('@/components/ui/card').then((mod) => mod.CardTitle), { ssr: false });
const CardContent = dynamic(() => import('@/components/ui/card').then((mod) => mod.CardContent), { ssr: false });
const Button = dynamic(() => import('@/components/ui/button').then((mod) => mod.Button), { ssr: false });
const Input = dynamic(() => import('@/components/ui/input').then((mod) => mod.Input), { ssr: false });
const Label = dynamic(() => import('@/components/ui/label').then((mod) => mod.Label), { ssr: false });
const Switch = dynamic(() => import('@/components/ui/Switch'), { ssr: false });
const Table = dynamic(() => import('@/components/ui/table').then((mod) => mod.Table), { ssr: false });
const TableBody = dynamic(() => import('@/components/ui/table').then((mod) => mod.TableBody), { ssr: false });
const TableCell = dynamic(() => import('@/components/ui/table').then((mod) => mod.TableCell), { ssr: false });
const TableHead = dynamic(() => import('@/components/ui/table').then((mod) => mod.TableHead), { ssr: false });
const TableHeader = dynamic(() => import('@/components/ui/table').then((mod) => mod.TableHeader), { ssr: false });
const TableRow = dynamic(() => import('@/components/ui/table').then((mod) => mod.TableRow), { ssr: false });
const Spinner = dynamic(() => import('@/components/ui/Spinner'), { ssr: false });

// Error Boundary
class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean }> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="min-h-screen bg-[#1E2A44] flex items-center justify-center text-white"
        >
          <div className="text-center bg-[#2E7D7D]/10 rounded-xl p-8 border border-[#2E7D7D]/30">
            <p className="text-red-400 font-inter text-lg">Failed to load profile</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 bg-[#2E7D7D] text-white px-6 py-2 rounded-lg hover:bg-[#2E7D7D]/80"
            >
              Retry
            </button>
          </div>
        </motion.div>
      );
    }
    return this.props.children;
  }
}

const Profile: React.FC = () => {
  const user = useUser({ or: 'redirect' });
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [notificationSettings, setNotificationSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteForm, setInviteForm] = useState({ name: '', email: '', role: '' });
  const [inviteError, setInviteError] = useState('');
  const [inviteSuccess, setInviteSuccess] = useState('');
  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileError, setProfileError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [profileRes, teamRes, notificationsRes] = await Promise.all([
          getProfile(),
          getTeamMembers(),
          getNotificationSettings(),
        ]);
        setProfile(profileRes.data);
        setTeamMembers(teamRes.data);
        setNotificationSettings(notificationsRes.data);
        setLoading(false);
      } catch (err) {
        console.error('Failed to fetch profile data:', err);
        setError('Failed to fetch profile data');
        toast.error('Failed to fetch profile data');
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProfile({ ...profile, [e.target.id]: e.target.value });
  };

  const handleProfileSave = async () => {
    try {
      await updateProfile(profile);
      setProfileSuccess('Profile updated successfully!');
      setProfileError('');
      toast.success('Profile updated successfully!');
      setTimeout(() => setProfileSuccess(''), 3000);
    } catch (err) {
      console.error('Failed to update profile:', err);
      setProfileError('Failed to update profile.');
      toast.error('Failed to update profile');
      setTimeout(() => setProfileError(''), 3000);
    }
  };

  const handleRemoveMember = async (id: string) => {
    try {
      await removeTeamMember(id);
      setTeamMembers(teamMembers.filter((m) => m.id !== id));
      setInviteSuccess('Member removed successfully.');
      toast.success('Member removed successfully');
      setTimeout(() => setInviteSuccess(''), 3000);
    } catch (err) {
      console.error('Failed to remove member:', err);
      setInviteError('Failed to remove member.');
      toast.error('Failed to remove member');
      setTimeout(() => setInviteError(''), 3000);
    }
  };

  const handleInviteChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setInviteForm({ ...inviteForm, [e.target.name]: e.target.value });
    setInviteError('');
    setInviteSuccess('');
  };

  const handleInviteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteForm.name || !inviteForm.email || !inviteForm.role) {
      setInviteError('All fields are required.');
      toast.error('All fields are required');
      return;
    }
    if (!inviteForm.email.match(/^[^@]+@[^@]+\.[^@]+$/)) {
      setInviteError('Please enter a valid email address.');
      toast.error('Please enter a valid email address');
      return;
    }
    try {
      // Replace with real API call (e.g., fetch('/api/invite-member', { method: 'POST', body: JSON.stringify(inviteForm) }))
      await fetch('/api/invite-member', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(inviteForm),
      });
      setTeamMembers([...teamMembers, { ...inviteForm, id: Date.now().toString() }]);
      setInviteSuccess('Member invited successfully!');
      toast.success('Member invited successfully!');
      setInviteError('');
      setInviteForm({ name: '', email: '', role: '' });
      setShowInviteModal(false);
      setTimeout(() => setInviteSuccess(''), 3000);
    } catch (err) {
      console.error('Failed to invite member:', err);
      setInviteError('Failed to invite member.');
      toast.error('Failed to invite member');
      setTimeout(() => setInviteError(''), 3000);
    }
  };

  const handleNotificationChange = async (id: string, checked: boolean) => {
    const newSettings = { ...notificationSettings, [id]: checked };
    setNotificationSettings(newSettings);
    try {
      await updateNotificationSettings(newSettings);
      toast.success('Notification settings updated');
    } catch (err) {
      console.error('Failed to update notification settings:', err);
      toast.error('Failed to update notification settings');
    }
  };

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="max-w-5xl mx-auto py-12 bg-[#1E2A44] text-white font-inter w-full"
      >
        <header className="sticky top-0 z-20 bg-[#1E2A44]/95 backdrop-blur-md border-b border-[#2E7D7D]/30 py-4 px-6">
          <div className="flex items-center justify-between max-w-5xl mx-auto">
            <div className="h-8 bg-[#2E7D7D]/20 rounded w-1/4 animate-pulse"></div>
          </div>
        </header>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-[#2E7D7D]/10 rounded-lg p-4 animate-pulse">
              <div className="h-6 bg-[#2E7D7D]/20 rounded w-1/2 mb-2"></div>
              <div className="h-4 bg-[#2E7D7D]/20 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      </motion.div>
    );
  }

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen bg-[#1E2A44] flex items-center justify-center w-full"
      >
        <div className="text-center bg-[#2E7D7D]/10 rounded-xl p-8 border border-[#2E7D7D]/30">
          <p className="text-red-400 font-inter text-lg">{error}</p>
          <button
            onClick={() => router.push('/')}
            className="mt-4 bg-[#2E7D7D] text-white px-6 py-2 rounded-lg hover:bg-[#2E7D7D]/80"
          >
            Return to Home
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <ErrorBoundary>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="max-w-5xl mx-auto py-12 bg-[#1E2A44] text-white font-inter w-full"
      >
        {/* Sticky Header */}
        <header className="sticky top-0 z-20 bg-[#1E2A44]/95 backdrop-blur-md border-b border-[#2E7D7D]/30 py-4 px-6">
          <div className="flex items-center justify-between max-w-5xl mx-auto">
            <h1 className="text-2xl font-bold">Profile & Settings</h1>
            <div className="flex gap-4">
              <Input
                type="text"
                placeholder="Search profile..."
                className="bg-[#2E7D7D]/20 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E7D7D]"
                aria-label="Search profile"
              />
              <Button
                className="bg-[#2E7D7D] text-white hover:bg-[#2E7D7D]/80"
                aria-label="Search profile"
                data-tooltip-id="search-profile"
                data-tooltip-content="Search profile"
              >
                Search
              </Button>
              <Tooltip id="search-profile" />
            </div>
          </div>
        </header>

        <h1 className="text-4xl font-extrabold text-[#2E7D7D] tracking-tight drop-shadow-lg mb-8 text-left mt-8">
          Profile & Settings
        </h1>

        {/* Edit Profile */}
        <motion.div whileHover={{ scale: 1.01 }} transition={{ duration: 0.2 }}>
          <Card className="mb-8 bg-[#2E7D7D]/10 border-0 shadow-lg rounded-xl">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-[#2E7D7D]">Edit Profile</CardTitle>
              <p className="text-sm text-gray-300 mt-2">
                Update your personal details and password. Changes are saved securely.
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              {profileSuccess && (
                <div className="text-green-400 text-sm mb-2">{profileSuccess}</div>
              )}
              {profileError && <div className="text-red-400 text-sm mb-2">{profileError}</div>}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-[#2E7D7D]">
                    Name
                  </Label>
                  <Input
                    id="name"
                    value={profile?.name || ''}
                    onChange={handleProfileChange}
                    className="bg-[#2E7D7D]/20 border-[#2E7D7D]/30 text-white focus:ring-2 focus:ring-[#2E7D7D]"
                    aria-label="Name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-[#2E7D7D]">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={profile?.email || ''}
                    onChange={handleProfileChange}
                    className="bg-[#2E7D7D]/20 border-[#2E7D7D]/30 text-white focus:ring-2 focus:ring-[#2E7D7D]"
                    aria-label="Email"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-[#2E7D7D]">
                  New Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  className="bg-[#2E7D7D]/20 border-[#2E7D7D]/30 text-white focus:ring-2 focus:ring-[#2E7D7D]"
                  aria-label="New Password"
                />
              </div>
              <Button
                onClick={handleProfileSave}
                className="bg-[#2E7D7D] text-white hover:bg-[#2E7D7D]/80"
                aria-label="Save profile changes"
                data-tooltip-id="save-profile"
                data-tooltip-content="Save profile changes"
              >
                Save Changes
              </Button>
              <Tooltip id="save-profile" />
            </CardContent>
          </Card>
        </motion.div>

        {/* Organization/Team */}
        <motion.div whileHover={{ scale: 1.01 }} transition={{ duration: 0.2 }}>
          <Card className="mb-8 bg-[#2E7D7D]/10 border-0 shadow-lg rounded-xl">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-xl font-semibold text-[#2E7D7D]">
                  Organization/Team
                </CardTitle>
                <p className="text-sm text-gray-300 mt-2">
                  Manage your team members. Invite new members and assign roles. Remove members as
                  needed.
                </p>
              </div>
              <Button
                onClick={() => setShowInviteModal(true)}
                className="bg-[#2E7D7D] text-white hover:bg-[#2E7D7D]/80"
                aria-label="Invite new member"
                data-tooltip-id="invite-member"
                data-tooltip-content="Invite new member"
              >
                Invite Member
              </Button>
              <Tooltip id="invite-member" />
            </CardHeader>
            <CardContent>
              {inviteSuccess && (
                <div className="text-green-400 text-sm mb-2">{inviteSuccess}</div>
              )}
              {inviteError && <div className="text-red-400 text-sm mb-2">{inviteError}</div>}
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-[#2E7D7D]">Name</TableHead>
                    <TableHead className="text-[#2E7D7D]">Email</TableHead>
                    <TableHead className="text-[#2E7D7D]">Role</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {teamMembers.map((member) => (
                    <TableRow key={member.id}>
                      <TableCell className="text-gray-200">{member.name}</TableCell>
                      <TableCell className="text-gray-200">{member.email}</TableCell>
                      <TableCell className="text-gray-200">{member.role}</TableCell>
                      <TableCell>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleRemoveMember(member.id)}
                          aria-label={`Remove ${member.name}`}
                          data-tooltip-id={`remove-${member.id}`}
                          data-tooltip-content={`Remove ${member.name}`}
                        >
                          Remove
                        </Button>
                        <Tooltip id={`remove-${member.id}`} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </motion.div>

        {/* Invite Member Modal */}
        {showInviteModal && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60"
            role="dialog"
            aria-modal="true"
            aria-labelledby="invite-modal-title"
          >
            <div className="bg-[#1E2A44] rounded-2xl p-8 w-full max-w-md shadow-2xl border border-[#2E7D7D]/30 relative">
              <button
                className="absolute top-3 right-4 text-white text-xl"
                onClick={() => setShowInviteModal(false)}
                aria-label="Close invite modal"
              >
                &times;
              </button>
              <h2 id="invite-modal-title" className="text-xl font-bold text-white mb-4">
                Invite New Member
              </h2>
              <form onSubmit={handleInviteSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="invite-name" className="text-[#2E7D7D]">
                    Name
                  </Label>
                  <Input
                    id="invite-name"
                    name="name"
                    value={inviteForm.name}
                    onChange={handleInviteChange}
                    className="bg-[#2E7D7D]/20 border-[#2E7D7D]/30 text-white focus:ring-2 focus:ring-[#2E7D7D]"
                    required
                    aria-label="Invitee name"
                  />
                </div>
                <div>
                  <Label htmlFor="invite-email" className="text-[#2E7D7D]">
                    Email
                  </Label>
                  <Input
                    id="invite-email"
                    name="email"
                    type="email"
                    value={inviteForm.email}
                    onChange={handleInviteChange}
                    className="bg-[#2E7D7D]/20 border-[#2E7D7D]/30 text-white focus:ring-2 focus:ring-[#2E7D7D]"
                    required
                    aria-label="Invitee email"
                  />
                </div>
                <div>
                  <Label htmlFor="invite-role" className="text-[#2E7D7D]">
                    Role
                  </Label>
                  <select
                    id="invite-role"
                    name="role"
                    value={inviteForm.role}
                    onChange={handleInviteChange}
                    className="bg-[#2E7D7D]/20 border-[#2E7D7D]/30 text-white w-full p-2 rounded-lg focus:ring-2 focus:ring-[#2E7D7D]"
                    required
                    aria-label="Invitee role"
                  >
                    <option value="">Select role</option>
                    <option value="Admin">Admin</option>
                    <option value="Member">Member</option>
                    <option value="Viewer">Viewer</option>
                  </select>
                </div>
                {inviteError && <div className="text-red-400 text-sm mb-2">{inviteError}</div>}
                <div className="flex gap-2">
                  <Button
                    type="submit"
                    className="w-full bg-[#2E7D7D] text-white font-bold hover:bg-[#2E7D7D]/80"
                    aria-label="Invite member"
                    data-tooltip-id="invite-submit"
                    data-tooltip-content="Invite member"
                  >
                    Invite
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full text-[#2E7D7D] border-[#2E7D7D]"
                    type="button"
                    onClick={() => setShowInviteModal(false)}
                    aria-label="Cancel invite"
                    data-tooltip-id="invite-cancel"
                    data-tooltip-content="Cancel invite"
                  >
                    Cancel
                  </Button>
                  <Tooltip id="invite-submit" />
                  <Tooltip id="invite-cancel" />
                </div>
              </form>
            </div>
          </motion.div>
        )}

        {/* Notification Preferences */}
        <motion.div whileHover={{ scale: 1.01 }} transition={{ duration: 0.2 }}>
          <Card className="bg-[#2E7D7D]/10 border-0 shadow-lg rounded-xl">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-[#2E7D7D]">
                Notification Preferences
              </CardTitle>
              <p className="text-sm text-gray-300 mt-2">
                Choose which updates you want to receive. Toggle notifications for product, billing,
                and support.
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="product-updates" className="text-[#2E7D7D]">
                  Product Updates
                </Label>
                <Switch
                  id="product-updates"
                  checked={notificationSettings?.['product-updates'] || false}
                  onCheckedChange={(checked: boolean) =>
                    handleNotificationChange('product-updates', checked)
                  }
                  aria-label="Toggle product updates"
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="billing-updates" className="text-[#2E7D7D]">
                  Billing Updates
                </Label>
                <Switch
                  id="billing-updates"
                  checked={notificationSettings?.['billing-updates'] || false}
                  onCheckedChange={(checked: boolean) =>
                    handleNotificationChange('billing-updates', checked)
                  }
                  aria-label="Toggle billing updates"
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="support-updates" className="text-[#2E7D7D]">
                  Support Updates
                </Label>
                <Switch
                  id="support-updates"
                  checked={notificationSettings?.['support-updates'] || false}
                  onCheckedChange={(checked: boolean) =>
                    handleNotificationChange('support-updates', checked)
                  }
                  aria-label="Toggle support updates"
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <Toaster position="top-right" />
      </motion.div>
    </ErrorBoundary>
  );
};

export default Profile;
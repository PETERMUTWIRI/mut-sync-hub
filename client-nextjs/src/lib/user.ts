import api from './api';

// temp stubs until you plug real endpoints
export const getCurrentPlan = async () => ({ data: { name: 'Free', price: 0 } });
export const getInvoices     = async () => ({ data: [] });
export const getPaymentMethods = async () => ({ data: [] });
export const deletePaymentMethod = async (id: string) => {};

// admin/advanced-analytics
export const getUserGrowth = (orgId: string, query: string) => api.get(`/admin/stats/users/${orgId}${query}`);
export const getRevenueTrend = (orgId: string, query: string) => api.get(`/admin/stats/mrr/${orgId}${query}`);
export const getActiveUsersTrend = (orgId: string, query: string) => api.get(`/admin/stats/active-users/${orgId}${query}`);
export const getChurnTrend = (orgId: string, query: string) => api.get(`/admin/stats/churn/${orgId}${query}`);

// admin/feature-flags
export const getUsers = (params: { email: string }) => api.get('/admin/users', { params });
export const getUserFeatureFlags = (userId: string) => api.get(`/admin/users/${userId}/flags`);
export const setUserFeatureFlags = (userId: string, flags: Record<string, boolean>) => api.post(`/admin/users/${userId}/flags`, flags);
export const getFeatureFlags = () => api.get('/admin/flags');
export const updateFeatureFlag = (key: string, enabled: boolean) => api.post('/admin/flags', { key, enabled });

// admin/system-controls
export const getSystemControls = () => api.get('/admin/system-controls');
export const updateSystemControls = (controls: any) => api.post('/admin/system-controls', controls);

// src/hooks/useNeonUser.tsx
'use client';

import { useEffect, useState } from 'react';
let maybeUseUser: (() => any) | undefined;
try {
	// eslint-disable-next-line @typescript-eslint/no-var-requires
	const mod = require('@stackframe/stack');
	maybeUseUser = mod?.useUser;
} catch (e) {
	maybeUseUser = undefined;
}

export function useNeonUser() {
	const user = maybeUseUser ? maybeUseUser() : null; // StackAuth's useUser hook if present
	const [role, setRole] = useState<string | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		async function fetchUserRole() {
			if (!user) {
				setRole(null);
				setLoading(false);
				return;
			}

			try {
				const { accessToken } = await (user.getAuthJson?.() ?? { accessToken: null });
				const res = await fetch('/api/users/me', {
					method: 'GET',
					credentials: 'include',
					headers: {
						'x-stack-access-token': accessToken ?? '',
						Authorization: `Bearer ${accessToken ?? ''}`,
						Accept: 'application/json',
					},
				});

				if (!res.ok) {
					throw new Error(`Backend error ${res.status}: ${await res.text()}`);
				}

				const json = await res.json();
				const userRole = json?.role?.toLowerCase();
				setRole(userRole || null);
			} catch (err: any) {
				console.error('useNeonUser Error:', err?.message ?? err);
				setError(err?.message ?? String(err));
				setRole(null);
			} finally {
				setLoading(false);
			}
		}

		fetchUserRole();
	}, [user]);

	const isAuthenticated = !!user && !!role;
	const isAdmin = role === 'admin';

	return {
		user: user || null,
		role,
		loading,
		error,
		isAuthenticated,
		isAdmin,
		backendData: user ? { ...user, role } : null,
	};
}
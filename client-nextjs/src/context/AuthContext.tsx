"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
let maybeUseUser: (() => any) | undefined;
try {
	// Try to require the stack user hook if available
	// eslint-disable-next-line @typescript-eslint/no-var-requires
	const mod = require("@stackframe/stack");
	maybeUseUser = mod?.useUser;
} catch (e) {
	maybeUseUser = undefined;
}

interface AuthContextType {
	user: any;
	isAdmin: boolean;
	loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
	const neonUser = maybeUseUser ? maybeUseUser() : null;
	const [isAdmin, setIsAdmin] = useState(false);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		async function fetchUserRole() {
			if (neonUser?.id) {
				setIsAdmin(neonUser.primaryEmail?.includes("admin") ?? false);
			}
			setLoading(false);
		}
		fetchUserRole();
	}, [neonUser]);

	return (
		<AuthContext.Provider value={{ user: neonUser, isAdmin, loading }}>
			{children}
		</AuthContext.Provider>
	);
};

export const useAuth = () => {
	const context = useContext(AuthContext);
	if (!context) throw new Error("useAuth must be used within AuthProvider");
	return context;
};

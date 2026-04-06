'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import type { AuthUser } from '@/types';

interface AuthContextValue {
	user: AuthUser | null;
	setUser: (user: AuthUser | null) => void;
	isLoading: boolean;
}

const AuthContext = createContext<AuthContextValue>({
	user: null,
	setUser: () => {},
	isLoading: true,
});

export function AuthProvider({
	children,
	initialUser,
}: {
	children: React.ReactNode;
	initialUser: AuthUser | null;
}) {
	const [user, setUser] = useState<AuthUser | null>(initialUser);
	const [isLoading, setIsLoading] = useState(!initialUser);

	useEffect(() => {
		if (initialUser) {
			// eslint-disable-next-line react-hooks/set-state-in-effect
			setUser(initialUser);
			setIsLoading(false);
			return;
		}

		fetch('/api/user/me')
			.then((r) => (r.ok ? r.json() : null))
			.then((res) => {
				if (res?.data) setUser(res.data);
			})
			.finally(() => setIsLoading(false));
	}, [initialUser]);

	return (
		<AuthContext.Provider value={{ user, setUser, isLoading }}>
			{children}
		</AuthContext.Provider>
	);
}

export function useAuthContext() {
	return useContext(AuthContext);
}

import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';
import type { AuthUser } from '@/types';

interface DashboardLayoutProps {
	children: React.ReactNode;
	user: AuthUser | null;
}

export function DashboardLayout({ children, user }: DashboardLayoutProps) {
	return (
		<div className="min-h-screen bg-background">
			<div className="hidden lg:block">
				<Sidebar />
			</div>
			<Navbar user={user} />
			<main className="lg:pl-60 pt-16">
				<div className="p-6 max-w-7xl mx-auto">{children}</div>
			</main>
		</div>
	);
}

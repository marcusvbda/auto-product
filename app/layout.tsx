import type { Metadata } from 'next';
import { Geist } from 'next/font/google';
import './globals.css';
import { QueryProvider } from '@/providers/QueryProvider';
import { Toaster } from '@/components/ui/sonner';

const geist = Geist({
	variable: '--font-geist-sans',
	subsets: ['latin'],
});

export const metadata: Metadata = {
	title: {
		default: 'SaaSKit',
		template: '%s | SaaSKit',
	},
	description: 'The production-ready SaaS starter kit',
};

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html
			lang="en"
			className={`${geist.variable} dark`}
			suppressHydrationWarning
		>
			<body
				className="min-h-screen bg-background font-sans antialiased"
				suppressHydrationWarning
			>
				<QueryProvider>
					{children}
					<Toaster richColors />
				</QueryProvider>
			</body>
		</html>
	);
}

import { Metadata } from 'next';
import { getSession } from '@/lib/auth/session';
import { prisma } from '@/lib/db';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Building2, CreditCard, Activity } from 'lucide-react';

export const metadata: Metadata = { title: 'Dashboard' };

export default async function DashboardPage() {
	const { companyId } = await getSession();

	const [company, memberCount] = await Promise.all([
		prisma.company.findFirst({
			where: { id: companyId, deletedAt: null },
			select: { id: true, name: true, plan: true },
		}),
		prisma.companyMember.count({ where: { companyId } }),
	]);

	const stats = [
		{
			title: 'Team members',
			value: memberCount,
			icon: Users,
			description: 'Active members in your workspace',
		},
		{
			title: 'Current plan',
			value: company?.plan ?? 'FREE',
			icon: CreditCard,
			description: 'Your active subscription',
		},
		{
			title: 'Workspace',
			value: company?.name ?? '—',
			icon: Building2,
			description: 'Your active organization',
		},
		{
			title: 'Status',
			value: 'Active',
			icon: Activity,
			description: 'All systems operational',
		},
	];

	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
				<p className="text-muted-foreground">
					Welcome back. Here&apos;s an overview of your workspace.
				</p>
			</div>

			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
				{stats.map((stat) => (
					<Card key={stat.title}>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-medium text-muted-foreground">
								{stat.title}
							</CardTitle>
							<stat.icon className="h-4 w-4 text-muted-foreground" />
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold">{stat.value}</div>
							<p className="text-xs text-muted-foreground mt-1">
								{stat.description}
							</p>
						</CardContent>
					</Card>
				))}
			</div>
		</div>
	);
}

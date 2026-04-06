import { Metadata } from 'next';
import { getSession } from '@/lib/auth/session';
import { prisma } from '@/lib/db';
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
	CardDescription,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';
import { PLANS, type PlanKey } from '@/lib/stripe/plans';
import Link from 'next/link';

export const metadata: Metadata = { title: 'Billing' };

export default async function BillingPage() {
	const { companyId } = await getSession();

	const company = await prisma.company.findFirst({
		where: { id: companyId, deletedAt: null },
		select: { plan: true, name: true },
	});

	const currentPlan = (company?.plan ?? 'FREE') as PlanKey;
	const planInfo = PLANS[currentPlan];

	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-2xl font-bold text-foreground">Billing</h1>
				<p className="text-muted-foreground">
					Manage your subscription and billing
				</p>
			</div>

			<Card>
				<CardHeader>
					<div className="flex items-center justify-between">
						<div>
							<CardTitle>Current plan</CardTitle>
							<CardDescription>
								{company?.name ?? 'Your workspace'}
							</CardDescription>
						</div>
						<Badge variant={currentPlan === 'FREE' ? 'secondary' : 'default'}>
							{planInfo.name}
						</Badge>
					</div>
				</CardHeader>
				<CardContent>
					<ul className="space-y-2 mb-4">
						{planInfo.features.map((f) => (
							<li key={f} className="flex items-center gap-2 text-sm">
								<Check className="h-4 w-4 text-primary" />
								<span>{f}</span>
							</li>
						))}
					</ul>
					{currentPlan === 'FREE' && (
						<Button asChild>
							<Link href="/app/billing/upgrade">Upgrade to Pro</Link>
						</Button>
					)}
				</CardContent>
			</Card>

			<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
				{(Object.entries(PLANS) as [PlanKey, (typeof PLANS)[PlanKey]][]).map(
					([key, plan]) => {
						const isActive = key === currentPlan;
						return (
							<Card key={key} className={isActive ? 'border-primary' : ''}>
								<CardHeader>
									<div className="flex items-center justify-between">
										<CardTitle className="text-base">{plan.name}</CardTitle>
										{isActive && <Badge variant="outline">Current</Badge>}
									</div>
									<div className="text-2xl font-bold">
										${plan.price}
										{plan.price > 0 && (
											<span className="text-sm font-normal text-muted-foreground">
												/mo
											</span>
										)}
									</div>
								</CardHeader>
								<CardContent>
									<ul className="space-y-1 mb-4">
										{plan.features.map((f) => (
											<li
												key={f}
												className="flex items-center gap-2 text-xs text-muted-foreground"
											>
												<Check className="h-3 w-3 text-primary shrink-0" />
												{f}
											</li>
										))}
									</ul>
									{!isActive && plan.price > 0 && (
										<Button size="sm" className="w-full" asChild>
											<Link href={`/dashboard/billing/upgrade?plan=${key}`}>
												Upgrade
											</Link>
										</Button>
									)}
									{!isActive && plan.price === 0 && currentPlan !== 'FREE' && (
										<Button size="sm" variant="outline" className="w-full">
											Downgrade
										</Button>
									)}
								</CardContent>
							</Card>
						);
					},
				)}
			</div>
		</div>
	);
}

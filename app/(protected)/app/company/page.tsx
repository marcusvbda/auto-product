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
import { CompanySettingsForm } from '@/components/forms/CompanySettingsForm';

export const metadata: Metadata = { title: 'Company settings' };

export default async function SettingsPage() {
	const { companyId } = await getSession();

	const company = await prisma.company.findFirst({
		where: { id: companyId, deletedAt: null },
		select: { id: true, name: true, slug: true },
	});

	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-2xl font-bold text-foreground">Company settings</h1>
				<p className="text-muted-foreground">
					Manage your organization details
				</p>
			</div>

			<Card>
				<CardHeader>
					<CardTitle>Organization</CardTitle>
					<CardDescription>
						Update your company name and settings
					</CardDescription>
				</CardHeader>
				<CardContent>
					{company ? (
						<CompanySettingsForm company={company} />
					) : (
						<p className="text-sm text-muted-foreground">
							No organization found.
						</p>
					)}
				</CardContent>
			</Card>
		</div>
	);
}

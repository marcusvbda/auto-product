import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth/session';
import { prisma } from '@/lib/db';
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
	CardDescription,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ProfileForm } from '@/components/forms/ProfileForm';
import { ChangePasswordForm } from '@/components/forms/ChangePasswordForm';

export const metadata: Metadata = { title: 'Profile' };

export default async function ProfilePage() {
	const { userId } = await getSession();

	const user = await prisma.user.findUnique({
		where: { id: userId },
		select: { id: true, email: true, name: true },
	});

	if (!user) redirect('/login');

	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-2xl font-bold text-foreground">Profile</h1>
				<p className="text-muted-foreground">
					Manage your personal information
				</p>
			</div>

			<Card>
				<CardHeader>
					<CardTitle>Personal information</CardTitle>
					<CardDescription>Update your name and email address</CardDescription>
				</CardHeader>
				<CardContent>
					<ProfileForm
						user={{ id: user.id, name: user.name, email: user.email }}
					/>
				</CardContent>
			</Card>

			<Separator />

			<Card>
				<CardHeader>
					<CardTitle>Change password</CardTitle>
					<CardDescription>
						Choose a strong password with at least 8 characters
					</CardDescription>
				</CardHeader>
				<CardContent>
					<ChangePasswordForm />
				</CardContent>
			</Card>
		</div>
	);
}

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
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { EmptyState } from '@/components/common/EmptyState';
import { InviteMemberDialog } from '@/components/dashboard/InviteMemberDialog';
import { Users } from 'lucide-react';

export const metadata: Metadata = { title: 'Members' };

export default async function MembersPage() {
	const { companyId, role } = await getSession();

	const [members, pendingInvites] = await Promise.all([
		prisma.companyMember.findMany({
			where: { companyId },
			include: { user: { select: { id: true, name: true, email: true } } },
			orderBy: { user: { createdAt: 'asc' } },
		}),
		prisma.invite.findMany({
			where: { companyId, accepted: false, expiresAt: { gt: new Date() } },
			orderBy: { createdAt: 'desc' },
		}),
	]);

	const canInvite = role === 'OWNER' || role === 'ADMIN';

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-bold text-foreground">Team members</h1>
					<p className="text-muted-foreground">
						Manage your team and invitations
					</p>
				</div>
				{canInvite && <InviteMemberDialog companyId={companyId} />}
			</div>

			<Card>
				<CardHeader>
					<CardTitle>Members ({members.length})</CardTitle>
				</CardHeader>
				<CardContent>
					{members.length === 0 ? (
						<EmptyState
							icon={<Users className="h-8 w-8" />}
							title="No members yet"
							description="Invite your team to get started"
						/>
					) : (
						<div className="divide-y divide-border">
							{members.map((member) => {
								const initials = member.user.name
									? member.user.name
											.split(' ')
											.map((n) => n[0])
											.join('')
											.toUpperCase()
											.slice(0, 2)
									: member.user.email.slice(0, 2).toUpperCase();
								return (
									<div key={member.id} className="flex items-center gap-3 py-3">
										<Avatar className="h-9 w-9">
											<AvatarFallback className="text-xs">
												{initials}
											</AvatarFallback>
										</Avatar>
										<div className="flex-1 min-w-0">
											<p className="text-sm font-medium truncate">
												{member.user.name ?? member.user.email}
											</p>
											<p className="text-xs text-muted-foreground truncate">
												{member.user.email}
											</p>
										</div>
										<Badge variant="outline" className="text-xs">
											{member.role}
										</Badge>
									</div>
								);
							})}
						</div>
					)}
				</CardContent>
			</Card>

			{pendingInvites.length > 0 && (
				<Card>
					<CardHeader>
						<CardTitle>Pending invitations</CardTitle>
						<CardDescription>
							{pendingInvites.length} awaiting acceptance
						</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="divide-y divide-border">
							{pendingInvites.map((invite) => (
								<div key={invite.id} className="flex items-center gap-3 py-3">
									<Avatar className="h-9 w-9">
										<AvatarFallback className="text-xs">
											{invite.email.slice(0, 2).toUpperCase()}
										</AvatarFallback>
									</Avatar>
									<div className="flex-1 min-w-0">
										<p className="text-sm font-medium truncate">
											{invite.email}
										</p>
										<p className="text-xs text-muted-foreground">
											Expires {invite.expiresAt.toLocaleDateString()}
										</p>
									</div>
									<Badge variant="secondary" className="text-xs capitalize">
										{invite.role.toLowerCase()}
									</Badge>
								</div>
							))}
						</div>
					</CardContent>
				</Card>
			)}
		</div>
	);
}

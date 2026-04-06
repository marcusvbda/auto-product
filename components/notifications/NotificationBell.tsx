'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';

interface NotificationItem {
	id: string;
	title: string;
	body: string | null;
	type: string;
	readAt: string | null;
	createdAt: string;
}

interface NotificationsResponse {
	data: {
		items: NotificationItem[];
		nextCursor: string | null;
		unreadCount: number;
	};
}

const BELL_QUERY_KEY = ['notifications', 'bell'];

export function NotificationBell() {
	const queryClient = useQueryClient();

	const { data } = useQuery<NotificationsResponse>({
		queryKey: BELL_QUERY_KEY,
		queryFn: async () => {
			const res = await fetch('/api/notifications');
			if (!res.ok) throw new Error('Failed to fetch notifications');
			return res.json();
		},
		refetchInterval: 30_000,
		staleTime: 10_000,
	});

	const markAllRead = useMutation({
		mutationFn: async () => {
			await fetch('/api/notifications/read-all', { method: 'PATCH' });
		},
		onSuccess: () => {
			// Update bell data in-place: clear unread dots, zero the badge
			// Do NOT refetch so items don't disappear from the popover
			queryClient.setQueryData<NotificationsResponse>(BELL_QUERY_KEY, (old) => {
				if (!old) return old;
				return {
					data: {
						...old.data,
						unreadCount: 0,
						items: old.data.items.map((n) => ({
							...n,
							readAt: n.readAt ?? new Date().toISOString(),
						})),
					},
				};
			});
			// Invalidate the full notifications page query so it refreshes there
			queryClient.invalidateQueries({ queryKey: ['notifications', 'page'] });
		},
	});

	const unreadCount = data?.data.unreadCount ?? 0;
	const items = data?.data.items ?? [];

	function handleOpenChange(open: boolean) {
		if (open && unreadCount > 0) {
			markAllRead.mutate();
		}
	}

	return (
		<Popover onOpenChange={handleOpenChange}>
			<PopoverTrigger asChild>
				<Button variant="ghost" size="icon" className="relative">
					<Bell className="h-4 w-4" />
					{unreadCount > 0 && (
						<span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-primary text-primary-foreground text-[10px] font-medium flex items-center justify-center leading-none">
							{unreadCount > 9 ? '9+' : unreadCount}
						</span>
					)}
					<span className="sr-only">Notifications</span>
				</Button>
			</PopoverTrigger>
			<PopoverContent align="end" className="w-80 p-0">
				<div className="flex items-center justify-between px-4 py-3 border-b">
					<h3 className="text-sm font-semibold">Notifications</h3>
				</div>

				<div className="max-h-80 overflow-y-auto">
					{items.length === 0 ? (
						<div className="flex flex-col items-center justify-center py-8 px-4 text-center">
							<Bell className="h-8 w-8 text-muted-foreground/40 mb-2" />
							<p className="text-sm text-muted-foreground">
								No notifications yet
							</p>
						</div>
					) : (
						<div className="divide-y divide-border">
							{items.map((n) => (
								<div
									key={n.id}
									className={cn(
										'px-4 py-3 text-sm',
										!n.readAt && 'bg-primary/5',
									)}
								>
									<div className="flex items-start gap-2">
										{!n.readAt && (
											<span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
										)}
										<div className={cn('flex-1', n.readAt && 'pl-3.5')}>
											<p className="font-medium text-foreground leading-snug">
												{n.title}
											</p>
											{n.body && (
												<p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
													{n.body}
												</p>
											)}
											<p className="text-xs text-muted-foreground mt-1">
												{formatDistanceToNow(new Date(n.createdAt), {
													addSuffix: true,
												})}
											</p>
										</div>
									</div>
								</div>
							))}
						</div>
					)}
				</div>

				<div className="px-4 py-2 border-t">
					<Button variant="ghost" size="sm" className="w-full text-xs" asChild>
						<Link href="/app/notifications">View all notifications</Link>
					</Button>
				</div>
			</PopoverContent>
		</Popover>
	);
}

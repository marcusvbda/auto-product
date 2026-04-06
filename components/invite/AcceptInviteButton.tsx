'use client';

import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { CheckCircle2 } from 'lucide-react';

interface AcceptInviteButtonProps {
	token: string;
	companyName: string;
}

export function AcceptInviteButton({
	token,
	companyName,
}: AcceptInviteButtonProps) {
	const router = useRouter();

	const mutation = useMutation({
		mutationFn: async () => {
			const res = await fetch('/api/invites/accept', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ token }),
			});
			const json = await res.json();
			if (!res.ok) throw new Error(json.error ?? 'Failed to accept invitation');
			return json;
		},
		onSuccess: () => {
			toast.success(`Welcome to ${companyName}!`);
			router.push('/app');
			router.refresh();
		},
		onError: (err) => {
			toast.error(err.message);
		},
	});

	return (
		<Button
			className="w-full"
			onClick={() => mutation.mutate()}
			disabled={mutation.isPending}
		>
			<CheckCircle2 className="h-4 w-4 mr-2" />
			{mutation.isPending ? 'Accepting...' : 'Accept invitation'}
		</Button>
	);
}

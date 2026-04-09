'use client';

import {
	Bell,
	Box,
	Building2,
	CreditCard,
	LayoutDashboard,
	User,
	Users,
} from 'lucide-react';

export default function useNavItems() {
	const items = [
		{
			href: '/app',
			label: 'Dashboard',
			icon: LayoutDashboard,
			exact: true,
		},
		{ href: '/app/products', label: 'Products', icon: Box },
		{ href: '/app/members', label: 'Members', icon: Users },
		{ href: '/app/notifications', label: 'Notifications', icon: Bell },
		{ href: '/app/company', label: 'Company', icon: Building2 },
		{ href: '/app/profile', label: 'Profile', icon: User },
		{ href: '/app/billing', label: 'Billing', icon: CreditCard },
	];

	return items;
}

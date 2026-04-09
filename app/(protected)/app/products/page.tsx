import ProductLinks from '@/components/products/productLinks';
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
	CardDescription,
} from '@/components/ui/card';
import { Metadata } from 'next';

export const metadata: Metadata = { title: 'Profile' };

export default function ProfilePage() {
	return (
		<div className="flex flex-col lg:flex-row gap-4">
			<div className="w-full lg:w-3/12">
				<ProductLinks />
			</div>
			<div className="w-full lg:w-9/12">
				<Card>
					<CardHeader>
						<CardTitle>Content</CardTitle>
						<CardDescription>
							Update your name and email address
						</CardDescription>
					</CardHeader>
					<CardContent>sdd</CardContent>
				</Card>
			</div>
		</div>
	);
}

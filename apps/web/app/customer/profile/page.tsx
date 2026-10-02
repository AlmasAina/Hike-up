import type { Metadata } from 'next';
import { AccountSettings } from '@/components/account/account-settings';

export const metadata: Metadata = { title: 'Profile' };

export default function CustomerProfilePage() {
  return <AccountSettings />;
}

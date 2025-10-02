import { redirect } from 'next/navigation';

export default function Home() {
  // In a real app, you'd have logic here to check for an authenticated user.
  // For this scaffold, we'll redirect directly to the dashboard.
  redirect('/dashboard');
}

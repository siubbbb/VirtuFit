'use client';
import { useEffect } from 'react';
import { useAuth, useUser, initiateAnonymousSignIn } from '@/firebase';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function Home() {
  const auth = useAuth();
  const { user, isUserLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isUserLoading) {
      if (user) {
        // User is already signed in, redirect to dashboard
        router.push('/dashboard');
      } else {
        // No user, sign in anonymously
        initiateAnonymousSignIn(auth);
      }
    }
  }, [user, isUserLoading, auth, router]);

  // Display a loading indicator while checking auth state and signing in.
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background">
      <Loader2 className="h-12 w-12 animate-spin text-primary" />
      <p className="mt-4 text-muted-foreground">Getting things ready...</p>
    </div>
  );
}

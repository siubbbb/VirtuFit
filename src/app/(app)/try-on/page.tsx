'use client';
import { TryOnClient } from '@/components/try-on/try-on-client';
import { getFitRecommendation } from './actions';
import { useDoc, useMemoFirebase, useUser, useFirestore } from '@/firebase';
import { doc } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function TryOnPage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();

  const userProfileRef = useMemoFirebase(
    () => (user ? doc(firestore, 'users', user.uid) : null),
    [user, firestore]
  );
  const { data: userProfile, isLoading: isProfileLoading } = useDoc(userProfileRef, { listen: false });

  const isLoading = isUserLoading || (user && isProfileLoading);
  
  const userClientData = userProfile ? {
    avatarUrl: userProfile.avatarUrl,
    measurements: userProfile.measurements,
  } : null;

  return (
    <div>
       <header className="mb-8">
        <h1 className="text-4xl font-bold font-headline">Virtual Try-On</h1>
        <p className="text-muted-foreground mt-2">
          See how garments fit on your personalized avatar and get expert size recommendations.
        </p>
      </header>
      
      {isLoading && (
        <div className="space-y-4">
            <Skeleton className="h-[70vh] w-full" />
        </div>
      )}

      {!isLoading && !userClientData?.avatarUrl && (
        <Alert variant="destructive" className="max-w-xl mx-auto">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>No Avatar Found</AlertTitle>
          <AlertDescription>
            You need to create an avatar before you can use the virtual try-on feature.
            <Button asChild className="mt-4">
              <Link href="/capture">Create Your Avatar</Link>
            </Button>
          </AlertDescription>
        </Alert>
      )}
      
      {!isLoading && userClientData?.avatarUrl && (
        <TryOnClient
          user={userClientData}
          getFitRecommendationAction={getFitRecommendation}
        />
      )}
    </div>
  );
}

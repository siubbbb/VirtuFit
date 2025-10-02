'use client';

import { QrCodeFlow } from '@/components/capture/qr-code-flow';
import { Skeleton } from '@/components/ui/skeleton';
import { useEffect, useState } from 'react';
import { useUser, useDoc, useMemoFirebase, useFirestore } from '@/firebase';
import { doc } from 'firebase/firestore';
import { useRouter, useSearchParams } from 'next/navigation';
import { CameraCapture } from '@/components/capture/camera-capture';

export default function CapturePage() {
  const { user } = useUser();
  const firestore = useFirestore();
  const router = useRouter();
  const searchParams = useSearchParams();

  const isMobileSession = searchParams.has('session');
  
  const activeUserId = isMobileSession ? searchParams.get('session') : user?.uid;

  const userProfileRef = useMemoFirebase(
    () => (activeUserId ? doc(firestore, 'users', activeUserId) : null),
    [activeUserId, firestore]
  );
  
  const { data: userProfile } = useDoc(userProfileRef, { listen: true });

  useEffect(() => {
    if (userProfile?.avatarUrl && !isMobileSession) {
      router.push('/dashboard');
    }
  }, [userProfile?.avatarUrl, router, isMobileSession]);

  if (isMobileSession) {
    return (
      <div className="max-w-4xl mx-auto">
        <header className="mb-8 text-center">
          <h1 className="text-4xl font-bold font-headline">Get Measured</h1>
          <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
            Follow the simple steps below to create your 2D avatar and extract your body measurements using your device's camera.
          </p>
        </header>
        <CameraCapture />
      </div>
    );
  }
  
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <QrCodeFlow />
    </div>
  );
}

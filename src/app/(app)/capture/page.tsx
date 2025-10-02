
'use client';

import { QrCodeFlow } from '@/components/capture/qr-code-flow';
import { Skeleton } from '@/components/ui/skeleton';
import { useEffect, useState } from 'react';
import { useUser, useDoc, useMemoFirebase } from '@/firebase';
import { doc, getFirestore } from 'firebase/firestore';
import { useRouter, useSearchParams } from 'next/navigation';
import { CameraCapture } from '@/components/capture/camera-capture';

export default function CapturePage() {
  const [isClient, setIsClient] = useState(false);
  const { user } = useUser();
  const router = useRouter();
  const searchParams = useSearchParams();

  // The 'session' parameter is only present when a user scans a QR code on their mobile.
  const isMobileSession = searchParams.has('session');

  useEffect(() => {
    // This ensures we only render UI that depends on client-side info after mounting.
    setIsClient(true);
  }, []);

  const userProfileRef = useMemoFirebase(
    // On desktop, we listen to our own user doc.
    // On mobile, we listen to the user doc specified by the 'session' parameter.
    () => {
      const userId = isMobileSession ? searchParams.get('session') : user?.uid;
      if (userId) {
        return doc(getFirestore(), 'users', userId);
      }
      return null;
    },
    [user, isMobileSession, searchParams]
  );

  // This hook listens for the avatarUrl update.
  const { data: userProfile } = useDoc(userProfileRef, { listen: true });

  useEffect(() => {
    // When the avatarUrl appears, the capture is complete. Redirect desktop users.
    // Mobile users will see a success message handled within CameraCapture.
    if (userProfile?.avatarUrl && !isMobileSession) {
      router.push('/dashboard');
    }
  }, [userProfile?.avatarUrl, router, isMobileSession]);


  const renderContent = () => {
    if (!isClient) {
      // Render a skeleton loader on the server and during initial client render.
      return (
        <div className="max-w-4xl mx-auto">
           <header className="mb-8 text-center">
             <Skeleton className="h-10 w-3/4 mx-auto" />
             <Skeleton className="h-6 w-1/2 mx-auto mt-4" />
           </header>
           <div className="flex justify-center">
            <Skeleton className="h-[50vh] w-full max-w-md" />
           </div>
        </div>
      )
    }

    // If the URL has a 'session' param, it's a mobile device that scanned the QR code.
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
    
    // On desktop (no 'session' param), show the QR code flow.
    return <QrCodeFlow />;
  };

  return <div className="p-4 sm:p-6 lg:p-8">{renderContent()}</div>;
}

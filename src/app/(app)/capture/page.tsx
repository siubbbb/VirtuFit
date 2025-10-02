
'use client';

import { useIsMobile } from '@/hooks/use-mobile';
import { CameraCapture } from '@/components/capture/camera-capture';
import { QrCodeFlow } from '@/components/capture/qr-code-flow';
import { Skeleton } from '@/components/ui/skeleton';
import { useEffect, useState } from 'react';
import { useUser, useDoc, useMemoFirebase } from '@/firebase';
import { doc, getFirestore } from 'firebase/firestore';
import { useRouter } from 'next/navigation';

export default function CapturePage() {
  const isMobile = useIsMobile();
  const [isClient, setIsClient] = useState(false);
  const { user } = useUser();
  const router = useRouter();

  useEffect(() => {
    // This ensures we don't have a server/client mismatch on the `isMobile` value.
    setIsClient(true);
  }, []);

  const userProfileRef = useMemoFirebase(
    () => (user ? doc(getFirestore(), 'users', user.uid) : null),
    [user]
  );

  // This hook now lives on the page and listens for the avatarUrl update
  const { data: userProfile } = useDoc(userProfileRef, { listen: true });

  useEffect(() => {
    // When the avatarUrl appears, the capture is complete. Redirect to dashboard.
    if (userProfile?.avatarUrl) {
      router.push('/dashboard');
    }
  }, [userProfile?.avatarUrl, router]);


  const renderContent = () => {
    if (!isClient) {
      // Render a skeleton loader on the server and during initial client render
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

    // If on a mobile device (or a narrow browser window), show the camera directly.
    if (isMobile) {
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
    
    // On desktop, show the QR code flow.
    return <QrCodeFlow isComplete={!!userProfile?.avatarUrl} />;
  };

  return <div className="p-4 sm:p-6 lg:p-8">{renderContent()}</div>;
}

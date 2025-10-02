'use client';

import { useIsMobile } from '@/hooks/use-mobile';
import { CameraCapture } from '@/components/capture/camera-capture';
import { QrCodeFlow } from '@/components/capture/qr-code-flow';
import { Skeleton } from '@/components/ui/skeleton';
import { useEffect, useState } from 'react';

export default function CapturePage() {
  const isMobile = useIsMobile();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    // This ensures we don't have a server/client mismatch on the `isMobile` value.
    setIsClient(true);
  }, []);

  const renderContent = () => {
    if (!isClient) {
      // Render a skeleton loader on the server and during initial client render
      // to avoid flash of incorrect content.
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

    return <QrCodeFlow />;
  };

  return <div className="p-4 sm:p-6 lg:p-8">{renderContent()}</div>;
}

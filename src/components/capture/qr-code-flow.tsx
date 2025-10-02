'use client';

import { useEffect, useMemo, useState } from 'react';
import QRCode from 'qrcode.react';
import { useUser } from '@/firebase';
import { Smartphone } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '../ui/skeleton';

export function QrCodeFlow() {
  const { user, isUserLoading } = useUser();
  const [origin, setOrigin] = useState('');

  // This effect runs only once on the client after the component mounts
  useEffect(() => {
    setOrigin(window.location.origin);
  }, []); // Empty dependency array ensures this runs only once on mount

  const qrUrl = useMemo(() => {
    if (!origin || !user) return '';
    return `${origin}/capture?session=${user.uid}`;
  }, [origin, user]);

  // The main loading state ONLY depends on getting the user and the origin.
  const isLoading = isUserLoading || !origin;

  return (
    <div className="max-w-2xl mx-auto">
      <header className="mb-8 text-center">
        <h1 className="text-4xl font-bold font-headline">Scan to Get Measured</h1>
        <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
          This part of the experience is designed for your mobile phone.
        </p>
      </header>

      <Card className="shadow-lg">
        <CardContent className="p-6 flex flex-col md:flex-row items-center gap-8">
          <div className="flex-1 space-y-4 text-center md:text-left">
            <div className="flex justify-center md:justify-start">
              <Smartphone className="w-12 h-12 text-primary" />
            </div>
            <h2 className="text-2xl font-semibold">Continue on your phone</h2>
            <ol className="list-decimal list-inside text-muted-foreground text-left space-y-2">
              <li>Open the camera app on your phone.</li>
              <li>Scan the QR code to open a secure link in your mobile browser.</li>
              <li>Follow the on-screen instructions to take your photo.</li>
              <li>Your desktop screen will update automatically when you're done.</li>
            </ol>
          </div>
          <div className="relative w-48 h-48 flex items-center justify-center">
            {isLoading ? (
              <Skeleton className="w-full h-full" />
            ) : (
              qrUrl && (
                <QRCode
                  value={qrUrl}
                  size={192}
                  bgColor="#FFFFFF"
                  fgColor="#000000"
                  level="Q"
                  includeMargin={false}
                  className="rounded-lg"
                />
              )
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

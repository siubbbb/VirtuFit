import { CameraCapture } from '@/components/capture/camera-capture';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, Smartphone } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

export default function CapturePage() {
  return (
    <div className="max-w-4xl mx-auto">
      <header className="mb-8 text-center">
        <h1 className="text-4xl font-bold font-headline">Get Measured</h1>
        <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
          Follow the simple steps below to create your 2D avatar and extract your body measurements using your device's camera.
        </p>
      </header>

      <Alert className="mb-8 bg-secondary/50">
          <Smartphone className="h-4 w-4"/>
          <AlertTitle>Mobile Experience</AlertTitle>
          <AlertDescription>
            For the best experience, this capture process is designed for mobile devices. In a real-world scenario, you would be guided here via a QR code from your desktop.
          </AlertDescription>
      </Alert>

      <Card className="shadow-lg overflow-hidden">
        <CardHeader>
            <CardTitle>Live Camera Capture</CardTitle>
            <CardDescription>Position yourself within the guide for an accurate capture.</CardDescription>
        </CardHeader>
        <CardContent>
            <CameraCapture />
        </CardContent>
      </Card>

    </div>
  );
}

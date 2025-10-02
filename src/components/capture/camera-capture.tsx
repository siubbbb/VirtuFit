'use client';

import { useState, useRef, useEffect, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Camera, Loader2, PersonStanding, Check, RefreshCw, AlertTriangle, ArrowRight } from 'lucide-react';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';
import { generateAvatar } from '@/ai/flows/generate-avatar';
import { useRouter } from 'next/navigation';
import { useUser, useFirestore, setDocumentNonBlocking } from '@/firebase';
import { doc, serverTimestamp } from 'firebase/firestore';


type CaptureStep = 'front-guide' | 'front-captured' | 'processing' | 'error';

export function CameraCapture() {
  const [step, setStep] = useState<CaptureStep>('front-guide');
  const [frontPhoto, setFrontPhoto] = useState<string | null>(null);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isProcessing, startTransition] = useTransition();
  const { user } = useUser();
  const firestore = useFirestore();

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    async function setupCamera() {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        try {
          const mediaStream = await navigator.mediaDevices.getUserMedia({ 
            video: { facingMode: 'user' } 
          });
          setStream(mediaStream);
          if (videoRef.current) {
            videoRef.current.srcObject = mediaStream;
            videoRef.current.onloadedmetadata = () => {
              setIsCameraReady(true);
            };
          }
        } catch (err) {
          console.error('Error accessing camera:', err);
          setStep('error');
          toast({
            variant: 'destructive',
            title: 'Camera Error',
            description: 'Could not access the camera. Please check permissions and try again.',
          });
        }
      }
    }
    setupCamera();

    return () => {
      stream?.getTracks().forEach(track => track.stop());
    };
  }, [toast, stream]);

  const takePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return null;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext('2d');
    context?.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
    return canvas.toDataURL('image/jpeg');
  };

  const handleCapture = () => {
    const photoDataUrl = takePhoto();
    if (photoDataUrl) {
      if (step === 'front-guide') {
        setFrontPhoto(photoDataUrl);
        setStep('front-captured');
      }
    }
  };
  
  const handleRetake = () => {
    setFrontPhoto(null);
    setStep('front-guide');
  };
  
  const handleGenerateAvatar = () => {
    if (!frontPhoto) {
        toast({ variant: 'destructive', title: 'Missing photo' });
        return;
    }
    if (!user) {
        toast({ variant: 'destructive', title: 'You must be signed in' });
        return;
    }
    
    setStep('processing');
    startTransition(async () => {
        try {
            const { avatarDataUri } = await generateAvatar({ photoDataUri: frontPhoto });

            // ** Firestore Integration **
            const userDocRef = doc(firestore, 'users', user.uid);
            
            // For now, let's create some mock measurement data
            const mockMeasurements = {
              chest: Math.round(90 + Math.random() * 20),
              waist: Math.round(75 + Math.random() * 20),
              hip: Math.round(90 + Math.random() * 20),
              inseam: Math.round(75 + Math.random() * 10),
              bust: Math.round(85 + Math.random() * 20),
              length: Math.round(65 + Math.random() * 10)
            }

            setDocumentNonBlocking(userDocRef, { 
                avatarUrl: avatarDataUri,
                measurements: mockMeasurements,
                updatedAt: serverTimestamp(),
            }, { merge: true });

            // We don't need to await the above non-blocking call.
            // Let's add a small delay to make the UI transition feel smoother.
            await new Promise(resolve => setTimeout(resolve, 1500));

            toast({
                title: 'Avatar Generated!',
                description: 'Your avatar and measurements have been saved.',
            });
            router.push('/dashboard');
        } catch(error) {
            console.error("Avatar generation failed", error);
            setStep('error');
            toast({
                variant: 'destructive',
                title: 'Generation Failed',
                description: 'Something went wrong while creating your avatar.',
            });
        }
    });
  };
  
  
  const getGuideText = () => {
    switch (step) {
      case 'front-guide': return 'Face forward and align with the guide.';
      case 'front-captured': return 'Great! Ready to generate your avatar?';
      case 'processing': return 'Processing... Our AI is working its magic!';
      case 'error': return 'An error occurred. Please try again.';
      default: return '';
    }
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative w-full max-w-md aspect-[9/16] bg-muted rounded-lg overflow-hidden flex items-center justify-center">
        {step !== 'front-captured' ? (
          <video ref={videoRef} autoPlay playsInline muted className="h-full w-full object-cover" />
        ) : (
          frontPhoto && <Image src={frontPhoto} alt="Captured photo" layout="fill" objectFit="cover" />
        )}
        
        {step === 'front-guide' && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <PersonStanding className="w-4/5 h-4/5 text-white/20" strokeWidth={1}/>
            </div>
        )}
        {!isCameraReady && step !== 'error' && step !== 'processing' && (
            <div className="absolute inset-0 bg-background/80 flex flex-col items-center justify-center gap-2">
                <Loader2 className="animate-spin h-8 w-8 text-primary"/>
                <p className="text-muted-foreground">Starting camera...</p>
            </div>
        )}
      </div>
      
      <p className="text-center text-muted-foreground min-h-[40px]">{getGuideText()}</p>
      
      <canvas ref={canvasRef} className="hidden" />

      <div className="w-full max-w-md">
        {step === 'front-guide' ? (
           <Button onClick={handleCapture} disabled={!isCameraReady || isProcessing} className="w-full" size="lg">
              <Camera className="mr-2" />
              Capture Photo
            </Button>
        ) : null}

        {step === 'front-captured' && (
             <div className="flex gap-4">
                <Button onClick={handleRetake} variant="outline" className="w-full" disabled={isProcessing}>
                    <RefreshCw className="mr-2" /> Retake
                </Button>
                <Button onClick={handleGenerateAvatar} className="w-full" disabled={isProcessing}>
                   {isProcessing ? <Loader2 className="animate-spin mr-2" /> : <ArrowRight className="mr-2" />}
                    Generate Avatar
                </Button>
            </div>
        )}

        {step === 'processing' && (
            <div className="flex flex-col items-center gap-4 text-primary">
                <Loader2 className="animate-spin h-10 w-10"/>
                <p>Analyzing your photo and creating your avatar...</p>
            </div>
        )}
        
        {step === 'error' && (
            <div className="flex flex-col items-center gap-4 text-destructive">
                 <AlertTriangle className="h-10 w-10"/>
                 <Button onClick={() => window.location.reload()} className="w-full">
                    <RefreshCw className="mr-2" /> Try Again
                </Button>
            </div>
        )}
      </div>
    </div>
  );
}

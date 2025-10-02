'use client';

import { useState, useRef, useEffect, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Camera, Loader2, PersonStanding, Check, RefreshCw, AlertTriangle, ArrowRight } from 'lucide-react';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';
import { generateAvatar } from '@/ai/flows/generate-avatar';
import { useRouter } from 'next/navigation';

type CaptureStep = 'front-guide' | 'front-captured' | 'side-guide' | 'side-captured' | 'processing' | 'error';

export function CameraCapture() {
  const [step, setStep] = useState<CaptureStep>('front-guide');
  const [frontPhoto, setFrontPhoto] = useState<string | null>(null);
  const [sidePhoto, setSidePhoto] = useState<string | null>(null);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isProcessing, startTransition] = useTransition();

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
      } else if (step === 'side-guide') {
        setSidePhoto(photoDataUrl);
        setStep('side-captured');
      }
    }
  };
  
  const handleRetake = () => {
    if (step === 'front-captured') {
        setFrontPhoto(null);
        setStep('front-guide');
    } else if (step === 'side-captured') {
        setSidePhoto(null);
        setStep('side-guide');
    }
  };

  const handleContinue = () => {
    if (step === 'front-captured') {
      setStep('side-guide');
    }
  };
  
  const handleGenerateAvatar = () => {
    if (!frontPhoto || !sidePhoto) {
        toast({ variant: 'destructive', title: 'Missing photos' });
        return;
    }
    
    setStep('processing');
    startTransition(async () => {
        try {
            // NOTE: In a real app, you would likely use both front and side photos
            // for more complex 3D modeling and measurement extraction.
            // For this 2D avatar generation, we use the front photo as per the AI flow.
            await generateAvatar({ photoDataUri: frontPhoto });

            // Simulate saving data and other backend processes
            await new Promise(resolve => setTimeout(resolve, 2000));

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
  
  const currentPhoto = step === 'front-captured' ? frontPhoto : sidePhoto;
  
  const getGuideText = () => {
    switch (step) {
      case 'front-guide': return 'Face forward and align with the guide.';
      case 'front-captured': return 'Front view captured. Happy with the result?';
      case 'side-guide': return 'Turn 90 degrees to your side.';
      case 'side-captured': return 'Side view captured. Ready to generate your avatar?';
      case 'processing': return 'Processing... Our AI is working its magic!';
      case 'error': return 'An error occurred. Please try again.';
      default: return '';
    }
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative w-full max-w-md aspect-[9/16] bg-muted rounded-lg overflow-hidden flex items-center justify-center">
        {step !== 'front-captured' && step !== 'side-captured' ? (
          <video ref={videoRef} autoPlay playsInline muted className="h-full w-full object-cover" />
        ) : (
          currentPhoto && <Image src={currentPhoto} alt="Captured photo" layout="fill" objectFit="cover" />
        )}
        
        {(step === 'front-guide' || step === 'side-guide') && (
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
        {step === 'front-guide' || step === 'side-guide' ? (
           <Button onClick={handleCapture} disabled={!isCameraReady || isProcessing} className="w-full" size="lg">
              <Camera className="mr-2" />
              Capture {step === 'front-guide' ? 'Front Photo' : 'Side Photo'}
            </Button>
        ) : null}

        {step === 'front-captured' && (
            <div className="flex gap-4">
                <Button onClick={handleRetake} variant="outline" className="w-full">
                    <RefreshCw className="mr-2" /> Retake
                </Button>
                <Button onClick={handleContinue} className="w-full bg-green-600 hover:bg-green-700">
                    <Check className="mr-2" /> Looks Good
                </Button>
            </div>
        )}
        
        {step === 'side-captured' && (
             <div className="flex gap-4">
                <Button onClick={handleRetake} variant="outline" className="w-full">
                    <RefreshCw className="mr-2" /> Retake
                </Button>
                <Button onClick={handleGenerateAvatar} className="w-full">
                    Generate Avatar <ArrowRight className="mr-2" />
                </Button>
            </div>
        )}

        {step === 'processing' && (
            <div className="flex flex-col items-center gap-4 text-primary">
                <Loader2 className="animate-spin h-10 w-10"/>
                <p>Analyzing your photos and creating your avatar...</p>
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

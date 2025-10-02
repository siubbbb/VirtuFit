'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, ScanLine, Loader2 } from 'lucide-react';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { useUser, useDoc, useMemoFirebase } from '@/firebase';
import { doc, getFirestore } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';

export default function DashboardPage() {
    const { user, isUserLoading } = useUser();

    const userProfileRef = useMemoFirebase(
      () => (user ? doc(getFirestore(), 'users', user.uid) : null),
      [user]
    );
    const { data: userProfile, isLoading: isProfileLoading } = useDoc(userProfileRef);

    const avatarPlaceholder = PlaceHolderImages.find(img => img.id === 'avatar-placeholder');
    const isLoading = isUserLoading || isProfileLoading;
    const hasAvatar = userProfile?.avatarUrl;
    const avatarUrl = hasAvatar ? userProfile.avatarUrl : avatarPlaceholder?.imageUrl;

  return (
    <div className="flex flex-col gap-8">
        <header>
           {isLoading ? (
             <div className="space-y-2">
                <Skeleton className="h-8 w-1/2" />
                <Skeleton className="h-4 w-1/3" />
             </div>
           ) : (
             <>
                <h1 className="text-3xl font-bold text-foreground font-headline">Welcome back, {user?.displayName || 'VirtuFit User'}!</h1>
                <p className="text-muted-foreground mt-1">Ready to find your perfect fit?</p>
             </>
           )}
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="md:col-span-2 flex flex-col justify-between shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardHeader>
                    <CardTitle className="font-headline">{hasAvatar ? "Your VirtuFit Avatar" : "Create Your Avatar"}</CardTitle>
                    <CardDescription>
                        {hasAvatar ? "Your personalized 2D avatar is ready for a virtual try-on." : "Let's create your 2D avatar for a personalized shopping experience."}
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex-grow flex items-center justify-center">
                    {isLoading ? (
                        <Skeleton className="w-full max-w-sm aspect-[4/5] rounded-lg" />
                    ) : (
                        <div className="relative w-full max-w-sm aspect-[4/5] rounded-lg overflow-hidden bg-muted">
                            {avatarUrl && (
                              <Image 
                                  src={avatarUrl}
                                  alt={hasAvatar ? "User's 2D avatar" : "Avatar placeholder"}
                                  fill
                                  className="object-contain"
                                  data-ai-hint={hasAvatar ? "fashion avatar" : avatarPlaceholder?.imageHint}
                              />
                            )}
                            {!hasAvatar && (
                                <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                                    <ScanLine className="w-16 h-16 text-white/50" />
                                </div>
                            )}
                        </div>
                    )}
                </CardContent>
                <CardFooter>
                     {hasAvatar ? (
                        <Button asChild className="w-full md:w-auto" size="lg">
                            <Link href="/try-on">
                                Start Virtual Try-On <ArrowRight className="ml-2"/>
                            </Link>
                        </Button>
                     ) : (
                        <Button asChild className="w-full md:w-auto" size="lg" disabled={isLoading}>
                             <Link href="/capture">
                                {isLoading ? <Loader2 className="mr-2 animate-spin"/> : 'Get Measured Now'}
                                {!isLoading && <ArrowRight className="ml-2"/>}
                            </Link>
                        </Button>
                     )}
                </CardFooter>
            </Card>

            <div className="flex flex-col gap-6">
                 <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
                    <CardHeader>
                        <CardTitle className="text-xl font-headline">How it Works</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ol className="list-decimal list-inside space-y-3 text-sm text-muted-foreground">
                            <li><strong>Capture:</strong> Take a photo using our guided process.</li>
                            <li><strong>Measure & Avatar:</strong> Our AI analyzes your photo to extract key body measurements and create an avatar.</li>
                            <li><strong>Try-On:</strong> See how clothes fit on your personalized 2D avatar.</li>
                            <li><strong>Recommend:</strong> Get AI-powered size recommendations for any garment.</li>
                        </ol>
                    </CardContent>
                </Card>
                <Card className="bg-primary text-primary-foreground shadow-lg hover:shadow-xl transition-shadow duration-300">
                    <CardHeader>
                        <CardTitle className="text-xl font-headline">Your Privacy Matters</CardTitle>
                    </CardHeader>
                    <CardContent>
                       <p className="text-sm">
                            Your data is yours. All measurements and photos are securely processed and can be deleted from your account at any time.
                       </p>
                    </CardContent>
                    <CardFooter>
                        <Button asChild variant="secondary" size="sm">
                            <Link href="/account">Manage Account</Link>
                        </Button>
                    </CardFooter>
                </Card>
            </div>

        </div>
    </div>
  );
}

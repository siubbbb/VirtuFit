'use client';

import { useState, useTransition, useEffect, useMemo } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { GARMENTS, BRAND_SIZE_CHARTS } from '@/lib/constants';
import { Loader2, Sparkles } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

type User = {
  name: string;
  avatarUrl: string;
  measurements: Record<string, number>;
};

type Props = {
  user: User;
  getFitRecommendationAction: (
    userMeasurements: Record<string, number>,
    garmentId: string
  ) => Promise<Record<string, number>>;
};

export function TryOnClient({ user, getFitRecommendationAction }: Props) {
  const [selectedGarment, setSelectedGarment] = useState(GARMENTS[0]);
  const [selectedSize, setSelectedSize] = useState('M');
  const [fitScores, setFitScores] = useState<Record<string, number>>({});
  const [isPending, startTransition] = useTransition();

  const sizes = Object.keys(BRAND_SIZE_CHARTS[selectedGarment.id].chart);

  useEffect(() => {
    startTransition(async () => {
      const scores = await getFitRecommendationAction(user.measurements, selectedGarment.id);
      setFitScores(scores);
    });
  }, [selectedGarment, user.measurements, getFitRecommendationAction]);
  
  const handleGarmentChange = (garmentId: string) => {
    const newGarment = GARMENTS.find(g => g.id === garmentId);
    if(newGarment) {
        setSelectedGarment(newGarment);
        const newSizes = Object.keys(BRAND_SIZE_CHARTS[newGarment.id].chart);
        if(!newSizes.includes(selectedSize)){
            setSelectedSize(newSizes[Math.floor(newSizes.length / 2)] || newSizes[0]);
        }
    }
  }

  const bestFitSize = useMemo(() => {
     if (Object.keys(fitScores).length === 0) return null;
     return Object.entries(fitScores).reduce((best, current) => current[1] > best[1] ? current : best)[0];
  }, [fitScores]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Avatar and Garment Display */}
      <div className="lg:col-span-2">
        <Card className="shadow-lg h-full">
            <CardHeader>
                <CardTitle className="font-headline">Your Fitting Room</CardTitle>
                <CardDescription>Select a garment and size to see it on your avatar.</CardDescription>
            </CardHeader>
          <CardContent className="flex items-center justify-center pt-0">
            <div className="relative w-full max-w-lg aspect-[4/5] bg-muted rounded-lg overflow-hidden">
              <Image
                src={user.avatarUrl}
                alt={`${user.name}'s avatar`}
                layout="fill"
                objectFit="contain"
                className="transition-opacity duration-300"
                data-ai-hint="fashion avatar"
              />
              <Image
                src={selectedGarment.imageUrl}
                alt={selectedGarment.name}
                layout="fill"
                objectFit="contain"
                className="opacity-70 mix-blend-multiply transition-all duration-300"
                key={selectedGarment.id}
                data-ai-hint={selectedGarment.imageHint}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Controls and Recommendations */}
      <div>
        <div className="space-y-8">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="font-headline">Choose Garment</CardTitle>
            </CardHeader>
            <CardContent>
              <Carousel opts={{ align: 'start' }} className="w-full">
                <CarouselContent>
                  {GARMENTS.map((garment) => (
                    <CarouselItem key={garment.id} className="basis-1/2 md:basis-1/3 lg:basis-1/2">
                      <div className="p-1">
                        <button
                          onClick={() => handleGarmentChange(garment.id)}
                          className={cn(
                            'block w-full rounded-lg border-2 p-1 transition-all',
                            selectedGarment.id === garment.id
                              ? 'border-primary shadow-md'
                              : 'border-transparent hover:border-primary/50'
                          )}
                        >
                          <div className="aspect-[4/5] w-full bg-muted rounded-md overflow-hidden relative">
                            <Image
                              src={garment.imageUrl}
                              alt={garment.name}
                              layout="fill"
                              objectFit="cover"
                              data-ai-hint={garment.imageHint}
                            />
                          </div>
                          <p className="text-xs font-medium mt-2 truncate">{garment.name}</p>
                        </button>
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious />
                <CarouselNext />
              </Carousel>
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="font-headline">Select Size</CardTitle>
            </CardHeader>
            <CardContent>
              <RadioGroup
                value={selectedSize}
                onValueChange={setSelectedSize}
                className="flex gap-2 flex-wrap"
              >
                {sizes.map((size) => (
                  <div key={size}>
                    <RadioGroupItem value={size} id={`size-${size}`} className="sr-only" />
                    <Label
                      htmlFor={`size-${size}`}
                      className="flex flex-col items-center justify-center rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary cursor-pointer transition-colors"
                    >
                      {size}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </CardContent>
          </Card>

          <Card className="shadow-lg bg-gradient-to-br from-primary/90 to-primary text-primary-foreground">
            <CardHeader>
              <CardTitle className="font-headline flex items-center gap-2">
                <Sparkles />
                AI Fit Recommendation
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isPending ? (
                <div className="flex items-center justify-center gap-2 text-primary-foreground/80 h-32">
                  <Loader2 className="animate-spin h-6 w-6" />
                  <span>Analyzing fit...</span>
                </div>
              ) : (
                <div className="space-y-4">
                  {sizes.map((size) => {
                    const score = fitScores[size] || 0;
                    return (
                        <div key={size} className={cn("p-3 rounded-lg transition-all", selectedSize === size && "bg-black/10")}>
                           <div className="flex justify-between items-center mb-1">
                             <span className="font-bold text-sm">{size}</span>
                             {size === bestFitSize && <Badge variant="secondary" className="bg-white text-primary">Best Fit</Badge>}
                           </div>
                           <Progress value={score} className="h-2 [&>div]:bg-white" />
                           <p className="text-right text-xs mt-1 opacity-80">{score}% Match</p>
                        </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

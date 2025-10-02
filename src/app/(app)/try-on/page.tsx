import { TryOnClient } from '@/components/try-on/try-on-client';
import { recommendFit } from '@/ai/flows/recommend-fit';
import { BRAND_SIZE_CHARTS } from '@/lib/constants';

// Mock fetching user data. In a real app, this would come from your database.
async function getUserData() {
  return {
    name: 'Alex',
    avatarUrl: 'https://picsum.photos/seed/user-avatar-generated/800/1000',
    measurements: {
      chest: 100,
      waist: 84,
      hip: 102,
      inseam: 81,
      bust: 96,
      length: 69
    },
  };
}

async function getFitRecommendation(userMeasurements: Record<string, number>, garmentId: string) {
  'use server';
  try {
    const brandData = BRAND_SIZE_CHARTS[garmentId];
    if (!brandData) {
      console.error(`No size chart found for garment ID: ${garmentId}`);
      return {};
    }

    const { chart, garmentType } = brandData;
    
    const result = await recommendFit({
      userMeasurements,
      brandSizeChart: chart,
      garmentType,
    });
    return result;
  } catch (error) {
    console.error("Failed to get fit recommendation:", error);
    return {};
  }
}

export default async function TryOnPage() {
  const user = await getUserData();

  return (
    <div>
       <header className="mb-8">
        <h1 className="text-4xl font-bold font-headline">Virtual Try-On</h1>
        <p className="text-muted-foreground mt-2">
          See how garments fit on your personalized avatar and get expert size recommendations.
        </p>
      </header>
      <TryOnClient
        user={user}
        getFitRecommendationAction={getFitRecommendation}
      />
    </div>
  );
}

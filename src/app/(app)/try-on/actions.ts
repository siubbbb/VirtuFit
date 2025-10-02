
'use server';

import { recommendFit } from '@/ai/flows/recommend-fit';
import { BRAND_SIZE_CHARTS } from '@/lib/constants';

export async function getFitRecommendation(userMeasurements: Record<string, number>, garmentId: string) {
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

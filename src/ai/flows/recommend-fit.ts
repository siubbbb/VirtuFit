'use server';
/**
 * @fileOverview A fit recommendation AI agent.
 *
 * - recommendFit - A function that handles the fit recommendation process.
 * - RecommendFitInput - The input type for the recommendFit function.
 * - RecommendFitOutput - The return type for the recommendFit function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const RecommendFitInputSchema = z.object({
  userMeasurements: z.record(z.string(), z.number()).describe('A record of the user measurements, with measurement names as keys and values in cm.'),
  brandSizeChart: z.record(z.string(), z.record(z.string(), z.number())).describe('The brand size chart data, with size as keys and measurement record as values.'),
  garmentType: z.string().describe('The type of garment (e.g., shirt, pants, dress).'),
});
export type RecommendFitInput = z.infer<typeof RecommendFitInputSchema>;

const RecommendFitOutputSchema = z.record(z.string(), z.number()).describe('A record of the best-fit score for each garment size.');
export type RecommendFitOutput = z.infer<typeof RecommendFitOutputSchema>;

export async function recommendFit(input: RecommendFitInput): Promise<RecommendFitOutput> {
  return recommendFitFlow(input);
}

const prompt = ai.definePrompt({
  name: 'recommendFitPrompt',
  input: {schema: RecommendFitInputSchema},
  output: {schema: RecommendFitOutputSchema},
  prompt: `You are a fit recommendation expert. You will cross-reference the user's measurements with brand size charts to output a \"best-fit score\" for each garment size.

  User Measurements:
  {{#each userMeasurements}}
  {{@key}}: {{@this}}
  {{/each}}

  Brand Size Chart:
  {{#each brandSizeChart}}
    Size {{@key}}:
    {{#each @this}}
      {{@key}}: {{@this}}
    {{/each}}
  {{/each}}

  Garment Type: {{{garmentType}}}

  Return a JSON object of key-value pairs of size and a "best-fit score" between 0 and 100.
  `,
});

const recommendFitFlow = ai.defineFlow(
  {
    name: 'recommendFitFlow',
    inputSchema: RecommendFitInputSchema,
    outputSchema: RecommendFitOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

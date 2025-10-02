// This file holds the Genkit flow for generating a 2D avatar from uploaded photos.

'use server';

/**
 * @fileOverview Generates a 2D avatar from user-uploaded photos.
 *
 * - generateAvatar - A function that generates a 2D avatar from the user's photo.
 * - GenerateAvatarInput - The input type for the generateAvatar function.
 * - GenerateAvatarOutput - The return type for the generateAvatar function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateAvatarInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of the user, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type GenerateAvatarInput = z.infer<typeof GenerateAvatarInputSchema>;

const GenerateAvatarOutputSchema = z.object({
  avatarDataUri: z
    .string()
    .describe("The generated 2D avatar as a data URI."),
});
export type GenerateAvatarOutput = z.infer<typeof GenerateAvatarOutputSchema>;

export async function generateAvatar(input: GenerateAvatarInput): Promise<GenerateAvatarOutput> {
  return generateAvatarFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateAvatarPrompt',
  input: {schema: GenerateAvatarInputSchema},
  output: {schema: GenerateAvatarOutputSchema},
  prompt: `You are an AI avatar generator. You will generate a 2D avatar from the user's photo.

  Photo: {{media url=photoDataUri}}

  Please generate a front-facing 2D avatar that matches the user’s body shape based on the uploaded photo. The avatar should be a data URI.
  `,
});

const generateAvatarFlow = ai.defineFlow(
  {
    name: 'generateAvatarFlow',
    inputSchema: GenerateAvatarInputSchema,
    outputSchema: GenerateAvatarOutputSchema,
  },
  async input => {
    const {media} = await ai.generate({
      model: 'googleai/gemini-2.5-flash-image-preview',
      prompt: [
        {media: {url: input.photoDataUri}},
        {text: 'generate a 2D avatar of this person'},
      ],
      config: {
        responseModalities: ['TEXT', 'IMAGE'], // MUST provide both TEXT and IMAGE, IMAGE only won't work
      },
    });

    return {
      avatarDataUri: media!.url,
    };
  }
);

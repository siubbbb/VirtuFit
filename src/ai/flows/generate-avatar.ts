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

const generateAvatarFlow = ai.defineFlow(
  {
    name: 'generateAvatarFlow',
    inputSchema: GenerateAvatarInputSchema,
    outputSchema: GenerateAvatarOutputSchema,
  },
  async input => {
    // Using gemini-pro-vision as an alternative to avoid rate-limiting on flash-image-preview
    const {output} = await ai.generate({
      model: 'googleai/gemini-pro-vision',
      prompt: [
        {media: {url: input.photoDataUri}},
        {text: 'From the attached image, generate a simple, front-facing 2D vector-style avatar that captures the body shape of the person. The background should be transparent. Do not include any text or other elements. Output the image directly.'},
      ],
    });

    // gemini-pro-vision might return the image within the output parts.
    const imagePart = output.parts.find(part => part.media);

    if (!imagePart || !imagePart.media) {
        throw new Error("Avatar image could not be generated.");
    }

    return {
      avatarDataUri: imagePart.media.url,
    };
  }
);

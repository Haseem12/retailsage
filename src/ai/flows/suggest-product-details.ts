
'use server';

/**
 * @fileOverview An AI flow for suggesting product details.
 * 
 * - suggestProductDetails - A function that provides AI-driven suggestions for a product's category and description.
 * - SuggestProductDetailsInput - The input type for the suggestProductDetails function.
 * - SuggestProductDetailsOutput - The return type for the suggestProductDetails function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const SuggestProductDetailsInputSchema = z.object({
  productName: z.string().describe('The name of the product.'),
});
export type SuggestProductDetailsInput = z.infer<typeof SuggestProductDetailsInputSchema>;

const SuggestProductDetailsOutputSchema = z.object({
  category: z.string().describe('A suitable category for the product.'),
  description: z.string().describe('A concise and appealing description for the product.'),
});
export type SuggestProductDetailsOutput = z.infer<typeof SuggestProductDetailsOutputSchema>;

export async function suggestProductDetails(input: SuggestProductDetailsInput): Promise<SuggestProductDetailsOutput> {
  return suggestProductDetailsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestProductDetailsPrompt',
  input: { schema: SuggestProductDetailsInputSchema },
  output: { schema: SuggestProductDetailsOutputSchema },
  prompt: `You are an expert in retail product management.
  
  Based on the product name provided, suggest a suitable category and a compelling, brief description.
  
  Product Name: {{{productName}}}
  
  The category should be one of the following: Groceries, Apparel, Electronics, Cafe, Fuel, Books, Home Goods, Other.
  The description should be one short sentence.`,
});

const suggestProductDetailsFlow = ai.defineFlow(
  {
    name: 'suggestProductDetailsFlow',
    inputSchema: SuggestProductDetailsInputSchema,
    outputSchema: SuggestProductDetailsOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);

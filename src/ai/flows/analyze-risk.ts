// use server'

/**
 * @fileOverview Risk analysis flow for identifying potential issues in retail operations.
 *
 * - analyzeRisk - Analyzes sales, stock, and spoilage data to identify potential risks.
 * - AnalyzeRiskInput - The input type for the analyzeRisk function.
 * - AnalyzeRiskOutput - The return type for the analyzeRisk function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeRiskInputSchema = z.object({
  salesData: z.string().describe('Sales data in JSON format.'),
  stockLevels: z.string().describe('Stock levels in JSON format.'),
  spoilageData: z.string().describe('Spoilage data in JSON format.'),
});
export type AnalyzeRiskInput = z.infer<typeof AnalyzeRiskInputSchema>;

const AnalyzeRiskOutputSchema = z.object({
  riskAssessment: z.string().describe('A comprehensive risk assessment based on the provided data.'),
  highRiskAreas: z.array(z.string()).describe('List of areas identified as high risk.'),
});
export type AnalyzeRiskOutput = z.infer<typeof AnalyzeRiskOutputSchema>;

export async function analyzeRisk(input: AnalyzeRiskInput): Promise<AnalyzeRiskOutput> {
  return analyzeRiskFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeRiskPrompt',
  input: {schema: AnalyzeRiskInputSchema},
  output: {schema: AnalyzeRiskOutputSchema},
  prompt: `You are a risk assessment expert in the retail industry.

You will analyze the provided sales data, stock levels, and spoilage data to identify potential risks.

Sales Data: {{{salesData}}}
Stock Levels: {{{stockLevels}}}
Spoilage Data: {{{spoilageData}}}

Based on this information, provide a comprehensive risk assessment and highlight areas identified as high risk.

Consider factors such as sales trends, inventory turnover, and spoilage rates to determine the overall risk level.

Ensure that your assessment is clear, concise, and actionable, providing specific recommendations for mitigating identified risks.

Format the riskAssessment as a detailed paragraph. Format the highRiskAreas as a list of strings.`, 
});

const analyzeRiskFlow = ai.defineFlow(
  {
    name: 'analyzeRiskFlow',
    inputSchema: AnalyzeRiskInputSchema,
    outputSchema: AnalyzeRiskOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

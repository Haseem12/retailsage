'use server';

import { analyzeRisk as analyzeRiskFlow, AnalyzeRiskInput } from '@/ai/flows/analyze-risk';
import { z } from 'zod';

const RiskAnalysisResultSchema = z.object({
  riskAssessment: z.string(),
  highRiskAreas: z.array(z.string()),
});

type RiskAnalysisResult = z.infer<typeof RiskAnalysisResultSchema>;

export interface ActionState {
  data?: RiskAnalysisResult | null;
  error?: string | null;
}

export async function analyzeRisk(
  prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const salesData = formData.get('salesData');
  const stockLevels = formData.get('stockLevels');
  const spoilageData = formData.get('spoilageData');

  const inputValidation = z.object({
    salesData: z.string().min(1, "Sales data cannot be empty."),
    stockLevels: z.string().min(1, "Stock levels cannot be empty."),
    spoilageData: z.string().min(1, "Spoilage data cannot be empty."),
  }).safeParse({ salesData, stockLevels, spoilageData });

  if (!inputValidation.success) {
    return { error: inputValidation.error.errors[0].message };
  }
  
  try {
    const result = await analyzeRiskFlow(inputValidation.data as AnalyzeRiskInput);
    return { data: result };
  } catch (e) {
    console.error(e);
    const errorMessage = e instanceof Error ? e.message : 'An unexpected error occurred.';
    return { error: `AI analysis failed: ${errorMessage}` };
  }
}

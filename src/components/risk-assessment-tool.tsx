'use client';
import { useFormState, useFormStatus } from 'react-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { analyzeRisk, type ActionState } from '@/lib/actions';
import { AlertCircle, Bot, Loader2, ThumbsUp } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { Sale, SpoilageEvent } from '@/lib/types';

const initialState: ActionState = {
  data: null,
  error: null,
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full sm:w-auto bg-accent text-accent-foreground hover:bg-accent/90">
      {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Bot className="mr-2 h-4 w-4" />}
      Analyze Risk
    </Button>
  );
}

export default function RiskAssessmentTool() {
  const [state, formAction] = useFormState(analyzeRisk, initialState);
  const { toast } = useToast();
  const [salesData] = useLocalStorage<Sale[]>('sales', []);
  const [stockLevels] = useLocalStorage('products', []);
  const [spoilageData] = useLocalStorage<SpoilageEvent[]>('spoilage', []);
  
  const [isClient, setIsClient] = useState(false);
  useEffect(() => setIsClient(true), []);


  useEffect(() => {
    if (state.error) {
      toast({
        variant: 'destructive',
        title: 'Analysis Error',
        description: state.error,
      });
    }
  }, [state.error, toast]);
  
  if (!isClient) return null;

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>AI-Powered Risk Assessment</CardTitle>
          <CardDescription>
            Input your sales, stock, and spoilage data in JSON format to receive an AI-driven risk analysis. The fields below are pre-filled with the data from your app.
          </CardDescription>
        </CardHeader>
        <form action={formAction}>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label htmlFor="salesData">Sales Data</Label>
                <Textarea id="salesData" name="salesData" rows={10} defaultValue={JSON.stringify(salesData, null, 2)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="stockLevels">Stock Levels</Label>
                <Textarea id="stockLevels" name="stockLevels" rows={10} defaultValue={JSON.stringify(stockLevels.map(({name, stock}) => ({name, stock})), null, 2)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="spoilageData">Spoilage Data</Label>
                <Textarea id="spoilageData" name="spoilageData" rows={10} defaultValue={JSON.stringify(spoilageData, null, 2)} />
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <SubmitButton />
          </CardFooter>
        </form>
      </Card>

      {state.data && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ThumbsUp className="text-primary" /> Analysis Complete
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Comprehensive Risk Assessment</AlertTitle>
              <AlertDescription>
                {state.data.riskAssessment}
              </AlertDescription>
            </Alert>
            <div>
              <h3 className="font-semibold mb-2">High-Risk Areas Identified:</h3>
              <div className="flex flex-wrap gap-2">
                {state.data.highRiskAreas.map((area, index) => (
                  <Badge key={index} variant="destructive">{area}</Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

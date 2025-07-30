'use client';
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

const tiers = [
  {
    name: 'Freemium',
    price: '$0',
    period: '/ month',
    description: 'Essential tools to get your retail business started.',
    features: [
      'Basic Point-of-Sale',
      'Sales Tracking (7-day history)',
      '1 User Account',
      'Community Support',
    ],
    cta: 'Stay on Freemium',
  },
  {
    name: 'Premium',
    price: '$79',
    period: '/ month',
    description: 'Advanced features for growing businesses and enterprises.',
    features: [
      'Advanced Point-of-Sale',
      'Unlimited Sales History',
      'Unlimited User Accounts',
      'AI Risk Analysis Tool',
      'Fuel Management Dashboard',
      'Priority Email & Phone Support',
    ],
    cta: 'Upgrade to Premium',
    isPrimary: true,
  },
];

export default function SubscriptionTiers() {
  const [activeTier, setActiveTier] = useState('Premium');
  const { toast } = useToast();

  const handleSelectTier = (tierName: string) => {
    setActiveTier(tierName);
    toast({
      title: 'Plan Updated!',
      description: `You are now on the ${tierName} plan.`,
    })
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
      {tiers.map((tier) => (
        <Card
          key={tier.name}
          className={cn(
            'flex flex-col transition-all',
            tier.isPrimary && 'border-primary shadow-lg',
            activeTier === tier.name && 'ring-2 ring-primary'
          )}
        >
          <CardHeader>
            <CardTitle className="font-headline">{tier.name}</CardTitle>
            <CardDescription>{tier.description}</CardDescription>
            <div className="flex items-baseline pt-4">
              <span className="text-4xl font-bold tracking-tight">{tier.price}</span>
              <span className="text-sm font-semibold text-muted-foreground">{tier.period}</span>
            </div>
          </CardHeader>
          <CardContent className="flex-grow">
            <ul className="space-y-3">
              {tier.features.map((feature) => (
                <li key={feature} className="flex items-start">
                  <Check className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-1" />
                  <span className="text-muted-foreground">{feature}</span>
                </li>
              ))}
            </ul>
          </CardContent>
          <CardFooter>
            <Button
              className={cn(
                'w-full',
                tier.isPrimary ? 'bg-accent text-accent-foreground hover:bg-accent/90' : 'bg-primary text-primary-foreground',
                activeTier === tier.name && 'opacity-50 cursor-not-allowed'
              )}
              onClick={() => handleSelectTier(tier.name)}
              disabled={activeTier === tier.name}
            >
              {activeTier === tier.name ? 'Current Plan' : tier.cta}
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}

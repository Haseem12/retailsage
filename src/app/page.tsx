
'use client';
import Link from 'next/link';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from '@/components/ui/carousel';
import { Button } from '@/components/ui/button';
import RetailLabLogo from '@/components/retaillab-logo';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { Warehouse, BrainCircuit, Smartphone } from 'lucide-react';

const onboardingSteps = [
  {
    icon: RetailLabLogo,
    title: 'Welcome to RetailLab',
    description: 'Your all-in-one solution for retail management and AI-powered insights.',
  },
  {
    icon: Warehouse,
    title: 'Smart Inventory',
    description: 'Track stock levels, manage inventory, and reduce spoilage with our intelligent tools.',
  },
  {
    icon: BrainCircuit,
    title: 'AI-Driven Analytics',
    description: 'Leverage the power of AI to understand sales trends and identify risks before they happen.',
  },
  {
    icon: Smartphone,
    title: 'Point of Sale, Anywhere',
    description: 'A modern, easy-to-use POS system that works on any device.',
  },
];

export default function OnboardingPage() {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (!api) {
      return;
    }

    setCurrent(api.selectedScrollSnap());

    const onSelect = () => {
      setCurrent(api.selectedScrollSnap());
    };

    api.on('select', onSelect);

    return () => {
      api.off('select', onSelect);
    };
  }, [api]);

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-background">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url('/bg.jpg')", filter: 'blur(2px) brightness(0.4)' }}
      ></div>
      
      <Carousel setApi={setApi} className="w-full h-screen">
        <CarouselContent className="h-full">
          {onboardingSteps.map((step, index) => {
            const Icon = step.icon;
            return (
            <CarouselItem key={index} className="h-full">
              <div className="z-10 flex flex-col items-center text-center w-full h-full p-4">
                  <div className="flex items-center gap-2 my-6">
                      <RetailLabLogo className="w-10 h-10 text-white" />
                      <h1 className="text-4xl font-bold font-headline text-white">RetailLab</h1>
                  </div>

                  <div className="flex flex-col items-center justify-center flex-1 text-white p-6 gap-4">
                      <Icon className="w-24 h-24 text-primary mb-4" />
                      <h2 className="text-2xl font-bold">{step.title}</h2>
                      <p className="text-white/80 max-w-sm">{step.description}</p>
                  </div>

                  <div className="flex items-center gap-2 my-4">
                    {onboardingSteps.map((_, i) => (
                      <div
                        key={i}
                        className={cn(
                          'h-2 w-2 rounded-full bg-white/50 transition-all',
                          i === current && 'w-4 bg-white'
                        )}
                      />
                    ))}
                  </div>
                  
                  <div className="w-full max-w-md flex flex-col gap-4 py-8 h-28">
                      {current === onboardingSteps.length - 1 && (
                          <>
                          <Button asChild size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90 animate-in fade-in duration-500">
                              <Link href="/signup">Create an Account</Link>
                          </Button>
                          <Button asChild size="lg" variant="outline" className="animate-in fade-in duration-500">
                              <Link href="/login">Login</Link>
                          </Button>
                          </>
                      )}
                  </div>
              </div>
            </CarouselItem>
          )})}
        </CarouselContent>
        <CarouselPrevious className="absolute left-4 top-1/2 -translate-y-1/2 z-20 text-white" />
        <CarouselNext className="absolute right-4 top-1/2 -translate-y-1/2 z-20 text-white" />
      </Carousel>
    </div>
  );
}

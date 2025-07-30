
'use client';
import Link from 'next/link';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Image from 'next/image';
import RetailLabLogo from '@/components/retaillab-logo';

const onboardingSteps = [
  {
    image: 'https://placehold.co/600x400.png',
    aiHint: 'retail analytics',
    title: 'Welcome to RetailLab',
    description: 'Your all-in-one solution for retail management and AI-powered insights.',
  },
  {
    image: 'https://placehold.co/600x400.png',
    aiHint: 'inventory management',
    title: 'Smart Inventory',
    description: 'Track stock levels, manage inventory, and reduce spoilage with our intelligent tools.',
  },
  {
    image: 'https://placehold.co/600x400.png',
    aiHint: 'sales dashboard',
    title: 'AI-Driven Analytics',
    description: 'Leverage the power of AI to understand sales trends and identify risks before they happen.',
  },
  {
    image: 'https://placehold.co/600x400.png',
    aiHint: 'mobile point of sale',
    title: 'Point of Sale, Anywhere',
    description: 'A modern, easy-to-use POS system that works on any device.',
  },
];

export default function OnboardingPage() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url('/bg.jpg')", filter: 'blur(2px) brightness(0.4)' }}
      ></div>
      <div className="z-10 flex flex-col items-center text-center w-full max-w-md">
        <div className="flex items-center gap-2 mb-6">
            <RetailLabLogo className="w-10 h-10" />
            <h1 className="text-4xl font-bold font-headline text-white">RetailLab</h1>
        </div>
        <Carousel className="w-full">
          <CarouselContent>
            {onboardingSteps.map((step, index) => (
              <CarouselItem key={index}>
                <Card className="bg-card/80 backdrop-blur-sm border-border/50">
                  <CardContent className="flex flex-col items-center justify-center p-6 gap-4">
                    <Image
                      src={step.image}
                      alt={step.title}
                      width={600}
                      height={400}
                      data-ai-hint={step.aiHint}
                      className="rounded-lg mb-4"
                    />
                    <h2 className="text-2xl font-bold">{step.title}</h2>
                    <p className="text-muted-foreground">{step.description}</p>
                  </CardContent>
                </Card>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
        <div className="mt-8 w-full flex flex-col gap-4">
            <Button asChild size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90">
                <Link href="/signup">Create an Account</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
                <Link href="/login">Login</Link>
            </Button>
        </div>
      </div>
    </div>
  );
}

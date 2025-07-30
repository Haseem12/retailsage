
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import RetailSageLogo from '@/components/retailsage-logo';
import { Zap, Users, Target, ArrowLeft } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="relative flex min-h-screen flex-col items-center bg-background p-4 sm:p-6 lg:p-8">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url('/bg.jpg')", filter: 'blur(2px) brightness(0.4)' }}
      ></div>

      <div className="absolute top-4 left-4 z-20">
        <Button asChild variant="outline" size="icon">
          <Link href="/">
            <ArrowLeft />
          </Link>
        </Button>
      </div>

      <div className="z-10 w-full max-w-4xl space-y-8 py-16 text-center">
        <header className="flex flex-col items-center gap-2 text-white">
            <RetailSageLogo className="w-14 h-14 text-primary" />
            <h1 className="text-4xl font-bold font-headline">Sagheer+ Lab</h1>
            <p className="text-lg text-white/80">
              Building smart, inclusive, and tech-driven solutions for Africa.
            </p>
        </header>

        <main className="space-y-12">
            <Card className="bg-card/80 backdrop-blur-sm text-left">
                <CardHeader>
                    <CardTitle>About Sagheer+ Lab</CardTitle>
                </CardHeader>
                <CardContent className="text-muted-foreground">
                    <p>Sagheer+ Lab is a multidisciplinary innovation lab focused on building smart, inclusive, and tech-driven solutions across industries — from retail and design to agriculture and public policy.</p>
                </CardContent>
            </Card>

             <Card className="bg-card/80 backdrop-blur-sm text-left">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Target className="text-primary" />
                        Our Mission
                    </CardTitle>
                </CardHeader>
                <CardContent className="text-muted-foreground">
                    <p>We're on a mission to empower African creators, startups, and local businesses with tools that bridge the gap between grassroots realities and digital possibilities.</p>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <Card className="bg-card/80 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center justify-center gap-2">
                            <Zap className="text-primary" />
                            Innovation
                        </CardTitle>
                    </CardHeader>
                </Card>
                 <Card className="bg-card/80 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center justify-center gap-2">
                           <Users className="text-primary" />
                           Community
                        </CardTitle>
                    </CardHeader>
                </Card>
            </div>
            
            <Card className="bg-card/80 backdrop-blur-sm text-left">
                <CardHeader>
                    <CardTitle>Our Impact</CardTitle>
                </CardHeader>
                <CardContent className="text-muted-foreground">
                    <p>At Sagheer+ Lab, we design inclusive, tech-powered solutions that help communities grow smarter — from retail to agriculture. RetailSage is part of our broader mission to make modern retail accessible, efficient, and connected.</p>
                </CardContent>
            </Card>
        </main>
      </div>
    </div>
  );
}

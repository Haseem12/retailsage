
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import SajFoodsLogo from '@/components/sajfoods-logo';
import { ArrowLeft, BookOpen, UserPlus, Receipt } from 'lucide-react';

export default function SupportPage() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-background p-4 sm:p-6 lg:p-8">
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
      
      <Card className="w-full max-w-2xl z-10 bg-card/80 backdrop-blur-sm text-center">
        <CardHeader>
           <div className="flex justify-center items-center gap-2 mb-2">
            <SajFoodsLogo className="w-10 h-10 text-primary" />
            <h1 className="text-4xl font-bold font-headline">SAJ FOODS</h1>
          </div>
          <CardDescription>
            A project by <Link href="/about" className="underline hover:text-primary">Sagheer+ Lab</Link>, created to support local retail businesses with digital tools that improve inventory, operations, and customer experience.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 text-left">
            <div className="flex items-start gap-4">
                <BookOpen className="w-8 h-8 text-primary mt-1" />
                <div>
                    <h3 className="font-semibold">Digital tools for inventory tracking and management</h3>
                </div>
            </div>
             <div className="flex items-start gap-4">
                <UserPlus className="w-8 h-8 text-primary mt-1" />
                <div>
                    <h3 className="font-semibold">Business registration and administrative support</h3>
                </div>
            </div>
             <div className="flex items-start gap-4">
                <Receipt className="w-8 h-8 text-primary mt-1" />
                <div>
                    <h3 className="font-semibold">Enhanced customer engagement and receipts</h3>
                </div>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}

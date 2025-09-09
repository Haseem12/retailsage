
'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';

export default function HomePage() {
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = sessionStorage.getItem('user-token');
    if (token) {
      router.replace('/pin');
    } else {
      router.replace('/login');
    }
    // A short delay to prevent flashing content, though in this case it's a redirect.
    // In a real app you might not need this if your auth check is fast.
    const timer = setTimeout(() => setLoading(false), 250); 
    
    return () => clearTimeout(timer);

  }, [router]);

  return (
    <div className="flex items-center justify-center h-screen bg-background">
      <Loader2 className="h-8 w-8 animate-spin" />
    </div>
  );
}

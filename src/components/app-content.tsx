
'use client';

import { useIsMobile } from '@/hooks/use-mobile';
import DesktopLockScreen from '@/components/desktop-lock-screen';
import React, { useEffect, useState } from 'react';

export default function AppContent({ children }: { children: React.ReactNode }) {
  const isMobile = useIsMobile();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    // Render nothing or a loading state on the server to avoid hydration mismatch
    return null; 
  }

  if (!isMobile) {
    return <DesktopLockScreen />;
  }

  return <>{children}</>;
}

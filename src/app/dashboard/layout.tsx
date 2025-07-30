
'use client';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarTrigger,
  SidebarInset,
} from '@/components/ui/sidebar';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, Shield, Flame, Settings, LogOut, Building, Utensils, Tv, ShoppingCart, Shirt } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useEffect, useState } from 'react';
import RetailLabLogo from '@/components/retaillab-logo';
import { Loader2 } from 'lucide-react';

const allNavItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, shopTypes: ['Supermarket/FMCG', 'Apparel Store', 'Electronics Store', 'Restaurant', 'Other'] },
  { href: '/dashboard/risk-analysis', label: 'Risk Analysis', icon: Shield, shopTypes: ['Supermarket/FMCG', 'Apparel Store', 'Electronics Store', 'Restaurant', 'Fuel Station', 'Other'] },
  { href: '/dashboard/fuel-management', label: 'Fuel', icon: Flame, shopTypes: ['Fuel Station'] },
  { href: '/dashboard/settings', label: 'Settings', icon: Settings, shopTypes: ['Supermarket/FMCG', 'Apparel Store', 'Electronics Store', 'Restaurant', 'Fuel Station', 'Other'] },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [navItems, setNavItems] = useState(allNavItems);

  useEffect(() => {
    const token = sessionStorage.getItem('user-token');
    if (!token) {
      router.push('/login');
    } else {
      setIsAuthenticated(true);
      const shopType = localStorage.getItem('shopType') || 'Other';
      const filteredNavItems = allNavItems.filter(item => item.shopTypes.includes(shopType));
      setNavItems(filteredNavItems);
    }
    setLoading(false);
  }, [router]);

  const handleLogout = () => {
    sessionStorage.removeItem('user-token');
    localStorage.removeItem('shopType');
    router.push('/login');
  };
  
  if (loading || !isAuthenticated) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarContent>
          <SidebarHeader>
            <div className="flex items-center gap-2">
              <RetailLabLogo className="size-7" />
              <span className="text-xl font-semibold font-headline">RetailLab</span>
            </div>
          </SidebarHeader>
          <SidebarMenu>
            {navItems.map((item) => (
              <SidebarMenuItem key={item.href}>
                <Link href={item.href} passHref>
                  <SidebarMenuButton
                    isActive={pathname === item.href}
                    tooltip={item.label}
                  >
                    <item.icon />
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter>
          <div className="flex items-center gap-3 p-2 rounded-md transition-colors">
             <Avatar>
                <AvatarImage src={"https://placehold.co/40x40.png"} data-ai-hint="manager avatar" alt="User" />
                <AvatarFallback>U</AvatarFallback>
              </Avatar>
              <div className="flex flex-col text-sm group-data-[collapsible=icon]:hidden">
                  <span className="font-semibold">User</span>
                  <span className="text-muted-foreground">Manager</span>
              </div>
          </div>
          <SidebarMenuButton tooltip="Logout" onClick={handleLogout}>
            <LogOut />
            <span>Logout</span>
          </SidebarMenuButton>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="flex items-center justify-between p-4 border-b">
          <SidebarTrigger />
          <h1 className="text-2xl font-bold font-headline capitalize">
             {pathname.split('/').pop()?.replace('-', ' ') || 'Dashboard'}
          </h1>
          <Button>New Sale</Button>
        </header>
        <main className="p-4 sm:p-6 lg:p-8 bg-background/60 flex-1">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}

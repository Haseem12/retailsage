
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
import { LayoutDashboard, Shield, Flame, Settings, LogOut, ShoppingCart, BookOpen, BarChart2, DollarSign, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useEffect, useState } from 'react';
import RetailLabLogo from '@/components/retaillab-logo';
import { Loader2 } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

const allNavItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, shopTypes: ['Supermarket/FMCG', 'Apparel Store', 'Electronics Store', 'Restaurant', 'Other'] },
  { href: '/dashboard/make-sale', label: 'Make Sale', icon: ShoppingCart, shopTypes: ['Supermarket/FMCG', 'Apparel Store', 'Electronics Store', 'Restaurant', 'Other'] },
  { href: '/dashboard/inventory', label: 'Inventory', icon: BookOpen, shopTypes: ['Supermarket/FMCG', 'Apparel Store', 'Electronics Store', 'Restaurant', 'Other'] },
  { href: '/dashboard/sales-history', label: 'Sales History', icon: BarChart2, shopTypes: ['Supermarket/FMCG', 'Apparel Store', 'Electronics Store', 'Restaurant', 'Other'] },
  { href: '/dashboard/sales-summary', label: 'Sales Summary', icon: DollarSign, shopTypes: ['Supermarket/FMCG', 'Apparel Store', 'Electronics Store', 'Restaurant', 'Other'] },
  { href: '/dashboard/risk-analysis', label: 'Risk Analysis', icon: Shield, shopTypes: ['Supermarket/FMCG', 'Apparel Store', 'Electronics Store', 'Restaurant', 'Fuel Station', 'Other'] },
  { href: '/dashboard/fuel-management', label: 'Fuel', icon: Flame, shopTypes: ['Fuel Station'] },
  { href: '/dashboard/admin/users', label: 'Users', icon: Users, shopTypes: ['Supermarket/FMCG', 'Apparel Store', 'Electronics Store', 'Restaurant', 'Fuel Station', 'Other'] },
  { href: '/dashboard/settings', label: 'Settings', icon: Settings, shopTypes: ['Supermarket/FMCG', 'Apparel Store', 'Electronics Store', 'Restaurant', 'Fuel Station', 'Other'] },
];

const mobileNavItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/make-sale', label: 'Sale', icon: ShoppingCart },
  { href: '/dashboard/inventory', label: 'Inventory', icon: BookOpen },
  { href: '/dashboard/sales-history', label: 'History', icon: BarChart2 },
  { href: '/dashboard/sales-summary', label: 'Summary', icon: DollarSign },
]

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
  const isMobile = useIsMobile();
  
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
                    isActive={pathname.startsWith(item.href) && (item.href !== '/dashboard' || pathname === '/dashboard')}
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
        <header className="flex items-center justify-between p-4 border-b md:hidden">
          <Link href="/dashboard" className="flex items-center gap-2">
            <RetailLabLogo className="size-7" />
            <span className="text-lg font-semibold font-headline">RetailLab</span>
          </Link>
        </header>
        <main className="p-4 sm:p-6 lg:p-8 bg-background/60 flex-1 pb-20 md:pb-8">
          {children}
        </main>
         {isMobile && (
          <div className="fixed bottom-0 left-0 right-0 bg-card border-t z-50 md:hidden">
            <div className="grid grid-cols-5">
              {mobileNavItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex flex-col items-center justify-center gap-1 p-2 text-xs",
                      isActive ? "text-primary" : "text-muted-foreground"
                    )}
                  >
                    <item.icon className="h-5 w-5" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </SidebarInset>
    </SidebarProvider>
  );
}


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
  SidebarInset,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from '@/components/ui/sidebar';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, Shield, Flame, LogOut, ShoppingCart, BookOpen, BarChart2, DollarSign, Users, Trash2, User, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useEffect, useState } from 'react';
import SajFoodsLogo from '@/components/sajfoods-logo';
import { Loader2 } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"


const allNavItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, shopTypes: ['Supermarket/FMCG', 'Apparel Store', 'Electronics Store', 'Restaurant', 'Other'] },
  { href: '/dashboard/make-sale', label: 'Make Sale', icon: ShoppingCart, shopTypes: ['Supermarket/FMCG', 'Apparel Store', 'Electronics Store', 'Restaurant', 'Other'] },
  { 
    href: '/dashboard/inventory', 
    label: 'Inventory', 
    icon: BookOpen, 
    shopTypes: ['Supermarket/FMCG', 'Apparel Store', 'Electronics Store', 'Restaurant', 'Other'],
    subItems: [
        { href: '/dashboard/inventory/spoilage', label: 'Spoilage', icon: Trash2 },
    ]
  },
  { href: '/dashboard/sales-history', label: 'Sales History', icon: BarChart2, shopTypes: ['Supermarket/FMCG', 'Apparel Store', 'Electronics Store', 'Restaurant', 'Other'] },
  { href: '/dashboard/sales-summary', label: 'Sales Summary', icon: DollarSign, shopTypes: ['Supermarket/FMCG', 'Apparel Store', 'Electronics Store', 'Restaurant', 'Other'] },
  { href: '/dashboard/risk-analysis', label: 'Risk Analysis', icon: Shield, shopTypes: ['Supermarket/FMCG', 'Apparel Store', 'Electronics Store', 'Restaurant', 'Fuel Station', 'Other'] },
  { href: '/dashboard/fuel-management', label: 'Fuel', icon: Flame, shopTypes: ['Fuel Station'] },
  { 
    label: 'Admin',
    icon: Shield,
    shopTypes: ['Supermarket/FMCG', 'Apparel Store', 'Electronics Store', 'Restaurant', 'Fuel Station', 'Other'],
    subItems: [
        { href: '/dashboard/admin/users', label: 'Users', icon: Users },
    ]
  },
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
    // Selectively clear localStorage instead of wiping everything
    localStorage.removeItem('shopType');
    localStorage.removeItem('businessName');
    localStorage.removeItem('businessAddress');
    // We keep rcNumber and phoneNumber
    router.push('/login');
  };
  
  if (loading || !isAuthenticated) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const isActive = (href: string) => {
    if (!href) return false;
    return pathname === href || (href !== '/dashboard' && pathname.startsWith(href));
  }

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarContent>
          <SidebarHeader>
            <div className="flex items-center gap-2">
              <SajFoodsLogo className="size-7" />
              <span className="text-xl font-semibold font-headline">SAJ FOODS</span>
            </div>
          </SidebarHeader>
          <SidebarMenu>
            {navItems.map((item, index) => (
              <SidebarMenuItem key={item.href || item.label || index}>
                 <SidebarMenuButton
                  asChild={!item.subItems}
                  isActive={isActive(item.href as string)}
                  tooltip={item.label}
                 >
                  {item.subItems ? (
                    <>
                      <item.icon />
                      <span>{item.label}</span>
                    </>
                  ) : (
                    <Link href={item.href as string}>
                      <item.icon />
                      <span>{item.label}</span>
                    </Link>
                  )}
                </SidebarMenuButton>

                {item.subItems && (
                   <SidebarMenuSub>
                     {item.subItems.map((subItem) => (
                       <SidebarMenuSubItem key={subItem.href}>
                         <Link href={subItem.href} passHref>
                           <SidebarMenuSubButton asChild isActive={pathname === subItem.href}>
                             {subItem.label}
                           </SidebarMenuSubButton>
                         </Link>
                       </SidebarMenuSubItem>
                     ))}
                   </SidebarMenuSub>
                )}
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter>
          <p className="text-xs text-muted-foreground p-2 group-data-[collapsible=icon]:hidden">
            © {new Date().getFullYear()} SAJ FOODS Inc.
          </p>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset className="flex flex-col">
        <header className="sticky top-0 z-50 flex items-center justify-between p-2 border-b h-14 bg-card/80 backdrop-blur-sm">
            <div className="flex items-center gap-2">
                <SajFoodsLogo className="size-7" />
                <span className="text-lg font-semibold font-headline">SAJ FOODS</span>
            </div>
            
            <div className="flex items-center gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Avatar className="h-8 w-8 cursor-pointer">
                        <AvatarImage src={"https://placehold.co/40x40.png"} data-ai-hint="manager avatar" alt="User" />
                        <AvatarFallback>U</AvatarFallback>
                    </Avatar>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                     <DropdownMenuItem onClick={() => router.push('/dashboard/settings')}>
                        <User className="mr-2 h-4 w-4" />
                        <span>Profile</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => router.push('/dashboard/settings')}>
                        <Settings className="mr-2 h-4 w-4" />
                        <span>Settings</span>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={handleLogout}>
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Logout</span>
                      </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-background/60 pb-20 md:pb-8">
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

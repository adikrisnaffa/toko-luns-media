
"use client";

import type { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation'; // Added useRouter
import { useEffect } from 'react'; // Added useEffect
import { Home, ShoppingCart, ListOrdered, Settings, LogOut, CreditCard, Package, BarChart3, DollarSign, LogIn } from 'lucide-react';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarTrigger,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
  SidebarSeparator,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAppContext } from '@/contexts/AppContext';
import { Logo } from '@/components/icons';
import { Badge } from './ui/badge';
import { Toaster } from '@/components/ui/toaster';
import { Skeleton } from './ui/skeleton';


interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
  adminOnly?: boolean;
  requiresLogin?: boolean; // To hide items if not logged in
}

const navItems: NavItem[] = [
  { href: '/', label: 'Products', icon: Home, requiresLogin: false },
  { href: '/cart', label: 'Cart', icon: ShoppingCart, requiresLogin: true },
  { href: '/checkout', label: 'Checkout', icon: CreditCard, requiresLogin: true },
  { href: '/transactions', label: 'My Orders', icon: ListOrdered, requiresLogin: true },
  { href: '/admin', label: 'Admin Dashboard', icon: Settings, adminOnly: true, requiresLogin: true },
  { href: '/admin/products', label: 'Manage Products', icon: Package, adminOnly: true, requiresLogin: true },
  { href: '/admin/record-transaction', label: 'Record Transaction', icon: DollarSign, adminOnly: true, requiresLogin: true },
  { href: '/admin/financial-report', label: 'Financial Report', icon: BarChart3, adminOnly: true, requiresLogin: true },
];

export default function AppLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { currentUser, getCartItemCount, logout, appReady } = useAppContext();
  const cartItemCount = getCartItemCount();

  useEffect(() => {
    if (appReady) { // Only run redirects after app context is ready (localStorage checked)
      if (!currentUser && pathname !== '/login') {
        router.push('/login');
      } else if (currentUser && pathname === '/login') {
        router.push('/');
      }
    }
  }, [currentUser, pathname, router, appReady]);

  const visibleNavItems = navItems.filter(item => {
    if (item.requiresLogin && !currentUser) return false;
    if (item.adminOnly && currentUser?.role !== 'admin') return false;
    return true;
  });
  
  // Render loading state or null if app is not ready or redirecting
  if (!appReady || (!currentUser && pathname !== '/login')) {
    return (
        <div className="flex h-screen items-center justify-center">
            <div className="flex flex-col items-center space-y-4">
                <Logo className="h-16 w-16 text-primary animate-pulse" />
                <p className="text-muted-foreground">Loading LUN'S MEDIA...</p>
            </div>
        </div>
    );
  }
  
  // If user is null and we are already on login page, render children (login page)
  if (!currentUser && pathname === '/login') {
    return <>{children}<Toaster /></>; // Ensure Toaster is available for login page errors
  }


  return (
    <SidebarProvider defaultOpen>
      <Sidebar>
        <SidebarHeader className="p-4">
          <Link href="/" className="flex items-center gap-2 text-lg font-semibold text-sidebar-foreground">
            <Logo className="h-8 w-8 text-sidebar-primary" />
            <span>LUN'S MEDIA</span>
          </Link>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            {visibleNavItems.map((item) => (
              <SidebarMenuItem key={item.href}>
                <Link href={item.href} legacyBehavior passHref>
                  <SidebarMenuButton
                    isActive={pathname === item.href}
                    tooltip={item.label}
                  >
                    <item.icon />
                    <span>{item.label}</span>
                    {item.href === '/cart' && cartItemCount > 0 && (
                      <Badge variant="destructive" className="ml-auto">{cartItemCount}</Badge>
                    )}
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter className="p-4">
          {currentUser ? (
            <>
              <div className="flex items-center gap-2">
                <Avatar>
                  <AvatarImage src={`https://placehold.co/40x40.png?text=${currentUser.name.charAt(0)}`} alt={currentUser.name} data-ai-hint="user avatar" />
                  <AvatarFallback>{currentUser.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-sidebar-foreground">{currentUser.name}</span>
                  <span className="text-xs text-sidebar-foreground/70">{currentUser.role}</span>
                </div>
              </div>
              <Button variant="ghost" onClick={logout} className="w-full justify-start mt-2 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground">
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </>
          ) : (
            <Link href="/login" legacyBehavior passHref>
                 <Button variant="outline" className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground">
                    <LogIn className="mr-2 h-4 w-4" />
                    Login
                </Button>
            </Link>
          )}
          {/* Role switcher removed */}
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-background px-4 md:px-6">
            <div className="flex items-center gap-2">
                 <SidebarTrigger className="md:hidden" /> 
                 <h1 className="text-xl font-semibold">LUN'S MEDIA</h1>
            </div>
            <div className="flex items-center gap-4">
                {currentUser && (
                    <Link href="/cart">
                        <Button variant="ghost" size="icon" aria-label="Shopping Cart">
                            <ShoppingCart className="h-6 w-6" />
                            {cartItemCount > 0 && (
                            <Badge variant="destructive" className="absolute -top-1 -right-1 h-5 w-5 justify-center rounded-full p-0 text-xs">
                                {cartItemCount}
                            </Badge>
                            )}
                        </Button>
                    </Link>
                )}
                {currentUser ? (
                     <Avatar>
                        <AvatarImage src={`https://placehold.co/40x40.png?text=${currentUser.name.charAt(0)}`} alt={currentUser.name} data-ai-hint="user avatar" />
                        <AvatarFallback>{currentUser.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                ) : (
                   <Skeleton className="h-10 w-10 rounded-full" />
                )}
            </div>
        </header>
        <main className="flex-1 p-4 md:p-6 lg:p-8">
          {children}
        </main>
        <Toaster />
      </SidebarInset>
    </SidebarProvider>
  );
}

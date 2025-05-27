
"use client";

import type { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, ShoppingCart, ListOrdered, UserCircle, BarChart3, DollarSign, Settings, LogOut, CreditCard, Package } from 'lucide-react'; // Added Package
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
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAppContext } from '@/contexts/AppContext';
import { Logo } from '@/components/icons';
import { Badge } from './ui/badge';
import { Toaster } from '@/components/ui/toaster';

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
  adminOnly?: boolean;
}

const navItems: NavItem[] = [
  { href: '/', label: 'Products', icon: Home },
  { href: '/cart', label: 'Cart', icon: ShoppingCart },
  { href: '/checkout', label: 'Checkout', icon: CreditCard },
  { href: '/transactions', label: 'My Orders', icon: ListOrdered },
  { href: '/admin', label: 'Admin Dashboard', icon: Settings, adminOnly: true },
  { href: '/admin/products', label: 'Manage Products', icon: Package, adminOnly: true }, // Added this line
  { href: '/admin/record-transaction', label: 'Record Transaction', icon: DollarSign, adminOnly: true },
  { href: '/admin/financial-report', label: 'Financial Report', icon: BarChart3, adminOnly: true },
];

export default function AppLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { currentUser, getCartItemCount } = useAppContext();
  const cartItemCount = getCartItemCount();

  const visibleNavItems = navItems.filter(item => !item.adminOnly || (item.adminOnly && currentUser?.role === 'admin'));

  return (
    <SidebarProvider defaultOpen>
      <Sidebar>
        <SidebarHeader className="p-4">
          <Link href="/" className="flex items-center gap-2 text-lg font-semibold text-sidebar-foreground">
            <Logo className="h-8 w-8 text-sidebar-primary" />
            <span>TokoSimpel</span>
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
          {currentUser && (
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
          )}
          <Button variant="ghost" className="w-full justify-start mt-2 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground">
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-background px-4 md:px-6">
            <div className="flex items-center gap-2">
                 <SidebarTrigger className="md:hidden" /> {/* Mobile toggle */}
                 <h1 className="text-xl font-semibold">TokoSimpel</h1>
            </div>
            <div className="flex items-center gap-4">
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
                {currentUser && (
                     <Avatar>
                        <AvatarImage src={`https://placehold.co/40x40.png?text=${currentUser.name.charAt(0)}`} alt={currentUser.name} data-ai-hint="user avatar" />
                        <AvatarFallback>{currentUser.name.charAt(0)}</AvatarFallback>
                    </Avatar>
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

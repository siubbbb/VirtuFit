'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
    Shirt,
    ScanLine,
    LogOut,
    ChevronDown,
    Settings,
} from 'lucide-react';

import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
  SidebarInset,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/icons/logo';
import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from '@/components/ui/avatar';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useUser, useAuth } from '@/firebase';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';


const menuItems = [
  { href: '/dashboard', label: 'Dashboard', icon: Home },
  { href: '/try-on', label: 'Virtual Try-On', icon: Shirt },
  { href: '/capture', label: 'Get Measured', icon: ScanLine },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const router = useRouter();

  React.useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/');
    }
  }, [isUserLoading, user, router]);

  const handleSignOut = async () => {
    if (auth) {
      await auth.signOut();
    }
    router.push('/');
  }

  const getInitials = (email: string | null | undefined) => {
    if (!email) return 'U';
    return email[0].toUpperCase();
  }
  
  if (isUserLoading || !user) {
     return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-background">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
     )
  }

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center gap-2">
            <Logo className="text-primary" />
            <div className="grow" />
            <SidebarTrigger className="hidden md:flex" />
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            {menuItems.map((item) => (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === item.href}
                  tooltip={item.label}
                >
                  <Link href={item.href}>
                    <item.icon />
                    <span>{item.label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="justify-start gap-2 w-full p-2 h-auto">
                        <Avatar className="h-8 w-8">
                            <AvatarImage src={user.photoURL ?? ''} alt={user.email ?? 'User'} />
                            <AvatarFallback>{getInitials(user.email)}</AvatarFallback>
                        </Avatar>
                        <div className="text-left group-data-[collapsible=icon]:hidden">
                            <p className="font-medium text-sm text-foreground truncate">{user.email}</p>
                        </div>
                        
                        <ChevronDown className="ml-auto h-4 w-4 group-data-[collapsible=icon]:hidden" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 mb-2" align="end" forceMount>
                     <DropdownMenuLabel className="font-normal">
                        <div className="flex flex-col space-y-1">
                            {user && (
                                <p className="text-xs leading-none text-muted-foreground">
                                {user.email}
                                </p>
                            )}
                        </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                         <Link href="/account">
                            <Settings className="mr-2 h-4 w-4" />
                            <span>Account</span>
                        </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut}>
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Log out</span>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <main className="min-h-screen p-4 sm:p-6 lg:p-8 bg-background">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}

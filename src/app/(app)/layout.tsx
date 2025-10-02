'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
    Shirt,
    ScanLine,
    User,
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
import { Skeleton } from '@/components/ui/skeleton';
import { useRouter } from 'next/navigation';


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

  const handleSignOut = async () => {
    await auth.signOut();
    router.push('/');
  }

  const getInitials = (name: string | null | undefined) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('');
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
                        {isUserLoading ? (
                          <>
                            <Skeleton className="h-8 w-8 rounded-full" />
                            <div className="space-y-2 group-data-[collapsible=icon]:hidden">
                               <Skeleton className="h-4 w-20" />
                               <Skeleton className="h-3 w-28" />
                            </div>
                          </>
                        ) : user ? (
                          <>
                            <Avatar className="h-8 w-8">
                                <AvatarImage src={user.photoURL ?? ''} alt={user.displayName ?? 'User'} />
                                <AvatarFallback>{getInitials(user.displayName)}</AvatarFallback>
                            </Avatar>
                            <div className="text-left group-data-[collapsible=icon]:hidden">
                                <p className="font-medium text-sm text-foreground truncate">{user.displayName || 'Anonymous'}</p>
                                <p className="text-xs text-muted-foreground truncate">{user.email || 'No email'}</p>
                            </div>
                          </>
                        ) : (
                          <>
                            <Avatar className="h-8 w-8">
                                <AvatarFallback>U</AvatarFallback>
                            </Avatar>
                             <div className="text-left group-data-[collapsible=icon]:hidden">
                                <p className="font-medium text-sm text-foreground">Not signed in</p>
                            </div>
                          </>
                        )}
                        
                        <ChevronDown className="ml-auto h-4 w-4 group-data-[collapsible=icon]:hidden" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 mb-2" align="end" forceMount>
                     <DropdownMenuLabel className="font-normal">
                        <div className="flex flex-col space-y-1">
                            {user && (
                              <>
                                <p className="text-sm font-medium leading-none">{user.displayName || 'Anonymous'}</p>
                                <p className="text-xs leading-none text-muted-foreground">
                                {user.email || 'No email'}
                                </p>
                              </>
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

"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  UtensilsCrossed,
  ClipboardList,
  Store,
  CreditCard,
  Search,
  Bell,
  ChevronDown,
  LogOut,
  Settings,
  User,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const navigationItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/menu", label: "Menu Management", icon: UtensilsCrossed },
  { href: "/admin/orders", label: "Order Management", icon: ClipboardList },
  { href: "/admin/canteens", label: "Canteen Management", icon: Store },
  { href: "/admin/payments", label: "Payments", icon: CreditCard },
];

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const pathname = usePathname();
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="min-h-screen bg-ucd-oatmeal">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 z-40 h-screen w-[220px] bg-ucd-sidebar text-white">
        {/* Branding */}
        <div className="flex h-16 flex-col justify-center border-b border-white/10 px-5">
          <h1 className="text-lg font-bold tracking-tight">UCD Canteen Hub</h1>
          <p className="text-xs text-gray-400">Admin Console</p>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 space-y-1 px-3 py-4">
          {navigationItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-ucd-sage text-white"
                    : "text-gray-300 hover:bg-white/10 hover:text-white"
                )}
              >
                <item.icon
                  className={cn(
                    "h-5 w-5 transition-colors",
                    isActive ? "text-white" : "text-gray-400 group-hover:text-white"
                  )}
                />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Bottom Section */}
        <div className="mt-auto border-t border-white/10 p-4">
          <p className="text-xs text-gray-500">UCD Dublin 2024</p>
        </div>
      </aside>

      {/* Main Content */}
      <div className="ml-[220px]">
        {/* Top Header Bar */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-[#EAE5D9] bg-ucd-oatmeal px-6">
          {/* Search Bar */}
          <div className="flex-1 max-w-xl">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search orders, dishes, customers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="rounded-xl border-[#EAE5D9] bg-white pl-10 focus:border-ucd-sage focus:ring-ucd-sage"
              />
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-4">
            <button className="relative rounded-full p-2 text-muted-foreground hover:bg-white">
              <Bell className="h-5 w-5" />
              <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-ucd-coral" />
            </button>

            {/* Admin Avatar Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-white">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="/admin-avatar.png" alt="Admin" />
                    <AvatarFallback className="bg-ucd-sage text-white text-xs">
                      AD
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex items-center gap-1 text-left">
                    <div className="hidden md:block">
                      <p className="text-sm font-medium text-foreground">Admin User</p>
                      <p className="text-xs text-muted-foreground">admin@ucd.ie</p>
                    </div>
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  </div>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-destructive focus:text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}

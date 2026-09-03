"use client";

import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/store/auth";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut, User, Bell, Search, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProjectSelector } from "@/components/project-selector";
import { useActiveProject } from "@/components/active-project-provider";

export function DashboardTopbar() {
  const { user, logout } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const { activeProject } = useActiveProject();

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const initials = user?.fullName
    ? user.fullName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "U";

  const pathSegments = pathname.split("/").filter(Boolean);
  const currentPage =
    pathSegments.length > 1
      ? pathSegments[pathSegments.length - 1]
          .replace(/-/g, " ")
          .replace(/\b\w/g, (l) => l.toUpperCase())
      : "Dashboard";

  return (
    <header className="sticky top-0 z-20 flex h-14 shrink-0 items-center gap-3 border-b border-border/60 bg-background/80 px-4 backdrop-blur-xl sm:gap-4 sm:px-6">
      {/* Left section */}
      <SidebarTrigger className="-ml-1 text-muted-foreground hover:text-foreground transition-colors" />
      <Separator orientation="vertical" className="!h-4 bg-border/50" />

      <div className="flex items-center gap-2">
        <ProjectSelector />
      </div>

      {/* Breadcrumbs */}
      <nav className="hidden lg:flex items-center gap-1.5 text-xs text-muted-foreground">
        <span className="font-medium text-foreground/80">Workspace</span>
        <ChevronRight className="h-3 w-3 opacity-40" />
        {activeProject ? (
          <>
            <span className="max-w-[120px] truncate">{activeProject.name}</span>
            <ChevronRight className="h-3 w-3 opacity-40" />
          </>
        ) : null}
        <span className="font-medium text-foreground">{currentPage}</span>
      </nav>

      <div className="flex-1" />

      {/* Search */}
      <Button
        variant="outline"
        className="hidden md:flex relative h-9 w-56 justify-start rounded-lg text-sm font-normal text-muted-foreground lg:w-64"
      >
        <Search className="mr-2 h-3.5 w-3.5 opacity-50" />
        <span className="hidden lg:inline-flex">Search anything...</span>
        <span className="inline-flex lg:hidden">Search...</span>
        <kbd className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 hidden h-5 select-none items-center gap-1 rounded border border-border bg-muted px-1.5 font-mono text-[10px] font-medium sm:flex">
          <span className="text-xs">⌘</span>K
        </kbd>
      </Button>

      {/* Actions */}
      <Button
        variant="ghost"
        size="icon"
        className="relative text-muted-foreground hover:text-foreground"
      >
        <Bell className="h-[18px] w-[18px]" />
        <span className="absolute right-1.5 top-1.5 flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
        </span>
      </Button>

      {/* User menu */}
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <button className="relative h-8 w-8 rounded-full overflow-hidden outline-none ring-1 ring-border/60 hover:ring-primary/50 transition-all duration-150">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-primary/15 text-primary text-xs font-semibold">
                  {initials}
                </AvatarFallback>
              </Avatar>
            </button>
          }
        />
        <DropdownMenuContent className="w-56" align="end">
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none text-foreground">
                {user?.fullName || "User"}
              </p>
              <p className="text-xs leading-none text-muted-foreground">
                {user?.email || ""}
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="cursor-pointer"
            render={<Link href="/dashboard/profile" />}
          >
            <User className="mr-2 h-4 w-4" />
            Profile
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={handleLogout}
            className="cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}

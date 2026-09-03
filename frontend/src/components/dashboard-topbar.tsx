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

  // Simple breadcrumb logic based on pathname
  const pathSegments = pathname.split("/").filter(Boolean);
  const currentPage = pathSegments.length > 1 
    ? pathSegments[1].replace("-", " ").replace(/\b\w/g, l => l.toUpperCase())
    : "Dashboard";

  return (
    <header className="flex h-14 shrink-0 items-center gap-4 border-b border-border/40 px-4 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <SidebarTrigger className="-ml-1 text-muted-foreground hover:text-foreground" />
      <Separator orientation="vertical" className="h-4" />
      
      <div className="flex items-center gap-2 mr-4">
        <ProjectSelector />
      </div>

      <div className="hidden md:flex items-center text-sm text-muted-foreground gap-2">
        <span>CMS</span>
        <ChevronRight className="w-4 h-4" />
        {activeProject ? (
          <>
            <span>{activeProject.name}</span>
            <ChevronRight className="w-4 h-4" />
          </>
        ) : null}
        <span className="font-medium text-foreground">{currentPage}</span>
      </div>

      <div className="flex-1" />

      {/* Global Search Mock */}
      <Button variant="outline" className="hidden md:flex relative h-8 w-64 justify-start rounded-[0.5rem] bg-muted/50 text-sm font-normal text-muted-foreground shadow-none sm:pr-12 md:w-40 lg:w-64">
        <span className="hidden lg:inline-flex">Cari sesuatu...</span>
        <span className="inline-flex lg:hidden">Cari...</span>
        <kbd className="pointer-events-none absolute right-[0.3rem] top-[0.3rem] hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
          <span className="text-xs">⌘</span>K
        </kbd>
      </Button>

      <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:text-foreground">
        <Bell className="w-4 h-4" />
        <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-violet-500 rounded-full"></span>
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <button className="relative h-8 w-8 rounded-full overflow-hidden outline-none hover:ring-2 hover:ring-violet-500/50 transition-all">
              <Avatar className="h-8 w-8 border border-border">
                <AvatarFallback className="bg-violet-600 text-white text-xs">
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
          <DropdownMenuItem className="cursor-pointer" render={<Link href="/dashboard/profile" />}>
            <User className="mr-2 h-4 w-4" />
            Profile
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-500 focus:text-red-500 focus:bg-red-500/10">
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}

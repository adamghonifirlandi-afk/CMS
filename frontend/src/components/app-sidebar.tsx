"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/store/auth";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  LayoutDashboard,
  Building2,
  FolderKanban,
  CreditCard,
  FileText,
  Database,
  Layers,
  Users,
  ImageIcon,
  GitBranch,
  Key,
  Settings,
  Mail,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const mainNavItems = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Organizations",
    url: "/dashboard/organizations",
    icon: Building2,
  },
  {
    title: "Projects",
    url: "/dashboard/projects",
    icon: FolderKanban,
  },
];

const contentNavItems = [
  {
    title: "Content Builder",
    url: "/dashboard/content-builder",
    icon: FileText,
  },
  {
    title: "Content Management",
    url: "/dashboard/content-management",
    icon: Database,
  },
  {
    title: "Media Library",
    url: "/dashboard/media",
    icon: ImageIcon,
  },
  {
    title: "Workflow",
    url: "/dashboard/workflow",
    icon: GitBranch,
  },
];

const settingsNavItems = [
  {
    title: "Plans & Billing",
    url: "/dashboard/billing",
    icon: CreditCard,
  },
  {
    title: "Collaborators",
    url: "/dashboard/collaborators",
    icon: Users,
  },
  {
    title: "Invitations",
    url: "/dashboard/invitations",
    icon: Mail, // Changed from Users to Mail to match intent
  },
  {
    title: "API Tokens",
    url: "/dashboard/api-tokens",
    icon: Key,
  },
  {
    title: "Settings",
    url: "/dashboard/profile",
    icon: Settings,
  },
];

export function AppSidebar() {
  const pathname = usePathname();
  const { setOpenMobile, isMobile, state } = useSidebar();
  const { user } = useAuthStore();

  const initials = user?.fullName
    ? user.fullName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "U";

  return (
    <Sidebar className="border-r border-border/40 bg-sidebar">
      <SidebarHeader className="p-4 border-b border-border/40">
        <Link href="/dashboard" className="flex items-center gap-3 transition-opacity hover:opacity-80">
          <div className="w-8 h-8 bg-violet-600 rounded-lg flex items-center justify-center shrink-0 shadow-sm">
            <Layers className="w-4 h-4 text-white" />
          </div>
          <div className="flex flex-col overflow-hidden">
            <span className="font-bold text-sm tracking-tight text-foreground truncate">Antigravity CMS</span>
            <p className="text-[10px] text-muted-foreground leading-none truncate">
              Enterprise Headless
            </p>
          </div>
        </Link>
      </SidebarHeader>

      <SidebarContent className="px-2 py-4 gap-6">
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-semibold text-muted-foreground/70 tracking-wider">
            MAIN
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNavItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    isActive={pathname === item.url || (item.url !== "/dashboard" && pathname.startsWith(item.url + "/"))}
                    tooltip={item.title}
                    render={<Link href={item.url} />}
                    onClick={() => isMobile && setOpenMobile(false)}
                    className="data-[active=true]:bg-violet-500/10 data-[active=true]:text-violet-500 data-[active=true]:font-medium transition-all"
                  >
                    <item.icon className="w-4 h-4" />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-semibold text-muted-foreground/70 tracking-wider">
            WORKSPACE
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {contentNavItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    isActive={pathname === item.url || pathname.startsWith(item.url + "/")}
                    tooltip={item.title}
                    render={<Link href={item.url} />}
                    onClick={() => isMobile && setOpenMobile(false)}
                    className="data-[active=true]:bg-violet-500/10 data-[active=true]:text-violet-500 data-[active=true]:font-medium transition-all"
                  >
                    <item.icon className="w-4 h-4" />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-semibold text-muted-foreground/70 tracking-wider">
            SETTINGS
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {settingsNavItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    isActive={pathname === item.url || pathname.startsWith(item.url + "/")}
                    tooltip={item.title}
                    render={<Link href={item.url} />}
                    onClick={() => isMobile && setOpenMobile(false)}
                    className="data-[active=true]:bg-violet-500/10 data-[active=true]:text-violet-500 data-[active=true]:font-medium transition-all"
                  >
                    <item.icon className="w-4 h-4" />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-border/40">
        <div className="flex items-center gap-3 overflow-hidden">
          <Avatar className="h-8 w-8 shrink-0 border border-border">
            <AvatarFallback className="bg-muted text-muted-foreground text-xs">
              {initials}
            </AvatarFallback>
          </Avatar>
          {state === "expanded" && (
            <div className="flex flex-col overflow-hidden">
              <span className="text-sm font-medium truncate text-foreground">{user?.fullName || "User"}</span>
              <span className="text-xs text-muted-foreground truncate">{user?.email || ""}</span>
            </div>
          )}
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}

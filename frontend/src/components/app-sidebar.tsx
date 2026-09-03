"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
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
} from "lucide-react";

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
  const { setOpenMobile, isMobile } = useSidebar();

  return (
    <Sidebar className="border-r border-sidebar-border">
      <SidebarHeader className="p-4">
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="w-9 h-9 bg-violet-600 rounded-lg flex items-center justify-center">
            <Layers className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="font-bold text-lg tracking-tight">CMS</span>
            <p className="text-[10px] text-muted-foreground leading-none">
              Headless CMS Platform
            </p>
          </div>
        </Link>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu Utama</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNavItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    isActive={pathname === item.url || (item.url !== "/dashboard" && pathname.startsWith(item.url + "/"))}
                    tooltip={item.title}
                    render={<Link href={item.url} />}
                    onClick={() => isMobile && setOpenMobile(false)}
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
          <SidebarGroupLabel>Content</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {contentNavItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    isActive={pathname === item.url || pathname.startsWith(item.url + "/")}
                    tooltip={item.title}
                    render={<Link href={item.url} />}
                    onClick={() => isMobile && setOpenMobile(false)}
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
          <SidebarGroupLabel>Settings</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {settingsNavItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    isActive={pathname === item.url || pathname.startsWith(item.url + "/")}
                    tooltip={item.title}
                    render={<Link href={item.url} />}
                    onClick={() => isMobile && setOpenMobile(false)}
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

      <SidebarFooter className="p-4 text-[10px] text-muted-foreground text-center">
        Headless CMS v1.0
      </SidebarFooter>
    </Sidebar>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/store/auth";
import { useActiveProject } from "@/components/active-project-provider";
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
  Blocks,
  Database,
  Layers,
  Users,
  Images,
  GitBranch,
  KeyRound,
  Settings,
  Mail,
  LogOut,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

const mainNavItems = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Organizations", url: "/dashboard/organizations", icon: Building2 },
  { title: "Projects", url: "/dashboard/projects", icon: FolderKanban },
];

const contentNavItems = [
  { title: "Content Builder", url: "/dashboard/content-builder", icon: Blocks },
  { title: "Content Management", url: "/dashboard/content-management", icon: Database },
  { title: "Media Library", url: "/dashboard/media", icon: Images },
  { title: "Workflow", url: "/dashboard/workflow", icon: GitBranch },
];

const settingsNavItems = [
  { title: "Plans & Billing", url: "/dashboard/billing", icon: CreditCard },
  { title: "Collaborators", url: "/dashboard/collaborators", icon: Users },
  { title: "Invitations", url: "/dashboard/invitations", icon: Mail },
  { title: "API Tokens", url: "/dashboard/api-tokens", icon: KeyRound },
  { title: "Settings", url: "/dashboard/profile", icon: Settings },
];

/* ── Shared nav item renderer ── */
function NavSection({
  label,
  items,
  pathname,
  hrefFn,
  onNavigate,
}: {
  label: string;
  items: typeof mainNavItems;
  pathname: string;
  hrefFn: (url: string) => string;
  onNavigate: () => void;
}) {
  return (
    <SidebarGroup>
      <SidebarGroupLabel className="mb-1 px-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground/50">
        {label}
      </SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => {
            const active =
              pathname === item.url ||
              (item.url !== "/dashboard" && pathname.startsWith(item.url + "/"));
            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  isActive={active}
                  tooltip={item.title}
                  render={<Link href={hrefFn(item.url)} />}
                  onClick={onNavigate}
                  className={cn(
                    "group/nav relative flex items-center gap-3 rounded-lg px-3 py-2 text-[13px] font-medium transition-all duration-150",
                    active
                      ? "bg-primary/[0.12] text-primary shadow-[inset_3px_0_0_0] shadow-primary"
                      : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                  )}
                >
                  <span
                    className={cn(
                      "flex h-7 w-7 shrink-0 items-center justify-center rounded-md transition-colors duration-150",
                      active
                        ? "bg-primary/20 text-primary"
                        : "bg-sidebar-accent/60 text-muted-foreground group-hover/nav:bg-sidebar-accent group-hover/nav:text-sidebar-foreground"
                    )}
                  >
                    <item.icon className="h-[18px] w-[18px]" />
                  </span>
                  <span>{item.title}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}

export function AppSidebar() {
  const pathname = usePathname();
  const { setOpenMobile, isMobile, state } = useSidebar();
  const { user } = useAuthStore();
  const { activeProject } = useActiveProject();

  const projectHref = (url: string) =>
    activeProject ? `${url}?projectId=${activeProject.id}` : url;

  const closeMobile = () => isMobile && setOpenMobile(false);

  const initials = user?.fullName
    ? user.fullName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "U";

  return (
    <Sidebar className="border-r border-sidebar-border bg-sidebar">
      {/* ── Brand ── */}
      <SidebarHeader className="px-5 py-5 border-b border-sidebar-border">
        <Link
          href="/dashboard"
          className="flex items-center gap-3 group/brand transition-opacity hover:opacity-90"
        >
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary shadow-[0_0_20px_oklch(0.78_0.14_174_/_0.18)]">
            <Layers className="h-4 w-4 text-primary-foreground" />
          </div>
          <div className="flex flex-col overflow-hidden">
            <span className="text-sm font-semibold tracking-tight text-foreground truncate">
              Northstar CMS
            </span>
            <span className="text-[10px] leading-none text-muted-foreground/60 truncate">
              Content infrastructure
            </span>
          </div>
        </Link>
      </SidebarHeader>

      {/* ── Navigation ── */}
      <SidebarContent className="px-3 py-4 space-y-5">
        <NavSection
          label="Workspace"
          items={mainNavItems}
          pathname={pathname}
          hrefFn={(u) => u}
          onNavigate={closeMobile}
        />
        <NavSection
          label="Content"
          items={contentNavItems}
          pathname={pathname}
          hrefFn={projectHref}
          onNavigate={closeMobile}
        />
        <NavSection
          label="Team & Settings"
          items={settingsNavItems}
          pathname={pathname}
          hrefFn={(u) => u}
          onNavigate={closeMobile}
        />
      </SidebarContent>

      {/* ── User footer ── */}
      <SidebarFooter className="px-4 py-4 border-t border-sidebar-border">
        <div className="flex items-center gap-3 overflow-hidden rounded-lg p-1.5 transition-colors hover:bg-sidebar-accent/60">
          <Avatar className="h-8 w-8 shrink-0 ring-1 ring-border/60">
            <AvatarFallback className="bg-primary/15 text-primary text-xs font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>
          {state === "expanded" && (
            <div className="flex flex-col overflow-hidden">
              <span className="text-sm font-medium truncate text-foreground">
                {user?.fullName || "User"}
              </span>
              <span className="text-[11px] text-muted-foreground truncate">
                {user?.email || ""}
              </span>
            </div>
          )}
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}

"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth";
import {
  SidebarProvider,
  SidebarInset,
} from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { DashboardTopbar } from "@/components/dashboard-topbar";
import { ActiveProjectProvider } from "@/components/active-project-provider";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, hydrate } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
      }
    }
  }, [router]);

  return (
    <ActiveProjectProvider>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <DashboardTopbar />
          <main className="flex-1 p-6 overflow-auto">{children}</main>
        </SidebarInset>
      </SidebarProvider>
    </ActiveProjectProvider>
  );
}

"use client";

import { useEffect, useState } from "react";
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
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
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

  if (!mounted) {
    return <div className="min-h-screen bg-background" />;
  }

  return (
    <ActiveProjectProvider>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <DashboardTopbar />
          <main className="flex-1 overflow-auto px-4 py-5 sm:px-6 sm:py-7 lg:px-8">{children}</main>
        </SidebarInset>
      </SidebarProvider>
    </ActiveProjectProvider>
  );
}

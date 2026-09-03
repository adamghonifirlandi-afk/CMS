"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useAuthStore } from "@/store/auth";
import { User, Shield, Bell } from "lucide-react";

export default function ProfilePage() {
  const { user, setUser } = useAuthStore();
  const [form, setForm] = useState({ fullName: "", email: "", company: "", job: "", country: "" });
  const [notifications, setNotifications] = useState(true);

  useEffect(() => {
    if (user) {
      setForm({
        fullName: user.fullName || "",
        email: user.email || "",
        company: user.company || "",
        job: user.job || "",
        country: user.country || "",
      });
    }
  }, [user]);

  const handleSaveProfile = (event: React.FormEvent) => {
    event.preventDefault();
    if (!form.fullName.trim() || !form.email.trim()) {
      toast.error("Name and email are required.");
      return;
    }
    setUser({ id: user?.id || "", ...(user || {}), ...form });
    toast.success("Profile updated successfully.");
  };

  const handleSaveSecurity = (event: React.FormEvent) => {
    event.preventDefault();
    toast.success("Security settings updated successfully.");
  };

  return (
    <div className="mx-auto max-w-4xl space-y-8 pb-10">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Account Settings</h1>
        <p className="text-muted-foreground mt-2">Manage your profile information, security preferences, and workspace settings.</p>
      </div>

      <div className="grid gap-8">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              <CardTitle>Profile Information</CardTitle>
            </div>
            <CardDescription>Update your personal and professional details for your workspace.</CardDescription>
          </CardHeader>
          <form onSubmit={handleSaveProfile}>
            <CardContent className="grid gap-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input 
                    id="fullName" 
                    placeholder="Enter your full name"
                    value={form.fullName} 
                    onChange={(e) => setForm({ ...form, fullName: e.target.value })} 
                  />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="Enter your email"
                    value={form.email} 
                    onChange={(e) => setForm({ ...form, email: e.target.value })} 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company">Company</Label>
                  <Input 
                    id="company" 
                    placeholder="E.g. Acme Corp"
                    value={form.company} 
                    onChange={(e) => setForm({ ...form, company: e.target.value })} 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="job">Job Title</Label>
                  <Input 
                    id="job" 
                    placeholder="E.g. Product Manager"
                    value={form.job} 
                    onChange={(e) => setForm({ ...form, job: e.target.value })} 
                  />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="country">Country</Label>
                  <Input 
                    id="country" 
                    placeholder="E.g. United States"
                    value={form.country} 
                    onChange={(e) => setForm({ ...form, country: e.target.value })} 
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="border-t px-6 py-4 flex justify-end">
              <Button type="submit">Save Changes</Button>
            </CardFooter>
          </form>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              <CardTitle>Security</CardTitle>
            </div>
            <CardDescription>Manage your password and security preferences.</CardDescription>
          </CardHeader>
          <form onSubmit={handleSaveSecurity}>
            <CardContent className="grid gap-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <Input 
                    id="currentPassword" 
                    type="password" 
                    placeholder="Enter current password"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input 
                    id="newPassword" 
                    type="password" 
                    placeholder="Enter new password"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input 
                    id="confirmPassword" 
                    type="password" 
                    placeholder="Confirm new password"
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="border-t px-6 py-4 flex justify-end">
              <Button type="submit">Update Password</Button>
            </CardFooter>
          </form>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-primary" />
              <CardTitle>Preferences</CardTitle>
            </div>
            <CardDescription>Manage your notifications and system preferences.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6">
            <div className="flex items-center justify-between space-x-4">
              <div className="space-y-1">
                <Label htmlFor="notifications" className="text-base">Email Notifications</Label>
                <p className="text-sm text-muted-foreground">Receive weekly reports and system alerts via email.</p>
              </div>
              <Button 
                type="button"
                variant={notifications ? "default" : "outline"}
                onClick={() => setNotifications(!notifications)}
              >
                {notifications ? "Enabled" : "Disabled"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

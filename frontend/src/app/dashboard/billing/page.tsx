"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Check, CreditCard, Sparkles, Building2 } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export default function BillingPage() {
  const [plans, setPlans] = useState<any[]>([]);
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [selectedOrgId, setSelectedOrgId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [subscribing, setSubscribing] = useState<string | null>(null);
  const [currentSub, setCurrentSub] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [orgsRes, plansRes] = await Promise.all([
          api.get("/organizations"),
          api.get("/plans/plans"),
        ]);
        const orgData = orgsRes.data?.data || orgsRes.data || [];
        setOrganizations(orgData);
        setPlans(plansRes.data?.data || plansRes.data || []);
        
        if (orgData.length > 0) {
          setSelectedOrgId(orgData[0].id);
        }
      } catch (err) {
        toast.error("Gagal memuat data paket");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (selectedOrgId) {
      fetchSubscription(selectedOrgId);
    }
  }, [selectedOrgId]);

  const fetchSubscription = async (orgId: string) => {
    try {
      const res = await api.get(`/subscriptions/organizations/${orgId}/subscription`);
      setCurrentSub(res.data?.data || res.data);
    } catch (err) {
      setCurrentSub(null);
    }
  };

  const handleSubscribe = async (planId: string) => {
    if (!selectedOrgId) return;
    setSubscribing(planId);
    try {
      await api.post(`/subscriptions/organizations/${selectedOrgId}/subscription`, {
        planId,
      });
      toast.success("Berhasil berlangganan!");
      fetchSubscription(selectedOrgId);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Gagal berlangganan");
    } finally {
      setSubscribing(null);
    }
  };

  return (
    <div className="mx-auto max-w-[1440px] space-y-8 animate-enter">
      {/* ── Header ── */}
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Plans & Billing</h1>
          <p className="mt-1 text-muted-foreground">Manage your organization's subscription and billing details.</p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={selectedOrgId} onValueChange={(val) => setSelectedOrgId(val || "")}>
            <SelectTrigger className="w-[220px] h-9">
              <SelectValue placeholder="Select Organization" />
            </SelectTrigger>
            <SelectContent>
              {organizations.map((org) => (
                <SelectItem key={org.id} value={org.id}>
                  {org.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {!selectedOrgId ? (
        <div className="flex min-h-[300px] flex-col items-center justify-center rounded-xl border border-dashed border-border/60 bg-card/30 p-8 text-center">
          <Building2 className="mb-4 h-10 w-10 text-muted-foreground/40" />
          <h2 className="text-lg font-semibold">No organization selected</h2>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">Please select an organization from the dropdown above to manage its billing.</p>
        </div>
      ) : loading ? (
        <div className="flex min-h-[300px] items-center justify-center text-sm text-muted-foreground">Loading plans...</div>
      ) : (
        <div className="space-y-8">
          {/* Current Subscription Alert */}
          {currentSub && (
            <div className="flex flex-col gap-4 rounded-xl border border-primary/20 bg-primary/5 p-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary ring-1 ring-primary/20">
                  <CreditCard className="h-6 w-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-semibold">Current Plan: {currentSub.plan?.name || "Premium"}</h3>
                    <Badge variant="active" className="h-5 py-0 px-2 text-[10px]">{currentSub.status}</Badge>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">Your subscription is active and will auto-renew.</p>
                </div>
              </div>
              <Button variant="outline" className="text-destructive hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30">
                Cancel Plan
              </Button>
            </div>
          )}

          {/* Pricing Grid */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {plans.map((plan) => {
              const isCurrent = currentSub?.planId === plan.id;
              const limits = plan.limits || {};
              const features = plan.features && typeof plan.features === "object"
                ? Object.keys(plan.features).filter((key) => plan.features[key] === true)
                : [];
                
              return (
                <Card 
                  key={plan.id} 
                  className={cn(
                    "relative flex flex-col overflow-visible bg-card/90 transition-all duration-200",
                    isCurrent 
                      ? "border-primary/50 shadow-md shadow-primary/10 ring-1 ring-primary/20" 
                      : "border-border/50 hover:border-primary/30 hover:shadow-sm hover:ring-1 hover:ring-primary/20"
                  )}
                >
                  {isCurrent && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-0.5 text-[11px] font-semibold tracking-wide text-primary-foreground shadow-sm flex items-center gap-1.5">
                      <Sparkles className="h-3 w-3" />
                      Active Plan
                    </div>
                  )}
                  
                  <CardHeader className="pb-6">
                    <CardTitle className="text-xl font-semibold tracking-tight">{plan.name}</CardTitle>
                    <CardDescription className="h-10 text-sm mt-1.5">{plan.description}</CardDescription>
                  </CardHeader>
                  
                  <CardContent className="flex-1 pb-6">
                    <div className="mb-6 flex items-baseline gap-1">
                      <span className="text-3xl font-bold tracking-tight text-foreground">
                        Rp {Number(plan.price || 0).toLocaleString('id-ID')}
                      </span>
                      <span className="text-sm font-medium text-muted-foreground">
                        /{plan.billingCycle === "YEARLY" ? "year" : "month"}
                      </span>
                    </div>
                    
                    <ul className="space-y-3">
                      <li className="flex items-start gap-3 text-sm text-foreground/80">
                        <Check className="h-4 w-4 shrink-0 text-emerald-400 mt-0.5" />
                        <span>{limits.projects === -1 ? 'Unlimited' : limits.projects ?? 0} Projects</span>
                      </li>
                      <li className="flex items-start gap-3 text-sm text-foreground/80">
                        <Check className="h-4 w-4 shrink-0 text-emerald-400 mt-0.5" />
                        <span>{limits.collaborators === -1 ? 'Unlimited' : limits.collaborators ?? 0} Collaborators</span>
                      </li>
                      <li className="flex items-start gap-3 text-sm text-foreground/80">
                        <Check className="h-4 w-4 shrink-0 text-emerald-400 mt-0.5" />
                        <span>{limits.apiCalls === -1 ? 'Unlimited' : Number(limits.apiCalls || 0).toLocaleString('id-ID')} API Requests/mo</span>
                      </li>
                      <li className="flex items-start gap-3 text-sm text-foreground/80">
                        <Check className="h-4 w-4 shrink-0 text-emerald-400 mt-0.5" />
                        <span>{features.length > 0 ? features.join(', ') : 'Basic Features'}</span>
                      </li>
                    </ul>
                  </CardContent>
                  
                  <CardFooter className="pt-0">
                    <Button 
                      className="w-full"
                      onClick={() => !isCurrent && handleSubscribe(plan.id)}
                      disabled={isCurrent || subscribing === plan.id}
                      variant={isCurrent ? "secondary" : "default"}
                    >
                      {subscribing === plan.id ? "Processing..." : isCurrent ? "Current Plan" : "Upgrade"}
                    </Button>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

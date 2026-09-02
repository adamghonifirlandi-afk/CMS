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
import { Check, CreditCard, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

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
      // Mock payment by calling backend
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
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Plans & Billing</h1>
          <p className="text-muted-foreground">Kelola paket berlangganan organisasi Anda</p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={selectedOrgId} onValueChange={(val) => setSelectedOrgId(val || "")}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Pilih Organisasi" />
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
        <div className="text-center py-12 text-muted-foreground border rounded-lg bg-muted/10">
          Silakan buat atau pilih organisasi terlebih dahulu.
        </div>
      ) : loading ? (
        <div className="text-center py-12 text-muted-foreground">Memuat...</div>
      ) : (
        <>
          {/* Current Subscription Alert */}
          {currentSub && (
            <div className="bg-violet-500/10 border border-violet-500/20 rounded-lg p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-violet-500/20 p-2 rounded-full text-violet-600">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold">Paket Saat Ini: {currentSub.plan?.name || "Premium"}</h3>
                  <p className="text-sm text-muted-foreground">Status: <Badge variant="default" className="bg-emerald-500">{currentSub.status}</Badge></p>
                </div>
              </div>
              <Button variant="outline" className="text-red-500 hover:text-red-600 hover:bg-red-50">Batalkan Paket</Button>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {plans.map((plan) => {
              const isCurrent = currentSub?.planId === plan.id;
              return (
                <Card key={plan.id} className={`relative flex flex-col ${isCurrent ? 'border-violet-500 ring-1 ring-violet-500' : ''}`}>
                  {isCurrent && (
                    <div className="absolute top-0 right-1/2 translate-x-1/2 -translate-y-1/2 bg-violet-500 text-white text-xs px-3 py-1 rounded-full font-medium">
                      Aktif
                    </div>
                  )}
                  <CardHeader>
                    <CardTitle className="text-xl">{plan.name}</CardTitle>
                    <CardDescription className="h-10">{plan.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1">
                    <div className="mb-6">
                      <span className="text-3xl font-bold">
                        Rp {parseInt(plan.price).toLocaleString('id-ID')}
                      </span>
                      <span className="text-muted-foreground text-sm">/ {plan.interval}</span>
                    </div>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-emerald-500" /> Max Projects: {plan.maxProjects === -1 ? 'Unlimited' : plan.maxProjects}
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-emerald-500" /> Max Collaborators: {plan.maxCollaborators === -1 ? 'Unlimited' : plan.maxCollaborators}
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-emerald-500" /> API Requests/mo: {plan.apiRequestsPerMonth === -1 ? 'Unlimited' : plan.apiRequestsPerMonth.toLocaleString()}
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-emerald-500" /> Features: {Array.isArray(plan.features) ? plan.features.join(', ') : 'Basic Features'}
                      </li>
                    </ul>
                  </CardContent>
                  <CardFooter>
                    <Button 
                      className={`w-full ${isCurrent ? 'bg-muted text-muted-foreground cursor-not-allowed' : 'bg-violet-600 hover:bg-violet-700 text-white'}`}
                      onClick={() => !isCurrent && handleSubscribe(plan.id)}
                      disabled={isCurrent || subscribing === plan.id}
                      variant={isCurrent ? "secondary" : "default"}
                    >
                      {subscribing === plan.id ? "Memproses..." : isCurrent ? "Paket Anda" : "Pilih Paket"}
                    </Button>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Mail, Check, X, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";

// Mock data since we might not have a reliable endpoint for this specific view yet
const mockInvitations = [
  {
    id: "inv-1",
    orgName: "CMLabs Demo",
    invitedBy: "Admin",
    role: "COLLABORATOR",
    status: "PENDING",
    date: "2 jam yang lalu",
  }
];

export default function InvitationsPage() {
  const [invitations, setInvitations] = useState(mockInvitations);

  const handleAction = (id: string, action: 'accept' | 'reject') => {
    setInvitations(invitations.filter(i => i.id !== id));
    // In a real app, call API here
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Invitations</h1>
        <p className="text-muted-foreground">
          Kelola undangan kolaborasi ke organisasi
        </p>
      </div>

      <Tabs defaultValue="received" className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-[400px]">
          <TabsTrigger value="received">Diterima</TabsTrigger>
          <TabsTrigger value="sent">Terkirim</TabsTrigger>
        </TabsList>
        
        <TabsContent value="received" className="mt-6">
          {invitations.length > 0 ? (
            <div className="grid gap-4">
              {invitations.map((inv) => (
                <Card key={inv.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-6 gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-violet-500/10 text-violet-500 rounded-full flex items-center justify-center shrink-0">
                      <Mail className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">Undangan ke {inv.orgName}</h3>
                      <p className="text-sm text-muted-foreground">
                        Diundang oleh <span className="text-foreground">{inv.invitedBy}</span> sebagai <Badge variant="outline" className="ml-1 text-[10px]">{inv.role}</Badge>
                      </p>
                      <div className="flex items-center text-xs text-muted-foreground mt-2">
                        <Clock className="w-3 h-3 mr-1" /> {inv.date}
                      </div>
                    </div>
                  </div>
                  <div className="flex w-full sm:w-auto items-center gap-2 mt-2 sm:mt-0">
                    <Button variant="outline" className="flex-1 sm:flex-none text-red-500 hover:text-red-600 hover:bg-red-500/10" onClick={() => handleAction(inv.id, 'reject')}>
                      <X className="w-4 h-4 mr-2" /> Tolak
                    </Button>
                    <Button className="flex-1 sm:flex-none bg-violet-600 hover:bg-violet-700 text-white" onClick={() => handleAction(inv.id, 'accept')}>
                      <Check className="w-4 h-4 mr-2" /> Terima
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="border-dashed bg-muted/10">
              <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                  <Mail className="w-8 h-8 text-muted-foreground/50" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Tidak ada undangan</h3>
                <p className="text-muted-foreground text-sm max-w-sm">
                  Anda belum menerima undangan baru untuk bergabung dengan organisasi mana pun.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="sent" className="mt-6">
          <Card className="border-dashed bg-muted/10">
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                <Mail className="w-8 h-8 text-muted-foreground/50" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Belum ada undangan terkirim</h3>
              <p className="text-muted-foreground text-sm max-w-sm">
                Undangan yang Anda kirim ke pengguna lain akan muncul di sini.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

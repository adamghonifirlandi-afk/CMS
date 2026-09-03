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
import { Mail, Check, X, Clock, Inbox } from "lucide-react";
import { Badge } from "@/components/ui/badge";

// Mock data since we might not have a reliable endpoint for this specific view yet
const mockInvitations = [
  {
    id: "inv-1",
    orgName: "CMLabs Demo",
    invitedBy: "Admin",
    role: "COLLABORATOR",
    status: "pending",
    date: "2 hours ago",
  }
];

export default function InvitationsPage() {
  const [invitations, setInvitations] = useState(mockInvitations);

  const handleAction = (id: string, action: 'accept' | 'reject') => {
    setInvitations(invitations.filter(i => i.id !== id));
    // In a real app, call API here
  };

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return <Badge variant="pending">Pending</Badge>;
      case 'accepted':
        return <Badge variant="active">Accepted</Badge>;
      case 'expired':
        return <Badge variant="archived">Expired</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-10">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Invitations</h1>
        <p className="text-muted-foreground">
          Manage your organization collaboration invitations
        </p>
      </div>

      <Tabs defaultValue="received" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="received">Received</TabsTrigger>
          <TabsTrigger value="sent">Sent</TabsTrigger>
        </TabsList>
        
        <TabsContent value="received" className="space-y-4">
          {invitations.length > 0 ? (
            <div className="flex flex-col gap-4">
              {invitations.map((inv) => (
                <Card key={inv.id} className="transition-all hover:border-primary/20 hover:shadow-sm">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-5 gap-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center shrink-0">
                        <Mail className="w-6 h-6" />
                      </div>
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-lg">Invitation to {inv.orgName}</h3>
                          {getStatusBadge(inv.status)}
                        </div>
                        <p className="text-sm text-muted-foreground flex items-center flex-wrap gap-x-1">
                          Invited by <span className="font-medium text-foreground">{inv.invitedBy}</span> as <Badge variant="outline" className="text-[10px] font-medium h-5">{inv.role}</Badge>
                        </p>
                        <div className="flex items-center text-xs text-muted-foreground mt-1">
                          <Clock className="w-3.5 h-3.5 mr-1.5 opacity-70" /> {inv.date}
                        </div>
                      </div>
                    </div>
                    <div className="flex w-full sm:w-auto items-center gap-3 mt-4 sm:mt-0 border-t sm:border-t-0 pt-4 sm:pt-0">
                      <Button variant="outline" className="flex-1 sm:flex-none text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/20" onClick={() => handleAction(inv.id, 'reject')}>
                        <X className="w-4 h-4 mr-2" /> Decline
                      </Button>
                      <Button className="flex-1 sm:flex-none" onClick={() => handleAction(inv.id, 'accept')}>
                        <Check className="w-4 h-4 mr-2" /> Accept
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="border-dashed bg-card/50">
              <CardContent className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-6">
                  <Inbox className="w-8 h-8 text-muted-foreground/50" />
                </div>
                <h3 className="text-xl font-semibold mb-2">No invitations</h3>
                <p className="text-muted-foreground text-sm max-w-sm">
                  You haven't received any new invitations to join organizations yet.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="sent" className="space-y-4">
          <Card className="border-dashed bg-card/50">
            <CardContent className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-6">
                <Mail className="w-8 h-8 text-muted-foreground/50" />
              </div>
              <h3 className="text-xl font-semibold mb-2">No sent invitations</h3>
              <p className="text-muted-foreground text-sm max-w-sm">
                Invitations you send to other users will appear here.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

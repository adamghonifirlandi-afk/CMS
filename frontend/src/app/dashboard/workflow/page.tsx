"use client";

import { Suspense } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { GitBranch, Clock, FileText, CheckCircle2, XCircle, MoreHorizontal, Plus } from "lucide-react";

interface MockItem {
  id: string;
  title: string;
  type: string;
  status: string;
  assignee: string;
  updated: string;
}

const MOCK_ITEMS: MockItem[] = [
  { id: "1", title: "Enterprise Pricing Page", type: "Landing Page", status: "Draft", assignee: "JS", updated: "2h ago" },
  { id: "7", title: "Product Vision 2027", type: "Presentation", status: "Draft", assignee: "MK", updated: "10m ago" },
  { id: "2", title: "Welcome Email Template", type: "Email", status: "Pending Review", assignee: "AL", updated: "5h ago" },
  { id: "3", title: "Q3 Marketing Report", type: "Document", status: "Pending Review", assignee: "MK", updated: "1d ago" },
  { id: "4", title: "CEO Announcement", type: "Blog Post", status: "Approved", assignee: "JS", updated: "2d ago" },
  { id: "5", title: "Feature Release Notes v2.1", type: "Documentation", status: "Published", assignee: "RN", updated: "1w ago" },
  { id: "6", title: "Social Media Guidelines", type: "Wiki", status: "Rejected", assignee: "AL", updated: "3d ago" },
];

const STAGES = [
  { 
    id: "Draft", 
    label: "Draft", 
    icon: FileText,
    badgeClass: "bg-secondary/70 text-secondary-foreground hover:bg-secondary/90",
    columnHeaderClass: "border-border/50 bg-muted/30"
  },
  { 
    id: "Pending Review", 
    label: "Pending Review", 
    icon: Clock,
    badgeClass: "bg-amber-500/15 text-amber-600 dark:text-amber-400 hover:bg-amber-500/25 border-0",
    columnHeaderClass: "border-amber-500/20 bg-amber-500/5"
  },
  { 
    id: "Approved", 
    label: "Approved", 
    icon: CheckCircle2,
    badgeClass: "bg-blue-500/15 text-blue-600 dark:text-blue-400 hover:bg-blue-500/25 border-0",
    columnHeaderClass: "border-blue-500/20 bg-blue-500/5"
  },
  { 
    id: "Published", 
    label: "Published", 
    icon: GitBranch,
    badgeClass: "bg-green-500/15 text-green-600 dark:text-green-400 hover:bg-green-500/25 border-0",
    columnHeaderClass: "border-green-500/20 bg-green-500/5"
  },
  { 
    id: "Rejected", 
    label: "Rejected", 
    icon: XCircle,
    badgeClass: "bg-red-500/15 text-red-600 dark:text-red-400 hover:bg-red-500/25 border-0",
    columnHeaderClass: "border-red-500/20 bg-red-500/5"
  },
];

function KanbanCard({ item }: { item: MockItem }) {
  const stage = STAGES.find(s => s.id === item.status);
  
  return (
    <Card className="border-border/60 hover:border-primary/40 bg-card transition-all duration-200 shadow-sm hover:shadow-md cursor-grab active:cursor-grabbing">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <Badge className={`px-2 py-0.5 rounded-md text-[10px] font-semibold tracking-wide ${stage?.badgeClass} shadow-none`}>
             {stage?.label}
          </Badge>
          <button className="text-muted-foreground hover:text-foreground shrink-0 transition-colors">
            <MoreHorizontal className="w-4 h-4" />
          </button>
        </div>

        <div>
          <h4 className="font-medium text-sm leading-snug text-foreground mb-1.5">{item.title}</h4>
          <span className="text-[11px] text-muted-foreground font-medium bg-muted/60 px-1.5 py-0.5 rounded border border-border/40">
            {item.type}
          </span>
        </div>
        
        <div className="flex items-center justify-between pt-2.5 mt-1 border-t border-border/40">
          <div className="w-6 h-6 rounded-full bg-primary/10 text-primary text-[10px] font-bold flex items-center justify-center ring-1 ring-primary/20">
            {item.assignee}
          </div>
          <span className="text-[11px] text-muted-foreground flex items-center gap-1 font-medium">
            <Clock className="w-3 h-3" />
            {item.updated}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

function WorkflowContent() {
  return (
    <div className="space-y-8 min-h-[calc(100vh-8rem)] flex flex-col">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Content Workflow</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Manage your content lifecycle across editorial stages.
          </p>
        </div>
        <Button className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm">
          <Plus className="w-4 h-4 mr-2" />
          New Item
        </Button>
      </div>

      <div className="flex-1 overflow-x-auto pb-6 custom-scrollbar">
        <div className="flex gap-5 min-w-max h-full items-start">
          {STAGES.map((stage) => {
            const items = MOCK_ITEMS.filter(item => item.status === stage.id);
            const Icon = stage.icon;
            
            return (
              <div key={stage.id} className="w-80 flex flex-col gap-3">
                {/* Column Header */}
                <div className={`px-4 py-3 rounded-xl border flex items-center justify-between ${stage.columnHeaderClass} shadow-sm`}>
                  <div className="flex items-center gap-2.5 font-semibold text-sm">
                    <Icon className="w-4 h-4" />
                    {stage.label}
                  </div>
                  <Badge variant="outline" className="bg-background/80 w-6 h-6 p-0 flex items-center justify-center rounded-full text-xs font-medium shadow-sm border-border/50">
                    {items.length}
                  </Badge>
                </div>
                
                {/* Column Content */}
                <div className="flex-1 rounded-xl bg-muted/10 border border-border/30 p-2.5 flex flex-col gap-3 min-h-[400px]">
                  {items.map(item => (
                    <KanbanCard key={item.id} item={item} />
                  ))}
                  
                  {items.length === 0 && (
                    <div className="flex-1 flex flex-col items-center justify-center p-6 border-2 border-dashed border-border/40 rounded-lg bg-muted/5 text-muted-foreground/60 text-sm">
                      <Icon className="w-8 h-8 mb-2 opacity-20" />
                      No items
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function WorkflowPage() {
  return (
    <Suspense fallback={<div className="text-center py-12 text-muted-foreground">Memuat workflow...</div>}>
      <WorkflowContent />
    </Suspense>
  );
}

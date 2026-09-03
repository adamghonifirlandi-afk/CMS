"use client";

import { useState } from "react";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  Plus, 
  Search, 
  Filter, 
  MoreHorizontal, 
  Edit3, 
  Trash2, 
  Eye,
  FileText,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const MOCK_MODELS = [
  { id: "all", name: "All Content", count: 248 },
  { id: "1", name: "Blog Posts", count: 42 },
  { id: "2", name: "Landing Pages", count: 12 },
  { id: "3", name: "Authors", count: 8 },
  { id: "4", name: "Case Studies", count: 15 },
  { id: "5", name: "Homepage", count: 1 },
  { id: "6", name: "Settings", count: 1 },
];

type EntryStatus = "published" | "draft" | "active" | "pending" | "archived";

const MOCK_ENTRIES = [
  { id: "e1", title: "Q3 Marketing Launch", type: "Landing Page", status: "published" as EntryStatus, author: "Sarah Jenkins", updatedAt: "2026-08-15T10:00:00Z" },
  { id: "e2", title: "Top 10 Features of 2026", type: "Blog Post", status: "draft" as EntryStatus, author: "Alex Chen", updatedAt: "2026-09-02T14:30:00Z" },
  { id: "e3", title: "Homepage Hero", type: "Component", status: "active" as EntryStatus, author: "Sarah Jenkins", updatedAt: "2026-09-01T09:15:00Z" },
  { id: "e4", title: "API Documentation V2", type: "Documentation", status: "pending" as EntryStatus, author: "David Kim", updatedAt: "2026-09-03T11:45:00Z" },
  { id: "e5", title: "Summer Sale Promo", type: "Campaign", status: "archived" as EntryStatus, author: "Emma Watson", updatedAt: "2026-07-20T16:20:00Z" },
  { id: "e6", title: "About Us Redesign", type: "Page", status: "published" as EntryStatus, author: "Michael Scott", updatedAt: "2026-08-28T08:30:00Z" },
  { id: "e7", title: "Customer Success Stories", type: "Blog Post", status: "published" as EntryStatus, author: "Alex Chen", updatedAt: "2026-08-10T13:10:00Z" },
  { id: "e8", title: "Sarah Jenkins (Author)", type: "Author", status: "active" as EntryStatus, author: "Admin", updatedAt: "2026-01-15T09:00:00Z" },
  { id: "e9", title: "Enterprise Pricing Tier", type: "Pricing", status: "draft" as EntryStatus, author: "David Kim", updatedAt: "2026-09-04T08:20:00Z" },
  { id: "e10", title: "Platform Security Overview", type: "Whitepaper", status: "pending" as EntryStatus, author: "Emma Watson", updatedAt: "2026-09-03T16:45:00Z" },
];

export default function ContentManagementPage() {
  const [selectedModel, setSelectedModel] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEntries, setSelectedEntries] = useState<Set<string>>(new Set());

  const toggleSelectAll = () => {
    if (selectedEntries.size === MOCK_ENTRIES.length) {
      setSelectedEntries(new Set());
    } else {
      setSelectedEntries(new Set(MOCK_ENTRIES.map(e => e.id)));
    }
  };

  const toggleSelect = (id: string) => {
    const next = new Set(selectedEntries);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedEntries(next);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="space-y-6 w-full max-w-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Content Workspace</h1>
          <p className="text-muted-foreground mt-1 text-sm">Manage and organize your content entries</p>
        </div>
        
        <div className="flex items-center gap-3">
          {selectedEntries.size > 0 && (
            <Button variant="secondary" className="bg-secondary text-secondary-foreground" size="sm">
              Bulk Actions ({selectedEntries.size})
            </Button>
          )}
          <Button size="sm">
            <Plus className="w-4 h-4 mr-2" />
            New Entry
          </Button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Sidebar Filters */}
        <div className="w-full md:w-56 shrink-0 space-y-6">
          <div>
            <h3 className="font-medium text-sm text-foreground mb-3 px-2">Content Types</h3>
            <div className="flex flex-col space-y-1">
              {MOCK_MODELS.map(model => (
                <button
                  key={model.id}
                  onClick={() => setSelectedModel(model.id)}
                  className={cn(
                    "flex items-center justify-between px-2 py-1.5 rounded-md text-sm transition-colors",
                    selectedModel === model.id 
                      ? "bg-primary/10 text-primary font-medium" 
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    <span>{model.name}</span>
                  </div>
                  <span className={cn(
                    "text-xs px-1.5 py-0.5 rounded-full",
                    selectedModel === model.id ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"
                  )}>
                    {model.count}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 bg-card rounded-xl border border-border shadow-sm overflow-hidden">
          {/* Top Bar */}
          <div className="p-4 border-b border-border flex flex-col sm:flex-row gap-4 justify-between items-center bg-muted/20">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search entries..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-9 bg-background"
              />
            </div>
            
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Button variant="outline" size="sm" className="h-9">
                <Filter className="w-4 h-4 mr-2" />
                Filter
              </Button>
              <Button variant="outline" size="sm" className="h-9">
                <ArrowUpDown className="w-4 h-4 mr-2" />
                Sort
              </Button>
            </div>
          </div>
          
          {/* Table */}
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30 hover:bg-muted/30 border-b border-border/50">
                  <TableHead className="w-12 text-center">
                    <input 
                      type="checkbox" 
                      className="rounded border-input bg-transparent text-primary focus:ring-1 focus:ring-primary h-4 w-4 align-middle"
                      checked={selectedEntries.size === MOCK_ENTRIES.length && MOCK_ENTRIES.length > 0}
                      onChange={toggleSelectAll}
                    />
                  </TableHead>
                  <TableHead className="font-medium text-foreground">Title</TableHead>
                  <TableHead className="font-medium text-foreground">Type</TableHead>
                  <TableHead className="font-medium text-foreground">Status</TableHead>
                  <TableHead className="font-medium text-foreground">Author</TableHead>
                  <TableHead className="font-medium text-foreground">Last Modified</TableHead>
                  <TableHead className="text-right font-medium text-foreground"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {MOCK_ENTRIES.map((entry) => {
                  const isSelected = selectedEntries.has(entry.id);
                  return (
                    <TableRow 
                      key={entry.id} 
                      className={cn(
                        "group hover:bg-muted/40 border-b border-border/40 transition-colors cursor-default",
                        isSelected && "bg-primary/5 hover:bg-primary/10"
                      )}
                    >
                      <TableCell className="text-center">
                        <input 
                          type="checkbox" 
                          className="rounded border-input bg-transparent text-primary focus:ring-1 focus:ring-primary h-4 w-4 align-middle"
                          checked={isSelected}
                          onChange={() => toggleSelect(entry.id)}
                        />
                      </TableCell>
                      <TableCell className="font-medium text-foreground">
                        <div className="flex flex-col">
                          <span>{entry.title}</span>
                          <span className="text-xs text-muted-foreground font-mono mt-0.5">{entry.id}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {entry.type}
                      </TableCell>
                      <TableCell>
                        <Badge variant={entry.status} className="capitalize">
                          {entry.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {entry.author}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {formatDate(entry.updatedAt)}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger className={cn(buttonVariants({ variant: "ghost", size: "icon" }), "h-8 w-8 text-muted-foreground hover:text-foreground focus-visible:ring-1 focus-visible:ring-primary outline-none")}>
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Open menu</span>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-40">
                            <DropdownMenuItem className="cursor-pointer" onClick={() => toast.success("Opening editor...")}>
                              <Edit3 className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem className="cursor-pointer">
                              <Eye className="mr-2 h-4 w-4" />
                              Preview
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {entry.status === "published" ? (
                              <DropdownMenuItem className="cursor-pointer text-amber-500 focus:text-amber-600 focus:bg-amber-50">
                                Unpublish
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem className="cursor-pointer text-emerald-500 focus:text-emerald-600 focus:bg-emerald-50">
                                Publish
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10" onClick={() => toast.success("Entry deleted")}>
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="p-4 border-t border-border flex items-center justify-between text-sm text-muted-foreground bg-muted/10">
            <div>
              Showing <span className="font-medium text-foreground">1</span> to <span className="font-medium text-foreground">10</span> of <span className="font-medium text-foreground">248</span> entries
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="h-8 w-8 p-0" disabled>
                <ChevronLeft className="h-4 w-4" />
                <span className="sr-only">Previous page</span>
              </Button>
              <div className="flex items-center gap-1">
                <Button variant="outline" size="sm" className="h-8 w-8 p-0 bg-primary text-primary-foreground border-primary hover:bg-primary/90 hover:text-primary-foreground">
                  1
                </Button>
                <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                  2
                </Button>
                <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                  3
                </Button>
                <span className="px-2">...</span>
                <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                  25
                </Button>
              </div>
              <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                <ChevronRight className="h-4 w-4" />
                <span className="sr-only">Next page</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

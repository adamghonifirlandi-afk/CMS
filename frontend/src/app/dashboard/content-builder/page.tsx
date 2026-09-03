"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Blocks, Plus, Search, Filter, Layers, LayoutTemplate, Box, Trash2, Copy, Edit2 } from "lucide-react";

interface Model {
  id: string;
  name: string;
  apiId: string;
  type: string;
  description: string;
  _count: {
    fields: number;
    entries: number;
  };
  lastUpdated: string;
}

const mockModels: Model[] = [
  {
    id: "1",
    name: "Blog Post",
    apiId: "blog-post",
    type: "COLLECTION",
    description: "Standard article for the company blog",
    _count: { fields: 12, entries: 45 },
    lastUpdated: "2 hours ago"
  },
  {
    id: "2",
    name: "Landing Page",
    apiId: "landing-page",
    type: "COLLECTION",
    description: "Marketing landing pages with flexible components",
    _count: { fields: 18, entries: 12 },
    lastUpdated: "5 hours ago"
  },
  {
    id: "3",
    name: "Product",
    apiId: "product",
    type: "COLLECTION",
    description: "E-commerce product catalog items",
    _count: { fields: 24, entries: 128 },
    lastUpdated: "1 day ago"
  },
  {
    id: "4",
    name: "Author",
    apiId: "author",
    type: "COLLECTION",
    description: "Writers and contributors for the blog",
    _count: { fields: 6, entries: 8 },
    lastUpdated: "3 days ago"
  },
  {
    id: "5",
    name: "Category",
    apiId: "category",
    type: "COLLECTION",
    description: "Taxonomy for grouping blog posts",
    _count: { fields: 4, entries: 15 },
    lastUpdated: "1 week ago"
  },
  {
    id: "6",
    name: "Global Navigation",
    apiId: "global-navigation",
    type: "SINGLE",
    description: "Header and footer menu links",
    _count: { fields: 8, entries: 1 },
    lastUpdated: "2 weeks ago"
  },
  {
    id: "7",
    name: "SEO Meta",
    apiId: "seo-meta",
    type: "COMPONENT",
    description: "Reusable SEO metadata fields for all pages",
    _count: { fields: 5, entries: 0 },
    lastUpdated: "1 month ago"
  }
];

export default function ContentBuilderPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredModels = mockModels.filter(m => m.name.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Blocks className="w-8 h-8 text-primary" /> Content Models
          </h1>
          <p className="text-muted-foreground mt-1">Design your content structures and API schema</p>
        </div>

        <Dialog>
          <DialogTrigger render={
            <Button>
              <Plus className="w-4 h-4 mr-2" /> Create Model
            </Button>
          } />
          <DialogContent className="sm:max-w-[475px]">
            <DialogHeader>
              <DialogTitle>Create Content Model</DialogTitle>
              <DialogDescription>
                Define a new structure for your content.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4 text-sm text-muted-foreground">
              (Creation form simulated in this demo)
            </div>
            <DialogFooter>
              <Button variant="outline">Cancel</Button>
              <Button>Create</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-card p-4 rounded-xl border border-border/50">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Search models..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-background"
          />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Button variant="outline" className="w-full sm:w-auto">
            <Filter className="w-4 h-4 mr-2" /> Filters
          </Button>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredModels.map((model) => (
          <Card key={model.id} className="group relative overflow-hidden border-border/50 hover:border-primary/30 hover:shadow-md transition-all flex flex-col bg-card">
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between mb-2">
                <Badge variant="outline" className={`font-medium ${
                  model.type === 'COLLECTION' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' : 
                  model.type === 'SINGLE' ? 'bg-orange-500/10 text-orange-500 border-orange-500/20' :
                  'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                }`}>
                  {model.type === 'COLLECTION' ? <Layers className="w-3 h-3 mr-1.5" /> : 
                   model.type === 'SINGLE' ? <LayoutTemplate className="w-3 h-3 mr-1.5" /> :
                   <Box className="w-3 h-3 mr-1.5" />}
                  {model.type === 'COLLECTION' ? 'Collection' : model.type === 'SINGLE' ? 'Single Type' : 'Component'}
                </Badge>
                
                {/* Hover Actions */}
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                    <Copy className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <CardTitle className="text-xl font-bold">{model.name}</CardTitle>
              <CardDescription className="text-sm line-clamp-1 mt-1">
                {model.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 pb-4">
               <div className="flex gap-4 mt-2">
                <div className="flex flex-col">
                  <span className="text-2xl font-bold">{model._count.fields}</span>
                  <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Fields</span>
                </div>
                {model.type !== 'COMPONENT' && (
                  <>
                    <div className="w-px bg-border/50"></div>
                    <div className="flex flex-col">
                      <span className="text-2xl font-bold">{model._count.entries}</span>
                      <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Entries</span>
                    </div>
                  </>
                )}
              </div>
              <div className="mt-6 text-xs text-muted-foreground flex items-center">
                <span className="bg-muted/50 px-2 py-1 rounded-md border border-border/50 font-mono">
                  api/{model.apiId}
                </span>
                <span className="ml-auto">Updated {model.lastUpdated}</span>
              </div>
            </CardContent>
            <CardFooter className="pt-0 pb-5 px-6 gap-3">
              <Button variant="outline" className="w-full bg-background/50 hover:bg-background">
                Edit Schema
              </Button>
              {model.type !== 'COMPONENT' && (
                <Button variant="default" className="w-full" render={<Link href={`/dashboard/content-management?model=${model.apiId}`} />}>
                  Manage Content
                </Button>
              )}
            </CardFooter>
          </Card>
        ))}
      </div>
      
      {filteredModels.length === 0 && (
        <div className="text-center py-20 text-muted-foreground bg-card border border-dashed rounded-xl">
          <Blocks className="w-12 h-12 mx-auto mb-4 opacity-20" />
          <p className="text-lg font-medium text-foreground">No content models found</p>
          <p className="text-sm">Try adjusting your search or create a new model.</p>
        </div>
      )}
    </div>
  );
}

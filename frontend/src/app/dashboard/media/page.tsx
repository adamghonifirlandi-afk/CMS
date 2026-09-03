"use client";

import { Suspense, useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Image as ImageIcon, UploadCloud, Folder, Search, Trash2, AlertCircle, FileText, Film, Download, Eye, File } from "lucide-react";
import api from "@/lib/api";
import { toast } from "sonner";
import { useActiveProject } from "@/components/active-project-provider";
import Link from "next/link";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";

interface MediaAsset {
  id: string;
  title: string;
  fileName: string;
  fileUrl: string;
  mimeType: string;
}

// Utility to mock size and date since backend doesn't provide it
const getMockDetails = (id: string) => {
  const hash = id.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const size = ((hash % 1000) / 100 + 0.5).toFixed(1) + " MB";
  const date = new Date(Date.now() - (hash % 10000000000)).toLocaleDateString("id-ID", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
  return { size, date };
};

const getFileTypeInfo = (mimeType: string) => {
  if (!mimeType) return { type: "other", icon: File, color: "text-muted-foreground", bg: "bg-muted" };
  if (mimeType.startsWith("image/")) return { type: "image", icon: ImageIcon, color: "text-primary", bg: "bg-primary/10" };
  if (mimeType.startsWith("video/")) return { type: "video", icon: Film, color: "text-orange-500", bg: "bg-orange-500/10" };
  if (mimeType.includes("pdf") || mimeType.includes("doc")) return { type: "document", icon: FileText, color: "text-blue-500", bg: "bg-blue-500/10" };
  return { type: "other", icon: File, color: "text-muted-foreground", bg: "bg-muted" };
};

function MediaContent() {
  const { activeProject, isLoading: isProjectLoading } = useActiveProject();
  const projectId = activeProject?.id;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [organizationId, setOrganizationId] = useState<string | null>(null);
  const [assets, setAssets] = useState<MediaAsset[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "images" | "documents" | "videos">("all");

  const handleDelete = async (assetId: string) => {
    if (!organizationId) return;
    try {
      await api.delete(`/media-assets/organizations/${organizationId}/media-assets/${assetId}`);
      setAssets((current) => current.filter((asset) => asset.id !== assetId));
      toast.success("Media berhasil dihapus");
    } catch {
      toast.error("Gagal menghapus media");
    }
  };

  useEffect(() => {
    if (!projectId) return;

    const load = async () => {
      setLoading(true);
      try {
        const projectRes = await api.get(`/projects/${projectId}`);
        const project = projectRes.data?.data || projectRes.data;
        const orgId = project?.organizationId || project?.organization?.id;
        if (!orgId) {
          toast.error("Organisasi proyek tidak ditemukan");
          return;
        }
        setOrganizationId(orgId);

        const mediaRes = await api.get(
          `/media-assets/organizations/${orgId}/media-assets`,
          { params: search ? { search } : {} }
        ).catch(() => ({ data: { data: { assets: [] } } }));
        const mediaData = mediaRes.data?.data;
        setAssets(mediaData?.assets || []);
      } catch {
        toast.error("Gagal memuat media library");
      } finally {
        setLoading(false);
      }
    };

    const debounce = setTimeout(() => {
      load();
    }, 500);

    return () => clearTimeout(debounce);
  }, [projectId, search]);

  const handleUpload = async (files: FileList | null) => {
    if (!files?.length || !organizationId) return;

    setUploading(true);
    try {
      const formData = new FormData();
      Array.from(files).forEach((file) => formData.append("files", file));

      await api.post(
        `/media-assets/organizations/${organizationId}/media-assets`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      toast.success("Upload berhasil");
      const mediaRes = await api.get(
        `/media-assets/organizations/${organizationId}/media-assets`
      );
      setAssets(mediaRes.data?.data?.assets || []);
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      toast.error(axiosErr.response?.data?.message || "Upload gagal — pastikan S3 dikonfigurasi");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const filteredAssets = assets.filter((asset) => {
    if (filter === "all") return true;
    const info = getFileTypeInfo(asset.mimeType);
    if (filter === "images") return info.type === "image";
    if (filter === "documents") return info.type === "document";
    if (filter === "videos") return info.type === "video";
    return true;
  });

  if (isProjectLoading) {
    return <div className="text-center py-12 text-muted-foreground">Memuat konteks proyek...</div>;
  }

  if (!projectId) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4 border rounded-xl bg-card border-dashed">
        <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center mb-4">
          <AlertCircle className="w-8 h-8 text-muted-foreground/50" />
        </div>
        <h2 className="text-xl font-semibold mb-2">Proyek Tidak Ditemukan</h2>
        <p className="text-muted-foreground text-sm max-w-sm text-center mb-8">
          Anda harus memilih proyek terlebih dahulu untuk melihat media library.
        </p>
        <Button render={<Link href="/dashboard/projects" />}>
          Kembali ke Proyek
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Media Library</h1>
          <p className="text-muted-foreground text-sm mt-1">Kelola dan atur semua aset digital Anda di satu tempat.</p>
        </div>

        <div>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            className="hidden"
            accept="image/*,video/*,.pdf,.doc,.docx"
            onChange={(e) => handleUpload(e.target.files)}
          />
          <Button
            disabled={uploading || !organizationId}
            onClick={() => fileInputRef.current?.click()}
          >
            <UploadCloud className="w-4 h-4 mr-2" />
            {uploading ? "Mengupload..." : "Upload Asset"}
          </Button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-card p-4 rounded-xl border border-border/50 shadow-sm">
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 hide-scrollbar">
          {(["all", "images", "documents", "videos"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
                filter === f
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Cari file..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-10 border-border/50 bg-background focus-visible:ring-primary/30 rounded-full"
          />
        </div>
      </div>

      {loading && assets.length === 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="animate-pulse bg-card rounded-xl border border-border/50 h-56"></div>
          ))}
        </div>
      ) : filteredAssets.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
          {filteredAssets.map((asset) => {
            const info = getFileTypeInfo(asset.mimeType);
            const Icon = info.icon;
            const { size, date } = getMockDetails(asset.id);

            return (
              <div key={asset.id} className="group flex flex-col bg-card border border-border/50 rounded-xl overflow-hidden hover:shadow-xl hover:border-primary/40 transition-all duration-300">
                {/* Thumbnail Area */}
                <div className="relative aspect-[4/3] w-full bg-muted/30 overflow-hidden flex items-center justify-center border-b border-border/50">
                  {info.type === "image" ? (
                    <img
                      src={asset.fileUrl}
                      alt={asset.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjOTQ5NGEzIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCI+PHJlY3QgeD0iMyIgeT0iMyIgd2lkdGg9IjE4IiBoZWlnaHQ9IjE4IiByeD0iMiIgcnk9IjIiPjwvcmVjdD48Y2lyY2xlIGN4PSI4LjUiIGN5PSI4LjUiIHI9IjEuNSI+PC9jaXJjbGU+PHBvbHlsaW5lIHBvaW50cz0iMjEgMTUgMTYgMTAgNSAyMSI+PC9wb2x5bGluZT48L3N2Zz4=';
                      }}
                    />
                  ) : (
                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${info.bg}`}>
                      <Icon className={`w-8 h-8 ${info.color}`} />
                    </div>
                  )}

                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col justify-center items-center gap-2 backdrop-blur-[2px]">
                    <div className="flex gap-2">
                      <Button size="icon" variant="secondary" className="h-9 w-9 rounded-full bg-white/10 hover:bg-white/20 text-white border-0" render={<a href={asset.fileUrl} target="_blank" rel="noreferrer" />}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="secondary" className="h-9 w-9 rounded-full bg-white/10 hover:bg-white/20 text-white border-0" render={<a href={asset.fileUrl} download={asset.fileName} />}>
                        <Download className="h-4 w-4" />
                      </Button>
                      <ConfirmationDialog
                        title="Hapus Media"
                        description={`Apakah Anda yakin ingin menghapus "${asset.fileName}"? Tindakan ini tidak dapat dibatalkan.`}
                        confirmText="Hapus"
                        variant="destructive"
                        onConfirm={() => handleDelete(asset.id)}
                        trigger={
                          <Button variant="destructive" size="icon" className="h-9 w-9 rounded-full">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        }
                      />
                    </div>
                  </div>
                  
                  {/* Badge Type */}
                  <div className="absolute top-2 left-2 px-2 py-1 rounded-md bg-background/90 backdrop-blur text-[10px] font-semibold tracking-wider uppercase border border-border/50 text-muted-foreground shadow-sm flex items-center gap-1">
                    <Icon className="w-3 h-3" />
                    {info.type}
                  </div>
                </div>

                {/* Details Area */}
                <div className="p-3.5 flex flex-col gap-1">
                  <p className="text-sm font-semibold truncate text-foreground" title={asset.fileName}>
                    {asset.fileName}
                  </p>
                  <div className="flex items-center justify-between text-xs text-muted-foreground mt-1">
                    <span>{size}</span>
                    <span>{date}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-24 px-4 border rounded-xl bg-card border-dashed">
          <div className="w-20 h-20 bg-muted/50 rounded-full flex items-center justify-center mb-4">
            <Folder className="w-10 h-10 text-muted-foreground/40" />
          </div>
          <h3 className="text-xl font-semibold mb-2">Belum Ada Media</h3>
          <p className="text-muted-foreground text-sm max-w-sm text-center mb-8">
            Upload gambar, dokumen, atau video untuk proyek ini. Memerlukan konfigurasi AWS S3 di backend.
          </p>
          <Button
            variant="outline"
            className="text-primary border-primary/20 hover:bg-primary/5 hover:text-primary"
            disabled={uploading}
            onClick={() => fileInputRef.current?.click()}
          >
            <UploadCloud className="w-4 h-4 mr-2" />
            Upload File Pertama
          </Button>
        </div>
      )}
    </div>
  );
}

export default function MediaPage() {
  return (
    <Suspense fallback={<div className="text-center py-20 text-muted-foreground">Memuat...</div>}>
      <MediaContent />
    </Suspense>
  );
}


"use client";

import { Suspense, useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Image as ImageIcon, UploadCloud, Folder, Search, Trash2, AlertCircle } from "lucide-react";
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

function MediaContent() {
  const { activeProject, isLoading: isProjectLoading } = useActiveProject();
  const projectId = activeProject?.id;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [organizationId, setOrganizationId] = useState<string | null>(null);
  const [assets, setAssets] = useState<MediaAsset[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [search, setSearch] = useState("");

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

    load();
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
        <Button className="bg-violet-600 hover:bg-violet-700 text-white shadow-md" render={<Link href="/dashboard/projects" />}>
          Kembali ke Proyek
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Media Library</h1>
          <p className="text-muted-foreground">Kelola aset gambar, video, dan dokumen Anda</p>
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
            className="bg-violet-600 hover:bg-violet-700 text-white shadow-md"
            disabled={uploading || !organizationId}
            onClick={() => fileInputRef.current?.click()}
          >
            <UploadCloud className="w-4 h-4 mr-2" />
            {uploading ? "Mengupload..." : "Upload Assets"}
          </Button>
        </div>
      </div>

      <div className="flex items-center bg-card p-3 rounded-lg border border-border/50 shadow-sm">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Cari media..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-background h-10 border-border/50 focus-visible:ring-violet-500/30"
          />
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20 text-muted-foreground">Memuat media...</div>
      ) : assets.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {assets.map((asset) => (
            <div key={asset.id} className="group relative border border-border/50 rounded-xl overflow-hidden bg-card hover:border-violet-500/50 hover:shadow-lg transition-all">
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity z-10 flex items-start justify-end p-2 pointer-events-none">
                <ConfirmationDialog
                  title="Hapus Media"
                  description={`Apakah Anda yakin ingin menghapus "${asset.fileName}"? Asset ini akan hilang selamanya.`}
                  confirmText="Hapus"
                  variant="destructive"
                  onConfirm={() => handleDelete(asset.id)}
                  trigger={
                    <Button variant="destructive" size="icon" className="h-8 w-8 pointer-events-auto" aria-label="Hapus media">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  }
                />
              </div>
              
              {asset.mimeType?.startsWith("image/") ? (
                <div className="relative aspect-square w-full bg-muted overflow-hidden">
                  <img
                    src={asset.fileUrl}
                    alt={asset.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="aspect-square w-full flex items-center justify-center bg-muted/50 border-b border-border/50">
                  <Folder className="w-10 h-10 text-muted-foreground/50" />
                </div>
              )}
              <div className="p-3 bg-card relative z-20">
                <p className="text-sm font-medium truncate text-foreground" title={asset.title}>{asset.title}</p>
                <p className="text-xs text-muted-foreground truncate mt-0.5" title={asset.fileName}>{asset.fileName}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 px-4 border rounded-xl bg-card border-dashed">
          <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center mb-4">
            <Folder className="w-8 h-8 text-muted-foreground/50" />
          </div>
          <h3 className="text-xl font-semibold mb-2">Media Library Kosong</h3>
          <p className="text-muted-foreground text-sm max-w-sm text-center mb-8">
            Upload gambar atau dokumen untuk proyek ini. Memerlukan konfigurasi AWS S3 di backend.
          </p>
          <Button
            variant="outline"
            className="text-violet-500 border-violet-500/20 hover:bg-violet-500/10"
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
    <Suspense fallback={<div className="text-center py-12">Memuat...</div>}>
      <MediaContent />
    </Suspense>
  );
}

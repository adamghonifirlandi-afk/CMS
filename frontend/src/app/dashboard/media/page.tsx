"use client";

import { Suspense, useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Image as ImageIcon, UploadCloud, Folder, Search } from "lucide-react";
import api from "@/lib/api";
import { toast } from "sonner";

interface MediaAsset {
  id: string;
  title: string;
  fileName: string;
  fileUrl: string;
  mimeType: string;
}

function MediaContent() {
  const searchParams = useSearchParams();
  const projectId = searchParams.get("projectId");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [organizationId, setOrganizationId] = useState<string | null>(null);
  const [assets, setAssets] = useState<MediaAsset[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [search, setSearch] = useState("");

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
        );
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

  if (!projectId) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <ImageIcon className="w-12 h-12 text-muted-foreground/50 mb-4" />
        <h2 className="text-xl font-semibold mb-2">Pilih Proyek</h2>
        <p className="text-muted-foreground mb-6">
          Harap pilih proyek terlebih dahulu untuk melihat media library.
        </p>
        <Button render={<a href="/dashboard/projects" />} className="bg-violet-600">
          Kembali ke Projects
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
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
            className="bg-violet-600 hover:bg-violet-700 text-white"
            disabled={uploading || !organizationId}
            onClick={() => fileInputRef.current?.click()}
          >
            <UploadCloud className="w-4 h-4 mr-2" />
            {uploading ? "Mengupload..." : "Upload Assets"}
          </Button>
        </div>
      </div>

      <div className="flex items-center bg-card p-2 rounded-lg border">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Cari media..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 bg-background h-9 text-sm"
          />
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-muted-foreground">Memuat...</div>
      ) : assets.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {assets.map((asset) => (
            <div key={asset.id} className="border rounded-lg overflow-hidden bg-card">
              {asset.mimeType?.startsWith("image/") ? (
                <img
                  src={asset.fileUrl}
                  alt={asset.title}
                  className="w-full h-32 object-cover"
                />
              ) : (
                <div className="h-32 flex items-center justify-center bg-muted">
                  <Folder className="w-8 h-8 text-muted-foreground" />
                </div>
              )}
              <div className="p-3">
                <p className="text-sm font-medium truncate">{asset.title}</p>
                <p className="text-xs text-muted-foreground truncate">{asset.fileName}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 border rounded-lg bg-muted/10 border-dashed">
          <Folder className="w-12 h-12 mx-auto text-muted-foreground/30 mb-4" />
          <h3 className="text-lg font-medium">Media Library Kosong</h3>
          <p className="text-muted-foreground text-sm max-w-sm mx-auto mt-1 mb-6">
            Upload memerlukan konfigurasi AWS S3 di backend production.
          </p>
          <Button
            variant="outline"
            className="text-violet-600 border-violet-200 hover:bg-violet-50"
            disabled={uploading}
            onClick={() => fileInputRef.current?.click()}
          >
            <UploadCloud className="w-4 h-4 mr-2" />
            Mulai Upload
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

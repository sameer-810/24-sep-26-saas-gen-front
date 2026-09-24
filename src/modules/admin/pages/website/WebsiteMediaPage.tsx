import { useRef, useState } from "react";
import { Check, Copy, UploadCloud } from "lucide-react";
import { getApiErrorMessage } from "@/shared/api/http";
import { toast } from "@/shared/lib/toast";
import { PageHeader } from "../../components/PageHeader";
import { EmptyState } from "../../components/EmptyState";
import { adminBtnPrimary, adminBtnSmall, adminPanel } from "../../components/AdminUi";
import { useUploadMedia } from "../../hooks/useAdminWebsite";
import type { MediaUpload } from "../../types";

const MAX_MB = 10;

function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error("Could not copy; select the URL and copy it manually");
    }
  }
  return (
    <button type="button" onClick={copy} className={adminBtnSmall} aria-label="Copy URL">
      {copied ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
      {copied ? "Copied" : "Copy"}
    </button>
  );
}

export function WebsiteMediaPage() {
  const upload = useUploadMedia();
  // ponytail: session-only list; there is no "list media" endpoint. Add one
  // and a query here when the library needs to outlive a page refresh.
  const [uploads, setUploads] = useState<(MediaUpload & { name: string })[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  async function onFile(file: File | undefined) {
    if (!file) return;
    if (file.size > MAX_MB * 1024 * 1024) {
      toast.error(`Files must be under ${MAX_MB} MB`);
      return;
    }
    try {
      const res = await upload.mutateAsync(file);
      setUploads((u) => [{ ...res, name: file.name }, ...u]);
      toast.success("Uploaded. Copy the URL into any image field.");
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    } finally {
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="space-y-8">
      <PageHeader
        crumbs={[{ label: "Website", to: "/admin/website" }, { label: "Media" }]}
        title="Media"
        subtitle="Upload images, then paste their URL into the hero, feature, benefit or settings image fields."
      />

      <div className={`${adminPanel} p-6`}>
        <label
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            onFile(e.dataTransfer.files?.[0]);
          }}
          className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-border px-6 py-12 text-center transition-colors hover:border-blue-400 hover:bg-blue-50/40 dark:hover:bg-blue-500/5"
        >
          <UploadCloud className="h-8 w-8 text-blue-600" aria-hidden="true" />
          <span className="mt-3 text-sm font-semibold">Drop an image here, or click to choose</span>
          <span className="mt-1 text-xs text-muted-foreground">
            PNG, JPG, WebP or SVG up to {MAX_MB} MB
          </span>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={(e) => onFile(e.target.files?.[0])}
            disabled={upload.isPending}
          />
          <span className={`${adminBtnPrimary} mt-5 ${upload.isPending ? "opacity-60" : ""}`}>
            {upload.isPending ? "Uploading…" : "Choose file"}
          </span>
        </label>
      </div>

      <div className={`${adminPanel} overflow-hidden`}>
        {uploads.length === 0 ? (
          <EmptyState
            title="Nothing uploaded yet"
            subtitle="Files you upload in this session are listed here with their URLs."
          />
        ) : (
          <ul className="divide-y divide-border">
            {uploads.map((u) => (
              <li key={u.url} className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center">
                <img
                  src={u.thumbnailUrl || u.url}
                  alt=""
                  className="h-20 w-28 shrink-0 rounded-lg border border-border bg-muted object-cover"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{u.name}</p>
                  <p className="mt-1 break-all font-mono text-xs text-muted-foreground">{u.url}</p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <CopyButton value={u.url} />
                  <a
                    href={u.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={adminBtnSmall}
                  >
                    Open
                  </a>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

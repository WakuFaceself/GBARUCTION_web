"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition, type FormEvent } from "react";

const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"] as const;
const MAX_FILE_SIZE = 10 * 1024 * 1024;

function formatError(message: string) {
  if (message === "invalid-upload-input") {
    return "Only JPG, PNG, WEBP, or GIF files up to 10MB are allowed.";
  }

  if (message === "upload-not-found") {
    return "The uploaded file could not be confirmed in storage yet. Please try again.";
  }

  if (message === "invalid-upload-object") {
    return "The uploaded file metadata did not match an allowed image object.";
  }

  if (message === "unauthorized") {
    return "Your admin session expired. Please log in again.";
  }

  return "Upload failed. Please try again.";
}

export function MediaUploader() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isUploading, setIsUploading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [altText, setAltText] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const fileSummary = useMemo(() => {
    if (!file) {
      return "Choose a cover, poster, or editorial image to upload into the shared media library.";
    }

    return `${file.name} · ${(file.size / 1024 / 1024).toFixed(2)} MB · ${file.type || "unknown type"}`;
  }, [file]);

  async function handleUpload(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!file) {
      setErrorMessage("Choose an image before uploading.");
      return;
    }

    if (!ACCEPTED_TYPES.includes(file.type as (typeof ACCEPTED_TYPES)[number]) || file.size > MAX_FILE_SIZE) {
      setErrorMessage("Only JPG, PNG, WEBP, or GIF files up to 10MB are allowed.");
      return;
    }

    try {
      setIsUploading(true);

      const presignResponse = await fetch("/api/uploads/presign", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fileName: file.name,
          contentType: file.type,
          byteSize: file.size,
          altText: altText.trim() || undefined,
        }),
      });

      const presignPayload = (await presignResponse.json()) as
        | {
            ok: true;
            objectKey: string;
            uploadUrl: string;
            fileName: string;
            contentType: string;
            byteSize: number;
            altText: string | null;
          }
        | { ok: false; reason: string };

      if (!presignResponse.ok || !presignPayload.ok) {
        throw new Error(!presignPayload.ok ? presignPayload.reason : "presign-failed");
      }

      const storageResponse = await fetch(presignPayload.uploadUrl, {
        method: "PUT",
        headers: {
          "Content-Type": file.type,
        },
        body: file,
      });

      if (!storageResponse.ok) {
        throw new Error("storage-upload-failed");
      }

      const finalizeResponse = await fetch("/api/uploads/finalize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          objectKey: presignPayload.objectKey,
          altText: presignPayload.altText ?? undefined,
        }),
      });

      const finalizePayload = (await finalizeResponse.json()) as { ok: boolean; reason?: string };

      if (!finalizeResponse.ok || !finalizePayload.ok) {
        throw new Error(finalizePayload.reason ?? "finalize-failed");
      }

      setFile(null);
      setAltText("");
      setSuccessMessage("Asset uploaded and finalized in the media library.");
      startTransition(() => {
        router.refresh();
      });
    } catch (error) {
      setErrorMessage(formatError(error instanceof Error ? error.message : "unknown-error"));
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <form onSubmit={handleUpload} className="space-y-4">
      <div className="space-y-2">
        <label
          htmlFor="media-upload-file"
          className="block text-xs uppercase tracking-[0.3em] text-[var(--muted)]"
        >
          Asset file
        </label>
        <input
          id="media-upload-file"
          type="file"
          accept={ACCEPTED_TYPES.join(",")}
          onChange={(event) => {
            setFile(event.target.files?.[0] ?? null);
            setErrorMessage(null);
            setSuccessMessage(null);
          }}
          className="block w-full rounded-3xl border border-[var(--line)] bg-black/20 px-4 py-3 text-sm file:mr-4 file:rounded-full file:border-0 file:bg-[var(--accent)] file:px-3 file:py-2 file:text-sm file:font-semibold file:text-[#120a06]"
        />
        <p className="text-sm leading-6 text-[var(--muted)]">{fileSummary}</p>
      </div>

      <label className="block space-y-2">
        <span className="block text-xs uppercase tracking-[0.3em] text-[var(--muted)]">Alt text</span>
        <input
          value={altText}
          onChange={(event) => {
            setAltText(event.target.value);
            setErrorMessage(null);
            setSuccessMessage(null);
          }}
          maxLength={240}
          placeholder="Optional description for covers, posters, and scans"
          className="w-full rounded-3xl border border-[var(--line)] bg-black/20 px-4 py-3 text-sm outline-none transition-colors placeholder:text-[var(--muted)] focus:border-[var(--accent)]"
        />
      </label>

      {errorMessage ? (
        <p className="rounded-2xl border border-[#ff8a63]/30 bg-[#ff8a63]/10 px-4 py-3 text-sm text-[#ffd5c4]">
          {errorMessage}
        </p>
      ) : null}

      {successMessage ? (
        <p className="rounded-2xl border border-[#8ec89a]/30 bg-[#8ec89a]/10 px-4 py-3 text-sm text-[#ddffe4]">
          {successMessage}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={isUploading || isPending}
        className="rounded-full border border-[var(--accent)] bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-[#120a06] transition-colors hover:bg-[#ff7b53] disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isUploading ? "Uploading..." : isPending ? "Refreshing library..." : "Upload asset"}
      </button>
    </form>
  );
}

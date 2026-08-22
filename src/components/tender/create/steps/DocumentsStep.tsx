"use client";

import React, { useState } from "react";
import { CheckCircle2, FileText, Loader2,Trash2, Upload } from "lucide-react";
import { useFormContext } from "react-hook-form";
import { toast } from "sonner";

import { tenderApi } from "@/features/tenders";

interface DocumentsStepProps {
  draftTenderId?: string | null;
  ensureDraftCreated?: () => Promise<string>;
  uploadedDocs?: any[];
  setUploadedDocs?: React.Dispatch<React.SetStateAction<any[]>>;
}

const DOCUMENT_TYPES = [
  { key: "Tender Document", label: "Tender Document", required: true },
  { key: "BOQ File", label: "BOQ File", required: false },
  {
    key: "Technical Specification",
    label: "Technical Specification",
    required: false,
  },
  { key: "Drawings", label: "Drawings", required: false },
  { key: "NIT Document", label: "NIT Document", required: false },
  { key: "Terms & Conditions", label: "Terms & Conditions", required: false },
  {
    key: "Additional Document",
    label: "Additional Documents",
    required: false,
  },
];

export default function DocumentsStep({
  draftTenderId,
  ensureDraftCreated,
  uploadedDocs = [],
  setUploadedDocs,
}: DocumentsStepProps) {
  const { register } = useFormContext();
  const [uploading, setUploading] = useState<Record<string, boolean>>({});

  async function handleFileUpload(file: File, documentType: string) {
    if (!file) return;

    setUploading((prev) => ({ ...prev, [documentType]: true }));

    try {
      // 1. Create tender draft first if not yet created
      const tenderId = ensureDraftCreated
        ? await ensureDraftCreated()
        : draftTenderId;

      if (!tenderId) {
        throw new Error("Failed to initialize draft tender ID for upload");
      }

      if (!tenderId) {
        throw new Error("Failed to initialize draft tender ID for upload");
      }

      // 2. Request S3 presigned upload URL from backend via tenderApi
      const presignedRes = await tenderApi.adminGetUploadUrl({
        fileName: file.name,
        documentType,
      });

      if (!presignedRes.data.success || !presignedRes.data.data) {
        throw new Error(
          presignedRes.data.message ||
            "Failed to generate presigned S3 upload URL",
        );
      }

      const { uploadUrl, documentKey } = presignedRes.data.data;

      // 3. Browser direct HTTP PUT upload to S3 presigned URL
      const putRes = await fetch(uploadUrl, {
        method: "PUT",
        headers: {
          "Content-Type": file.type || "application/octet-stream",
        },
        body: file,
      });

      if (!putRes.ok) {
        throw new Error("Direct S3 file upload failed");
      }

      // 4. Store document metadata in PostgreSQL linked to draft version via tenderApi
      const regRes = await tenderApi.adminRegisterDocument(tenderId, {
        documentType,
        s3Key: documentKey,
        bucket: "rfpnexa-tenders",
        originalName: file.name,
        mimeType: file.type || "application/pdf",
        fileSize: file.size,
        isPublic: true,
      });

      if (!regRes.data.success) {
        throw new Error(
          regRes.data.message ||
            "Failed to register document metadata in PostgreSQL",
        );
      }

      const newDoc = regRes.data.data || regRes.data;

      if (setUploadedDocs) {
        setUploadedDocs((prev) => [...prev, newDoc]);
      }
      toast.success(`${file.name} uploaded & linked to draft version!`);
    } catch (err: any) {
      console.error("Immediate document upload error:", err);
      toast.error(err.message || "Upload failed");
    } finally {
      setUploading((prev) => ({ ...prev, [documentType]: false }));
    }
  }

  async function handleDeleteDocument(docId: string) {
    try {
      const res = await tenderApi.adminDeleteDocument(docId);
      if (res.data.success) {
        if (setUploadedDocs) {
          setUploadedDocs((prev) => prev.filter((d) => d.id !== docId));
        }
        toast.success("Document removed successfully");
      }
    } catch (err) {
      toast.error("Failed to remove document");
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-semibold">Tender Documents</h2>
        <p className="mt-2 text-text-light text-sm">
          Files are uploaded immediately to S3 using secure presigned URLs and
          stored as metadata linked to the draft version in PostgreSQL.
        </p>
      </div>

      {/* Document Upload Slots */}
      <div className="grid gap-6 md:grid-cols-2">
        {DOCUMENT_TYPES.map((docType) => {
          const matchingDocs = uploadedDocs.filter(
            (d) => d.documentType === docType.key,
          );
          const isBusy = uploading[docType.key];

          return (
            <div
              key={docType.key}
              className="p-5 rounded-2xl border border-border bg-background space-y-3"
            >
              <div className="flex items-center justify-between">
                <label className="text-sm font-semibold text-text flex items-center gap-1.5">
                  <FileText className="h-4 w-4 text-primary" />
                  {docType.label}{" "}
                  {docType.required && <span className="text-red-500">*</span>}
                </label>

                {matchingDocs.length > 0 ? (
                  <span className="text-xs font-semibold text-emerald-600 bg-emerald-500/10 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                    <CheckCircle2 size={12} /> {matchingDocs.length} Uploaded
                  </span>
                ) : (
                  <span className="text-xs text-text-light">
                    {docType.required ? "Required" : "Optional"}
                  </span>
                )}
              </div>

              {/* Upload Input Button */}
              <div className="relative">
                <input
                  type="file"
                  id={`file-${docType.key}`}
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileUpload(file, docType.key);
                    e.target.value = "";
                  }}
                  disabled={isBusy}
                />
                <label
                  htmlFor={`file-${docType.key}`}
                  className={`flex items-center justify-center gap-2 p-3 rounded-xl border border-dashed text-xs font-semibold cursor-pointer transition ${
                    isBusy
                      ? "border-primary bg-primary/5 text-primary opacity-75 pointer-events-none"
                      : "border-border hover:border-primary hover:bg-primary/5 text-text"
                  }`}
                >
                  {isBusy ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin text-primary" />
                      <span>Uploading directly to S3...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 text-primary" />
                      <span>Select & Upload {docType.label}</span>
                    </>
                  )}
                </label>
              </div>

              {/* Uploaded File Items */}
              {matchingDocs.length > 0 && (
                <div className="space-y-2 pt-1">
                  {matchingDocs.map((doc) => (
                    <div
                      key={doc.id}
                      className="flex items-center justify-between p-2.5 rounded-xl bg-surface border border-border text-xs"
                    >
                      <div className="min-w-0 flex-1 pr-2">
                        <p className="font-semibold text-text truncate">
                          {doc.documentOriginalName || doc.originalName}
                        </p>
                        <p className="text-[10px] text-text-light">
                          {doc.fileSize
                            ? `${(doc.fileSize / 1024).toFixed(1)} KB`
                            : "S3 Direct Upload"}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDeleteDocument(doc.id)}
                        className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-500/10 transition shrink-0"
                        title="Remove Document"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Internal Notes */}
      <div>
        <label className="mb-2 block text-sm font-semibold text-text">
          Internal Notes
        </label>
        <textarea
          rows={4}
          placeholder="Add any internal documentation notes for reviewers..."
          {...register("internalNotes")}
          className="w-full rounded-xl border border-border bg-surface p-4 text-text text-sm outline-none focus:border-primary font-normal leading-normal"
        />
      </div>
    </div>
  );
}

"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { CustomerDocument } from "@/types/database";
import { format } from "date-fns";
import { FileImage, FileText, Camera, PenTool } from "lucide-react";

interface DocumentsTabProps {
  documents: CustomerDocument[];
}

function getDocumentIcon(type: string) {
  switch (type) {
    case "nid_front":
    case "nid_back":
      return FileText;
    case "photograph":
      return Camera;
    case "signature":
      return PenTool;
    default:
      return FileImage;
  }
}

function getDocumentLabel(type: string) {
  switch (type) {
    case "nid_front":
      return "NID Front";
    case "nid_back":
      return "NID Back";
    case "photograph":
      return "Photograph";
    case "signature":
      return "Signature";
    case "tin_certificate":
      return "TIN Certificate";
    case "trade_license":
      return "Trade License";
    default:
      return "Other Document";
  }
}

function formatFileSize(bytes: number | null) {
  if (bytes == null) return "N/A";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function DocumentsTab({ documents }: DocumentsTabProps) {
  if (documents.length === 0) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <FileImage className="mx-auto size-12 text-muted-foreground/50" />
            <p className="mt-2 text-sm text-muted-foreground">No documents uploaded yet.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {documents.map((doc) => {
        const Icon = getDocumentIcon(doc.document_type);
        return (
          <Card key={doc.id}>
            <CardContent className="p-0">
              {/* Placeholder thumbnail */}
              <div className="flex h-40 items-center justify-center rounded-t-xl bg-muted/50">
                <Icon className="size-16 text-muted-foreground/30" />
              </div>
              <div className="space-y-2 p-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium">{getDocumentLabel(doc.document_type)}</h4>
                  <Badge variant="outline" className="text-xs">
                    {doc.mime_type?.split("/")[1]?.toUpperCase() || "FILE"}
                  </Badge>
                </div>
                <div className="space-y-1 text-xs text-muted-foreground">
                  <p>Uploaded: {format(new Date(doc.created_at), "MMM dd, yyyy")}</p>
                  <p>Size: {formatFileSize(doc.file_size)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

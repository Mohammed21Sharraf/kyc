"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Info, ArrowRight, ArrowLeft, Upload, X, ImageIcon } from "lucide-react";

export interface Step2Data {
  nidFront: File | null;
  nidBack: File | null;
}

interface Step2NIDScanProps {
  onNext: (data: Step2Data) => void;
  onBack: () => void;
  defaultValues?: Partial<Step2Data>;
}

function ImageUploadArea({
  label,
  file,
  onFileChange,
  onRemove,
}: {
  label: string;
  file: File | null;
  onFileChange: (file: File) => void;
  onRemove: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const handleFile = (f: File) => {
    onFileChange(f);
    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result as string);
    reader.readAsDataURL(f);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f && f.type.startsWith("image/")) {
      handleFile(f);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) handleFile(f);
  };

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {preview || file ? (
        <div className="relative rounded-lg border bg-muted/30 p-2">
          {preview && (
            <img
              src={preview}
              alt={label}
              className="mx-auto max-h-48 rounded-md object-contain"
            />
          )}
          {!preview && file && (
            <div className="flex items-center justify-center gap-2 py-8 text-sm text-muted-foreground">
              <ImageIcon className="size-5" />
              {file.name}
            </div>
          )}
          <button
            type="button"
            onClick={() => {
              onRemove();
              setPreview(null);
              if (inputRef.current) inputRef.current.value = "";
            }}
            className="absolute top-2 right-2 rounded-full bg-background p-1 ring-1 ring-foreground/10 transition-colors hover:bg-muted"
          >
            <X className="size-4" />
          </button>
        </div>
      ) : (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed py-10 transition-colors ${
            dragOver
              ? "border-primary bg-primary/5"
              : "border-muted-foreground/25 hover:border-muted-foreground/50"
          }`}
        >
          <Upload className="size-8 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            Drag & drop or click to upload
          </p>
          <p className="text-xs text-muted-foreground/70">
            Accepts image files (JPG, PNG, etc.)
          </p>
        </div>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleInputChange}
      />
    </div>
  );
}

export function Step2NIDScan({ onNext, onBack, defaultValues }: Step2NIDScanProps) {
  const [nidFront, setNidFront] = useState<File | null>(
    defaultValues?.nidFront ?? null
  );
  const [nidBack, setNidBack] = useState<File | null>(
    defaultValues?.nidBack ?? null
  );
  const [errors, setErrors] = useState<{ front?: string; back?: string }>({});

  const handleSubmit = () => {
    const newErrors: typeof errors = {};
    if (!nidFront) newErrors.front = "NID Front image is required";
    if (!nidBack) newErrors.back = "NID Back image is required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onNext({ nidFront, nidBack });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>NID Image Upload</CardTitle>
        <CardDescription>
          Upload front and back images of the National ID card
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Info Box */}
          <div className="flex items-start gap-3 rounded-lg border border-blue-200 bg-blue-50 p-3 dark:border-blue-900 dark:bg-blue-950/50">
            <Info className="mt-0.5 size-4 shrink-0 text-blue-600 dark:text-blue-400" />
            <p className="text-sm text-blue-700 dark:text-blue-300">
              OCR will extract data from NID images (simulated in Phase 1).
            </p>
          </div>

          {/* NID Front */}
          <div>
            <ImageUploadArea
              label="NID Front *"
              file={nidFront}
              onFileChange={(f) => {
                setNidFront(f);
                setErrors((prev) => ({ ...prev, front: undefined }));
              }}
              onRemove={() => setNidFront(null)}
            />
            {errors.front && (
              <p className="mt-1 text-xs text-destructive">{errors.front}</p>
            )}
          </div>

          {/* NID Back */}
          <div>
            <ImageUploadArea
              label="NID Back *"
              file={nidBack}
              onFileChange={(f) => {
                setNidBack(f);
                setErrors((prev) => ({ ...prev, back: undefined }));
              }}
              onRemove={() => setNidBack(null)}
            />
            {errors.back && (
              <p className="mt-1 text-xs text-destructive">{errors.back}</p>
            )}
          </div>

          {/* Navigation */}
          <div className="flex justify-between pt-4">
            <Button type="button" variant="outline" size="lg" onClick={onBack}>
              <ArrowLeft className="size-4" />
              Back
            </Button>
            <Button type="button" size="lg" onClick={handleSubmit}>
              Continue
              <ArrowRight className="size-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

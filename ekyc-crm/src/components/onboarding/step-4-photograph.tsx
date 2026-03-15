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
import { ArrowRight, ArrowLeft, Upload, X, Camera, Info } from "lucide-react";

export interface Step4Data {
  photograph: File | null;
}

interface Step4PhotographProps {
  onNext: (data: Step4Data) => void;
  onBack: () => void;
  defaultValues?: Partial<Step4Data>;
}

export function Step4Photograph({
  onNext,
  onBack,
  defaultValues,
}: Step4PhotographProps) {
  const [photograph, setPhotograph] = useState<File | null>(
    defaultValues?.photograph ?? null
  );
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (f: File) => {
    setPhotograph(f);
    setError(null);
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

  const handleRemove = () => {
    setPhotograph(null);
    setPreview(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  const handleSubmit = () => {
    if (!photograph) {
      setError("Photograph is required");
      return;
    }
    onNext({ photograph });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Customer Photograph</CardTitle>
        <CardDescription>
          Upload a recent photograph of the customer
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Guidelines */}
          <div className="flex items-start gap-3 rounded-lg border border-blue-200 bg-blue-50 p-3 dark:border-blue-900 dark:bg-blue-950/50">
            <Info className="mt-0.5 size-4 shrink-0 text-blue-600 dark:text-blue-400" />
            <div className="text-sm text-blue-700 dark:text-blue-300">
              <p className="font-medium">Photo Guidelines:</p>
              <ul className="mt-1 list-inside list-disc space-y-0.5 text-xs">
                <li>Photo should be recent and clear</li>
                <li>Front-facing with neutral expression</li>
                <li>Plain background preferred</li>
                <li>In Phase 2, live camera capture will be supported</li>
              </ul>
            </div>
          </div>

          {/* Photo Upload */}
          <div className="space-y-2">
            <Label>
              Photograph <span className="text-destructive">*</span>
            </Label>

            {preview ? (
              <div className="relative mx-auto max-w-xs rounded-lg border bg-muted/30 p-4">
                <img
                  src={preview}
                  alt="Customer photograph"
                  className="mx-auto max-h-64 rounded-md object-contain"
                />
                <button
                  type="button"
                  onClick={handleRemove}
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
                className={`flex cursor-pointer flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed py-14 transition-colors ${
                  dragOver
                    ? "border-primary bg-primary/5"
                    : "border-muted-foreground/25 hover:border-muted-foreground/50"
                }`}
              >
                <div className="rounded-full bg-muted p-3">
                  <Camera className="size-8 text-muted-foreground" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium text-muted-foreground">
                    Drag & drop or click to upload
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground/70">
                    Accepts image files (JPG, PNG, etc.)
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    inputRef.current?.click();
                  }}
                >
                  <Upload className="size-4" />
                  Choose File
                </Button>
              </div>
            )}

            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleInputChange}
            />
            {error && (
              <p className="text-xs text-destructive">{error}</p>
            )}
          </div>

          {/* Navigation */}
          <div className="flex justify-between pt-4">
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={onBack}
            >
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

"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ArrowRight, ArrowLeft, Upload, X, PenTool, Info } from "lucide-react";

export interface Step5Data {
  signature: File | null;
  signatureType: "wet" | "electronic" | "digital";
}

interface Step5SignatureProps {
  onNext: (data: Step5Data) => void;
  onBack: () => void;
  defaultValues?: Partial<Step5Data>;
}

export function Step5Signature({
  onNext,
  onBack,
  defaultValues,
}: Step5SignatureProps) {
  const [signature, setSignature] = useState<File | null>(
    defaultValues?.signature ?? null
  );
  const [signatureType, setSignatureType] = useState<Step5Data["signatureType"]>(
    defaultValues?.signatureType ?? "wet"
  );
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (f: File) => {
    setSignature(f);
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
    setSignature(null);
    setPreview(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  const handleSubmit = () => {
    if (!signature) {
      setError("Signature image is required");
      return;
    }
    onNext({ signature, signatureType });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Signature Capture</CardTitle>
        <CardDescription>
          Upload the customer&apos;s signature image
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Guidelines */}
          <div className="flex items-start gap-3 rounded-lg border border-blue-200 bg-blue-50 p-3 dark:border-blue-900 dark:bg-blue-950/50">
            <Info className="mt-0.5 size-4 shrink-0 text-blue-600 dark:text-blue-400" />
            <div className="text-sm text-blue-700 dark:text-blue-300">
              <p className="font-medium">Signature Requirements:</p>
              <ul className="mt-1 list-inside list-disc space-y-0.5 text-xs">
                <li>Signature should be on a plain white background</li>
                <li>Use dark ink (black or blue)</li>
                <li>Ensure the signature is clear and not smudged</li>
                <li>The signature must match the account holder&apos;s identity</li>
              </ul>
            </div>
          </div>

          {/* Signature Type */}
          <div className="space-y-3">
            <Label>Signature Type</Label>
            <RadioGroup
              value={signatureType}
              onValueChange={(val) =>
                setSignatureType(val as Step5Data["signatureType"])
              }
            >
              <div className="flex gap-6">
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="wet" />
                  <Label className="font-normal">Wet Signature</Label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="electronic" />
                  <Label className="font-normal">Electronic Signature</Label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="digital" />
                  <Label className="font-normal">Digital Signature</Label>
                </div>
              </div>
            </RadioGroup>
          </div>

          {/* Signature Upload */}
          <div className="space-y-2">
            <Label>
              Signature Image <span className="text-destructive">*</span>
            </Label>

            {preview ? (
              <div className="relative mx-auto max-w-sm rounded-lg border bg-white p-4 dark:bg-muted/30">
                <img
                  src={preview}
                  alt="Signature"
                  className="mx-auto max-h-40 object-contain"
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
                className={`flex cursor-pointer flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed py-12 transition-colors ${
                  dragOver
                    ? "border-primary bg-primary/5"
                    : "border-muted-foreground/25 hover:border-muted-foreground/50"
                }`}
              >
                <div className="rounded-full bg-muted p-3">
                  <PenTool className="size-8 text-muted-foreground" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium text-muted-foreground">
                    Drag & drop or click to upload signature
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

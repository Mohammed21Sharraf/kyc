"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ArrowLeft,
  CheckCircle2,
  Shield,
  User,
  FileText,
  ImageIcon,
} from "lucide-react";
import type { Step1Data } from "./step-1-nid";
import type { Step2Data } from "./step-2-nid-scan";
import type { Step3Data } from "./step-3-customer-info";
import type { Step4Data } from "./step-4-photograph";
import type { Step5Data } from "./step-5-signature";

export interface AllFormData {
  step1: Step1Data;
  step2: Step2Data;
  step3: Step3Data;
  step4: Step4Data;
  step5: Step5Data;
}

interface ScreeningCheck {
  id: string;
  label: string;
  description: string;
  status: "clear" | "flagged";
  notes: string;
}

interface Step6ScreeningProps {
  onSubmit: (data: {
    screeningChecks: ScreeningCheck[];
  }) => void;
  onBack: () => void;
  allFormData: AllFormData;
}

const INITIAL_CHECKS: ScreeningCheck[] = [
  {
    id: "unscr",
    label: "UN Security Council Resolution Sanctions (UNSCR)",
    description: "Check against UN sanctions list",
    status: "clear",
    notes: "",
  },
  {
    id: "pep",
    label: "Influential Person (IP/PEP) Check",
    description: "Politically Exposed Person screening",
    status: "clear",
    notes: "",
  },
  {
    id: "adverse_media",
    label: "Adverse Media Screening",
    description: "Check for negative news or media reports",
    status: "clear",
    notes: "",
  },
  {
    id: "beneficial_ownership",
    label: "Beneficial Ownership Check",
    description: "Verify ultimate beneficial ownership",
    status: "clear",
    notes: "",
  },
];

export function Step6Screening({
  onSubmit,
  onBack,
  allFormData,
}: Step6ScreeningProps) {
  const [checks, setChecks] = useState<ScreeningCheck[]>(INITIAL_CHECKS);

  const updateCheck = (
    id: string,
    field: "status" | "notes",
    value: string
  ) => {
    setChecks((prev) =>
      prev.map((c) => (c.id === id ? { ...c, [field]: value } : c))
    );
  };

  const { step1, step3, step5 } = allFormData;

  const channelLabel: Record<string, string> = {
    branch: "Branch",
    agent_banking: "Agent Banking",
    digital: "Digital",
  };

  const genderLabel: Record<string, string> = {
    male: "Male",
    female: "Female",
    third_gender: "Third Gender",
  };

  const signatureTypeLabel: Record<string, string> = {
    wet: "Wet Signature",
    electronic: "Electronic Signature",
    digital: "Digital Signature",
  };

  return (
    <div className="space-y-6">
      {/* Screening Checklist */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="size-5" />
            Screening Checklist
          </CardTitle>
          <CardDescription>
            Verify compliance screenings before completing onboarding
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {checks.map((check) => (
              <div key={check.id} className="space-y-3 rounded-lg border p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h4 className="text-sm font-medium">{check.label}</h4>
                    <p className="text-xs text-muted-foreground">
                      {check.description}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <Checkbox
                        checked={check.status === "clear"}
                        onCheckedChange={(checked: boolean) =>
                          updateCheck(
                            check.id,
                            "status",
                            checked ? "clear" : "flagged"
                          )
                        }
                      />
                      <Label className="text-xs font-normal">Clear</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Checkbox
                        checked={check.status === "flagged"}
                        onCheckedChange={(checked: boolean) =>
                          updateCheck(
                            check.id,
                            "status",
                            checked ? "flagged" : "clear"
                          )
                        }
                      />
                      <Label className="text-xs font-normal">Flagged</Label>
                    </div>
                    <Badge
                      variant={
                        check.status === "clear" ? "secondary" : "destructive"
                      }
                    >
                      {check.status === "clear" ? "Clear" : "Flagged"}
                    </Badge>
                  </div>
                </div>
                <Textarea
                  placeholder="Add notes (optional)..."
                  value={check.notes}
                  onChange={(e) =>
                    updateCheck(check.id, "notes", e.target.value)
                  }
                  className="min-h-10"
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Review Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="size-5" />
            Review Summary
          </CardTitle>
          <CardDescription>
            Review all customer information before completing onboarding
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* NID Verification */}
            <section className="space-y-3">
              <h4 className="text-sm font-semibold">NID Verification</h4>
              <Separator />
              <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm md:grid-cols-3">
                <div>
                  <span className="text-muted-foreground">NID Number:</span>
                  <p className="font-medium">{step1.nidNumber}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Date of Birth:</span>
                  <p className="font-medium">{step1.dateOfBirth}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">KYC Tier:</span>
                  <p className="font-medium capitalize">{step1.kycTier}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">
                    Verification Model:
                  </span>
                  <p className="font-medium capitalize">
                    {step1.verificationModel.replace("_", " ")}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">Channel:</span>
                  <p className="font-medium">
                    {channelLabel[step1.channel] || step1.channel}
                  </p>
                </div>
              </div>
            </section>

            {/* NID Documents */}
            <section className="space-y-3">
              <h4 className="text-sm font-semibold">NID Documents</h4>
              <Separator />
              <div className="flex gap-4">
                <div className="flex items-center gap-2 rounded-md border bg-muted/30 px-3 py-2 text-sm">
                  <ImageIcon className="size-4 text-muted-foreground" />
                  <span>NID Front uploaded</span>
                  <CheckCircle2 className="size-4 text-green-600" />
                </div>
                <div className="flex items-center gap-2 rounded-md border bg-muted/30 px-3 py-2 text-sm">
                  <ImageIcon className="size-4 text-muted-foreground" />
                  <span>NID Back uploaded</span>
                  <CheckCircle2 className="size-4 text-green-600" />
                </div>
              </div>
            </section>

            {/* Customer Info */}
            <section className="space-y-3">
              <h4 className="flex items-center gap-2 text-sm font-semibold">
                <User className="size-4" />
                Customer Information
              </h4>
              <Separator />
              <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm md:grid-cols-3">
                <div>
                  <span className="text-muted-foreground">Name (EN):</span>
                  <p className="font-medium">{step3.nameEn}</p>
                </div>
                {step3.nameBn && (
                  <div>
                    <span className="text-muted-foreground">Name (BN):</span>
                    <p className="font-medium">{step3.nameBn}</p>
                  </div>
                )}
                <div>
                  <span className="text-muted-foreground">
                    Father&apos;s Name:
                  </span>
                  <p className="font-medium">{step3.fatherNameEn}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">
                    Mother&apos;s Name:
                  </span>
                  <p className="font-medium">{step3.motherNameEn}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Gender:</span>
                  <p className="font-medium">
                    {genderLabel[step3.gender] || step3.gender}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">Date of Birth:</span>
                  <p className="font-medium">{step3.dateOfBirth}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Mobile:</span>
                  <p className="font-medium">{step3.mobileNumber}</p>
                </div>
                {step3.email && (
                  <div>
                    <span className="text-muted-foreground">Email:</span>
                    <p className="font-medium">{step3.email}</p>
                  </div>
                )}
                <div>
                  <span className="text-muted-foreground">Profession:</span>
                  <p className="font-medium">{step3.profession}</p>
                </div>
              </div>

              <div className="mt-2 grid grid-cols-1 gap-4 text-sm md:grid-cols-2">
                <div>
                  <span className="text-muted-foreground">
                    Present Address:
                  </span>
                  <p className="font-medium">{step3.presentAddress}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">
                    Permanent Address:
                  </span>
                  <p className="font-medium">{step3.permanentAddress}</p>
                </div>
              </div>
            </section>

            {/* Nominees */}
            {step3.nominees && step3.nominees.length > 0 && (
              <section className="space-y-3">
                <h4 className="text-sm font-semibold">Nominees</h4>
                <Separator />
                <div className="space-y-2">
                  {step3.nominees.map((nominee, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between rounded-md border bg-muted/30 px-3 py-2 text-sm"
                    >
                      <div>
                        <span className="font-medium">{nominee.nameEn}</span>
                        <span className="ml-2 text-muted-foreground">
                          ({nominee.relationship})
                        </span>
                        {nominee.isMinor && (
                          <Badge variant="outline" className="ml-2">
                            Minor
                          </Badge>
                        )}
                      </div>
                      <Badge variant="secondary">
                        {nominee.sharePercentage}%
                      </Badge>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Documents */}
            <section className="space-y-3">
              <h4 className="text-sm font-semibold">Documents</h4>
              <Separator />
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-2 rounded-md border bg-muted/30 px-3 py-2 text-sm">
                  <ImageIcon className="size-4 text-muted-foreground" />
                  <span>Photograph uploaded</span>
                  <CheckCircle2 className="size-4 text-green-600" />
                </div>
                <div className="flex items-center gap-2 rounded-md border bg-muted/30 px-3 py-2 text-sm">
                  <ImageIcon className="size-4 text-muted-foreground" />
                  <span>
                    {signatureTypeLabel[step5.signatureType]} uploaded
                  </span>
                  <CheckCircle2 className="size-4 text-green-600" />
                </div>
              </div>
            </section>
          </div>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button type="button" variant="outline" size="lg" onClick={onBack}>
          <ArrowLeft className="size-4" />
          Back
        </Button>
        <Button
          type="button"
          size="lg"
          className="bg-green-600 text-white hover:bg-green-700"
          onClick={() => onSubmit({ screeningChecks: checks })}
        >
          <CheckCircle2 className="size-4" />
          Complete Onboarding
        </Button>
      </div>
    </div>
  );
}

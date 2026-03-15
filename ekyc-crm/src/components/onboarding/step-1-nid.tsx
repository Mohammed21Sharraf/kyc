"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Info, ArrowRight } from "lucide-react";

const nidSchema = z.object({
  nidNumber: z
    .string()
    .min(1, "NID Number is required")
    .regex(/^\d{17}$/, "NID Number must be exactly 17 digits"),
  dateOfBirth: z.string().min(1, "Date of Birth is required"),
  verificationModel: z.enum(["fingerprint", "face_matching"], {
    message: "Please select a verification model",
  }),
  kycTier: z.enum(["simplified", "regular"], {
    message: "Please select a KYC tier",
  }),
  channel: z.string().min(1, "Please select a channel"),
});

export type Step1Data = z.infer<typeof nidSchema>;

interface Step1NIDProps {
  onNext: (data: Step1Data) => void;
  defaultValues?: Partial<Step1Data>;
}

export function Step1NID({ onNext, defaultValues }: Step1NIDProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<Step1Data>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(nidSchema) as any,
    defaultValues: {
      nidNumber: "",
      dateOfBirth: "",
      verificationModel: "fingerprint",
      kycTier: "simplified",
      channel: "",
      ...defaultValues,
    },
  });

  const verificationModel = watch("verificationModel");
  const kycTier = watch("kycTier");
  const channel = watch("channel");

  return (
    <Card>
      <CardHeader>
        <CardTitle>NID Verification</CardTitle>
        <CardDescription>
          Verify customer identity using their National ID
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onNext)} className="space-y-6">
          {/* Info Box */}
          <div className="flex items-start gap-3 rounded-lg border border-blue-200 bg-blue-50 p-3 dark:border-blue-900 dark:bg-blue-950/50">
            <Info className="mt-0.5 size-4 shrink-0 text-blue-600 dark:text-blue-400" />
            <p className="text-sm text-blue-700 dark:text-blue-300">
              NID will be verified against EC NID Database (simulated in Phase
              1).
            </p>
          </div>

          {/* NID Number */}
          <div className="space-y-2">
            <Label htmlFor="nidNumber">
              NID Number <span className="text-destructive">*</span>
            </Label>
            <Input
              id="nidNumber"
              placeholder="Enter 17-digit NID number"
              maxLength={17}
              {...register("nidNumber")}
            />
            {errors.nidNumber && (
              <p className="text-xs text-destructive">
                {errors.nidNumber.message}
              </p>
            )}
          </div>

          {/* Date of Birth */}
          <div className="space-y-2">
            <Label htmlFor="dateOfBirth">
              Date of Birth <span className="text-destructive">*</span>
            </Label>
            <Input id="dateOfBirth" type="date" {...register("dateOfBirth")} />
            {errors.dateOfBirth && (
              <p className="text-xs text-destructive">
                {errors.dateOfBirth.message}
              </p>
            )}
          </div>

          {/* Verification Model */}
          <div className="space-y-3">
            <Label>
              Verification Model <span className="text-destructive">*</span>
            </Label>
            <RadioGroup
              value={verificationModel}
              onValueChange={(val) =>
                setValue(
                  "verificationModel",
                  val as Step1Data["verificationModel"],
                  { shouldValidate: true }
                )
              }
            >
              <div className="flex items-center gap-2">
                <RadioGroupItem value="fingerprint" />
                <Label htmlFor="fingerprint" className="font-normal">
                  Fingerprint
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="face_matching" />
                <Label htmlFor="face_matching" className="font-normal">
                  Face Matching
                </Label>
              </div>
            </RadioGroup>
            {errors.verificationModel && (
              <p className="text-xs text-destructive">
                {errors.verificationModel.message}
              </p>
            )}
          </div>

          {/* KYC Tier */}
          <div className="space-y-3">
            <Label>
              KYC Tier <span className="text-destructive">*</span>
            </Label>
            <RadioGroup
              value={kycTier}
              onValueChange={(val) =>
                setValue("kycTier", val as Step1Data["kycTier"], {
                  shouldValidate: true,
                })
              }
            >
              <div className="flex items-center gap-2">
                <RadioGroupItem value="simplified" />
                <Label className="font-normal">Simplified</Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="regular" />
                <Label className="font-normal">Regular</Label>
              </div>
            </RadioGroup>
            {errors.kycTier && (
              <p className="text-xs text-destructive">
                {errors.kycTier.message}
              </p>
            )}
          </div>

          {/* Channel */}
          <div className="space-y-2">
            <Label>
              Channel <span className="text-destructive">*</span>
            </Label>
            <Select
              value={channel}
              onValueChange={(val) =>
                setValue("channel", val ?? "", { shouldValidate: true })
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a channel" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="branch">Branch</SelectItem>
                <SelectItem value="agent_banking">Agent Banking</SelectItem>
                <SelectItem value="digital">Digital</SelectItem>
              </SelectContent>
            </Select>
            {errors.channel && (
              <p className="text-xs text-destructive">
                {errors.channel.message}
              </p>
            )}
          </div>

          {/* Submit */}
          <div className="flex justify-end pt-4">
            <Button type="submit" size="lg">
              Verify & Continue
              <ArrowRight className="size-4" />
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

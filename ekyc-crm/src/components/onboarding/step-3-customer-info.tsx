"use client";

import { useForm, useFieldArray } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ArrowRight, ArrowLeft, Plus, Trash2 } from "lucide-react";

const nomineeSchema = z.object({
  nameEn: z.string().min(1, "Name (English) is required"),
  nameBn: z.string().optional(),
  relationship: z.string().min(1, "Relationship is required"),
  nid: z.string().optional(),
  dob: z.string().min(1, "Date of birth is required"),
  sharePercentage: z.coerce
    .number()
    .min(1, "Share must be at least 1%")
    .max(100, "Share cannot exceed 100%"),
  isMinor: z.boolean().default(false),
  guardianName: z.string().optional(),
  guardianNid: z.string().optional(),
  guardianRelationship: z.string().optional(),
});

const customerInfoSchema = z.object({
  nameEn: z.string().min(1, "Name (English) is required"),
  nameBn: z.string().optional(),
  fatherNameEn: z.string().min(1, "Father's Name (English) is required"),
  fatherNameBn: z.string().optional(),
  motherNameEn: z.string().min(1, "Mother's Name (English) is required"),
  motherNameBn: z.string().optional(),
  spouseNameEn: z.string().optional(),
  spouseNameBn: z.string().optional(),
  gender: z.enum(["M", "F", "T"], {
    message: "Gender is required",
  }),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  mobileNumber: z
    .string()
    .min(1, "Mobile number is required")
    .regex(/^01\d{9}$/, "Must start with 01 and be 11 digits"),
  email: z.string().email("Invalid email").or(z.literal("")).optional(),
  presentAddress: z.string().min(1, "Present address is required"),
  permanentAddress: z.string().min(1, "Permanent address is required"),
  sameAsPresent: z.boolean().optional(),
  profession: z.string().min(1, "Profession is required"),
  employerName: z.string().optional(),
  // Regular tier fields
  monthlyIncome: z.string().optional(),
  sourceOfFunds: z.string().optional(),
  tinNumber: z.string().optional(),
  otherBankAccounts: z.string().optional(),
  // Nominees
  nominees: z.array(nomineeSchema).optional(),
});

export type Step3Data = z.infer<typeof customerInfoSchema>;

interface Step3CustomerInfoProps {
  onNext: (data: Step3Data) => void;
  onBack: () => void;
  defaultValues?: Partial<Step3Data>;
  kycTier: "simplified" | "regular";
}

export function Step3CustomerInfo({
  onNext,
  onBack,
  defaultValues,
  kycTier,
}: Step3CustomerInfoProps) {
  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { errors },
  } = useForm<Step3Data>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(customerInfoSchema) as any,
    defaultValues: {
      nameEn: "",
      nameBn: "",
      fatherNameEn: "",
      fatherNameBn: "",
      motherNameEn: "",
      motherNameBn: "",
      spouseNameEn: "",
      spouseNameBn: "",
      gender: undefined,
      dateOfBirth: "",
      mobileNumber: "",
      email: "",
      presentAddress: "",
      permanentAddress: "",
      sameAsPresent: false,
      profession: "",
      employerName: "",
      monthlyIncome: "",
      sourceOfFunds: "",
      tinNumber: "",
      otherBankAccounts: "",
      nominees: [],
      ...defaultValues,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "nominees",
  });

  const sameAsPresent = watch("sameAsPresent");
  const presentAddress = watch("presentAddress");
  const gender = watch("gender");
  const nominees = watch("nominees") ?? [];

  const handleSameAsPresent = (checked: boolean) => {
    setValue("sameAsPresent", checked);
    if (checked) {
      setValue("permanentAddress", presentAddress);
    }
  };

  const onSubmit = (data: Step3Data) => {
    // Validate nominee shares total 100% if nominees exist
    if (data.nominees && data.nominees.length > 0) {
      const totalShare = data.nominees.reduce(
        (sum, n) => sum + (n.sharePercentage || 0),
        0
      );
      if (totalShare !== 100) {
        alert("Nominee share percentages must total 100%");
        return;
      }
    }
    onNext(data);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Customer Information</CardTitle>
        <CardDescription>
          Enter the customer&apos;s personal and contact details
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* Basic Information */}
          <section className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground">
              Basic Information
            </h3>
            <Separator />

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="nameEn">
                  Name (English) <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="nameEn"
                  placeholder="Full name in English"
                  {...register("nameEn")}
                />
                {errors.nameEn && (
                  <p className="text-xs text-destructive">
                    {errors.nameEn.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="nameBn">Name (Bangla)</Label>
                <Input
                  id="nameBn"
                  placeholder="Full name in Bangla"
                  {...register("nameBn")}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="fatherNameEn">
                  Father&apos;s Name (EN){" "}
                  <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="fatherNameEn"
                  placeholder="Father's name in English"
                  {...register("fatherNameEn")}
                />
                {errors.fatherNameEn && (
                  <p className="text-xs text-destructive">
                    {errors.fatherNameEn.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="fatherNameBn">Father&apos;s Name (BN)</Label>
                <Input
                  id="fatherNameBn"
                  placeholder="Father's name in Bangla"
                  {...register("fatherNameBn")}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="motherNameEn">
                  Mother&apos;s Name (EN){" "}
                  <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="motherNameEn"
                  placeholder="Mother's name in English"
                  {...register("motherNameEn")}
                />
                {errors.motherNameEn && (
                  <p className="text-xs text-destructive">
                    {errors.motherNameEn.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="motherNameBn">Mother&apos;s Name (BN)</Label>
                <Input
                  id="motherNameBn"
                  placeholder="Mother's name in Bangla"
                  {...register("motherNameBn")}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="spouseNameEn">Spouse Name (EN)</Label>
                <Input
                  id="spouseNameEn"
                  placeholder="Spouse name in English"
                  {...register("spouseNameEn")}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="spouseNameBn">Spouse Name (BN)</Label>
                <Input
                  id="spouseNameBn"
                  placeholder="Spouse name in Bangla"
                  {...register("spouseNameBn")}
                />
              </div>
            </div>

            {/* Gender */}
            <div className="space-y-3">
              <Label>
                Gender <span className="text-destructive">*</span>
              </Label>
              <RadioGroup
                value={gender}
                onValueChange={(val) =>
                  setValue("gender", val as Step3Data["gender"], {
                    shouldValidate: true,
                  })
                }
              >
                <div className="flex gap-6">
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="M" />
                    <Label className="font-normal">Male</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="F" />
                    <Label className="font-normal">Female</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="T" />
                    <Label className="font-normal">Third Gender</Label>
                  </div>
                </div>
              </RadioGroup>
              {errors.gender && (
                <p className="text-xs text-destructive">
                  {errors.gender.message}
                </p>
              )}
            </div>

            {/* Date of Birth */}
            <div className="max-w-xs space-y-2">
              <Label htmlFor="dateOfBirth">
                Date of Birth <span className="text-destructive">*</span>
              </Label>
              <Input
                id="dateOfBirth"
                type="date"
                {...register("dateOfBirth")}
              />
              {errors.dateOfBirth && (
                <p className="text-xs text-destructive">
                  {errors.dateOfBirth.message}
                </p>
              )}
            </div>
          </section>

          {/* Contact */}
          <section className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground">Contact</h3>
            <Separator />
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="mobileNumber">
                  Mobile Number <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="mobileNumber"
                  placeholder="01XXXXXXXXX"
                  maxLength={11}
                  {...register("mobileNumber")}
                />
                {errors.mobileNumber && (
                  <p className="text-xs text-destructive">
                    {errors.mobileNumber.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="email@example.com"
                  {...register("email")}
                />
                {errors.email && (
                  <p className="text-xs text-destructive">
                    {errors.email.message}
                  </p>
                )}
              </div>
            </div>
          </section>

          {/* Address */}
          <section className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground">Address</h3>
            <Separator />

            <div className="space-y-2">
              <Label htmlFor="presentAddress">
                Present Address <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="presentAddress"
                placeholder="Enter present address"
                {...register("presentAddress")}
              />
              {errors.presentAddress && (
                <p className="text-xs text-destructive">
                  {errors.presentAddress.message}
                </p>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Checkbox
                checked={sameAsPresent}
                onCheckedChange={handleSameAsPresent}
              />
              <Label className="font-normal">Same as present address</Label>
            </div>

            <div className="space-y-2">
              <Label htmlFor="permanentAddress">
                Permanent Address <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="permanentAddress"
                placeholder="Enter permanent address"
                disabled={sameAsPresent}
                {...register("permanentAddress")}
              />
              {errors.permanentAddress && (
                <p className="text-xs text-destructive">
                  {errors.permanentAddress.message}
                </p>
              )}
            </div>
          </section>

          {/* Professional */}
          <section className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground">
              Professional Information
            </h3>
            <Separator />

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="profession">
                  Profession <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="profession"
                  placeholder="Enter profession"
                  {...register("profession")}
                />
                {errors.profession && (
                  <p className="text-xs text-destructive">
                    {errors.profession.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="employerName">Employer Name</Label>
                <Input
                  id="employerName"
                  placeholder="Enter employer name"
                  {...register("employerName")}
                />
              </div>
            </div>
          </section>

          {/* Regular Tier Only */}
          {kycTier === "regular" && (
            <section className="space-y-4">
              <h3 className="text-sm font-semibold text-foreground">
                Additional Information (Regular Tier)
              </h3>
              <Separator />

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="monthlyIncome">Monthly Income</Label>
                  <Input
                    id="monthlyIncome"
                    placeholder="Enter monthly income"
                    {...register("monthlyIncome")}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sourceOfFunds">Source of Funds</Label>
                  <Input
                    id="sourceOfFunds"
                    placeholder="Enter source of funds"
                    {...register("sourceOfFunds")}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tinNumber">TIN Number</Label>
                  <Input
                    id="tinNumber"
                    placeholder="Enter TIN number"
                    {...register("tinNumber")}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="otherBankAccounts">
                  Other Bank Account Numbers
                </Label>
                <Textarea
                  id="otherBankAccounts"
                  placeholder="Enter other bank account numbers (one per line)"
                  {...register("otherBankAccounts")}
                />
              </div>
            </section>
          )}

          {/* Nominees */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-foreground">
                Nominees
              </h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  append({
                    nameEn: "",
                    nameBn: "",
                    relationship: "",
                    nid: "",
                    dob: "",
                    sharePercentage: 0,
                    isMinor: false,
                    guardianName: "",
                    guardianNid: "",
                    guardianRelationship: "",
                  })
                }
              >
                <Plus className="size-4" />
                Add Nominee
              </Button>
            </div>
            <Separator />

            {fields.length === 0 && (
              <p className="py-4 text-center text-sm text-muted-foreground">
                No nominees added yet. Click &quot;Add Nominee&quot; to add one.
              </p>
            )}

            {fields.length > 0 && (
              <div className="text-xs text-muted-foreground">
                Total share:{" "}
                <span
                  className={
                    nominees.reduce(
                      (sum, n) => sum + (Number(n.sharePercentage) || 0),
                      0
                    ) === 100
                      ? "font-semibold text-green-600"
                      : "font-semibold text-destructive"
                  }
                >
                  {nominees.reduce(
                    (sum, n) => sum + (Number(n.sharePercentage) || 0),
                    0
                  )}
                  %
                </span>{" "}
                (must total 100%)
              </div>
            )}

            {fields.map((field, index) => (
              <div
                key={field.id}
                className="space-y-4 rounded-lg border p-4"
              >
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium">
                    Nominee {index + 1}
                  </h4>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => remove(index)}
                  >
                    <Trash2 className="size-4 text-destructive" />
                  </Button>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>
                      Name (English){" "}
                      <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      placeholder="Nominee name in English"
                      {...register(`nominees.${index}.nameEn`)}
                    />
                    {errors.nominees?.[index]?.nameEn && (
                      <p className="text-xs text-destructive">
                        {errors.nominees[index].nameEn.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>Name (Bangla)</Label>
                    <Input
                      placeholder="Nominee name in Bangla"
                      {...register(`nominees.${index}.nameBn`)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>
                      Relationship{" "}
                      <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      placeholder="e.g., Spouse, Child, Parent"
                      {...register(`nominees.${index}.relationship`)}
                    />
                    {errors.nominees?.[index]?.relationship && (
                      <p className="text-xs text-destructive">
                        {errors.nominees[index].relationship.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>NID</Label>
                    <Input
                      placeholder="Nominee NID number"
                      {...register(`nominees.${index}.nid`)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>
                      Date of Birth{" "}
                      <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      type="date"
                      {...register(`nominees.${index}.dob`)}
                    />
                    {errors.nominees?.[index]?.dob && (
                      <p className="text-xs text-destructive">
                        {errors.nominees[index].dob.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>
                      Share %{" "}
                      <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      type="number"
                      min={1}
                      max={100}
                      placeholder="0"
                      {...register(`nominees.${index}.sharePercentage`, {
                        valueAsNumber: true,
                      })}
                    />
                    {errors.nominees?.[index]?.sharePercentage && (
                      <p className="text-xs text-destructive">
                        {errors.nominees[index].sharePercentage.message}
                      </p>
                    )}
                  </div>
                </div>

                {/* Is Minor */}
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={nominees[index]?.isMinor ?? false}
                    onCheckedChange={(checked: boolean) =>
                      setValue(`nominees.${index}.isMinor`, checked)
                    }
                  />
                  <Label className="font-normal">Is Minor</Label>
                </div>

                {/* Guardian fields - shown when isMinor is true */}
                {nominees[index]?.isMinor && (
                  <div className="ml-4 grid grid-cols-1 gap-4 border-l-2 border-muted pl-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Guardian Name</Label>
                      <Input
                        placeholder="Guardian name"
                        {...register(`nominees.${index}.guardianName`)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Guardian NID</Label>
                      <Input
                        placeholder="Guardian NID"
                        {...register(`nominees.${index}.guardianNid`)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Guardian Relationship</Label>
                      <Input
                        placeholder="e.g., Father, Mother"
                        {...register(
                          `nominees.${index}.guardianRelationship`
                        )}
                      />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </section>

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
            <Button type="submit" size="lg">
              Continue
              <ArrowRight className="size-4" />
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

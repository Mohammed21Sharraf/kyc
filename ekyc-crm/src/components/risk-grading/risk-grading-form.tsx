"use client"

import { useState, useMemo } from "react"
import { useForm, Controller } from "react-hook-form"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { DimensionForm, type DimensionConfig, type DimensionValue } from "./dimension-form"
import { ScoreGauge } from "./score-gauge"
import { ShieldAlert, ShieldCheck, BookOpen, X } from "lucide-react"

// ─── Dimension Definitions (Bangladesh Bank Annexure-2 A3/A4/A5) ───

const DIMENSIONS: DimensionConfig[] = [
  {
    number: 1,
    name: "Type of On-boarding",
    description:
      "Assess the risk based on how the customer was on-boarded to the institution.",
    options: [
      { label: "Face to face at branch", score: 0 },
      { label: "Agent Banking", score: 1 },
      { label: "Digital / Remote", score: 2 },
      { label: "Third-party reliance", score: 3 },
    ],
  },
  {
    number: 2,
    name: "Geographic / Jurisdictional Risk",
    description:
      "Evaluate the geographic risk of the customer based on their location and transaction jurisdictions.",
    options: [
      { label: "Domestic - Urban", score: 0 },
      { label: "Domestic - Rural", score: 1 },
      { label: "Border district", score: 2 },
      { label: "High-risk jurisdiction (FATF list)", score: 3 },
      { label: "Sanctioned country", score: 4 },
    ],
  },
  {
    number: 3,
    name: "Type of Customer (PEP/IP)",
    description:
      "Determine if the customer is a Politically Exposed Person or Influential Person.",
    options: [
      { label: "General individual", score: 0 },
      { label: "Family member of PEP", score: 1 },
      { label: "Close associate of PEP", score: 2 },
      { label: "Domestic PEP", score: 3 },
      { label: "Foreign PEP", score: 4 },
    ],
  },
  {
    number: 4,
    name: "Product and Channel Risk",
    description:
      "Assess the risk associated with the products and banking channels used by the customer.",
    options: [
      { label: "Savings account only", score: 0 },
      { label: "Savings + debit card", score: 1 },
      { label: "Full banking with digital", score: 2 },
      { label: "International transaction enabled", score: 3 },
      { label: "High-value investment products", score: 4 },
    ],
  },
  {
    number: 5,
    name: "Business / Profession Risk",
    description:
      "Rate the inherent risk of the customer's profession or business type. Use the lookup helper for guidance.",
    options: [
      { label: "Low risk profession", score: 1 },
      { label: "Medium risk", score: 2 },
      { label: "High risk", score: 3 },
      { label: "Very high risk", score: 4 },
    ],
  },
  {
    number: 6,
    name: "Transactional Risk",
    description:
      "Evaluate the risk based on the customer's expected or observed transaction patterns.",
    options: [
      { label: "Low transaction volume", score: 0 },
      { label: "Moderate", score: 1 },
      { label: "High volume", score: 2 },
      { label: "Cash-intensive", score: 3 },
      { label: "Unusual patterns", score: 4 },
    ],
  },
  {
    number: 7,
    name: "Transparency Risk",
    description:
      "Assess the customer's willingness and ability to provide complete, accurate documentation.",
    options: [
      { label: "Full documentation provided", score: 0 },
      { label: "Minor gaps in documentation", score: 1 },
      { label: "Significant gaps", score: 2 },
      { label: "Reluctant to provide info", score: 3 },
      { label: "Suspicious / inconsistent info", score: 4 },
    ],
  },
]

// ─── Profession Lookup Table ───

const PROFESSION_LOOKUP: Record<string, string[]> = {
  "Low (1)": ["Govt service", "Teaching", "Doctor", "Farmer", "Retired"],
  "Medium (2)": ["Small business", "Private service", "Student", "Housewife"],
  "High (3)": ["Money changer", "Real estate", "Jeweler", "Arms dealer"],
  "Very high (4)": ["Casino", "Virtual assets", "Gambling"],
}

function ProfessionLookup({ onClose }: { onClose: () => void }) {
  return (
    <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-900 dark:bg-blue-950/30">
      <div className="mb-3 flex items-center justify-between">
        <h4 className="flex items-center gap-2 text-sm font-semibold">
          <BookOpen className="size-4" />
          Profession Risk Lookup
        </h4>
        <Button variant="ghost" size="icon-xs" onClick={onClose}>
          <X className="size-3" />
        </Button>
      </div>
      <div className="grid gap-2">
        {Object.entries(PROFESSION_LOOKUP).map(([level, professions]) => (
          <div key={level} className="text-sm">
            <span className="font-medium">{level}:</span>{" "}
            <span className="text-muted-foreground">{professions.join(", ")}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Form Types ───

interface DimensionFormValues {
  [key: string]: DimensionValue
}

interface FormData {
  dimensions: DimensionFormValues
}

interface RiskGradingFormProps {
  onSubmit: (data: {
    dimensions: Record<string, DimensionValue>
    totalScore: number
    riskLevel: "Regular" | "High"
  }) => void
  customerId: string
  existingGrading?: Record<string, DimensionValue> | null
}

export function RiskGradingForm({
  onSubmit,
  customerId,
  existingGrading,
}: RiskGradingFormProps) {
  const [showProfessionLookup, setShowProfessionLookup] = useState(false)

  const defaultValues: FormData = {
    dimensions: DIMENSIONS.reduce<DimensionFormValues>((acc, dim) => {
      const key = `dim_${dim.number}`
      acc[key] = existingGrading?.[key] ?? { score: null, rationale: "" }
      return acc
    }, {}),
  }

  const { control, handleSubmit, watch } = useForm<FormData>({
    defaultValues,
  })

  const watchedDimensions = watch("dimensions")

  const totalScore = useMemo(() => {
    return Object.values(watchedDimensions).reduce(
      (sum, dim) => sum + (dim.score ?? 0),
      0
    )
  }, [watchedDimensions])

  const isHighRisk = totalScore > 14
  const allScored = Object.values(watchedDimensions).every(
    (dim) => dim.score !== null
  )

  const handleFormSubmit = (data: FormData) => {
    onSubmit({
      dimensions: data.dimensions,
      totalScore,
      riskLevel: isHighRisk ? "High" : "Regular",
    })
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {DIMENSIONS.map((dimension) => {
        const key = `dim_${dimension.number}`
        return (
          <div key={key} className="space-y-3">
            <Controller
              name={`dimensions.${key}`}
              control={control}
              render={({ field }) => (
                <DimensionForm
                  dimension={dimension}
                  value={field.value}
                  onChange={field.onChange}
                />
              )}
            />

            {/* Profession lookup helper for dimension 5 */}
            {dimension.number === 5 && (
              <div className="pl-4">
                {showProfessionLookup ? (
                  <ProfessionLookup
                    onClose={() => setShowProfessionLookup(false)}
                  />
                ) : (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowProfessionLookup(true)}
                  >
                    <BookOpen className="size-3.5" />
                    Lookup Profession Risk
                  </Button>
                )}
              </div>
            )}
          </div>
        )
      })}

      <Separator />

      {/* Running total & risk indicator */}
      <Card>
        <CardContent className="flex items-center justify-between gap-4 pt-4">
          <div className="flex items-center gap-3">
            {isHighRisk ? (
              <ShieldAlert className="size-6 text-red-600" />
            ) : (
              <ShieldCheck className="size-6 text-green-600" />
            )}
            <div>
              <div className="text-sm font-medium">Running Total</div>
              <div
                className={cn(
                  "text-2xl font-bold tabular-nums",
                  isHighRisk ? "text-red-600" : "text-green-600"
                )}
              >
                {totalScore} / 28
              </div>
            </div>
          </div>
          <Badge
            variant={isHighRisk ? "destructive" : "default"}
            className="text-sm"
          >
            {isHighRisk ? "High Risk" : "Regular Risk"}
          </Badge>
        </CardContent>
      </Card>

      {/* Submit */}
      <Button type="submit" className="w-full" size="lg" disabled={!allScored}>
        <ShieldCheck className="size-4" />
        Submit Risk Grading
      </Button>

      {!allScored && (
        <p className="text-center text-xs text-muted-foreground">
          Please score all 7 dimensions before submitting.
        </p>
      )}
    </form>
  )
}

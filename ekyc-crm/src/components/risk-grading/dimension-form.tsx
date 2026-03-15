"use client"

import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Textarea } from "@/components/ui/textarea"

export interface DimensionOption {
  label: string
  score: number
}

export interface DimensionConfig {
  number: number
  name: string
  description: string
  options: DimensionOption[]
}

export interface DimensionValue {
  score: number | null
  rationale: string
}

interface DimensionFormProps {
  dimension: DimensionConfig
  value: DimensionValue
  onChange: (value: DimensionValue) => void
}

export function DimensionForm({ dimension, value, onChange }: DimensionFormProps) {
  return (
    <div className="space-y-4 rounded-lg border p-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <h3 className="text-sm font-semibold">
            <span className="text-muted-foreground">Dimension {dimension.number}:</span>{" "}
            {dimension.name}
          </h3>
          <p className="text-xs text-muted-foreground">{dimension.description}</p>
        </div>
        {value.score !== null && (
          <Badge
            variant={value.score >= 3 ? "destructive" : "secondary"}
            className="shrink-0 tabular-nums"
          >
            Score: {value.score}
          </Badge>
        )}
      </div>

      {/* Radio options */}
      <RadioGroup
        value={value.score !== null ? String(value.score) : undefined}
        onValueChange={(val) => {
          onChange({ ...value, score: Number(val) })
        }}
      >
        {dimension.options.map((option) => (
          <div key={`${option.label}-${option.score}`} className="flex items-center gap-3">
            <RadioGroupItem value={String(option.score)} />
            <Label
              className={cn(
                "cursor-pointer text-sm font-normal",
                value.score === option.score && "font-medium"
              )}
            >
              {option.label}{" "}
              <span className="text-muted-foreground">({option.score})</span>
            </Label>
          </div>
        ))}
      </RadioGroup>

      {/* Rationale */}
      <div className="space-y-1.5">
        <Label className="text-xs text-muted-foreground">Rationale / Notes</Label>
        <Textarea
          placeholder="Provide justification for the selected score..."
          value={value.rationale}
          onChange={(e) => onChange({ ...value, rationale: e.target.value })}
          className="min-h-12 text-sm"
        />
      </div>
    </div>
  )
}

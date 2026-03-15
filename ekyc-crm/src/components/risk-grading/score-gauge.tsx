"use client"

import { cn } from "@/lib/utils"

interface ScoreGaugeProps {
  score: number
  maxScore?: number
}

export function ScoreGauge({ score, maxScore = 28 }: ScoreGaugeProps) {
  const percentage = Math.min((score / maxScore) * 100, 100)
  const isHighRisk = score > 14
  const riskLabel = isHighRisk ? "High Risk" : "Regular Risk"

  // Interpolate color from green to red based on score
  const getBarColor = () => {
    if (score <= 7) return "bg-green-500"
    if (score <= 14) return "bg-green-400"
    if (score <= 21) return "bg-orange-500"
    return "bg-red-600"
  }

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Large score display */}
      <div className="flex items-baseline gap-1">
        <span
          className={cn(
            "text-6xl font-bold tabular-nums",
            isHighRisk ? "text-red-600" : "text-green-600"
          )}
        >
          {score}
        </span>
        <span className="text-2xl text-muted-foreground">/ {maxScore}</span>
      </div>

      {/* Risk level label */}
      <span
        className={cn(
          "text-lg font-semibold",
          isHighRisk ? "text-red-600" : "text-green-600"
        )}
      >
        {riskLabel}
      </span>

      {/* Horizontal progress bar */}
      <div className="w-full max-w-xs">
        <div className="relative h-3 w-full overflow-hidden rounded-full bg-muted">
          <div
            className={cn(
              "h-full rounded-full transition-all duration-500",
              getBarColor()
            )}
            style={{ width: `${percentage}%` }}
          />
        </div>
        <div className="mt-1 flex justify-between text-xs text-muted-foreground">
          <span>0</span>
          <span>14</span>
          <span>{maxScore}</span>
        </div>
      </div>
    </div>
  )
}

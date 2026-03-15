"use client"

import { use, useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { ScoreGauge } from "@/components/risk-grading/score-gauge"
import { RiskGradingForm } from "@/components/risk-grading/risk-grading-form"
import { GradingHistory, type GradingRecord } from "@/components/risk-grading/grading-history"
import { ArrowLeft, RefreshCw } from "lucide-react"

// ─── Mock Data (Phase 1) ───

const MOCK_CUSTOMERS: Record<string, { name: string; referenceId: string }> = {
  "cust-001": { name: "Md. Karim Uddin", referenceId: "UCB-2025-00142" },
  "cust-002": { name: "Fatema Begum", referenceId: "UCB-2025-00389" },
  "cust-003": { name: "Abdul Hasan", referenceId: "UCB-2025-00567" },
}

const MOCK_GRADINGS: Record<string, GradingRecord[]> = {
  "cust-001": [
    {
      id: "grading-001",
      date: "2025-12-01",
      totalScore: 8,
      riskLevel: "Regular",
      gradedBy: "Officer Tanvir Ahmed",
    },
    {
      id: "grading-002",
      date: "2025-06-15",
      totalScore: 6,
      riskLevel: "Regular",
      gradedBy: "Officer Rashida Khatun",
    },
  ],
  "cust-002": [
    {
      id: "grading-003",
      date: "2025-11-20",
      totalScore: 18,
      riskLevel: "High",
      gradedBy: "Officer Tanvir Ahmed",
    },
  ],
  "cust-003": [],
}

const MOCK_CURRENT_SCORES: Record<string, number | null> = {
  "cust-001": 8,
  "cust-002": 18,
  "cust-003": null,
}

// ─── Page Component ───

export default function RiskGradingPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id: customerId } = use(params)
  const [showForm, setShowForm] = useState(false)

  const customer = MOCK_CUSTOMERS[customerId] ?? {
    name: "Unknown Customer",
    referenceId: "N/A",
  }
  const currentScore = MOCK_CURRENT_SCORES[customerId] ?? null
  const gradingHistory = MOCK_GRADINGS[customerId] ?? []

  const handleSubmit = (data: {
    dimensions: Record<string, { score: number | null; rationale: string }>
    totalScore: number
    riskLevel: "Regular" | "High"
  }) => {
    // Phase 1: just log the data
    console.log("Risk grading submitted:", { customerId, ...data })
    alert(
      `Risk grading submitted!\nTotal Score: ${data.totalScore}/28\nRisk Level: ${data.riskLevel}`
    )
    setShowForm(false)
  }

  const handleViewDetails = (gradingId: string) => {
    console.log("View grading details:", gradingId)
    alert(`Viewing details for grading: ${gradingId}`)
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-4 md:p-6">
      {/* Back link */}
      <Link
        href={`/customers/${customerId}`}
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Back to Customer Profile
      </Link>

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Risk Grading</h1>
        <p className="text-sm text-muted-foreground">
          {customer.name} &mdash; {customer.referenceId}
        </p>
      </div>

      {/* Current Score Gauge */}
      {currentScore !== null && (
        <Card>
          <CardHeader>
            <CardTitle>Current Risk Score</CardTitle>
            <CardDescription>
              Latest risk grading assessment result
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScoreGauge score={currentScore} maxScore={28} />
          </CardContent>
        </Card>
      )}

      {/* New / Re-grading Form */}
      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <div className="space-y-1">
            <CardTitle>
              {currentScore !== null ? "Re-grade Customer" : "New Risk Grading"}
            </CardTitle>
            <CardDescription>
              Score across 7 dimensions per Bangladesh Bank Annexure-2
            </CardDescription>
          </div>
          {!showForm && (
            <Button variant="outline" onClick={() => setShowForm(true)}>
              <RefreshCw className="size-4" />
              {currentScore !== null ? "Re-grade" : "Start Grading"}
            </Button>
          )}
        </CardHeader>
        {showForm && (
          <CardContent>
            <RiskGradingForm
              customerId={customerId}
              onSubmit={handleSubmit}
              existingGrading={null}
            />
          </CardContent>
        )}
      </Card>

      <Separator />

      {/* Grading History */}
      <Card>
        <CardHeader>
          <CardTitle>Grading History</CardTitle>
          <CardDescription>
            Previous risk grading assessments for this customer
          </CardDescription>
        </CardHeader>
        <CardContent>
          <GradingHistory
            gradings={gradingHistory}
            onViewDetails={handleViewDetails}
          />
        </CardContent>
      </Card>
    </div>
  )
}

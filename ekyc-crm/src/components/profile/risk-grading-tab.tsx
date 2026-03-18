"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import type { RiskGrading } from "@/types/database";
import { ShieldAlert, ShieldCheck, BarChart3 } from "lucide-react";

interface RiskGradingTabProps {
  riskGrading: RiskGrading | null;
  customerId: string;
}

const DIMENSION_LABELS: Record<number, string> = {
  1: "Customer Type",
  2: "Business/Professional Type",
  3: "Transaction Pattern",
  4: "Geographic Risk",
  5: "Product/Channel Risk",
  6: "Transparent Intl. Org.",
  7: "Politically Exposed Person",
};

function ScoreGauge({ score, maxScore }: { score: number; maxScore: number }) {
  const percentage = (score / maxScore) * 100;
  const isHighRisk = score >= 15;
  const color = isHighRisk ? "text-red-500" : "text-green-500";
  const strokeColor = isHighRisk ? "stroke-red-500" : "stroke-green-500";
  const bgStrokeColor = isHighRisk
    ? "stroke-red-100 dark:stroke-red-950"
    : "stroke-green-100 dark:stroke-green-950";

  // SVG circular gauge
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative">
        <svg width="160" height="160" viewBox="0 0 160 160">
          {/* Background circle */}
          <circle
            cx="80"
            cy="80"
            r={radius}
            fill="none"
            strokeWidth="12"
            className={bgStrokeColor}
            strokeLinecap="round"
          />
          {/* Score arc */}
          <circle
            cx="80"
            cy="80"
            r={radius}
            fill="none"
            strokeWidth="12"
            className={strokeColor}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            transform="rotate(-90 80 80)"
            style={{ transition: "stroke-dashoffset 0.5s ease" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`text-3xl font-bold ${color}`}>{score}</span>
          <span className="text-xs text-muted-foreground">out of {maxScore}</span>
        </div>
      </div>
      <Badge
        className={
          isHighRisk
            ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
            : "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
        }
      >
        {isHighRisk ? (
          <>
            <ShieldAlert className="mr-1 size-3" />
            High Risk
          </>
        ) : (
          <>
            <ShieldCheck className="mr-1 size-3" />
            Regular Risk
          </>
        )}
      </Badge>
    </div>
  );
}

export function RiskGradingTab({ riskGrading, customerId }: RiskGradingTabProps) {
  if (!riskGrading) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center gap-4 py-12">
          <BarChart3 className="size-12 text-muted-foreground/50" />
          <div className="text-center">
            <p className="text-sm font-medium text-foreground">Not Yet Graded</p>
            <p className="mt-1 text-sm text-muted-foreground">
              This customer has not been risk graded yet.
            </p>
          </div>
          <Button nativeButton={false} render={<Link href={`/customers/${customerId}/risk-grading`} />}>Grade Now</Button>
        </CardContent>
      </Card>
    );
  }

  const dimensions = [
    { num: 1, score: riskGrading.dimension_1_score, rationale: riskGrading.dimension_1_rationale },
    { num: 2, score: riskGrading.dimension_2_score, rationale: riskGrading.dimension_2_rationale },
    { num: 3, score: riskGrading.dimension_3_score, rationale: riskGrading.dimension_3_rationale },
    { num: 4, score: riskGrading.dimension_4_score, rationale: riskGrading.dimension_4_rationale },
    { num: 5, score: riskGrading.dimension_5_score, rationale: riskGrading.dimension_5_rationale },
    { num: 6, score: riskGrading.dimension_6_score, rationale: riskGrading.dimension_6_rationale },
    { num: 7, score: riskGrading.dimension_7_score, rationale: riskGrading.dimension_7_rationale },
  ];

  return (
    <div className="space-y-6">
      {/* Score Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="size-4" />
              Risk Score Overview
            </CardTitle>
            <Button nativeButton={false} variant="outline" size="sm" render={<Link href={`/customers/${customerId}/risk-grading`} />}>Re-grade</Button>
          </div>
        </CardHeader>
        <CardContent className="flex justify-center">
          <ScoreGauge score={riskGrading.total_score} maxScore={28} />
        </CardContent>
      </Card>

      {/* Dimension Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Dimension Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[40px]">#</TableHead>
                <TableHead>Dimension</TableHead>
                <TableHead className="w-[80px] text-center">Score</TableHead>
                <TableHead>Rationale</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {dimensions.map((dim) => (
                <TableRow key={dim.num}>
                  <TableCell className="text-muted-foreground">{dim.num}</TableCell>
                  <TableCell className="font-medium">
                    {DIMENSION_LABELS[dim.num] || `Dimension ${dim.num}`}
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge
                      variant="outline"
                      className={
                        dim.score >= 3
                          ? "border-red-200 text-red-700 dark:border-red-800 dark:text-red-400"
                          : dim.score >= 2
                          ? "border-yellow-200 text-yellow-700 dark:border-yellow-800 dark:text-yellow-400"
                          : ""
                      }
                    >
                      {dim.score}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {dim.rationale || "---"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

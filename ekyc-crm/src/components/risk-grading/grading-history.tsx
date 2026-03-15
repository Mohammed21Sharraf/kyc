"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Eye } from "lucide-react"

export interface GradingRecord {
  id: string
  date: string
  totalScore: number
  riskLevel: "Regular" | "High"
  gradedBy: string
}

interface GradingHistoryProps {
  gradings: GradingRecord[]
  onViewDetails?: (id: string) => void
}

export function GradingHistory({ gradings, onViewDetails }: GradingHistoryProps) {
  if (gradings.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 py-12 text-center">
        <p className="text-sm text-muted-foreground">
          No risk grading history available for this customer.
        </p>
      </div>
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Date</TableHead>
          <TableHead>Total Score</TableHead>
          <TableHead>Risk Level</TableHead>
          <TableHead>Graded By</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {gradings.map((grading) => (
          <TableRow key={grading.id}>
            <TableCell>{grading.date}</TableCell>
            <TableCell className="tabular-nums font-medium">
              {grading.totalScore} / 28
            </TableCell>
            <TableCell>
              <Badge
                variant={grading.riskLevel === "High" ? "destructive" : "default"}
              >
                {grading.riskLevel === "High" ? "High Risk" : "Regular Risk"}
              </Badge>
            </TableCell>
            <TableCell>{grading.gradedBy}</TableCell>
            <TableCell className="text-right">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onViewDetails?.(grading.id)}
              >
                <Eye className="size-3.5" />
                View Details
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

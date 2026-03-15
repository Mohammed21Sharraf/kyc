"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { ScreeningResult } from "@/types/database";
import { format } from "date-fns";
import { ShieldCheck, ShieldAlert, Clock, Search } from "lucide-react";

interface ScreeningTabProps {
  screeningResults: ScreeningResult[];
}

function getScreeningTypeLabel(type: string) {
  switch (type) {
    case "unscr":
      return "UN Sanctions List (UNSCR)";
    case "ip_check":
      return "Influential Person (IP) Check";
    case "adverse_media":
      return "Adverse Media";
    case "beneficial_ownership":
      return "Beneficial Ownership";
    case "pep_check":
      return "PEP Screening";
    default:
      return type.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
  }
}

function getStatusBadge(status: string) {
  switch (status) {
    case "clear":
      return (
        <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
          <ShieldCheck className="mr-1 size-3" />
          Clear
        </Badge>
      );
    case "hit":
      return (
        <Badge className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
          <ShieldAlert className="mr-1 size-3" />
          Flagged
        </Badge>
      );
    case "false_positive":
      return (
        <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
          <ShieldCheck className="mr-1 size-3" />
          False Positive
        </Badge>
      );
    case "pending_review":
      return (
        <Badge className="bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400">
          <Clock className="mr-1 size-3" />
          Pending Review
        </Badge>
      );
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}

export function ScreeningTab({ screeningResults }: ScreeningTabProps) {
  if (screeningResults.length === 0) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <Search className="mx-auto size-12 text-muted-foreground/50" />
            <p className="mt-2 text-sm text-muted-foreground">
              No screening results available yet.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="size-4" />
          Screening Results
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Screening Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Screened By</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Details</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {screeningResults.map((result) => (
              <TableRow key={result.id}>
                <TableCell className="font-medium">
                  {getScreeningTypeLabel(result.screening_type)}
                </TableCell>
                <TableCell>{getStatusBadge(result.screening_status)}</TableCell>
                <TableCell className="text-muted-foreground">
                  {result.screened_by || "System"}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {format(new Date(result.created_at), "MMM dd, yyyy HH:mm")}
                </TableCell>
                <TableCell className="max-w-[200px] truncate text-muted-foreground">
                  {(result.result_details as Record<string, string>)?.message || "No matches found"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

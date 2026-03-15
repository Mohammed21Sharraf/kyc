"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { ArrowUpDown, Eye, Loader2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Customer } from "@/types/database";

interface CustomerTableProps {
  customers: Customer[];
  loading: boolean;
}

type SortField =
  | "reference_id"
  | "name_en"
  | "nid_number"
  | "mobile_number"
  | "kyc_tier"
  | "onboarding_status"
  | "risk_level"
  | "created_at";

type SortDirection = "asc" | "desc";

function maskNid(nid: string): string {
  if (nid.length <= 8) return nid;
  const first5 = nid.slice(0, 5);
  const last3 = nid.slice(-3);
  const masked = "*".repeat(nid.length - 8);
  return `${first5}${masked}${last3}`;
}

function getTierBadge(tier: string) {
  switch (tier) {
    case "simplified":
      return (
        <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
          Simplified
        </Badge>
      );
    case "regular":
      return (
        <Badge className="bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">
          Regular
        </Badge>
      );
    default:
      return <Badge variant="secondary">{tier}</Badge>;
  }
}

function getStatusBadge(status: string) {
  switch (status) {
    case "completed":
      return (
        <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
          Completed
        </Badge>
      );
    case "initiated":
    case "nid_verified":
    case "nid_scanned":
    case "info_collected":
    case "photo_captured":
    case "signature_captured":
    case "screening_done":
    case "risk_graded":
      return (
        <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
          In Progress
        </Badge>
      );
    case "rejected":
      return (
        <Badge className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
          Failed
        </Badge>
      );
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
}

function getRiskBadge(riskLevel: string | null) {
  if (!riskLevel) {
    return (
      <Badge className="bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400">
        Ungraded
      </Badge>
    );
  }
  switch (riskLevel) {
    case "low":
    case "medium":
      return (
        <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
          Regular
        </Badge>
      );
    case "high":
    case "very_high":
      return (
        <Badge className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
          High
        </Badge>
      );
    default:
      return <Badge variant="secondary">{riskLevel}</Badge>;
  }
}

function getReferenceId(customer: Customer): string {
  return customer.reference_id;
}

export function CustomerTable({ customers, loading }: CustomerTableProps) {
  const router = useRouter();
  const [sortField, setSortField] = useState<SortField>("created_at");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const sortedCustomers = [...customers].sort((a, b) => {
    const dir = sortDirection === "asc" ? 1 : -1;

    switch (sortField) {
      case "reference_id":
        return getReferenceId(a).localeCompare(getReferenceId(b)) * dir;
      case "name_en":
        return a.name_en.localeCompare(b.name_en) * dir;
      case "nid_number":
        return a.nid_number.localeCompare(b.nid_number) * dir;
      case "mobile_number":
        return (a.mobile_number ?? "").localeCompare(b.mobile_number ?? "") * dir;
      case "kyc_tier":
        return a.kyc_tier.localeCompare(b.kyc_tier) * dir;
      case "onboarding_status":
        return a.onboarding_status.localeCompare(b.onboarding_status) * dir;
      case "risk_level":
        return (a.risk_level ?? "").localeCompare(b.risk_level ?? "") * dir;
      case "created_at":
        return (new Date(a.created_at).getTime() - new Date(b.created_at).getTime()) * dir;
      default:
        return 0;
    }
  });

  const SortableHeader = ({
    field,
    children,
  }: {
    field: SortField;
    children: React.ReactNode;
  }) => (
    <TableHead>
      <button
        className="inline-flex items-center gap-1 hover:text-foreground"
        onClick={() => handleSort(field)}
      >
        {children}
        <ArrowUpDown className="size-3.5 text-muted-foreground" />
      </button>
    </TableHead>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
        <span className="ml-2 text-sm text-muted-foreground">
          Loading customers...
        </span>
      </div>
    );
  }

  if (customers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <p className="text-sm text-muted-foreground">No customers found.</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Try adjusting your search or filter criteria.
        </p>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <SortableHeader field="reference_id">Reference ID</SortableHeader>
          <SortableHeader field="name_en">Name</SortableHeader>
          <SortableHeader field="nid_number">NID Number</SortableHeader>
          <SortableHeader field="mobile_number">Mobile</SortableHeader>
          <SortableHeader field="kyc_tier">Tier</SortableHeader>
          <SortableHeader field="onboarding_status">Status</SortableHeader>
          <SortableHeader field="risk_level">Risk Level</SortableHeader>
          <SortableHeader field="created_at">Created Date</SortableHeader>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {sortedCustomers.map((customer) => (
          <TableRow
            key={customer.id}
            className="cursor-pointer"
            onClick={() => router.push(`/customers/${customer.id}`)}
          >
            <TableCell className="font-mono text-xs">
              {getReferenceId(customer)}
            </TableCell>
            <TableCell className="font-medium">{customer.name_en}</TableCell>
            <TableCell className="font-mono text-xs">
              {maskNid(customer.nid_number)}
            </TableCell>
            <TableCell>{customer.mobile_number ?? "-"}</TableCell>
            <TableCell>{getTierBadge(customer.kyc_tier)}</TableCell>
            <TableCell>{getStatusBadge(customer.onboarding_status)}</TableCell>
            <TableCell>{getRiskBadge(customer.risk_level)}</TableCell>
            <TableCell>
              {format(new Date(customer.created_at), "dd MMM yyyy")}
            </TableCell>
            <TableCell>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={(e) => {
                  e.stopPropagation();
                  router.push(`/customers/${customer.id}`);
                }}
              >
                <Eye className="size-4" />
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

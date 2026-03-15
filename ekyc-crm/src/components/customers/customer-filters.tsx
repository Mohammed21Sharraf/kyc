"use client";

import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface CustomerFilterValues {
  search: string;
  tier: string;
  status: string;
  riskLevel: string;
}

interface CustomerFiltersProps {
  filters: CustomerFilterValues;
  onChange: (filters: CustomerFilterValues) => void;
}

const defaultFilters: CustomerFilterValues = {
  search: "",
  tier: "all",
  status: "all",
  riskLevel: "all",
};

export function CustomerFilters({ filters, onChange }: CustomerFiltersProps) {
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ ...filters, search: e.target.value });
  };

  const handleClearFilters = () => {
    onChange({ ...defaultFilters });
  };

  const hasActiveFilters =
    filters.search !== "" ||
    filters.tier !== "all" ||
    filters.status !== "all" ||
    filters.riskLevel !== "all";

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Search Input */}
      <div className="relative min-w-[280px] flex-1">
        <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search by name, NID, mobile, or reference ID..."
          value={filters.search}
          onChange={handleSearchChange}
          className="pl-9"
        />
      </div>

      {/* KYC Tier Filter */}
      <Select
        value={filters.tier}
        onValueChange={(value) =>
          onChange({ ...filters, tier: value ?? "all" })
        }
      >
        <SelectTrigger className="w-[150px]">
          <SelectValue placeholder="KYC Tier" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Tiers</SelectItem>
          <SelectItem value="simplified">Simplified</SelectItem>
          <SelectItem value="regular">Regular</SelectItem>
        </SelectContent>
      </Select>

      {/* Status Filter */}
      <Select
        value={filters.status}
        onValueChange={(value) =>
          onChange({ ...filters, status: value ?? "all" })
        }
      >
        <SelectTrigger className="w-[150px]">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Statuses</SelectItem>
          <SelectItem value="completed">Completed</SelectItem>
          <SelectItem value="in_progress">In Progress</SelectItem>
          <SelectItem value="failed">Failed</SelectItem>
        </SelectContent>
      </Select>

      {/* Risk Level Filter */}
      <Select
        value={filters.riskLevel}
        onValueChange={(value) =>
          onChange({ ...filters, riskLevel: value ?? "all" })
        }
      >
        <SelectTrigger className="w-[150px]">
          <SelectValue placeholder="Risk Level" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Risk Levels</SelectItem>
          <SelectItem value="regular">Regular</SelectItem>
          <SelectItem value="high">High</SelectItem>
        </SelectContent>
      </Select>

      {/* Clear Filters */}
      {hasActiveFilters && (
        <Button variant="ghost" size="sm" onClick={handleClearFilters}>
          <X className="size-4" />
          Clear Filters
        </Button>
      )}
    </div>
  );
}

"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  CustomerFilters,
  type CustomerFilterValues,
} from "@/components/customers/customer-filters";
import { CustomerTable } from "@/components/customers/customer-table";
import { Pagination } from "@/components/customers/pagination";
import { useCustomers } from "@/hooks/use-customers";
import type { CustomerFilters as CustomerFiltersType } from "@/types/database";

const ITEMS_PER_PAGE = 20;

export default function CustomersPage() {
  const [filters, setFilters] = useState<CustomerFilterValues>({
    search: "",
    tier: "all",
    status: "all",
    riskLevel: "all",
  });
  const [currentPage, setCurrentPage] = useState(1);

  // Map UI filter values to hook filter format
  const queryFilters: CustomerFiltersType = {
    search: filters.search || undefined,
    kyc_tier: filters.tier === "all" ? undefined : (filters.tier as CustomerFiltersType["kyc_tier"]),
    onboarding_status:
      filters.status === "all"
        ? undefined
        : (filters.status as CustomerFiltersType["onboarding_status"]),
    risk_level:
      filters.riskLevel === "all"
        ? undefined
        : (filters.riskLevel as CustomerFiltersType["risk_level"]),
    page: currentPage,
    pageSize: ITEMS_PER_PAGE,
  };

  const { data, isLoading } = useCustomers(queryFilters);

  const customers = data?.customers ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / ITEMS_PER_PAGE);

  const handleFiltersChange = (newFilters: CustomerFilterValues) => {
    setFilters(newFilters);
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Customers</h1>
          <p className="text-sm text-muted-foreground">
            Manage customer KYC onboarding and records.
          </p>
        </div>
        <Button nativeButton={false} render={<Link href="/customers/new" />}>
          <Plus className="mr-2 size-4" />
          New Customer
        </Button>
      </div>

      <CustomerFilters filters={filters} onChange={handleFiltersChange} />

      <div className="text-sm text-muted-foreground">
        {total} customer{total !== 1 ? "s" : ""} found
      </div>

      <CustomerTable customers={customers} loading={isLoading} />

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
    </div>
  );
}

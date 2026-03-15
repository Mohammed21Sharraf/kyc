"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  CustomerFilters,
  type CustomerFilterValues,
} from "@/components/customers/customer-filters";
import { CustomerTable } from "@/components/customers/customer-table";
import { Pagination } from "@/components/customers/pagination";
import type { Customer, OnboardingStatus } from "@/types/database";

// ─── Mock Data ────────────────────────────────────────────────────────────────

const bangladeshiNames = [
  "Mohammad Rahim Uddin",
  "Fatema Akter Khatun",
  "Abdul Karim Sheikh",
  "Nasrin Sultana Begum",
  "Rafiqul Islam Molla",
  "Taslima Begum Rupa",
  "Mizanur Rahman Khan",
  "Sharmin Akter Liza",
  "Jamal Hossain Chowdhury",
  "Ayesha Siddika Moni",
  "Habibur Rahman Sarker",
  "Rehana Parvin Nila",
  "Kamrul Hasan Bhuiyan",
  "Nusrat Jahan Mitu",
  "Shafiqul Islam Talukder",
  "Salma Khatun Bithi",
  "Anisur Rahman Sohel",
  "Mousumi Akter Shathi",
  "Delwar Hossain Mondol",
  "Sumona Akter Rima",
  "Ashraful Alam Majumder",
  "Roksana Begum Jui",
  "Nurul Huda Pramanik",
  "Tania Sultana Mim",
  "Mahfuzur Rahman Akash",
  "Farzana Yasmin Dola",
  "Shahidul Islam Liton",
  "Jesmin Akter Tuly",
  "Alamgir Hossain Rubel",
  "Sabiha Sultana Joty",
  "Mostafizur Rahman Sagar",
  "Poly Akter Swarna",
  "Zahidul Islam Pavel",
  "Nargis Akter Laboni",
  "Badrul Alam Babu",
  "Farjana Akter Nipa",
  "Sohel Rana Mia",
  "Meherunnisa Begum",
  "Towhidul Islam Rocky",
  "Afroza Begum Popy",
  "Nazmul Hasan Tanvir",
  "Rubina Akter Jhorna",
  "Golam Mostofa Rony",
  "Shapna Begum Alo",
  "Imranul Haque Emon",
  "Rokeya Sultana Mala",
  "Firoz Ahmed Firoz",
  "Lucky Akter Keya",
  "Saiful Islam Bachchu",
  "Monira Begum Tithi",
];

const statuses: OnboardingStatus[] = [
  "nid_verification",
  "nid_scan",
  "customer_info",
  "photograph_capture",
  "signature_capture",
  "screening_review",
  "completed",
  "completed",
  "completed",
  "completed",
  "failed",
];

const riskLevels: ("regular" | "high" | null)[] = [
  "regular",
  "regular",
  "regular",
  "regular",
  "high",
  null,
  null,
  null,
];

function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function generateMockCustomers(): Customer[] {
  const rand = seededRandom(42);
  const customers: Customer[] = [];

  for (let i = 0; i < 50; i++) {
    const refNum = String(i + 1).padStart(6, "0");
    const reference_id = `EKYC-2026-${refNum}`;
    const tier = rand() > 0.5 ? "simplified" as const : "regular" as const;
    const status = statuses[Math.floor(rand() * statuses.length)];
    const risk = riskLevels[Math.floor(rand() * riskLevels.length)];
    const gender = rand() > 0.5 ? "M" as const : "F" as const;

    let nid = "";
    for (let d = 0; d < 17; d++) {
      nid += Math.floor(rand() * 10).toString();
    }

    const operators = ["3", "4", "5", "6", "7", "8", "9"];
    let mobile = "01" + operators[Math.floor(rand() * operators.length)];
    for (let d = 0; d < 8; d++) {
      mobile += Math.floor(rand() * 10).toString();
    }

    const dayOffset = Math.floor(rand() * 400);
    const createdDate = new Date(2025, 0, 1);
    createdDate.setDate(createdDate.getDate() + dayOffset);

    const dobYear = 1960 + Math.floor(rand() * 40);
    const dobMonth = 1 + Math.floor(rand() * 12);
    const dobDay = 1 + Math.floor(rand() * 28);

    customers.push({
      id: `cust-${refNum}`,
      reference_id,
      nid_number: nid,
      name_en: bangladeshiNames[i],
      name_bn: null,
      date_of_birth: `${dobYear}-${String(dobMonth).padStart(2, "0")}-${String(dobDay).padStart(2, "0")}`,
      gender,
      father_name_en: null,
      father_name_bn: null,
      mother_name_en: null,
      mother_name_bn: null,
      spouse_name_en: null,
      spouse_name_bn: null,
      nationality: "Bangladeshi",
      present_address: "Dhaka, Bangladesh",
      permanent_address: null,
      mobile_number: mobile,
      email: null,
      profession: null,
      employer_name: null,
      monthly_income: null,
      source_of_funds: null,
      tin_number: null,
      other_bank_accounts: null,
      kyc_tier: tier,
      verification_model: "fingerprint",
      channel: "branch",
      onboarding_status: status,
      nid_verified_at: null,
      nid_verification_method: null,
      risk_level: risk,
      risk_score: risk ? Math.floor(rand() * 28) : null,
      created_by: null,
      approved_by: null,
      onboarded_at: null,
      created_at: createdDate.toISOString(),
      updated_at: createdDate.toISOString(),
    });
  }

  return customers;
}

const mockCustomers = generateMockCustomers();

const IN_PROGRESS_STATUSES: OnboardingStatus[] = [
  "nid_verification",
  "nid_scan",
  "customer_info",
  "photograph_capture",
  "signature_capture",
  "screening_review",
];

const ITEMS_PER_PAGE = 20;

// ─── Page Component ───────────────────────────────────────────────────────────

export default function CustomersPage() {
  const [filters, setFilters] = useState<CustomerFilterValues>({
    search: "",
    tier: "all",
    status: "all",
    riskLevel: "all",
  });
  const [currentPage, setCurrentPage] = useState(1);

  const filteredCustomers = useMemo(() => {
    let result = mockCustomers;

    if (filters.search) {
      const query = filters.search.toLowerCase();
      result = result.filter(
        (c) =>
          c.name_en.toLowerCase().includes(query) ||
          c.nid_number.includes(query) ||
          c.mobile_number.includes(query) ||
          c.reference_id.toLowerCase().includes(query)
      );
    }

    if (filters.tier !== "all") {
      result = result.filter((c) => c.kyc_tier === filters.tier);
    }

    if (filters.status !== "all") {
      switch (filters.status) {
        case "completed":
          result = result.filter((c) => c.onboarding_status === "completed");
          break;
        case "in_progress":
          result = result.filter((c) =>
            IN_PROGRESS_STATUSES.includes(c.onboarding_status)
          );
          break;
        case "failed":
          result = result.filter((c) => c.onboarding_status === "failed");
          break;
      }
    }

    if (filters.riskLevel !== "all") {
      result = result.filter((c) => c.risk_level === filters.riskLevel);
    }

    return result;
  }, [filters]);

  const totalPages = Math.ceil(filteredCustomers.length / ITEMS_PER_PAGE);
  const paginatedCustomers = filteredCustomers.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

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
        <Button render={<Link href="/customers/new" />}>
          <Plus className="mr-2 size-4" />
          New Customer
        </Button>
      </div>

      <CustomerFilters filters={filters} onChange={handleFiltersChange} />

      <div className="text-sm text-muted-foreground">
        {filteredCustomers.length} customer{filteredCustomers.length !== 1 ? "s" : ""} found
      </div>

      <CustomerTable customers={paginatedCustomers} loading={false} />

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
    </div>
  );
}

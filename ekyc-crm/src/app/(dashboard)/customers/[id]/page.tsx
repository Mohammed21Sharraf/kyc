"use client";

import { use } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { PersonalInfoTab } from "@/components/profile/personal-info-tab";
import { DocumentsTab } from "@/components/profile/documents-tab";
import { NomineesTab } from "@/components/profile/nominees-tab";
import { ScreeningTab } from "@/components/profile/screening-tab";
import { RiskGradingTab } from "@/components/profile/risk-grading-tab";
import { AuditTrailTab } from "@/components/profile/audit-trail-tab";
import {
  ArrowLeft,
  User,
  FileText,
  Users,
  Search,
  BarChart3,
  Clock,
  ShieldCheck,
} from "lucide-react";
import type {
  Customer,
  CustomerDocument,
  Nominee,
  ScreeningResult,
  RiskGrading,
  AuditLog,
} from "@/types/database";

// ─── Mock Data ────────────────────────────────────────────────────────────────

const mockCustomer: Customer = {
  id: "c7e1a2b3-4d5e-6f7a-8b9c-0d1e2f3a4b5c",
  reference_id: "EKYC-2026-000042",
  nid_number: "19901234567890123",
  name_en: "Mohammad Rafiqul Islam",
  name_bn: "মোহাম্মদ রফিকুল ইসলাম",
  date_of_birth: "1990-05-15",
  gender: "M",
  father_name_en: "Abdul Karim Islam",
  father_name_bn: "আব্দুল করিম ইসলাম",
  mother_name_en: "Fatema Begum",
  mother_name_bn: "ফাতেমা বেগম",
  spouse_name_en: "Nasreen Akter",
  spouse_name_bn: "নাসরীন আক্তার",
  nationality: "Bangladeshi",
  present_address: "House 42, Road 7, Block C, Mirpur-10, Dhaka-1216",
  permanent_address: "Village: Char Gopalpur, Post: Bhairab, Upazila: Bhairab, District: Kishoreganj",
  mobile_number: "01712345678",
  email: "rafiqul.islam@email.com",
  profession: "Software Engineer",
  employer_name: "Grameenphone Ltd.",
  monthly_income: 85000,
  source_of_funds: "Salary",
  tin_number: "123456789012",
  other_bank_accounts: "Dutch-Bangla Bank: 1234567890",
  kyc_tier: "regular",
  verification_model: "fingerprint",
  channel: "branch",
  onboarding_status: "completed",
  nid_verified_at: "2026-02-10T09:32:00.000Z",
  nid_verification_method: "fingerprint",
  risk_level: "regular",
  risk_score: 8,
  created_by: "user-agent-001",
  approved_by: "user-checker-001",
  onboarded_at: "2026-02-12T14:15:00.000Z",
  created_at: "2026-02-10T09:30:00.000Z",
  updated_at: "2026-02-12T14:15:00.000Z",
};

const mockDocuments: CustomerDocument[] = [
  {
    id: "doc-001",
    customer_id: mockCustomer.id,
    document_type: "nid_front",
    storage_path: "nid-images/c7e1a2b3/nid_front.jpg",
    file_name: "nid_front_19901234567890123.jpg",
    file_size: 245760,
    mime_type: "image/jpeg",
    uploaded_by: "user-agent-001",
    created_at: "2026-02-10T09:35:00.000Z",
  },
  {
    id: "doc-002",
    customer_id: mockCustomer.id,
    document_type: "nid_back",
    storage_path: "nid-images/c7e1a2b3/nid_back.jpg",
    file_name: "nid_back_19901234567890123.jpg",
    file_size: 231424,
    mime_type: "image/jpeg",
    uploaded_by: "user-agent-001",
    created_at: "2026-02-10T09:36:00.000Z",
  },
  {
    id: "doc-003",
    customer_id: mockCustomer.id,
    document_type: "photograph",
    storage_path: "photographs/c7e1a2b3/photo.jpg",
    file_name: "photo_rafiqul_islam.jpg",
    file_size: 184320,
    mime_type: "image/jpeg",
    uploaded_by: "user-agent-001",
    created_at: "2026-02-10T09:40:00.000Z",
  },
  {
    id: "doc-004",
    customer_id: mockCustomer.id,
    document_type: "signature",
    storage_path: "signatures/c7e1a2b3/signature.png",
    file_name: "signature_rafiqul_islam.png",
    file_size: 51200,
    mime_type: "image/png",
    uploaded_by: "user-agent-001",
    created_at: "2026-02-10T09:42:00.000Z",
  },
];

const mockNominees: Nominee[] = [
  {
    id: "nom-001",
    customer_id: mockCustomer.id,
    name_en: "Nasreen Akter",
    name_bn: "নাসরীন আক্তার",
    relationship: "Spouse",
    nid_number: "19921098765432109",
    date_of_birth: "1992-08-20",
    share_percentage: 100,
    is_minor: false,
    guardian_name: null,
    guardian_nid: null,
    guardian_relationship: null,
    created_at: "2026-02-10T09:45:00.000Z",
  },
];

const mockScreeningResults: ScreeningResult[] = [
  {
    id: "scr-001",
    customer_id: mockCustomer.id,
    screening_type: "unscr",
    screening_status: "clear",
    result_details: { message: "No matches found against UN sanctions list." },
    screened_by: "System (Auto)",
    reviewed_by: null,
    screened_at: "2026-02-10T10:00:00.000Z",
    reviewed_at: null,
    created_at: "2026-02-10T10:00:00.000Z",
  },
  {
    id: "scr-002",
    customer_id: mockCustomer.id,
    screening_type: "ip_check",
    screening_status: "clear",
    result_details: { message: "No PEP/IP association identified." },
    screened_by: "System (Auto)",
    reviewed_by: null,
    screened_at: "2026-02-10T10:01:00.000Z",
    reviewed_at: null,
    created_at: "2026-02-10T10:01:00.000Z",
  },
  {
    id: "scr-003",
    customer_id: mockCustomer.id,
    screening_type: "adverse_media",
    screening_status: "clear",
    result_details: { message: "No adverse media reports found." },
    screened_by: "System (Auto)",
    reviewed_by: null,
    screened_at: "2026-02-10T10:02:00.000Z",
    reviewed_at: null,
    created_at: "2026-02-10T10:02:00.000Z",
  },
  {
    id: "scr-004",
    customer_id: mockCustomer.id,
    screening_type: "beneficial_ownership",
    screening_status: "clear",
    result_details: { message: "Beneficial ownership verified." },
    screened_by: "System (Auto)",
    reviewed_by: null,
    screened_at: "2026-02-10T10:03:00.000Z",
    reviewed_at: null,
    created_at: "2026-02-10T10:03:00.000Z",
  },
];

const mockRiskGrading: RiskGrading = {
  id: "rg-001",
  customer_id: mockCustomer.id,
  dimension_1_score: 0,
  dimension_1_rationale: "Face to face at branch",
  dimension_2_score: 0,
  dimension_2_rationale: "Domestic - Urban (Dhaka)",
  dimension_3_score: 0,
  dimension_3_rationale: "General individual, not a PEP",
  dimension_4_score: 2,
  dimension_4_rationale: "Full banking with digital access",
  dimension_5_score: 1,
  dimension_5_rationale: "Software Engineer - low risk profession",
  dimension_6_score: 1,
  dimension_6_rationale: "Moderate transaction volume expected",
  dimension_7_score: 0,
  dimension_7_rationale: "Full documentation provided",
  total_score: 4,
  risk_level: "regular",
  graded_by: "user-checker-001",
  approved_by: "user-checker-001",
  graded_at: "2026-02-11T11:00:00.000Z",
  created_at: "2026-02-11T11:00:00.000Z",
};

const mockAuditLogs: AuditLog[] = [
  {
    id: "audit-001",
    customer_id: mockCustomer.id,
    user_id: "user-agent-001",
    action: "Customer account initiated via branch e-KYC",
    entity_type: "customer",
    entity_id: mockCustomer.id,
    old_values: null,
    new_values: { status: "nid_verification", channel: "branch" },
    ip_address: "103.12.45.67",
    user_agent: "Mozilla/5.0 Chrome/120",
    created_at: "2026-02-10T09:30:00.000Z",
  },
  {
    id: "audit-002",
    customer_id: mockCustomer.id,
    user_id: "user-agent-001",
    action: "NID verification completed via fingerprint",
    entity_type: "customer",
    entity_id: mockCustomer.id,
    old_values: { status: "nid_verification" },
    new_values: { status: "nid_scan", nid_verified: true },
    ip_address: "103.12.45.67",
    user_agent: "Mozilla/5.0 Chrome/120",
    created_at: "2026-02-10T09:32:00.000Z",
  },
  {
    id: "audit-003",
    customer_id: mockCustomer.id,
    user_id: "user-agent-001",
    action: "Documents uploaded (NID Front, NID Back, Photo, Signature)",
    entity_type: "document",
    entity_id: mockCustomer.id,
    old_values: null,
    new_values: { documents_count: 4 },
    ip_address: "103.12.45.67",
    user_agent: "Mozilla/5.0 Chrome/120",
    created_at: "2026-02-10T09:42:00.000Z",
  },
  {
    id: "audit-004",
    customer_id: mockCustomer.id,
    user_id: null,
    action: "Screening completed - all checks clear",
    entity_type: "screening",
    entity_id: mockCustomer.id,
    old_values: null,
    new_values: { screening_types: 4, all_clear: true },
    ip_address: null,
    user_agent: null,
    created_at: "2026-02-10T10:03:00.000Z",
  },
  {
    id: "audit-005",
    customer_id: mockCustomer.id,
    user_id: "user-checker-001",
    action: "Risk grading performed - Score: 4/28 (Regular)",
    entity_type: "risk_grading",
    entity_id: mockCustomer.id,
    old_values: null,
    new_values: { total_score: 4, risk_level: "regular" },
    ip_address: "10.0.1.55",
    user_agent: "Mozilla/5.0 Chrome/120",
    created_at: "2026-02-11T11:00:00.000Z",
  },
  {
    id: "audit-006",
    customer_id: mockCustomer.id,
    user_id: "user-checker-001",
    action: "Customer application approved and onboarding completed",
    entity_type: "customer",
    entity_id: mockCustomer.id,
    old_values: { status: "screening_review" },
    new_values: { status: "completed" },
    ip_address: "10.0.1.55",
    user_agent: "Mozilla/5.0 Chrome/120",
    created_at: "2026-02-12T14:15:00.000Z",
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getStatusBadgeClass(status: string) {
  switch (status) {
    case "completed":
      return "bg-green-100 text-green-700";
    case "failed":
      return "bg-red-100 text-red-700";
    case "screening_review":
      return "bg-yellow-100 text-yellow-700";
    default:
      return "bg-blue-100 text-blue-700";
  }
}

function getRiskBadgeClass(risk: string | null) {
  switch (risk) {
    case "high":
      return "bg-red-100 text-red-700";
    case "regular":
      return "bg-green-100 text-green-700";
    default:
      return "bg-gray-100 text-gray-700";
  }
}

function formatStatus(status: string) {
  return status
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

// ─── Page Component ───────────────────────────────────────────────────────────

export default function CustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  // Phase 1: use mock data regardless of ID
  const customer = mockCustomer;
  const documents = mockDocuments;
  const nominees = mockNominees;
  const screeningResults = mockScreeningResults;
  const riskGrading = mockRiskGrading;
  const auditLogs = mockAuditLogs;

  void id; // suppress unused warning

  return (
    <div className="space-y-6">
      {/* Back button */}
      <Button variant="ghost" size="sm" render={<Link href="/customers" />} className="gap-1.5">
        <ArrowLeft className="size-4" />
        Back to Customers
      </Button>

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">{customer.name_en}</h1>
          <p className="text-sm text-muted-foreground">
            Reference: <span className="font-mono">{customer.reference_id}</span>
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge className={getStatusBadgeClass(customer.onboarding_status)}>
            {formatStatus(customer.onboarding_status)}
          </Badge>
          <Badge variant="outline" className="capitalize">
            {customer.kyc_tier} Tier
          </Badge>
          <Badge className={getRiskBadgeClass(customer.risk_level)}>
            <ShieldCheck className="mr-1 size-3" />
            {customer.risk_level
              ? formatStatus(customer.risk_level) + " Risk"
              : "Not Graded"}
          </Badge>
        </div>
      </div>

      <Separator />

      {/* Tabbed Interface */}
      <Tabs defaultValue="personal">
        <TabsList>
          <TabsTrigger value="personal">
            <User className="mr-1.5 size-3.5" />
            Personal Info
          </TabsTrigger>
          <TabsTrigger value="documents">
            <FileText className="mr-1.5 size-3.5" />
            Documents
          </TabsTrigger>
          <TabsTrigger value="nominees">
            <Users className="mr-1.5 size-3.5" />
            Nominees
          </TabsTrigger>
          <TabsTrigger value="screening">
            <Search className="mr-1.5 size-3.5" />
            Screening
          </TabsTrigger>
          <TabsTrigger value="risk">
            <BarChart3 className="mr-1.5 size-3.5" />
            Risk Grading
          </TabsTrigger>
          <TabsTrigger value="audit">
            <Clock className="mr-1.5 size-3.5" />
            Audit Trail
          </TabsTrigger>
        </TabsList>

        <TabsContent value="personal">
          <PersonalInfoTab customer={customer} />
        </TabsContent>

        <TabsContent value="documents">
          <DocumentsTab documents={documents} />
        </TabsContent>

        <TabsContent value="nominees">
          <NomineesTab nominees={nominees} />
        </TabsContent>

        <TabsContent value="screening">
          <ScreeningTab screeningResults={screeningResults} />
        </TabsContent>

        <TabsContent value="risk">
          <RiskGradingTab riskGrading={riskGrading} customerId={customer.id} />
        </TabsContent>

        <TabsContent value="audit">
          <AuditTrailTab auditLogs={auditLogs} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

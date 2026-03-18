// ─── Enums (as string unions for Supabase compatibility) ────────────────────

export type KycTier = 'simplified' | 'regular';
export type OnboardingStatus =
  | 'nid_verification'
  | 'nid_scan'
  | 'customer_info'
  | 'photograph_capture'
  | 'signature_capture'
  | 'screening_review'
  | 'completed'
  | 'failed';
export type RiskLevel = 'regular' | 'high';
export type AppRole = 'maker' | 'checker' | 'admin' | 'auditor';
export type VerificationModel = 'fingerprint' | 'face_matching';
export type GenderType = 'M' | 'F' | 'T';
export type DocumentType =
  | 'nid_front'
  | 'nid_back'
  | 'photograph'
  | 'signature'
  | 'nominee_photo'
  | 'nominee_nid';
export type ScreeningType =
  | 'unscr'
  | 'ip_check'
  | 'adverse_media'
  | 'beneficial_ownership'
  | 'pep_check';
export type ScreeningStatus = 'pending' | 'clear' | 'flagged' | 'escalated';
export type ChannelType = 'branch' | 'agent' | 'digital';

// ─── Database Row Types ──────────────────────────────────────────────────────

export interface Customer {
  id: string;
  reference_id: string;
  nid_number: string;
  name_en: string;
  name_bn: string | null;
  date_of_birth: string;
  gender: GenderType;
  father_name_en: string | null;
  father_name_bn: string | null;
  mother_name_en: string | null;
  mother_name_bn: string | null;
  spouse_name_en: string | null;
  spouse_name_bn: string | null;
  nationality: string;
  present_address: string | null;
  permanent_address: string | null;
  mobile_number: string;
  email: string | null;
  profession: string | null;
  employer_name: string | null;
  monthly_income: number | null;
  source_of_funds: string | null;
  tin_number: string | null;
  other_bank_accounts: string | null;
  kyc_tier: KycTier;
  verification_model: VerificationModel;
  channel: ChannelType;
  onboarding_status: OnboardingStatus;
  nid_verified_at: string | null;
  nid_verification_method: string | null;
  risk_level: RiskLevel | null;
  risk_score: number | null;
  created_by: string | null;
  approved_by: string | null;
  onboarded_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Nominee {
  id: string;
  customer_id: string;
  name_en: string;
  name_bn: string | null;
  relationship: string;
  nid_number: string | null;
  date_of_birth: string | null;
  is_minor: boolean;
  guardian_name: string | null;
  guardian_nid: string | null;
  guardian_relationship: string | null;
  share_percentage: number;
  created_at: string;
}

export interface RiskGrading {
  id: string;
  customer_id: string;
  dimension_1_score: number;
  dimension_1_rationale: string | null;
  dimension_2_score: number;
  dimension_2_rationale: string | null;
  dimension_3_score: number;
  dimension_3_rationale: string | null;
  dimension_4_score: number;
  dimension_4_rationale: string | null;
  dimension_5_score: number;
  dimension_5_rationale: string | null;
  dimension_6_score: number;
  dimension_6_rationale: string | null;
  dimension_7_score: number;
  dimension_7_rationale: string | null;
  total_score: number;
  risk_level: RiskLevel;
  graded_by: string | null;
  approved_by: string | null;
  graded_at: string;
  created_at: string;
}

export interface CustomerDocument {
  id: string;
  customer_id: string;
  document_type: DocumentType;
  storage_path: string;
  file_name: string;
  file_size: number | null;
  mime_type: string | null;
  uploaded_by: string | null;
  created_at: string;
}

export interface ScreeningResult {
  id: string;
  customer_id: string;
  screening_type: ScreeningType;
  screening_status: ScreeningStatus;
  result_details: Record<string, unknown> | null;
  screened_by: string | null;
  reviewed_by: string | null;
  screened_at: string;
  reviewed_at: string | null;
  created_at: string;
}

export interface TransactionLimit {
  id: string;
  customer_id: string | null;
  daily_debit_limit: number;
  daily_credit_limit: number;
  monthly_debit_limit: number;
  monthly_credit_limit: number;
  effective_from: string;
  effective_to: string | null;
  created_at: string;
}

export interface PeriodicReview {
  id: string;
  customer_id: string;
  review_type: string;
  due_date: string;
  completed_date: string | null;
  reviewer_id: string | null;
  notes: string | null;
  created_at: string;
}

export interface AuditLog {
  id: string;
  customer_id: string | null;
  user_id: string | null;
  action: string;
  entity_type: string;
  entity_id: string | null;
  old_values: Record<string, unknown> | null;
  new_values: Record<string, unknown> | null;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
}

export interface Profile {
  id: string;
  full_name: string | null;
  designation: string | null;
  branch_code: string | null;
  branch_name: string | null;
  employee_id: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserRole {
  id: string;
  user_id: string;
  role: AppRole;
  assigned_by: string | null;
  created_at: string;
}

// ─── Form Data Types ─────────────────────────────────────────────────────────

export interface CustomerFormData {
  nid_number: string;
  date_of_birth: string;
  verification_model: VerificationModel;
  kyc_tier: KycTier;
  channel: ChannelType;
  name_en: string;
  name_bn?: string;
  father_name_en?: string;
  father_name_bn?: string;
  mother_name_en?: string;
  mother_name_bn?: string;
  spouse_name_en?: string;
  spouse_name_bn?: string;
  gender: GenderType;
  nationality?: string;
  present_address?: string;
  permanent_address?: string;
  mobile_number: string;
  email?: string;
  profession?: string;
  employer_name?: string;
  monthly_income?: number;
  source_of_funds?: string;
  tin_number?: string;
  other_bank_accounts?: string;
}

export interface RiskGradingFormData {
  customer_id: string;
  dimension_1_score: number;
  dimension_1_rationale?: string;
  dimension_2_score: number;
  dimension_2_rationale?: string;
  dimension_3_score: number;
  dimension_3_rationale?: string;
  dimension_4_score: number;
  dimension_4_rationale?: string;
  dimension_5_score: number;
  dimension_5_rationale?: string;
  dimension_6_score: number;
  dimension_6_rationale?: string;
  dimension_7_score: number;
  dimension_7_rationale?: string;
}

export interface OnboardingStepData {
  step: number;
  status: 'pending' | 'in_progress' | 'completed' | 'skipped';
  data: Record<string, unknown>;
}

// ─── Composite / Query Types ─────────────────────────────────────────────────

export interface CustomerWithRelations extends Customer {
  nominees?: Nominee[];
  documents?: CustomerDocument[];
  screening_results?: ScreeningResult[];
  risk_grading?: RiskGrading | null;
}

export interface DashboardStats {
  totalCustomers: number;
  monthlyOnboarded: number;
  pendingReview: number;
  highRisk: number;
}

export interface CustomerFilters {
  search?: string;
  kyc_tier?: KycTier | 'all';
  onboarding_status?: OnboardingStatus | 'in_progress' | 'all';
  risk_level?: RiskLevel | 'all';
  page?: number;
  pageSize?: number;
}

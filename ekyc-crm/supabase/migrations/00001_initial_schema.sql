-- ============================================================================
-- Bangladesh Bank e-KYC CRM System - Initial Schema Migration
-- Migration: 00001_initial_schema
-- Description: Creates all enums, tables, functions, RLS policies, and seed data
-- ============================================================================

-- ============================================================================
-- EXTENSIONS
-- ============================================================================
create extension if not exists "pgcrypto";
create extension if not exists "uuid-ossp";

-- ============================================================================
-- ENUMS
-- ============================================================================
create type kyc_tier as enum ('simplified', 'regular');
create type onboarding_status as enum (
  'nid_verification',
  'nid_scan',
  'customer_info',
  'photograph_capture',
  'signature_capture',
  'screening_review',
  'completed',
  'failed'
);
create type risk_level as enum ('regular', 'high');
create type app_role as enum ('maker', 'checker', 'admin', 'auditor');
create type verification_model as enum ('fingerprint', 'face_matching');
create type gender_type as enum ('M', 'F', 'T');
create type document_type as enum (
  'nid_front',
  'nid_back',
  'photograph',
  'signature',
  'nominee_photo',
  'nominee_nid'
);
create type screening_type as enum (
  'unscr',
  'ip_check',
  'adverse_media',
  'beneficial_ownership',
  'pep_check'
);
create type screening_status as enum ('pending', 'clear', 'flagged', 'escalated');
create type channel_type as enum ('branch', 'agent', 'digital');

-- ============================================================================
-- SEQUENCES
-- ============================================================================
create sequence if not exists customer_ref_seq start with 1 increment by 1;

-- ============================================================================
-- FUNCTIONS
-- ============================================================================

-- Generate sequential reference IDs: EKYC-YYYY-NNNNNN
create or replace function generate_reference_id()
returns text
language plpgsql
as $$
declare
  seq_val bigint;
  ref_id text;
begin
  seq_val := nextval('customer_ref_seq');
  ref_id := 'EKYC-' || extract(year from now())::text || '-' || lpad(seq_val::text, 6, '0');
  return ref_id;
end;
$$;

-- Auto-update updated_at timestamp trigger function
create or replace function handle_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ============================================================================
-- TABLES
-- ============================================================================

-- ---------------------------------------------------------------------------
-- profiles (extends Supabase auth.users)
-- ---------------------------------------------------------------------------
create table profiles (
  id          uuid primary key references auth.users on delete cascade,
  full_name   text not null,
  designation text,
  branch_code text,
  branch_name text,
  employee_id text unique,
  is_active   boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create trigger profiles_updated_at
  before update on profiles
  for each row execute function handle_updated_at();

-- ---------------------------------------------------------------------------
-- user_roles
-- ---------------------------------------------------------------------------
create table user_roles (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references profiles(id) on delete cascade,
  role        app_role not null,
  assigned_by uuid references profiles(id),
  created_at  timestamptz not null default now(),
  unique (user_id, role)
);

-- ---------------------------------------------------------------------------
-- customers
-- ---------------------------------------------------------------------------
create table customers (
  id                      uuid primary key default uuid_generate_v4(),
  reference_id            text not null unique default generate_reference_id(),
  kyc_tier                kyc_tier not null default 'simplified',
  onboarding_status       onboarding_status not null default 'nid_verification',
  verification_model      verification_model,
  channel                 channel_type not null default 'branch',

  -- NID fields
  nid_number              text not null,
  date_of_birth           date not null,

  -- Personal information
  name_en                 text not null,
  name_bn                 text,
  father_name_en          text,
  father_name_bn          text,
  mother_name_en          text,
  mother_name_bn          text,
  spouse_name_en          text,
  spouse_name_bn          text,

  gender                  gender_type,
  nationality             text not null default 'Bangladeshi',

  -- Address
  present_address         jsonb,
  permanent_address       jsonb,

  -- Contact
  mobile_number           text,
  email                   text,

  -- Employment & financial
  profession              text,
  employer_name           text,
  monthly_income          numeric(15, 2),
  source_of_funds         text,          -- regular tier only
  tin_number              text,          -- regular tier only
  other_bank_accounts     jsonb,         -- regular tier only

  -- NID verification
  nid_verified_at         timestamptz,
  nid_verification_method text,

  -- Risk
  risk_level              risk_level not null default 'regular',
  risk_score              smallint,

  -- Workflow
  created_by              uuid references profiles(id),
  approved_by             uuid references profiles(id),
  onboarded_at            timestamptz,
  created_at              timestamptz not null default now(),
  updated_at              timestamptz not null default now()
);

-- Index on encrypted/hashed NID for lookups
create index idx_customers_nid_number on customers (nid_number);
create index idx_customers_reference_id on customers (reference_id);
create index idx_customers_onboarding_status on customers (onboarding_status);
create index idx_customers_created_by on customers (created_by);
create index idx_customers_mobile_number on customers (mobile_number);

create trigger customers_updated_at
  before update on customers
  for each row execute function handle_updated_at();

-- ---------------------------------------------------------------------------
-- nominees
-- ---------------------------------------------------------------------------
create table nominees (
  id                    uuid primary key default uuid_generate_v4(),
  customer_id           uuid not null references customers(id) on delete cascade,
  name_en               text not null,
  name_bn               text,
  relationship          text not null,
  nid_number            text,
  date_of_birth         date,
  is_minor              boolean not null default false,
  guardian_name         text,
  guardian_nid          text,
  guardian_relationship text,
  share_percentage      numeric(5, 2) not null default 100.00,
  created_at            timestamptz not null default now()
);

create index idx_nominees_customer_id on nominees (customer_id);

-- ---------------------------------------------------------------------------
-- risk_gradings
-- ---------------------------------------------------------------------------
create table risk_gradings (
  id                     uuid primary key default uuid_generate_v4(),
  customer_id            uuid not null references customers(id) on delete cascade,

  -- Bangladesh Bank 7-dimension risk scoring
  dimension_1_score      smallint,
  dimension_1_rationale  text,
  dimension_2_score      smallint,
  dimension_2_rationale  text,
  dimension_3_score      smallint,
  dimension_3_rationale  text,
  dimension_4_score      smallint,
  dimension_4_rationale  text,
  dimension_5_score      smallint,
  dimension_5_rationale  text,
  dimension_6_score      smallint,
  dimension_6_rationale  text,
  dimension_7_score      smallint,
  dimension_7_rationale  text,

  total_score            smallint,
  risk_level             risk_level not null default 'regular',

  graded_by              uuid references profiles(id),
  approved_by            uuid references profiles(id),
  graded_at              timestamptz not null default now(),
  created_at             timestamptz not null default now()
);

create index idx_risk_gradings_customer_id on risk_gradings (customer_id);

-- ---------------------------------------------------------------------------
-- customer_documents
-- ---------------------------------------------------------------------------
create table customer_documents (
  id              uuid primary key default uuid_generate_v4(),
  customer_id     uuid not null references customers(id) on delete cascade,
  document_type   document_type not null,
  storage_path    text not null,
  file_name       text not null,
  file_size       bigint,
  mime_type       text,
  uploaded_by     uuid references profiles(id),
  created_at      timestamptz not null default now()
);

create index idx_customer_documents_customer_id on customer_documents (customer_id);
create index idx_customer_documents_type on customer_documents (customer_id, document_type);

-- ---------------------------------------------------------------------------
-- screening_results
-- ---------------------------------------------------------------------------
create table screening_results (
  id                uuid primary key default uuid_generate_v4(),
  customer_id       uuid not null references customers(id) on delete cascade,
  screening_type    screening_type not null,
  screening_status  screening_status not null default 'pending',
  result_details    jsonb,
  screened_by       uuid references profiles(id),
  reviewed_by       uuid references profiles(id),
  screened_at       timestamptz not null default now(),
  reviewed_at       timestamptz,
  created_at        timestamptz not null default now()
);

create index idx_screening_results_customer_id on screening_results (customer_id);
create index idx_screening_results_status on screening_results (screening_status);

-- ---------------------------------------------------------------------------
-- transaction_limits
-- ---------------------------------------------------------------------------
create table transaction_limits (
  id                   uuid primary key default uuid_generate_v4(),
  customer_id          uuid references customers(id) on delete cascade,
  daily_debit_limit    numeric(15, 2) not null,
  daily_credit_limit   numeric(15, 2) not null,
  monthly_debit_limit  numeric(15, 2) not null,
  monthly_credit_limit numeric(15, 2) not null,
  effective_from       date not null default current_date,
  effective_to         date,
  created_at           timestamptz not null default now()
);

create index idx_transaction_limits_customer_id on transaction_limits (customer_id);

-- ---------------------------------------------------------------------------
-- periodic_reviews
-- ---------------------------------------------------------------------------
create table periodic_reviews (
  id              uuid primary key default uuid_generate_v4(),
  customer_id     uuid not null references customers(id) on delete cascade,
  review_type     text not null,
  due_date        date not null,
  completed_date  date,
  reviewer_id     uuid references profiles(id),
  notes           text,
  created_at      timestamptz not null default now()
);

create index idx_periodic_reviews_customer_id on periodic_reviews (customer_id);
create index idx_periodic_reviews_due_date on periodic_reviews (due_date);

-- ---------------------------------------------------------------------------
-- audit_logs
-- ---------------------------------------------------------------------------
create table audit_logs (
  id           uuid primary key default uuid_generate_v4(),
  customer_id  uuid references customers(id) on delete set null,
  user_id      uuid not null references profiles(id),
  action       text not null,
  entity_type  text not null,
  entity_id    uuid,
  old_values   jsonb,
  new_values   jsonb,
  ip_address   inet,
  user_agent   text,
  created_at   timestamptz not null default now()
);

create index idx_audit_logs_customer_id on audit_logs (customer_id);
create index idx_audit_logs_user_id on audit_logs (user_id);
create index idx_audit_logs_entity on audit_logs (entity_type, entity_id);
create index idx_audit_logs_created_at on audit_logs (created_at);

-- ============================================================================
-- DASHBOARD STATS FUNCTION
-- ============================================================================
create or replace function get_dashboard_stats()
returns json
language plpgsql
security definer
as $$
declare
  result json;
begin
  select json_build_object(
    'total_customers', (select count(*) from customers),
    'monthly_onboarded', (
      select count(*) from customers
      where onboarded_at >= date_trunc('month', now())
        and onboarding_status = 'completed'
    ),
    'pending_review', (
      select count(*) from customers
      where onboarding_status not in ('completed', 'failed')
    ),
    'high_risk', (
      select count(*) from customers
      where risk_level = 'high'
    )
  ) into result;
  return result;
end;
$$;

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

-- Enable RLS on all tables
alter table profiles enable row level security;
alter table user_roles enable row level security;
alter table customers enable row level security;
alter table nominees enable row level security;
alter table risk_gradings enable row level security;
alter table customer_documents enable row level security;
alter table screening_results enable row level security;
alter table transaction_limits enable row level security;
alter table periodic_reviews enable row level security;
alter table audit_logs enable row level security;

-- ---------------------------------------------------------------------------
-- profiles policies
-- ---------------------------------------------------------------------------
create policy "Users can view all profiles"
  on profiles for select
  to authenticated
  using (true);

create policy "Users can update own profile"
  on profiles for update
  to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

create policy "Users can insert own profile"
  on profiles for insert
  to authenticated
  with check (id = auth.uid());

-- ---------------------------------------------------------------------------
-- user_roles policies
-- ---------------------------------------------------------------------------
create policy "Authenticated users can view user roles"
  on user_roles for select
  to authenticated
  using (true);

create policy "Authenticated users can insert user roles"
  on user_roles for insert
  to authenticated
  with check (true);

create policy "Authenticated users can update user roles"
  on user_roles for update
  to authenticated
  using (true);

create policy "Authenticated users can delete user roles"
  on user_roles for delete
  to authenticated
  using (true);

-- ---------------------------------------------------------------------------
-- customers policies
-- ---------------------------------------------------------------------------
create policy "Authenticated users can view all customers"
  on customers for select
  to authenticated
  using (true);

create policy "Authenticated users can create customers"
  on customers for insert
  to authenticated
  with check (true);

create policy "Authenticated users can update customers"
  on customers for update
  to authenticated
  using (true);

-- ---------------------------------------------------------------------------
-- nominees policies
-- ---------------------------------------------------------------------------
create policy "Authenticated users can view nominees"
  on nominees for select
  to authenticated
  using (true);

create policy "Authenticated users can insert nominees"
  on nominees for insert
  to authenticated
  with check (true);

create policy "Authenticated users can update nominees"
  on nominees for update
  to authenticated
  using (true);

create policy "Authenticated users can delete nominees"
  on nominees for delete
  to authenticated
  using (true);

-- ---------------------------------------------------------------------------
-- risk_gradings policies
-- ---------------------------------------------------------------------------
create policy "Authenticated users can view risk gradings"
  on risk_gradings for select
  to authenticated
  using (true);

create policy "Authenticated users can insert risk gradings"
  on risk_gradings for insert
  to authenticated
  with check (true);

create policy "Authenticated users can update risk gradings"
  on risk_gradings for update
  to authenticated
  using (true);

create policy "Authenticated users can delete risk gradings"
  on risk_gradings for delete
  to authenticated
  using (true);

-- ---------------------------------------------------------------------------
-- customer_documents policies
-- ---------------------------------------------------------------------------
create policy "Authenticated users can view documents"
  on customer_documents for select
  to authenticated
  using (true);

create policy "Authenticated users can insert documents"
  on customer_documents for insert
  to authenticated
  with check (true);

create policy "Authenticated users can update documents"
  on customer_documents for update
  to authenticated
  using (true);

create policy "Authenticated users can delete documents"
  on customer_documents for delete
  to authenticated
  using (true);

-- ---------------------------------------------------------------------------
-- screening_results policies
-- ---------------------------------------------------------------------------
create policy "Authenticated users can view screening results"
  on screening_results for select
  to authenticated
  using (true);

create policy "Authenticated users can insert screening results"
  on screening_results for insert
  to authenticated
  with check (true);

create policy "Authenticated users can update screening results"
  on screening_results for update
  to authenticated
  using (true);

create policy "Authenticated users can delete screening results"
  on screening_results for delete
  to authenticated
  using (true);

-- ---------------------------------------------------------------------------
-- transaction_limits policies
-- ---------------------------------------------------------------------------
create policy "Authenticated users can view transaction limits"
  on transaction_limits for select
  to authenticated
  using (true);

create policy "Authenticated users can insert transaction limits"
  on transaction_limits for insert
  to authenticated
  with check (true);

create policy "Authenticated users can update transaction limits"
  on transaction_limits for update
  to authenticated
  using (true);

create policy "Authenticated users can delete transaction limits"
  on transaction_limits for delete
  to authenticated
  using (true);

-- ---------------------------------------------------------------------------
-- periodic_reviews policies
-- ---------------------------------------------------------------------------
create policy "Authenticated users can view periodic reviews"
  on periodic_reviews for select
  to authenticated
  using (true);

create policy "Authenticated users can insert periodic reviews"
  on periodic_reviews for insert
  to authenticated
  with check (true);

create policy "Authenticated users can update periodic reviews"
  on periodic_reviews for update
  to authenticated
  using (true);

create policy "Authenticated users can delete periodic reviews"
  on periodic_reviews for delete
  to authenticated
  using (true);

-- ---------------------------------------------------------------------------
-- audit_logs policies (insert and read only, no update/delete)
-- ---------------------------------------------------------------------------
create policy "Authenticated users can view audit logs"
  on audit_logs for select
  to authenticated
  using (true);

create policy "Authenticated users can insert audit logs"
  on audit_logs for insert
  to authenticated
  with check (true);

-- ============================================================================
-- SEED DATA: Default Transaction Limits
-- ============================================================================

-- Simplified tier defaults (customer_id = NULL serves as template)
insert into transaction_limits (customer_id, daily_debit_limit, daily_credit_limit, monthly_debit_limit, monthly_credit_limit)
values
  (null, 25000.00, 50000.00, 200000.00, 200000.00),    -- simplified tier
  (null, 200000.00, 500000.00, 1000000.00, 1000000.00); -- regular tier

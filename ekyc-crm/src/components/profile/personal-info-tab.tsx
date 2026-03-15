"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { Customer, KycTier } from "@/types/database";
import { User, Phone, MapPin, Briefcase, Banknote } from "lucide-react";

interface PersonalInfoTabProps {
  customer: Customer;
}

function InfoField({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div className="space-y-1">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className="text-sm text-foreground">{value || "N/A"}</p>
    </div>
  );
}

function SectionHeader({ icon: Icon, title }: { icon: React.ElementType; title: string }) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <Icon className="size-4 text-muted-foreground" />
      <h3 className="text-sm font-semibold text-foreground">{title}</h3>
    </div>
  );
}

export function PersonalInfoTab({ customer }: PersonalInfoTabProps) {
  return (
    <div className="space-y-6">
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="size-4" />
            Basic Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <InfoField label="Name (English)" value={customer.name_en} />
            <InfoField label="Name (Bangla)" value={customer.name_bn} />
            <InfoField label="Father's Name" value={customer.father_name_en} />
            <InfoField label="Mother's Name" value={customer.mother_name_en} />
            <InfoField label="Spouse's Name" value={customer.spouse_name_en} />
            <InfoField
              label="Gender"
              value={customer.gender ? customer.gender.charAt(0).toUpperCase() + customer.gender.slice(1) : null}
            />
            <InfoField label="Date of Birth" value={customer.date_of_birth} />
            <InfoField label="NID Number" value={customer.nid_number} />
            <InfoField label="Nationality" value={customer.nationality} />
          </div>
        </CardContent>
      </Card>

      {/* Contact Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Phone className="size-4" />
            Contact Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <InfoField label="Mobile Number" value={customer.mobile_number} />
            <InfoField label="Email Address" value={customer.email} />
          </div>
        </CardContent>
      </Card>

      {/* Address Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="size-4" />
            Address Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <InfoField label="Present Address" value={customer.present_address} />
            <InfoField label="Permanent Address" value={customer.permanent_address} />
          </div>
        </CardContent>
      </Card>

      {/* Professional Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="size-4" />
            Professional Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <InfoField label="Profession / Occupation" value={customer.profession} />
            <InfoField label="Employer" value={customer.employer_name} />
          </div>
        </CardContent>
      </Card>

      {/* Financial Information (Regular tier only) */}
      {customer.kyc_tier === "regular" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Banknote className="size-4" />
              Financial Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <InfoField
                label="Monthly Income"
                value={
                  customer.monthly_income != null
                    ? `BDT ${customer.monthly_income.toLocaleString()}`
                    : null
                }
              />
              <InfoField label="Source of Funds" value={customer.source_of_funds} />
              <InfoField label="TIN Number" value={customer.tin_number} />
              <InfoField label="Other Bank Accounts" value={customer.other_bank_accounts} />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

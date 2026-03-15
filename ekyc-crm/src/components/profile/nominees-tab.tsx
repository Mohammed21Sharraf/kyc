"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Users, ShieldCheck } from "lucide-react";

import type { Nominee } from "@/types/database";

interface NomineesTabProps {
  nominees: Nominee[];
}

function InfoField({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div className="space-y-1">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className="text-sm text-foreground">{value || "N/A"}</p>
    </div>
  );
}

export function NomineesTab({ nominees }: NomineesTabProps) {
  if (nominees.length === 0) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <Users className="mx-auto size-12 text-muted-foreground/50" />
            <p className="mt-2 text-sm text-muted-foreground">No nominees added yet.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {nominees.map((nominee, index) => (
        <Card key={nominee.id}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Users className="size-4" />
                Nominee {index + 1}
              </CardTitle>
              <Badge variant="secondary">{nominee.share_percentage}% Share</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <InfoField label="Full Name" value={nominee.name_en} />
              <InfoField label="Relationship" value={nominee.relationship} />
              <InfoField label="NID Number" value={nominee.nid_number} />
              <InfoField label="Date of Birth" value={nominee.date_of_birth} />
            </div>

            {/* Guardian section for minors */}
            {nominee.is_minor && (
              <>
                <Separator className="my-4" />
                <div className="mb-3 flex items-center gap-2">
                  <ShieldCheck className="size-4 text-muted-foreground" />
                  <h4 className="text-sm font-semibold text-foreground">Guardian Information</h4>
                  <Badge variant="outline" className="text-xs">Minor</Badge>
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <InfoField label="Guardian Name" value={nominee.guardian_name} />
                  <InfoField label="Guardian NID" value={nominee.guardian_nid} />
                  <InfoField label="Relationship to Nominee" value={nominee.guardian_relationship} />
                </div>
              </>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { AuditLog } from "@/types/database";
import { format } from "date-fns";
import {
  UserPlus,
  FileCheck,
  ShieldCheck,
  BarChart3,
  CheckCircle2,
  Eye,
  Edit,
  ChevronDown,
  ChevronUp,
  Clock,
} from "lucide-react";

interface AuditTrailTabProps {
  auditLogs: AuditLog[];
}

function getActionIcon(action: string) {
  if (action.includes("create") || action.includes("initiate")) return UserPlus;
  if (action.includes("document") || action.includes("upload")) return FileCheck;
  if (action.includes("screen")) return ShieldCheck;
  if (action.includes("risk") || action.includes("grade")) return BarChart3;
  if (action.includes("approve") || action.includes("complete")) return CheckCircle2;
  if (action.includes("view") || action.includes("review")) return Eye;
  if (action.includes("update") || action.includes("edit")) return Edit;
  return Clock;
}

function getActionColor(action: string) {
  if (action.includes("create") || action.includes("initiate"))
    return "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400";
  if (action.includes("approve") || action.includes("complete"))
    return "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400";
  if (action.includes("reject"))
    return "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400";
  if (action.includes("screen") || action.includes("risk"))
    return "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400";
  return "bg-gray-100 text-gray-600 dark:bg-gray-900/30 dark:text-gray-400";
}

function AuditLogEntry({ log }: { log: AuditLog }) {
  const [expanded, setExpanded] = useState(false);
  const Icon = getActionIcon(log.action);
  const iconColor = getActionColor(log.action);
  const hasDetails = log.old_values || log.new_values;

  return (
    <div className="relative flex gap-4 pb-8 last:pb-0">
      {/* Timeline line */}
      <div className="absolute left-[17px] top-10 bottom-0 w-px bg-border last:hidden" />

      {/* Icon */}
      <div
        className={`relative z-10 flex size-9 shrink-0 items-center justify-center rounded-full ${iconColor}`}
      >
        <Icon className="size-4" />
      </div>

      {/* Content */}
      <div className="flex-1 space-y-1">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-sm font-medium text-foreground">{log.action}</p>
            <p className="text-xs text-muted-foreground">
              by {log.user_id || "System"} &middot;{" "}
              {format(new Date(log.created_at), "MMM dd, yyyy 'at' HH:mm")}
            </p>
          </div>
          {hasDetails && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
            >
              {expanded ? (
                <>
                  Hide <ChevronUp className="size-3" />
                </>
              ) : (
                <>
                  Details <ChevronDown className="size-3" />
                </>
              )}
            </button>
          )}
        </div>

        {expanded && hasDetails && (
          <div className="mt-2 rounded-lg border bg-muted/30 p-3 text-xs">
            {log.new_values && (
              <div>
                <span className="font-medium text-foreground">Changes: </span>
                <span className="text-muted-foreground">
                  {JSON.stringify(log.new_values, null, 2)}
                </span>
              </div>
            )}
            {log.ip_address && (
              <div className="mt-1">
                <span className="font-medium text-foreground">IP: </span>
                <span className="text-muted-foreground">{log.ip_address}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export function AuditTrailTab({ auditLogs }: AuditTrailTabProps) {
  if (auditLogs.length === 0) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <Clock className="mx-auto size-12 text-muted-foreground/50" />
            <p className="mt-2 text-sm text-muted-foreground">No audit logs available.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="size-4" />
          Activity Timeline
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-0">
          {auditLogs.map((log) => (
            <AuditLogEntry key={log.id} log={log} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

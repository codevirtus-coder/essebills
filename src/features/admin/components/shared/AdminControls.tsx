import React, {
  type InputHTMLAttributes,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
} from "react";
import { Search } from "lucide-react";
import {
  ADMIN_BADGE_DANGER,
  ADMIN_BADGE_INFO,
  ADMIN_BADGE_NEUTRAL,
  ADMIN_BADGE_SUCCESS,
  ADMIN_BADGE_WARNING,
  ADMIN_INPUT,
  ADMIN_SEARCH_INPUT,
  ADMIN_SEARCH_WRAPPER,
  ADMIN_SELECT,
  ADMIN_TEXTAREA,
} from "./adminUi";
import { cn } from "../../../../lib/utils";

// ── Form Controls ────────────────────────────────────────────────────────────

export function AdminInput(props: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input {...props} className={cn(ADMIN_INPUT, props.className)} />
  );
}

export function AdminSelect(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select {...props} className={cn(ADMIN_SELECT, props.className)} />
  );
}

export function AdminTextarea(
  props: TextareaHTMLAttributes<HTMLTextAreaElement>,
) {
  return (
    <textarea
      {...props}
      className={cn(ADMIN_TEXTAREA, props.className)}
    />
  );
}

// ── Status Badges ────────────────────────────────────────────────────────────

export type StatusVariant =
  | "success"
  | "warning"
  | "danger"
  | "info"
  | "neutral";

const BADGE_MAP: Record<StatusVariant, string> = {
  success: ADMIN_BADGE_SUCCESS,
  warning: ADMIN_BADGE_WARNING,
  danger: ADMIN_BADGE_DANGER,
  info: ADMIN_BADGE_INFO,
  neutral: ADMIN_BADGE_NEUTRAL,
};

interface AdminStatusBadgeProps {
  variant: StatusVariant;
  children: React.ReactNode;
  className?: string;
}

export function AdminStatusBadge({
  variant,
  children,
  className,
}: AdminStatusBadgeProps) {
  return (
    <span className={cn(BADGE_MAP[variant], className)}>{children}</span>
  );
}

/** Derives a status variant from common status strings. */
export function statusVariant(status: string): StatusVariant {
  const s = status.toLowerCase();
  if (
    s === "active" ||
    s === "success" ||
    s === "approved" ||
    s === "completed" ||
    s === "enabled"
  )
    return "success";
  if (s === "pending" || s === "processing") return "neutral";
  if (
    s === "suspended" ||
    s === "inactive" ||
    s === "failed" ||
    s === "rejected" ||
    s === "disabled"
  )
    return "danger";
  if (s === "warning" || s === "review") return "warning";
  return "info";
}

// ── Search Input ─────────────────────────────────────────────────────────────

export function AdminSearchInput(props: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className={ADMIN_SEARCH_WRAPPER}>
      <Search
        size={16}
        className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-text pointer-events-none"
      />
      <input
        type="search"
        {...props}
        className={cn(ADMIN_SEARCH_INPUT, props.className)}
      />
    </div>
  );
}

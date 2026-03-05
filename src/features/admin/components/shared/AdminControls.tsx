import React, {
  type ButtonHTMLAttributes,
  type InputHTMLAttributes,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
} from "react";
import { Ban, Check, Edit3, KeyRound, Search, Trash2 } from "lucide-react";
import {
  ADMIN_ACTION_ICON_BUTTON,
  ADMIN_ACTION_ICON_DANGER,
  ADMIN_BADGE_DANGER,
  ADMIN_BADGE_INFO,
  ADMIN_BADGE_NEUTRAL,
  ADMIN_BADGE_SUCCESS,
  ADMIN_BADGE_WARNING,
  ADMIN_DANGER_BUTTON_SM,
  ADMIN_INFO_BUTTON_SM,
  ADMIN_INPUT,
  ADMIN_OUTLINE_BUTTON,
  ADMIN_OUTLINE_BUTTON_SM,
  ADMIN_PRIMARY_BUTTON,
  ADMIN_SEARCH_INPUT,
  ADMIN_SEARCH_WRAPPER,
  ADMIN_SELECT,
  ADMIN_SUCCESS_BUTTON_SM,
  ADMIN_TEXTAREA,
  ADMIN_WARNING_BUTTON_SM,
} from "./adminUi";

function joinClass(...classes: Array<string | undefined>) {
  return classes.filter(Boolean).join(" ");
}

// ── Button Components ────────────────────────────────────────────────────────

export function AdminCreateButton(
  props: ButtonHTMLAttributes<HTMLButtonElement>,
) {
  return (
    <button
      type="button"
      {...props}
      className={joinClass(ADMIN_OUTLINE_BUTTON, props.className)}
    >
      {props.children ?? "+ Create"}
    </button>
  );
}

export function AdminRefreshButton(
  props: ButtonHTMLAttributes<HTMLButtonElement>,
) {
  return (
    <button
      type="button"
      {...props}
      className={joinClass(ADMIN_OUTLINE_BUTTON, props.className)}
    >
      {props.children ?? "Refresh"}
    </button>
  );
}

export function AdminPrimaryButton(
  props: ButtonHTMLAttributes<HTMLButtonElement>,
) {
  return (
    <button
      type="button"
      {...props}
      className={joinClass(
        ADMIN_PRIMARY_BUTTON,
        "flex items-center gap-2",
        props.className,
      )}
    />
  );
}

export function AdminEditButton(
  props: ButtonHTMLAttributes<HTMLButtonElement>,
) {
  return (
    <button
      type="button"
      {...props}
      className={joinClass(ADMIN_OUTLINE_BUTTON_SM, props.className)}
    />
  );
}

export function AdminDeleteButton(
  props: ButtonHTMLAttributes<HTMLButtonElement>,
) {
  return (
    <button
      type="button"
      {...props}
      className={joinClass(ADMIN_DANGER_BUTTON_SM, props.className)}
    />
  );
}

export function AdminInfoButton(
  props: ButtonHTMLAttributes<HTMLButtonElement>,
) {
  return (
    <button
      type="button"
      {...props}
      className={joinClass(ADMIN_INFO_BUTTON_SM, props.className)}
    />
  );
}

export function AdminSuccessButton(
  props: ButtonHTMLAttributes<HTMLButtonElement>,
) {
  return (
    <button
      type="button"
      {...props}
      className={joinClass(ADMIN_SUCCESS_BUTTON_SM, props.className)}
    />
  );
}

export function AdminWarningButton(
  props: ButtonHTMLAttributes<HTMLButtonElement>,
) {
  return (
    <button
      type="button"
      {...props}
      className={joinClass(ADMIN_WARNING_BUTTON_SM, props.className)}
    />
  );
}

// ── Form Controls ────────────────────────────────────────────────────────────

export function AdminInput(props: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input {...props} className={joinClass(ADMIN_INPUT, props.className)} />
  );
}

export function AdminSelect(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select {...props} className={joinClass(ADMIN_SELECT, props.className)} />
  );
}

export function AdminTextarea(
  props: TextareaHTMLAttributes<HTMLTextAreaElement>,
) {
  return (
    <textarea
      {...props}
      className={joinClass(ADMIN_TEXTAREA, props.className)}
    />
  );
}

// ── Icon Action Buttons ──────────────────────────────────────────────────────

export function AdminIconEditButton(
  props: ButtonHTMLAttributes<HTMLButtonElement>,
) {
  return (
    <button
      type="button"
      aria-label="Edit"
      title="Edit"
      {...props}
      className={joinClass(ADMIN_ACTION_ICON_BUTTON, props.className)}
    >
      <Edit3 size={16} />
    </button>
  );
}

export function AdminIconDeleteButton(
  props: ButtonHTMLAttributes<HTMLButtonElement>,
) {
  return (
    <button
      type="button"
      aria-label="Delete"
      title="Delete"
      {...props}
      className={joinClass(ADMIN_ACTION_ICON_DANGER, props.className)}
    >
      <Trash2 size={16} />
    </button>
  );
}

export function AdminIconDisableButton(
  props: ButtonHTMLAttributes<HTMLButtonElement>,
) {
  return (
    <button
      type="button"
      aria-label="Disable"
      title="Disable"
      {...props}
      className={joinClass(ADMIN_ACTION_ICON_BUTTON, props.className)}
    >
      <Ban size={16} />
    </button>
  );
}

export function AdminIconActivateButton(
  props: ButtonHTMLAttributes<HTMLButtonElement>,
) {
  return (
    <button
      type="button"
      aria-label="Activate"
      title="Activate"
      {...props}
      className={joinClass(ADMIN_ACTION_ICON_BUTTON, props.className)}
    >
      <Check size={16} />
    </button>
  );
}

export function AdminIconOtpButton(
  props: ButtonHTMLAttributes<HTMLButtonElement>,
) {
  return (
    <button
      type="button"
      aria-label="Reset OTP"
      title="Reset OTP"
      {...props}
      className={joinClass(ADMIN_ACTION_ICON_BUTTON, props.className)}
    >
      <KeyRound size={16} />
    </button>
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
    <span className={joinClass(BADGE_MAP[variant], className)}>{children}</span>
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
        className={joinClass(ADMIN_SEARCH_INPUT, props.className)}
      />
    </div>
  );
}

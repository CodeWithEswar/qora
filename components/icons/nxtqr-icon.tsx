"use client";

import * as React from "react";
import { Icon } from "@iconify/react";
import { cn } from "@/lib/utils";

export type NxtqrIconName =
  | "member"
  | "user"
  | "team"
  | "shield"
  | "mail"
  | "clock"
  | "search"
  | "filter"
  | "more"
  | "edit"
  | "suspend"
  | "restore"
  | "remove"
  | "check"
  | "alert"
  | "arrowRight"
  | "plus"
  | "close"
  | "permission"
  | "external"
  | "role"
  | "qr"
  | "sparkles"
  | "route"
  | "copy"
  | "refresh";

export type VaahanIconName = NxtqrIconName;

const ICON_MAP: Record<NxtqrIconName, string> = {
  member: "hugeicons:user-multiple-02",
  user: "hugeicons:user",
  team: "hugeicons:user-group",
  shield: "hugeicons:shield-01",
  mail: "hugeicons:mail-01",
  clock: "hugeicons:clock-01",
  search: "hugeicons:search-01",
  filter: "hugeicons:filter",
  more: "hugeicons:more-vertical",
  edit: "hugeicons:pencil-edit-01",
  suspend: "hugeicons:pause-circle",
  restore: "hugeicons:play-circle",
  remove: "hugeicons:delete-02",
  check: "hugeicons:tick-02",
  alert: "hugeicons:alert-02",
  arrowRight: "hugeicons:arrow-right-01",
  plus: "hugeicons:plus-sign",
  close: "hugeicons:cancel-01",
  permission: "hugeicons:key-01",
  external: "hugeicons:link-square-02",
  role: "hugeicons:badge-check",
  qr: "hugeicons:qr-code",
  sparkles: "hugeicons:sparkles",
  route: "hugeicons:git-fork",
  copy: "hugeicons:copy-01",
  refresh: "hugeicons:refresh",
};

export interface NxtqrIconProps extends React.HTMLAttributes<HTMLSpanElement> {
  name?: NxtqrIconName | string;
  icon?: string;
  size?: number | string;
  className?: string;
}

export type VaahanIconProps = NxtqrIconProps;

export function NxtqrIcon({
  name,
  icon,
  size = 16,
  className,
  ...props
}: NxtqrIconProps) {
  const iconId =
    icon ||
    (name ? ICON_MAP[name as NxtqrIconName] || name : ICON_MAP.shield);

  return (
    <span
      className={cn("inline-flex items-center justify-center shrink-0 leading-none", className)}
      {...props}
    >
      <Icon icon={iconId} width={size} height={size} />
    </span>
  );
}

export const VaahanIcon = NxtqrIcon;

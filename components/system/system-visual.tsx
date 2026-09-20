import * as React from "react";
import { NotFoundRoute } from "./visuals/not-found-route";
import { IdentityRequired } from "./visuals/identity-required";
import { AccessRestricted } from "./visuals/access-restricted";
import { SystemFault } from "./visuals/system-fault";

export type SystemVisualType =
  | "not-found"
  | "unauthorized"
  | "forbidden"
  | "fault";

interface SystemVisualProps {
  type: SystemVisualType;
  className?: string;
}

export function SystemVisual({ type, className }: SystemVisualProps) {
  switch (type) {
    case "not-found":
      return <NotFoundRoute className={className} />;
    case "unauthorized":
      return <IdentityRequired className={className} />;
    case "forbidden":
      return <AccessRestricted className={className} />;
    case "fault":
      return <SystemFault className={className} />;
    default:
      return <NotFoundRoute className={className} />;
  }
}

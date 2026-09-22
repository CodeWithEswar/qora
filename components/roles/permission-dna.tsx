"use client";

import * as React from "react";
import { PermissionMatrixDomainGroup } from "@nxtqr/contracts";

interface PermissionDnaProps {
  matrixGroups: PermissionMatrixDomainGroup[];
  selectedRoleId: string;
  onFilterDomain?: (domainKey: string) => void;
}

export function PermissionDna({
  matrixGroups,
  selectedRoleId,
  onFilterDomain,
}: PermissionDnaProps) {
  // Calculate distribution for this specific role
  const domainDistributions = React.useMemo(() => {
    return matrixGroups.map((group) => {
      let granted = 0;
      group.permissions.forEach((perm) => {
        const cell = perm.roleStates[selectedRoleId];
        if (cell && (cell.state === "allowed" || cell.state === "system_required" || cell.state === "inherited")) {
          granted++;
        }
      });

      const total = group.permissions.length;
      const percentage = total > 0 ? Math.round((granted / total) * 100) : 0;

      return {
        key: group.domainKey,
        name: group.domainName,
        granted,
        total,
        percentage,
      };
    });
  }, [matrixGroups, selectedRoleId]);

  return (
    <div className="space-y-2.5 p-3 rounded-lg border border-white/[0.08] bg-[#191919]">
      <div className="flex items-center justify-between text-[11px] font-mono font-semibold uppercase tracking-wider text-[#85827B]">
        <span>AUTHORITY DNA DISTRIBUTION</span>
        <span className="text-[10px] text-[#B8B5AD] lowercase">
          by domain coverage
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-1">
        {domainDistributions.map((domain) => (
          <button
            key={domain.key}
            onClick={() => onFilterDomain?.(domain.key)}
            className="p-2 rounded-md border border-white/[0.06] bg-[#151515] hover:border-[#FA520F]/40 hover:bg-[#1E1713] transition-all text-left group"
          >
            <div className="flex items-center justify-between text-[10px] font-medium text-[#B8B5AD] mb-1">
              <span className="group-hover:text-[#F7F4EC] truncate">{domain.name}</span>
              <span className="font-mono text-[#FA520F] font-semibold">
                {domain.granted}/{domain.total}
              </span>
            </div>

            {/* Visual Bar Indicator */}
            <div className="h-1.5 w-full bg-white/[0.06] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#FA520F] rounded-full transition-all duration-300"
                style={{ width: `${domain.percentage}%` }}
              />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

import * as React from "react";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface DataTableProps {
  children: React.ReactNode;
  pagination?: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    pageSize: number;
    onPageChange?: (page: number) => void;
  };
  isLoading?: boolean;
  emptyState?: React.ReactNode;
  filterSlot?: React.ReactNode;
  className?: string;
}

export function DataTable({
  children,
  pagination,
  isLoading,
  emptyState,
  filterSlot,
  className,
}: DataTableProps) {
  return (
    <div className={cn("space-y-3", className)}>
      {filterSlot && <div className="flex items-center justify-between gap-3">{filterSlot}</div>}

      <div className="rounded-xl border border-border bg-card overflow-hidden shadow-2xs">
        {emptyState ? (
          <div className="p-6">{emptyState}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              {children}
            </table>
          </div>
        )}

        {pagination && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 border-t border-border bg-surface text-muted-foreground text-xs">
            <div>
              Showing{" "}
              <span className="font-medium text-foreground">
                {Math.min(
                  (pagination.currentPage - 1) * pagination.pageSize + 1,
                  pagination.totalItems
                )}
              </span>{" "}
              to{" "}
              <span className="font-medium text-foreground">
                {Math.min(
                  pagination.currentPage * pagination.pageSize,
                  pagination.totalItems
                )}
              </span>{" "}
              of <span className="font-medium text-foreground">{pagination.totalItems}</span> results
            </div>

            <div className="flex items-center gap-1.5">
              <Button
                variant="outline"
                size="iconSm"
                onClick={() => pagination.onPageChange?.(1)}
                disabled={pagination.currentPage <= 1 || isLoading}
                title="First page"
              >
                <ChevronsLeft className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="outline"
                size="iconSm"
                onClick={() => pagination.onPageChange?.(pagination.currentPage - 1)}
                disabled={pagination.currentPage <= 1 || isLoading}
                title="Previous page"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
              </Button>
              <span className="px-2 text-xs font-medium text-foreground">
                Page {pagination.currentPage} of {pagination.totalPages}
              </span>
              <Button
                variant="outline"
                size="iconSm"
                onClick={() => pagination.onPageChange?.(pagination.currentPage + 1)}
                disabled={pagination.currentPage >= pagination.totalPages || isLoading}
                title="Next page"
              >
                <ChevronRight className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="outline"
                size="iconSm"
                onClick={() => pagination.onPageChange?.(pagination.totalPages)}
                disabled={pagination.currentPage >= pagination.totalPages || isLoading}
                title="Last page"
              >
                <ChevronsRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export function TableHead({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <thead className={cn("bg-muted/60 border-b border-border text-muted-foreground font-medium", className)}>
      {children}
    </thead>
  );
}

export function TableRow({
  children,
  className,
  onClick,
  isClickable = false,
}: {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  isClickable?: boolean;
}) {
  return (
    <tr
      onClick={onClick}
      className={cn(
        "border-b border-border/60 transition-colors last:border-b-0",
        isClickable && "cursor-pointer hover:bg-surface-hover",
        !isClickable && "hover:bg-surface-hover/60",
        className
      )}
    >
      {children}
    </tr>
  );
}

export function TableHeaderCell({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <th className={cn("px-4 py-3 text-xs font-medium tracking-tight text-muted-foreground select-none", className)}>
      {children}
    </th>
  );
}

export function TableCell({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <td className={cn("px-4 py-3 align-middle text-foreground", className)}>
      {children}
    </td>
  );
}

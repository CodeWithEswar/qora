import * as React from "react";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SearchInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  onClear?: () => void;
  shortcutBadge?: string;
}

const SearchInput = React.forwardRef<HTMLInputElement, SearchInputProps>(
  ({ className, value, onChange, onClear, shortcutBadge, ...props }, ref) => {
    return (
      <div className="relative flex items-center w-full">
        <Search className="absolute left-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
        <input
          ref={ref}
          type="search"
          value={value}
          onChange={onChange}
          className={cn(
            "flex h-9 w-full rounded-lg border border-border bg-surface pl-8 pr-9 py-1 text-sm text-foreground placeholder:text-muted-foreground transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary disabled:cursor-not-allowed disabled:opacity-50",
            shortcutBadge && "pr-14",
            className
          )}
          {...props}
        />
        {value && onClear ? (
          <button
            type="button"
            onClick={onClear}
            className="absolute right-2.5 p-0.5 rounded text-muted-foreground hover:text-foreground hover:bg-muted"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        ) : shortcutBadge ? (
          <kbd className="absolute right-2 pointer-events-none hidden sm:inline-flex h-5 select-none items-center gap-0.5 rounded border border-border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
            {shortcutBadge}
          </kbd>
        ) : null}
      </div>
    );
  }
);
SearchInput.displayName = "SearchInput";

export { SearchInput };

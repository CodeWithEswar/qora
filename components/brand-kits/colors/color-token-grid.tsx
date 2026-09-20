"use client";

import * as React from "react";
import { BrandColorToken } from "@nxtqr/contracts";
import { Plus, Sliders, Check, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface ColorTokenGridProps {
  tokens: BrandColorToken[];
  onSelectToken: (token: BrandColorToken) => void;
  onAddToken: () => void;
}

export function ColorTokenGrid({
  tokens,
  onSelectToken,
  onAddToken,
}: ColorTokenGridProps) {
  const [copiedHex, setCopiedHex] = React.useState<string | null>(null);

  const copyHex = (hex: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(hex);
    setCopiedHex(hex);
    toast.success(`Copied ${hex} to clipboard`);
    setTimeout(() => setCopiedHex(null), 1500);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h4 className="text-sm font-bold uppercase tracking-wider text-foreground">
            SEMANTIC COLOR TOKENS
          </h4>
          <p className="text-xs text-muted-foreground mt-0.5">
            Click any token to inspect WCAG contrast ratios, adjust values, or map roles.
          </p>
        </div>

        <Button
          onClick={onAddToken}
          size="sm"
          className="h-8 gap-1.5 text-xs bg-[#FA520F] hover:bg-[#E0480C] text-white font-medium cursor-pointer shadow-xs"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>Add Color Token</span>
        </Button>
      </div>

      {tokens.length === 0 ? (
        <div className="p-8 text-center rounded-xl border border-dashed border-border bg-surface/40">
          <p className="text-xs text-muted-foreground">
            No color tokens configured yet.
          </p>
          <Button
            onClick={onAddToken}
            variant="outline"
            size="sm"
            className="mt-3 text-xs"
          >
            Add Color Token
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {tokens.map((token) => (
            <div
              key={token.id}
              onClick={() => onSelectToken(token)}
              className="group relative p-3.5 rounded-xl border border-border/80 bg-surface/70 hover:border-border hover:bg-surface-elevated/60 transition-all cursor-pointer shadow-xs flex flex-col justify-between"
            >
              <div>
                {/* Large Swatch Block */}
                <div
                  className="w-full h-16 rounded-lg border border-black/10 dark:border-white/10 shadow-inner relative overflow-hidden flex items-end justify-end p-2"
                  style={{ backgroundColor: token.hex }}
                >
                  <button
                    type="button"
                    onClick={(e) => copyHex(token.hex, e)}
                    className="p-1 rounded bg-black/40 hover:bg-black/60 text-white backdrop-blur-xs transition-colors cursor-pointer text-[10px] font-mono flex items-center gap-1 shadow-xs"
                    title="Copy HEX"
                  >
                    {copiedHex === token.hex ? (
                      <Check className="w-3 h-3 text-emerald-400" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                    <span>{token.hex}</span>
                  </button>
                </div>

                <div className="mt-3 space-y-1">
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-xs font-bold text-foreground truncate">
                      {token.name}
                    </span>
                    <Badge
                      variant="secondary"
                      className="text-[9px] font-mono uppercase px-1.5 py-0 bg-surface-elevated border border-border/60"
                    >
                      {token.role.replace("_", " ")}
                    </Badge>
                  </div>

                  {token.description && (
                    <p className="text-[11px] text-muted-foreground line-clamp-1">
                      {token.description}
                    </p>
                  )}
                </div>
              </div>

              <div className="mt-3 pt-2.5 border-t border-border/50 flex items-center justify-between text-[10px] font-mono text-muted-foreground">
                <span>ROLE: {token.role.toUpperCase()}</span>
                <span className="flex items-center gap-1 text-[#FA520F] opacity-0 group-hover:opacity-100 transition-opacity font-sans font-medium">
                  <Sliders className="w-3 h-3" />
                  Inspect
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

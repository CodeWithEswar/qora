"use client";

import * as React from "react";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

export interface DestinationFlowNode {
  id: string;
  name: string;
  type: "qr" | "rule" | "destination";
  value: number;
}

export interface DestinationFlowLink {
  source: string;
  target: string;
  value: number;
}

interface DestinationFlowProps {
  nodes?: DestinationFlowNode[];
  links?: DestinationFlowLink[];
  className?: string;
}

export function DestinationFlow({ nodes = [], links = [], className }: DestinationFlowProps) {
  const [hoveredNode, setHoveredNode] = React.useState<string | null>(null);

  const qrNodes = nodes.filter((n) => n.type === "qr");
  const destNodes = nodes.filter((n) => n.type === "destination");
  const hasData = qrNodes.length > 0 && destNodes.length > 0;

  const totalFlowScans = qrNodes.reduce((acc, n) => acc + n.value, 0);

  return (
    <div
      className={cn(
        "rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-xs flex flex-col justify-between text-card-foreground",
        className
      )}
    >
      <div>
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary" />
              <h4 className="font-serif text-base font-normal tracking-tight text-foreground">
                Destination Flow
              </h4>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Signal transition from QR origins through routing rules to resolved endpoints
            </p>
          </div>
          <span className="text-[10px] font-mono text-muted-foreground px-2 py-0.5 rounded bg-muted border border-border">
            SIGNAL FLOW
          </span>
        </div>

        {/* Content */}
        {!hasData ? (
          <div className="py-14 text-center text-xs text-muted-foreground space-y-1">
            <p className="font-mono uppercase tracking-wider text-muted-foreground">
              Dormant Destination Network
            </p>
            <p>Connections between QR codes and target URLs will illuminate here.</p>
          </div>
        ) : (
          <div className="mt-6">
            {/* Desktop Flow Diagram (hidden on small screens) */}
            <div className="hidden md:block relative h-56 w-full">
              <svg className="w-full h-full overflow-visible">
                <defs>
                  <linearGradient id="flowGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#FA520F" stopOpacity="0.7" />
                    <stop offset="100%" stopColor="#FFB83E" stopOpacity="0.4" />
                  </linearGradient>
                </defs>

                {/* Render bezier curves for links */}
                {links.map((link, idx) => {
                  const sIdx = qrNodes.findIndex((n) => n.id === link.source);
                  const tIdx = destNodes.findIndex((n) => n.id === link.target);
                  if (sIdx === -1 || tIdx === -1) return null;

                  const sY = (sIdx / (qrNodes.length || 1)) * 160 + 30;
                  const tY = (tIdx / (destNodes.length || 1)) * 160 + 30;
                  const strokeW = Math.min(8, Math.max(2, (link.value / (totalFlowScans || 1)) * 20));

                  const isDimmed =
                    hoveredNode && hoveredNode !== link.source && hoveredNode !== link.target;

                  return (
                    <path
                      key={idx}
                      d={`M 140 ${sY} C 250 ${sY}, 300 ${tY}, 410 ${tY}`}
                      fill="none"
                      stroke="url(#flowGradient)"
                      strokeWidth={strokeW}
                      strokeOpacity={isDimmed ? 0.15 : 0.6}
                      className="transition-all duration-200"
                    />
                  );
                })}
              </svg>

              {/* Source QR Nodes Column (Left) */}
              <div className="absolute left-0 top-0 bottom-0 w-36 flex flex-col justify-around py-2">
                {qrNodes.map((node) => (
                  <div
                    key={node.id}
                    onMouseEnter={() => setHoveredNode(node.id)}
                    onMouseLeave={() => setHoveredNode(null)}
                    className="p-2 rounded-lg border border-border bg-muted/50 hover:border-primary/50 cursor-pointer transition-all text-xs flex items-center justify-between"
                  >
                    <span className="font-medium text-foreground truncate max-w-[80px]">
                      {node.name}
                    </span>
                    <span className="font-mono text-[10px] text-primary font-semibold tabular-nums">
                      {node.value.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>

              {/* Target Destination Nodes Column (Right) */}
              <div className="absolute right-0 top-0 bottom-0 w-44 flex flex-col justify-around py-2">
                {destNodes.map((node) => (
                  <div
                    key={node.id}
                    onMouseEnter={() => setHoveredNode(node.id)}
                    onMouseLeave={() => setHoveredNode(null)}
                    className="p-2 rounded-lg border border-border bg-muted/50 hover:border-amber-500/50 cursor-pointer transition-all text-xs flex items-center justify-between"
                  >
                    <span className="font-medium text-foreground truncate max-w-[110px]">
                      {node.name}
                    </span>
                    <span className="font-mono text-[10px] text-amber-500 font-semibold tabular-nums">
                      {node.value.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Mobile Stacked Route Lanes (visible on mobile) */}
            <div className="md:hidden space-y-2.5">
              {links.map((link, idx) => {
                const sourceNode = nodes.find((n) => n.id === link.source);
                const targetNode = nodes.find((n) => n.id === link.target);

                return (
                  <div
                    key={idx}
                    className="p-3 rounded-lg border border-border bg-muted/40 text-xs space-y-1.5"
                  >
                    <div className="flex items-center justify-between text-[11px] font-medium text-foreground">
                      <span className="truncate max-w-[130px]">{sourceNode?.name || "QR"}</span>
                      <ArrowRight className="h-3 w-3 text-muted-foreground shrink-0 mx-1" />
                      <span className="text-amber-500 font-medium truncate max-w-[130px]">
                        {targetNode?.name || "Destination"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[10px] font-mono text-muted-foreground pt-1 border-t border-border">
                      <span>Volume:</span>
                      <span className="font-semibold text-primary tabular-nums">
                        {link.value.toLocaleString()} scans
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <div className="mt-4 pt-3 border-t border-border text-[10px] font-mono text-muted-foreground flex items-center justify-between">
        <span>QR Asset → Routing Layer → Target</span>
        <span>Line stroke denotes scan volume</span>
      </div>
    </div>
  );
}

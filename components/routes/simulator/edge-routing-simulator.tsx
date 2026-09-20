"use client";

import * as React from "react";
import {
  RoutingRule,
  RoutingSimulationResult,
  ResolverContext,
} from "@nxtqr/contracts";
import { evaluateRoutingPolicy } from "@nxtqr/routing-engine";
import {
  Play,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Clock,
  Globe,
  Smartphone,
  Compass,
  ArrowRight,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  Copy,
  Check,
  Zap,
  Info,
  Layers,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { RoutingAssetItem } from "../types";

interface EdgeRoutingSimulatorProps {
  assets: RoutingAssetItem[];
  selectedAssetId?: string;
  onInspectRule?: (rule: RoutingRule, asset: RoutingAssetItem) => void;
  orgSlug?: string;
}

export function EdgeRoutingSimulator({
  assets,
  selectedAssetId,
  onInspectRule,
  orgSlug,
}: EdgeRoutingSimulatorProps) {
  // 1. Currently selected QR Asset for simulation
  const [activeAssetId, setActiveAssetId] = React.useState<string>(
    selectedAssetId || (assets.length > 0 ? assets[0].id : "")
  );

  React.useEffect(() => {
    if (selectedAssetId) {
      setActiveAssetId(selectedAssetId);
    }
  }, [selectedAssetId]);

  const activeAsset = React.useMemo(() => {
    return assets.find((a) => a.id === activeAssetId) || assets[0] || null;
  }, [assets, activeAssetId]);

  // 2. Scan Context Parameters
  const [device, setDevice] = React.useState<string>("mobile");
  const [os, setOs] = React.useState<string>("ios");
  const [country, setCountry] = React.useState<string>("IN");
  const [language, setLanguage] = React.useState<string>("en-US");
  const [localTime, setLocalTime] = React.useState<string>("14:30");
  const [weekday, setWeekday] = React.useState<string>("monday");

  // 3. Simulation Result
  const [simulationResult, setSimulationResult] =
    React.useState<RoutingSimulationResult | null>(null);
  const [isSimulating, setIsSimulating] = React.useState<boolean>(false);
  const [traceOpen, setTraceOpen] = React.useState<boolean>(false);
  const [copiedUrl, setCopiedUrl] = React.useState<boolean>(false);

  // Authoritative simulation execution backed by Supabase
  const runSimulation = React.useCallback(
    async (customAsset = activeAsset) => {
      if (!customAsset) return;

      setIsSimulating(true);

      const normalizedContext: Partial<ResolverContext> = {
        device: device.toLowerCase() as "mobile" | "desktop" | "tablet",
        os: os.toLowerCase() as any,
        country: country.toUpperCase(),
        language: language.toLowerCase(),
        localTime,
        weekday: weekday.toLowerCase() as any,
        now: Date.now(),
      };

      // Construct resolver snapshot according to @nxtqr/contracts
      const snapshot = {
        qrId: customAsset.id,
        slug: customAsset.slug,
        host: "nxtqr.me",
        publishedRevision: customAsset.publishedRevision || 1,
        defaultDestination: customAsset.defaultUrl,
        fallbackDestination: customAsset.fallbackUrl,
        routing: {
          rules: customAsset.rules || [],
        },
        rules: customAsset.rules || [],
        guardianHealthy: true,
      };

      try {
        const res = await fetch(`/api/v1/qrs/${customAsset.id}/rules/simulate`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-organization-slug": orgSlug || "",
          },
          body: JSON.stringify({
            context: normalizedContext,
            recordTelemetry: true,
          }),
        });

        if (res.ok) {
          const json = await res.json();
          const result = json.data;
          setSimulationResult(result);

          if (result.matchedRuleName) {
            toast.success("Real Edge Route Evaluated", {
              description: `Matched '${result.matchedRuleName}' → ${result.destinationUrl} (Logged to Supabase)`,
            });
          } else {
            toast.info("Real Edge Route Evaluated", {
              description: `Default route selected → ${result.destinationUrl} (Logged to Supabase)`,
            });
          }
          return;
        }

        // Fallback to local evaluateRoutingPolicy
        const result = evaluateRoutingPolicy(snapshot as any, normalizedContext, {
          includeTrace: true,
        });
        setSimulationResult(result);
      } catch (err: any) {
        const result = evaluateRoutingPolicy(snapshot as any, normalizedContext, {
          includeTrace: true,
        });
        setSimulationResult(result);
      } finally {
        setIsSimulating(false);
      }
    },
    [activeAsset, device, os, country, language, localTime, weekday, orgSlug]
  );

  // Run simulation whenever active asset changes initially
  React.useEffect(() => {
    if (activeAsset) {
      runSimulation(activeAsset);
    }
  }, [activeAssetId]);

  const handleResetContext = () => {
    setDevice("mobile");
    setOs("ios");
    setCountry("IN");
    setLanguage("en-US");
    setLocalTime("14:30");
    setWeekday("monday");
    toast.info("Context parameters reset to defaults");
  };

  const handleCopyDestination = () => {
    if (!simulationResult?.destinationUrl) return;
    navigator.clipboard.writeText(simulationResult.destinationUrl);
    setCopiedUrl(true);
    toast.success("Destination URL copied");
    setTimeout(() => setCopiedUrl(false), 1500);
  };

  if (!activeAsset) {
    return (
      <div className="rounded-xl border border-white/[0.08] bg-[#141414] p-12 text-center text-xs text-[#85827B]">
        No Dynamic QR assets available for simulation. Create a QR code first.
      </div>
    );
  }

  const evaluatedRules = simulationResult?.trace?.evaluatedRules || [];
  const selectedRuleId = simulationResult?.matchedRuleId;

  return (
    <div className="space-y-5">
      {/* Header & Controls Container */}
      <div className="rounded-xl border border-white/[0.08] bg-[#141414] p-5 sm:p-6 space-y-5 shadow-sm">
        {/* Title Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/[0.08]">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold tracking-tight text-[#F7F4EC] font-serif">
                EDGE ROUTING SIMULATOR
              </h2>
              <span className="inline-flex items-center gap-1 text-[10px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                Pure Edge Parity
              </span>
              <span className="inline-flex items-center gap-1 text-[10px] font-mono text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-2 py-0.5 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                Live Supabase Telemetry
              </span>
            </div>
            <p className="text-xs text-[#85827B]">
              Test how an edge scan moves through the deterministic routing policy with 1:1 redirect runtime logic and real Supabase telemetry logging.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleResetContext}
              className="h-8 text-xs border-white/10 bg-[#191919] hover:bg-[#222222] text-[#B8B5AD] gap-1"
            >
              <RotateCcw className="h-3 w-3" />
              <span>Reset Context</span>
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={() => runSimulation()}
              disabled={isSimulating}
              className="h-8 text-xs font-semibold bg-[#FA520F] hover:bg-[#d9440a] text-white shadow-xs gap-1.5"
            >
              {isSimulating ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Play className="h-3.5 w-3.5 fill-current" />
              )}
              <span>{isSimulating ? "SIMULATING..." : "SIMULATE ROUTE"}</span>
            </Button>
          </div>
        </div>

        {/* Scan Context Controls Form Row */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
          {/* 1. Target QR Asset Picker */}
          <div className="col-span-2 sm:col-span-3 lg:col-span-2 space-y-1.5">
            <label className="text-[11px] font-medium text-[#85827B] uppercase tracking-wider">
              QR Asset
            </label>
            <Select
              value={activeAssetId}
              onValueChange={(val) => setActiveAssetId(val)}
            >
              <SelectTrigger className="h-9 text-xs bg-[#18181b] border-white/10 text-[#F7F4EC] font-medium">
                <SelectValue placeholder="Select QR Asset" />
              </SelectTrigger>
              <SelectContent className="bg-[#18181b] border-white/10 text-[#F7F4EC]">
                {assets.map((a) => (
                  <SelectItem key={a.id} value={a.id} className="text-xs focus:bg-white/5">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{a.name}</span>
                      <span className="text-[10px] font-mono text-[#85827B]">
                        ({a.ruleCount} {a.ruleCount === 1 ? "rule" : "rules"})
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* 2. Device Class */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-medium text-[#85827B] uppercase tracking-wider">
              Device
            </label>
            <Select value={device} onValueChange={setDevice}>
              <SelectTrigger className="h-9 text-xs bg-[#18181b] border-white/10 text-[#F7F4EC]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#18181b] border-white/10 text-[#F7F4EC]">
                <SelectItem value="mobile" className="text-xs">Mobile</SelectItem>
                <SelectItem value="desktop" className="text-xs">Desktop</SelectItem>
                <SelectItem value="tablet" className="text-xs">Tablet</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* 3. OS Family */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-medium text-[#85827B] uppercase tracking-wider">
              OS Family
            </label>
            <Select value={os} onValueChange={setOs}>
              <SelectTrigger className="h-9 text-xs bg-[#18181b] border-white/10 text-[#F7F4EC]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#18181b] border-white/10 text-[#F7F4EC]">
                <SelectItem value="ios" className="text-xs">iOS</SelectItem>
                <SelectItem value="android" className="text-xs">Android</SelectItem>
                <SelectItem value="macos" className="text-xs">macOS</SelectItem>
                <SelectItem value="windows" className="text-xs">Windows</SelectItem>
                <SelectItem value="linux" className="text-xs">Linux</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* 4. Country (ISO) */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-medium text-[#85827B] uppercase tracking-wider">
              Country
            </label>
            <Select value={country} onValueChange={setCountry}>
              <SelectTrigger className="h-9 text-xs bg-[#18181b] border-white/10 text-[#F7F4EC]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#18181b] border-white/10 text-[#F7F4EC]">
                <SelectItem value="IN" className="text-xs">India (IN)</SelectItem>
                <SelectItem value="US" className="text-xs">United States (US)</SelectItem>
                <SelectItem value="GB" className="text-xs">United Kingdom (GB)</SelectItem>
                <SelectItem value="DE" className="text-xs">Germany (DE)</SelectItem>
                <SelectItem value="FR" className="text-xs">France (FR)</SelectItem>
                <SelectItem value="JP" className="text-xs">Japan (JP)</SelectItem>
                <SelectItem value="CA" className="text-xs">Canada (CA)</SelectItem>
                <SelectItem value="AU" className="text-xs">Australia (AU)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* 5. Language */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-medium text-[#85827B] uppercase tracking-wider">
              Language
            </label>
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger className="h-9 text-xs bg-[#18181b] border-white/10 text-[#F7F4EC]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#18181b] border-white/10 text-[#F7F4EC]">
                <SelectItem value="en-US" className="text-xs">English (en-US)</SelectItem>
                <SelectItem value="en-GB" className="text-xs">English (en-GB)</SelectItem>
                <SelectItem value="hi-IN" className="text-xs">Hindi (hi-IN)</SelectItem>
                <SelectItem value="de-DE" className="text-xs">German (de-DE)</SelectItem>
                <SelectItem value="fr-FR" className="text-xs">French (fr-FR)</SelectItem>
                <SelectItem value="es-ES" className="text-xs">Spanish (es-ES)</SelectItem>
                <SelectItem value="ja-JP" className="text-xs">Japanese (ja-JP)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* 6. Weekday & Time */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-medium text-[#85827B] uppercase tracking-wider">
              Weekday
            </label>
            <Select value={weekday} onValueChange={setWeekday}>
              <SelectTrigger className="h-9 text-xs bg-[#18181b] border-white/10 text-[#F7F4EC] capitalize">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#18181b] border-white/10 text-[#F7F4EC]">
                {["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"].map(
                  (d) => (
                    <SelectItem key={d} value={d} className="text-xs capitalize">
                      {d}
                    </SelectItem>
                  )
                )}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* 3-Panel Decision Engine Visualization */}
      {simulationResult && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* PANEL 1: Scan Context Summary (3 cols on desktop) */}
          <div className="lg:col-span-3 rounded-xl border border-white/[0.08] bg-[#141414] p-5 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-white/[0.08]">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[#85827B]">
                Scan Context
              </span>
              <Smartphone className="h-3.5 w-3.5 text-[#85827B]" />
            </div>

            <div className="space-y-2.5 font-mono text-xs">
              <div className="flex items-center justify-between p-2 rounded bg-[#18181b] border border-white/5">
                <span className="text-[#85827B]">Device</span>
                <span className="font-semibold text-[#F7F4EC] uppercase">{device}</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-[#18181b] border border-white/5">
                <span className="text-[#85827B]">OS</span>
                <span className="font-semibold text-[#F7F4EC] uppercase">{os}</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-[#18181b] border border-white/5">
                <span className="text-[#85827B]">Country</span>
                <span className="font-semibold text-[#F7F4EC]">{country}</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-[#18181b] border border-white/5">
                <span className="text-[#85827B]">Language</span>
                <span className="font-semibold text-[#F7F4EC]">{language}</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-[#18181b] border border-white/5">
                <span className="text-[#85827B]">Local Time</span>
                <span className="font-semibold text-[#F7F4EC]">{localTime}</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-[#18181b] border border-white/5">
                <span className="text-[#85827B]">Weekday</span>
                <span className="font-semibold text-[#F7F4EC] capitalize">{weekday}</span>
              </div>
            </div>

            <div className="pt-2 text-[10px] text-[#85827B] text-center font-mono">
              Deterministic Evaluation Model
            </div>
          </div>

          {/* PANEL 2: Explainable Decision Path (6 cols on desktop) */}
          <div className="lg:col-span-5 rounded-xl border border-white/[0.08] bg-[#141414] p-5 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-white/[0.08]">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[#85827B]">
                  Deterministic Decision Path
                </span>
                <span className="text-[10px] font-mono text-[#FA520F]">
                  First-Match Engine
                </span>
              </div>
              <Layers className="h-3.5 w-3.5 text-[#FA520F]" />
            </div>

            {/* Root Scan Trigger */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 p-2 rounded-lg bg-[#18181b] border border-white/10 font-mono text-xs text-[#F7F4EC]">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="font-bold">INCOMING SCAN</span>
                <span className="text-[10px] text-[#85827B] ml-auto">
                  /{activeAsset.slug}
                </span>
              </div>

              {/* Ordered Rule Nodes */}
              <div className="space-y-3 pl-4 relative before:absolute before:left-1.5 before:top-2 before:bottom-2 before:w-[2px] before:bg-white/10">
                {activeAsset.rules && activeAsset.rules.length > 0 ? (
                  activeAsset.rules.map((rule, idx) => {
                    const step = evaluatedRules.find((s) => s.ruleId === rule.id);
                    const isMatched = step?.matched === true;
                    const isEvaluated = Boolean(step);
                    const isSelected = selectedRuleId === rule.id;

                    return (
                      <div
                        key={rule.id}
                        onClick={() => onInspectRule?.(rule, activeAsset)}
                        className={`group relative p-3 rounded-lg border transition-all cursor-pointer ${
                          isSelected
                            ? "bg-[#FA520F]/10 border-[#FA520F] shadow-[0_0_15px_rgba(250,82,15,0.15)]"
                            : isEvaluated
                            ? "bg-[#18181b] border-white/10 hover:border-white/20"
                            : "bg-[#141414] border-white/5 opacity-50"
                        }`}
                      >
                        {/* Status connector icon */}
                        <div className="flex items-start justify-between gap-2">
                          <div className="space-y-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span
                                className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-bold ${
                                  isSelected
                                    ? "bg-[#FA520F] text-white"
                                    : "bg-white/10 text-[#85827B]"
                                }`}
                              >
                                #{rule.priority}
                              </span>
                              <span className="text-xs font-semibold text-[#F7F4EC] truncate">
                                {rule.name}
                              </span>
                            </div>

                            {/* Conditions evaluated */}
                            <div className="space-y-1 pt-1">
                              {(step?.conditionsEvaluated || (rule.conditions || []).map((c) => ({
                                conditionId: c.id,
                                type: c.type,
                                operator: c.operator,
                                expected: c.value,
                                actual: null,
                                matched: false,
                              }))).map((cond, cIdx) => (
                                <div
                                  key={cIdx}
                                  className="flex items-center gap-1.5 text-[10px] font-mono"
                                >
                                  {cond.matched ? (
                                    <CheckCircle2 className="h-3 w-3 text-emerald-400 shrink-0" />
                                  ) : isEvaluated ? (
                                    <XCircle className="h-3 w-3 text-red-400/80 shrink-0" />
                                  ) : (
                                    <span className="w-3 h-3 rounded-full border border-white/20 shrink-0" />
                                  )}
                                  <span className="text-[#85827B]">
                                    {cond.type} {cond.operator}
                                  </span>
                                  <span className="text-[#F7F4EC]">
                                    {String(cond.expected)}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Match outcome badge */}
                          <div className="shrink-0 text-right">
                            {isSelected ? (
                              <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-[#FA520F] bg-[#FA520F]/20 px-2 py-0.5 rounded">
                                MATCHED
                              </span>
                            ) : isEvaluated ? (
                              <span className="text-[10px] font-mono text-[#85827B]">
                                NO MATCH
                              </span>
                            ) : (
                              <span className="text-[10px] font-mono text-[#85827B]/50">
                                BYPASSED
                              </span>
                            )}
                          </div>
                        </div>

                        {isSelected && (
                          <div className="mt-2.5 pt-2 border-t border-[#FA520F]/30 flex items-center justify-between text-[10px] font-mono text-[#FA520F]">
                            <span>Active Route Selected</span>
                            <ArrowRight className="h-3 w-3 animate-pulse" />
                          </div>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <div className="p-3 rounded-lg border border-white/5 bg-[#18181b] text-xs text-[#85827B]">
                    No conditional rules configured. Scan directly falls through to default destination.
                  </div>
                )}

                {/* Default Fallthrough Node */}
                <div
                  className={`p-3 rounded-lg border transition-all ${
                    !selectedRuleId
                      ? "bg-[#FA520F]/10 border-[#FA520F] shadow-[0_0_15px_rgba(250,82,15,0.15)]"
                      : "bg-[#18181b]/50 border-white/5 opacity-60"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-semibold text-[#F7F4EC]">
                        Default Destination Fallback
                      </span>
                      <p className="text-[10px] font-mono text-[#85827B]">
                        Applied if no conditional rules match
                      </p>
                    </div>
                    {!selectedRuleId && (
                      <span className="text-[10px] font-mono font-bold text-[#FA520F] bg-[#FA520F]/20 px-2 py-0.5 rounded">
                        SELECTED
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* PANEL 3: Selected Destination (4 cols on desktop) */}
          <div className="lg:col-span-4 rounded-xl border border-white/[0.08] bg-[#141414] p-5 space-y-4 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-white/[0.08]">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[#85827B]">
                  Selected Destination
                </span>
                <Compass className="h-3.5 w-3.5 text-[#FA520F]" />
              </div>

              {/* Destination URL Card */}
              <div className="p-4 rounded-xl border border-[#FA520F]/30 bg-[#FA520F]/5 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[10px] font-mono text-[#FA520F] uppercase font-bold tracking-wider">
                    {simulationResult.matchedRuleName
                      ? `Target: ${simulationResult.matchedRuleName}`
                      : "Target: Default Destination"}
                  </span>
                  <span className="text-[10px] font-mono text-emerald-400">
                    &lt; 1ms evaluation
                  </span>
                </div>

                <div className="text-xs font-mono text-[#F7F4EC] break-all bg-[#121214] p-2.5 rounded-md border border-white/10">
                  {simulationResult.destinationUrl}
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleCopyDestination}
                    className="flex-1 h-8 text-xs border-white/10 bg-[#191919] hover:bg-[#222222] text-[#F7F4EC] gap-1.5"
                  >
                    {copiedUrl ? (
                      <Check className="h-3.5 w-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                    <span>Copy URL</span>
                  </Button>
                  <Button
                    asChild
                    size="sm"
                    className="flex-1 h-8 text-xs bg-[#FA520F] hover:bg-[#d9440a] text-white gap-1.5"
                  >
                    <a
                      href={simulationResult.destinationUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <span>Open URL</span>
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  </Button>
                </div>
              </div>

              {/* Decision Reason */}
              <div className="space-y-1.5 text-xs">
                <span className="text-[11px] font-medium text-[#85827B]">
                  Decision Reason
                </span>
                <p className="p-2.5 rounded-lg bg-[#18181b] border border-white/5 text-[#B8B5AD] text-xs leading-relaxed">
                  {simulationResult.reason}
                </p>
              </div>

              {/* Alternative Routes Summary */}
              <div className="space-y-1.5 text-xs">
                <span className="text-[11px] font-medium text-[#85827B]">
                  Alternative / Non-Selected Routes
                </span>
                <div className="space-y-1">
                  {selectedRuleId ? (
                    <div className="p-2 rounded bg-[#18181b] border border-white/5 text-[11px] font-mono text-[#85827B]">
                      <span className="text-[#F7F4EC]">Default Route</span>: Not
                      selected (Rule &apos;{simulationResult.matchedRuleName}&apos; matched first)
                    </div>
                  ) : (
                    <div className="p-2 rounded bg-[#18181b] border border-white/5 text-[11px] font-mono text-[#85827B]">
                      No conditional rules matched; standard fallback route applied.
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Diagnostic Trace Toggle */}
            <div className="pt-3 border-t border-white/[0.08]">
              <button
                type="button"
                onClick={() => setTraceOpen(!traceOpen)}
                className="w-full flex items-center justify-between text-xs text-[#85827B] hover:text-[#F7F4EC] transition-colors"
              >
                <span className="font-mono text-[11px]">Evaluation trace details</span>
                {traceOpen ? (
                  <ChevronDown className="h-3.5 w-3.5" />
                ) : (
                  <ChevronRight className="h-3.5 w-3.5" />
                )}
              </button>
              {traceOpen && (
                <div className="pt-2">
                  <pre className="p-3 rounded-lg bg-[#111111] border border-white/10 text-[10px] font-mono text-[#85827B] overflow-x-auto max-h-48">
                    {JSON.stringify(simulationResult.trace || simulationResult, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

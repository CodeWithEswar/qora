import * as React from "react";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "System Status",
  description: "View the operational status of NXTQR platform services.",
};
import {
  Activity,
  ArrowRight,
  BarChart3,
  CheckCircle2,
  Clock3,
  Cloud,
  Database,
  ExternalLink,
  Globe2,
  HardDrive,
  HeartPulse,
  QrCode,
  Radio,
  RefreshCw,
  Route,
  Server,
  ShieldCheck,
  Signal,
  TriangleAlert,
  Zap,
} from "lucide-react";

import { MarketingHeader } from "@/components/marketing/header";
import { MarketingFooter } from "@/components/marketing/footer";
import { BRAND } from "@/config/brand";

type SystemStatus =
  | "operational"
  | "degraded"
  | "partial_outage"
  | "major_outage"
  | "maintenance";

type System = {
  id: string;
  index: string;
  name: string;
  shortName: string;
  description: string;
  status: SystemStatus;
  metricLabel?: string;
  metricValue?: string;
  icon: React.ComponentType<{ className?: string }>;
};

const systems: System[] = [
  {
    id: "edge",
    index: "01",
    name: "Edge Resolution",
    shortName: "EDGE",
    description:
      "Resolves dynamic QR identities against published routing state.",
    status: "operational",
    metricLabel: "STATE",
    metricValue: "Available",
    icon: Zap,
  },
  {
    id: "control",
    index: "02",
    name: "Control Plane",
    shortName: "CONTROL",
    description:
      "Application, API and configuration services used to manage QR assets.",
    status: "operational",
    metricLabel: "STATE",
    metricValue: "Available",
    icon: Server,
  },
  {
    id: "events",
    index: "03",
    name: "Event Pipeline",
    shortName: "EVENTS",
    description:
      "Asynchronous ingestion path for scan telemetry and platform events.",
    status: "operational",
    metricLabel: "QUEUE",
    metricValue: "Processing",
    icon: Activity,
  },
  {
    id: "guardian",
    index: "04",
    name: "Guardian",
    shortName: "GUARDIAN",
    description:
      "Destination-health evaluation and approved fallback-state processing.",
    status: "operational",
    metricLabel: "STATE",
    metricValue: "Monitoring",
    icon: HeartPulse,
  },
  {
    id: "storage",
    index: "05",
    name: "Asset Storage",
    shortName: "STORAGE",
    description:
      "Storage services supporting customer files, logos and platform assets.",
    status: "operational",
    metricLabel: "STATE",
    metricValue: "Available",
    icon: HardDrive,
  },
];

/*
 * IMPORTANT:
 *
 * This is fallback / design-preview status data.
 *
 * Before production:
 * replace this with data from a server-side status service.
 *
 * Never calculate "all systems operational" independently
 * from static marketing data.
 */

export default function StatusPage() {
  const hasIncident = systems.some(
    (system) =>
      system.status === "degraded" ||
      system.status === "partial_outage" ||
      system.status === "major_outage",
  );

  const overallStatus: SystemStatus = hasIncident
    ? "degraded"
    : "operational";

  return (
    <div className="min-h-screen bg-background text-foreground">
      <MarketingHeader />

      <main>
        {/* ================================================= */}
        {/* STATUS HERO                                       */}
        {/* ================================================= */}

        <section
          className="
            relative overflow-hidden
            border-b border-border/60
            pt-32 sm:pt-36 lg:pt-40
          "
        >
          {/* Ambient infrastructure field */}

          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0"
          >
            <div
              className="
                absolute left-[12%] top-[15%]
                h-[30rem] w-[30rem]
                rounded-full
                bg-emerald-500/[0.035]
                blur-[150px]
              "
            />

            <div
              className="
                absolute right-[8%] top-[20%]
                h-[26rem] w-[26rem]
                rounded-full
                bg-primary/[0.035]
                blur-[140px]
              "
            />

            <div
              className="
                absolute inset-0 opacity-[0.18]
                [background-image:linear-gradient(to_right,hsl(var(--border)/.3)_1px,transparent_1px)]
                [background-size:72px_100%]
                [mask-image:linear-gradient(to_bottom,black,transparent)]
              "
            />
          </div>

          <div className="relative mx-auto max-w-[1380px] px-4 sm:px-6 lg:px-8 xl:px-10">
            <div
              className="
                grid gap-10 pb-14
                lg:grid-cols-[1fr_380px]
                lg:items-end
                lg:pb-18
              "
            >
              {/* Heading */}

              <div className="max-w-[820px]">
                <div
                  className="
                    inline-flex items-center gap-2
                    font-mono text-[9px]
                    font-semibold uppercase
                    tracking-[0.18em]
                    text-primary
                  "
                >
                  <span
                    className="
                      flex h-6 w-6
                      items-center justify-center
                      border border-primary/20
                      bg-primary/[0.06]
                    "
                  >
                    <Activity className="h-3 w-3" />
                  </span>

                  NXTQR Operations

                  <span className="h-px w-10 bg-primary/30" />
                </div>

                <h1
                  className="
                    mt-6 font-display
                    text-[clamp(3rem,10vw,5rem)]
                    font-medium leading-[0.95]
                    tracking-[-0.05em]
                    sm:text-[clamp(4rem,7vw,6rem)]
                  "
                >
                  Infrastructure,
                  <br />

                  <span
                    className="
                      bg-gradient-to-r
                      from-primary
                      via-[#FF8A00]
                      to-[#FFD06A]
                      bg-clip-text text-transparent
                    "
                  >
                    in view.
                  </span>
                </h1>

                <p
                  className="
                    mt-7 max-w-[700px]
                    text-sm leading-7
                    text-muted-foreground
                    sm:text-base
                  "
                >
                  Operational visibility across the systems responsible
                  for QR resolution, platform control, event processing,
                  destination health and asset storage.
                </p>
              </div>

              {/* Overall status */}

              <div
                className="
                  border border-border/60
                  bg-card/60
                  p-5
                  backdrop-blur-sm
                "
              >
                <div className="flex items-start justify-between gap-5">
                  <div>
                    <div
                      className="
                        font-mono text-[7px]
                        font-semibold uppercase
                        tracking-[0.15em]
                        text-muted-foreground
                      "
                    >
                      Current platform state
                    </div>

                    <div className="mt-3 flex items-center gap-2.5">
                      <StatusPulse status={overallStatus} />

                      <span className="text-sm font-semibold">
                        {statusLabel(overallStatus)}
                      </span>
                    </div>
                  </div>

                  <Signal className="h-4 w-4 text-emerald-500" />
                </div>

                <div className="mt-6 grid grid-cols-2 border-t border-border/60 pt-4">
                  <div>
                    <div className="font-mono text-[6px] tracking-[0.13em] text-muted-foreground">
                      SERVICES
                    </div>

                    <div className="mt-1 text-[10px] font-semibold">
                      {systems.length} monitored
                    </div>
                  </div>

                  <div className="border-l border-border/60 pl-4">
                    <div className="font-mono text-[6px] tracking-[0.13em] text-muted-foreground">
                      INCIDENTS
                    </div>

                    <div className="mt-1 text-[10px] font-semibold">
                      {hasIncident ? "Active" : "None shown"}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Status metadata rail */}

            <div
              className="
                grid border-t border-border/60
                sm:grid-cols-3
              "
            >
              <HeroMetric
                label="PLATFORM"
                value={BRAND.name}
                icon={Globe2}
              />

              <HeroMetric
                label="SYSTEM MODEL"
                value="Distributed infrastructure"
                icon={Cloud}
              />

              <HeroMetric
                label="STATUS SOURCE"
                value="Preview"
                icon={Radio}
                last
              />
            </div>
          </div>
        </section>

        {/* ================================================= */}
        {/* LIVE TOPOLOGY                                     */}
        {/* ================================================= */}

        <section className="border-b border-border/60">
          <div className="mx-auto max-w-[1380px] px-4 py-14 sm:px-6 lg:px-8 lg:py-20 xl:px-10">
            {/* Section heading */}

            <div
              className="
                mb-8 flex flex-col gap-4
                sm:flex-row
                sm:items-end
                sm:justify-between
              "
            >
              <div>
                <div
                  className="
                    font-mono text-[7px]
                    font-semibold uppercase
                    tracking-[0.16em]
                    text-primary
                  "
                >
                  Runtime topology
                </div>

                <h2
                  className="
                    mt-2 font-display
                    text-2xl font-medium
                    tracking-[-0.03em]
                    sm:text-3xl lg:text-4xl
                  "
                >
                  Follow the scan path.
                </h2>
              </div>

              <p
                className="
                  max-w-[470px]
                  text-[10px] leading-5
                  text-muted-foreground
                "
              >
                Critical redirect work stays focused on resolution while
                telemetry and health evaluation can operate outside the
                synchronous redirect path.
              </p>
            </div>

            {/* Topology console */}

            <div
              className="
                overflow-hidden
                border border-border/70
                bg-card
              "
            >
              {/* Console rail */}

              <div
                className="
                  flex flex-col gap-3
                  border-b border-border/60
                  px-4 py-3
                  sm:flex-row
                  sm:items-center
                  sm:justify-between
                  sm:px-5
                "
              >
                <div className="flex items-center gap-2">
                  <Radio className="h-3.5 w-3.5 text-primary" />

                  <span
                    className="
                      font-mono text-[8px]
                      font-semibold uppercase
                      tracking-[0.13em]
                    "
                  >
                    NXTQR Infrastructure Map
                  </span>
                </div>

                <div className="flex items-center gap-4">
                  <span
                    className="
                      font-mono text-[6px]
                      tracking-[0.13em]
                      text-muted-foreground
                    "
                  >
                    SCAN → RESOLVE → DESTINATION
                  </span>

                  <div className="flex items-center gap-1.5">
                    <span className="relative flex h-2 w-2">
                      <span
                        className="
                          absolute inline-flex h-full w-full
                          animate-ping rounded-full
                          bg-emerald-400 opacity-50
                        "
                      />

                      <span
                        className="
                          relative inline-flex h-2 w-2
                          rounded-full bg-emerald-500
                        "
                      />
                    </span>

                    <span
                      className="
                        font-mono text-[6px]
                        font-semibold
                        text-emerald-600
                        dark:text-emerald-400
                      "
                    >
                      PREVIEW
                    </span>
                  </div>
                </div>
              </div>

              {/* Scan flow */}

              <div
                className="
                  relative overflow-hidden
                  px-4 py-10
                  sm:px-6
                  lg:px-8 lg:py-14
                "
              >
                {/* Fine grid */}

                <div
                  aria-hidden="true"
                  className="
                    pointer-events-none absolute inset-0
                    opacity-[0.12]
                    [background-image:linear-gradient(to_right,hsl(var(--border))_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border))_1px,transparent_1px)]
                    [background-size:40px_40px]
                  "
                />

                <div className="relative">
                  {/* Desktop architecture */}

                  <div
                    className="
                      hidden
                      lg:grid
                      lg:grid-cols-[150px_70px_1fr_70px_180px]
                      lg:items-center
                    "
                  >
                    <TopologyNode
                      eyebrow="INPUT"
                      title="QR Scan"
                      description="Incoming resolution request"
                      icon={QrCode}
                    />

                    <FlowConnector label="REQUEST" />

                    <div>
                      <div
                        className="
                          grid gap-px
                          overflow-hidden
                          border border-border/70
                          bg-border/60
                          xl:grid-cols-2
                        "
                      >
                        <TopologyService
                          index="01"
                          title="Edge Resolver"
                          subtitle="Identity → routing state"
                          icon={Zap}
                          status="operational"
                        />

                        <TopologyService
                          index="02"
                          title="Published State"
                          subtitle="Routing snapshot"
                          icon={Database}
                          status="operational"
                        />
                      </div>
                    </div>

                    <FlowConnector label="302 / TARGET" />

                    <TopologyNode
                      eyebrow="OUTPUT"
                      title="Destination"
                      description="Configured route target"
                      icon={Route}
                      active
                    />
                  </div>

                  {/* Mobile architecture */}

                  <div className="space-y-0 lg:hidden">
                    <TopologyNode
                      eyebrow="INPUT"
                      title="QR Scan"
                      description="Incoming resolution request"
                      icon={QrCode}
                    />

                    <MobileFlow label="REQUEST" />

                    <TopologyService
                      index="01"
                      title="Edge Resolver"
                      subtitle="Identity → routing state"
                      icon={Zap}
                      status="operational"
                    />

                    <MobileFlow label="READ STATE" />

                    <TopologyService
                      index="02"
                      title="Published State"
                      subtitle="Routing snapshot"
                      icon={Database}
                      status="operational"
                    />

                    <MobileFlow label="DESTINATION" />

                    <TopologyNode
                      eyebrow="OUTPUT"
                      title="Destination"
                      description="Configured route target"
                      icon={Route}
                      active
                    />
                  </div>

                  {/* Async intelligence branch */}

                  <div
                    className="
                      mt-8 border-t border-dashed
                      border-border/70 pt-8
                      lg:mt-10
                    "
                  >
                    <div
                      className="
                        mb-5 flex flex-col gap-2
                        sm:flex-row
                        sm:items-center
                        sm:justify-between
                      "
                    >
                      <div className="flex items-center gap-2">
                        <Activity className="h-3.5 w-3.5 text-primary" />

                        <span
                          className="
                            font-mono text-[7px]
                            font-semibold uppercase
                            tracking-[0.14em]
                          "
                        >
                          Asynchronous intelligence path
                        </span>
                      </div>

                      <span
                        className="
                          font-mono text-[6px]
                          tracking-[0.12em]
                          text-muted-foreground
                        "
                      >
                        DOES NOT NEED TO BLOCK REDIRECT RESPONSE
                      </span>
                    </div>

                    <div
                      className="
                        grid gap-px
                        overflow-hidden
                        border border-border/60
                        bg-border/60
                        sm:grid-cols-3
                      "
                    >
                      <AsyncNode
                        index="03"
                        title="Event Pipeline"
                        description="Scan-event ingestion"
                        icon={Activity}
                      />

                      <AsyncNode
                        index="04"
                        title="Analytics"
                        description="Aggregated signals"
                        icon={BarChart3}
                      />

                      <AsyncNode
                        index="05"
                        title="Guardian"
                        description="Destination health state"
                        icon={HeartPulse}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ================================================= */}
        {/* SERVICE STATUS                                    */}
        {/* ================================================= */}

        <section className="border-b border-border/60 bg-muted/[0.08]">
          <div className="mx-auto max-w-[1380px] px-4 py-14 sm:px-6 lg:px-8 lg:py-20 xl:px-10">
            <div className="mb-8">
              <div
                className="
                  font-mono text-[7px]
                  font-semibold uppercase
                  tracking-[0.16em]
                  text-primary
                "
              >
                Component status
              </div>

              <h2
                className="
                  mt-2 font-display
                  text-2xl font-medium
                  tracking-[-0.03em]
                  sm:text-3xl
                "
              >
                System by system.
              </h2>
            </div>

            <div className="overflow-hidden border border-border/70 bg-card">
              {/* Table heading */}

              <div
                className="
                  hidden grid-cols-[55px_1fr_140px_130px]
                  border-b border-border/60
                  px-5 py-3
                  md:grid
                "
              >
                <TableLabel>NO.</TableLabel>
                <TableLabel>COMPONENT</TableLabel>
                <TableLabel>SIGNAL</TableLabel>
                <TableLabel>STATUS</TableLabel>
              </div>

              {systems.map((system) => {
                const Icon = system.icon;

                return (
                  <div
                    key={system.id}
                    className="
                      group grid gap-4
                      border-b border-border/60
                      p-5
                      transition-colors
                      last:border-b-0
                      hover:bg-muted/[0.08]
                      md:grid-cols-[55px_1fr_140px_130px]
                      md:items-center
                    "
                  >
                    <div
                      className="
                        font-mono text-[7px]
                        text-muted-foreground
                      "
                    >
                      {system.index}
                    </div>

                    <div className="flex min-w-0 items-start gap-3">
                      <div
                        className="
                          flex h-8 w-8 shrink-0
                          items-center justify-center
                          border border-border/70
                          bg-background
                          text-primary
                        "
                      >
                        <Icon className="h-3.5 w-3.5" />
                      </div>

                      <div className="min-w-0">
                        <div className="text-[11px] font-semibold">
                          {system.name}
                        </div>

                        <p
                          className="
                            mt-1 max-w-[520px]
                            text-[8px] leading-4
                            text-muted-foreground
                          "
                        >
                          {system.description}
                        </p>
                      </div>
                    </div>

                    <div>
                      <div
                        className="
                          font-mono text-[6px]
                          tracking-[0.12em]
                          text-muted-foreground
                          md:hidden
                        "
                      >
                        {system.metricLabel}
                      </div>

                      <div
                        className="
                          mt-1 font-mono
                          text-[8px]
                          text-foreground
                          md:mt-0
                        "
                      >
                        {system.metricValue}
                      </div>
                    </div>

                    <StatusBadge status={system.status} />
                  </div>
                );
              })}
            </div>

            <p
              className="
                mt-4 max-w-[720px]
                text-[8px] leading-4
                text-muted-foreground
              "
            >
              Current values on this page are interface-preview data until
              the status surface is connected to production monitoring.
              They must not be interpreted as measured uptime or latency.
            </p>
          </div>
        </section>

        {/* ================================================= */}
        {/* INCIDENT HISTORY                                  */}
        {/* ================================================= */}

        <section className="border-b border-border/60">
          <div className="mx-auto max-w-[1380px] px-4 py-14 sm:px-6 lg:px-8 lg:py-20 xl:px-10">
            <div
              className="
                grid gap-10
                lg:grid-cols-[0.8fr_1.2fr]
              "
            >
              {/* Intro */}

              <div>
                <div
                  className="
                    font-mono text-[7px]
                    font-semibold uppercase
                    tracking-[0.16em]
                    text-primary
                  "
                >
                  Incident history
                </div>

                <h2
                  className="
                    mt-3 max-w-[500px]
                    font-display text-3xl
                    font-medium leading-[1]
                    tracking-[-0.035em]
                    sm:text-4xl
                  "
                >
                  Operational history,
                  <br />
                  without hiding the bad days.
                </h2>

                <p
                  className="
                    mt-5 max-w-[500px]
                    text-[10px] leading-5
                    text-muted-foreground
                  "
                >
                  Once connected to production monitoring, incidents,
                  maintenance windows and recovery updates should appear
                  here as a chronological public record.
                </p>
              </div>

              {/* Empty incident history */}

              <div className="border border-border/70 bg-card">
                <div
                  className="
                    flex items-center justify-between
                    border-b border-border/60
                    px-5 py-3
                  "
                >
                  <div className="flex items-center gap-2">
                    <Clock3 className="h-3.5 w-3.5 text-primary" />

                    <span
                      className="
                        font-mono text-[7px]
                        font-semibold uppercase
                        tracking-[0.13em]
                      "
                    >
                      Recent incidents
                    </span>
                  </div>

                  <span
                    className="
                      font-mono text-[6px]
                      text-muted-foreground
                    "
                  >
                    PUBLIC HISTORY
                  </span>
                </div>

                <div
                  className="
                    flex min-h-[230px]
                    flex-col items-center
                    justify-center
                    px-6 text-center
                  "
                >
                  <div
                    className="
                      flex h-10 w-10
                      items-center justify-center
                      border border-border/70
                      bg-muted/[0.1]
                    "
                  >
                    <Clock3 className="h-4 w-4 text-muted-foreground" />
                  </div>

                  <div className="mt-4 text-[11px] font-semibold">
                    No production incident history published yet
                  </div>

                  <p
                    className="
                      mt-2 max-w-[420px]
                      text-[8px] leading-4
                      text-muted-foreground
                    "
                  >
                    Historical incidents will appear here after the
                    production status service is enabled. We do not
                    generate fictional uptime history.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ================================================= */}
        {/* STATUS PRINCIPLES                                 */}
        {/* ================================================= */}

        <section className="border-b border-border/60 border-b border-border/60 bg-muted/[0.1] text-foreground dark:bg-card border border-border/60 dark:bg-[#111111] dark:border-white/[0.08] dark:text-foreground">
          <div className="mx-auto max-w-[1380px] px-4 py-12 sm:px-6 lg:px-8 lg:py-16 xl:px-10">
            <div
              className="
                grid gap-px
                overflow-hidden
                border border-border/60 dark:border-white/[0.08]
                bg-border/60 dark:bg-white/[0.08]
                sm:grid-cols-2
                lg:grid-cols-4
              "
            >
              <Principle
                index="01"
                title="RESOLVE"
                value="At the edge"
                icon={Zap}
              />

              <Principle
                index="02"
                title="ISOLATE"
                value="Critical paths"
                icon={ShieldCheck}
              />

              <Principle
                index="03"
                title="OBSERVE"
                value="System health"
                icon={Activity}
              />

              <Principle
                index="04"
                title="REPORT"
                value="Real incidents"
                icon={Radio}
              />
            </div>
          </div>
        </section>
      </main>

      <MarketingFooter />
    </div>
  );
}

/* ========================================================= */
/* STATUS                                                    */
/* ========================================================= */

function statusLabel(status: SystemStatus) {
  switch (status) {
    case "operational":
      return "All monitored systems operational";
    case "degraded":
      return "Degraded performance";
    case "partial_outage":
      return "Partial outage";
    case "major_outage":
      return "Major outage";
    case "maintenance":
      return "Maintenance";
  }
}

function StatusPulse({ status }: { status: SystemStatus }) {
  const className =
    status === "operational"
      ? "bg-emerald-500"
      : status === "maintenance"
        ? "bg-blue-500"
        : status === "degraded"
          ? "bg-amber-500"
          : "bg-red-500";

  return (
    <span className="relative flex h-2.5 w-2.5">
      <span
        className={`
          absolute inline-flex
          h-full w-full
          animate-ping rounded-full
          opacity-40
          ${className}
        `}
      />

      <span
        className={`
          relative inline-flex
          h-2.5 w-2.5
          rounded-full
          ${className}
        `}
      />
    </span>
  );
}

function StatusBadge({ status }: { status: SystemStatus }) {
  const styles: Record<SystemStatus, string> = {
    operational:
      "border-emerald-500/20 bg-emerald-500/[0.07] text-emerald-600 dark:text-emerald-400",
    degraded:
      "border-amber-500/20 bg-amber-500/[0.07] text-amber-600 dark:text-amber-400",
    partial_outage:
      "border-orange-500/20 bg-orange-500/[0.07] text-orange-600 dark:text-orange-400",
    major_outage:
      "border-red-500/20 bg-red-500/[0.07] text-red-600 dark:text-red-400",
    maintenance:
      "border-blue-500/20 bg-blue-500/[0.07] text-blue-600 dark:text-blue-400",
  };

  return (
    <div
      className={`
        inline-flex w-fit items-center
        gap-2 border px-2 py-1
        font-mono text-[7px]
        font-semibold uppercase
        tracking-[0.08em]
        ${styles[status]}
      `}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {statusLabelShort(status)}
    </div>
  );
}

function statusLabelShort(status: SystemStatus) {
  switch (status) {
    case "operational":
      return "Operational";
    case "degraded":
      return "Degraded";
    case "partial_outage":
      return "Partial outage";
    case "major_outage":
      return "Major outage";
    case "maintenance":
      return "Maintenance";
  }
}

/* ========================================================= */
/* TOPOLOGY                                                  */
/* ========================================================= */

function TopologyNode({
  eyebrow,
  title,
  description,
  icon: Icon,
  active = false,
}: {
  eyebrow: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  active?: boolean;
}) {
  return (
    <div
      className={`
        border p-4
        ${
          active
            ? "border-primary/30 bg-primary/[0.035]"
            : "border-border/70 bg-background"
        }
      `}
    >
      <div className="flex items-center justify-between">
        <span
          className="
            font-mono text-[6px]
            tracking-[0.13em]
            text-muted-foreground
          "
        >
          {eyebrow}
        </span>

        <Icon
          className={`
            h-3.5 w-3.5
            ${active ? "text-primary" : "text-muted-foreground"}
          `}
        />
      </div>

      <div className="mt-5 text-[10px] font-semibold">
        {title}
      </div>

      <p className="mt-1 text-[7px] leading-4 text-muted-foreground">
        {description}
      </p>
    </div>
  );
}

function TopologyService({
  index,
  title,
  subtitle,
  icon: Icon,
  status,
}: {
  index: string;
  title: string;
  subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
  status: SystemStatus;
}) {
  return (
    <div className="bg-background p-5">
      <div className="flex items-center justify-between">
        <span className="font-mono text-[6px] text-muted-foreground">
          {index}
        </span>

        <StatusPulse status={status} />
      </div>

      <div
        className="
          mt-8 flex h-8 w-8
          items-center justify-center
          border border-primary/20
          bg-primary/[0.05]
          text-primary
        "
      >
        <Icon className="h-3.5 w-3.5" />
      </div>

      <div className="mt-3 text-[10px] font-semibold">
        {title}
      </div>

      <div className="mt-1 text-[7px] text-muted-foreground">
        {subtitle}
      </div>
    </div>
  );
}

function FlowConnector({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center justify-center">
      <span
        className="
          mb-2 whitespace-nowrap
          font-mono text-[5px]
          tracking-[0.1em]
          text-muted-foreground
        "
      >
        {label}
      </span>

      <div className="flex w-full items-center">
        <div className="h-px flex-1 bg-gradient-to-r from-border to-primary/50" />

        <ArrowRight className="h-3 w-3 -translate-x-0.5 text-primary/70" />
      </div>
    </div>
  );
}

function MobileFlow({ label }: { label: string }) {
  return (
    <div className="flex h-14 flex-col items-center justify-center">
      <div className="h-5 w-px bg-gradient-to-b from-border to-primary/50" />

      <span
        className="
          my-1 font-mono text-[5px]
          tracking-[0.1em]
          text-muted-foreground
        "
      >
        {label}
      </span>

      <div className="h-5 w-px bg-gradient-to-b from-primary/50 to-border" />
    </div>
  );
}

function AsyncNode({
  index,
  title,
  description,
  icon: Icon,
}: {
  index: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="bg-background p-4">
      <div className="flex items-center justify-between">
        <span className="font-mono text-[6px] text-muted-foreground">
          {index}
        </span>

        <Icon className="h-3.5 w-3.5 text-primary" />
      </div>

      <div className="mt-5 text-[9px] font-semibold">
        {title}
      </div>

      <p className="mt-1 text-[7px] text-muted-foreground">
        {description}
      </p>
    </div>
  );
}

/* ========================================================= */
/* HERO METRIC                                               */
/* ========================================================= */

function HeroMetric({
  label,
  value,
  icon: Icon,
  last = false,
}: {
  label: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  last?: boolean;
}) {
  return (
    <div
      className={`
        border-b border-border/60
        py-4
        sm:border-b-0 sm:px-5
        ${last ? "" : "sm:border-r"}
        sm:first:pl-0
      `}
    >
      <div className="flex items-center justify-between">
        <span
          className="
            font-mono text-[7px]
            tracking-[0.14em]
            text-muted-foreground
          "
        >
          {label}
        </span>

        <Icon className="h-3 w-3 text-primary" />
      </div>

      <div className="mt-2 text-[9px] font-semibold">
        {value}
      </div>
    </div>
  );
}

/* ========================================================= */
/* TABLE                                                     */
/* ========================================================= */

function TableLabel({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <span
      className="
        font-mono text-[6px]
        tracking-[0.13em]
        text-muted-foreground
      "
    >
      {children}
    </span>
  );
}

/* ========================================================= */
/* PRINCIPLE                                                 */
/* ========================================================= */

function Principle({
  index,
  title,
  value,
  icon: Icon,
}: {
  index: string;
  title: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="bg-card border border-border/60 dark:bg-[#111111] dark:border-white/[0.08] p-5 sm:p-6">
      <div className="flex items-center justify-between">
        <span className="font-mono text-[6px] text-muted-foreground">
          {index}
        </span>

        <Icon className="h-3.5 w-3.5 text-[#FA520F]" />
      </div>

      <div
        className="
          mt-8 font-mono text-[7px]
          font-semibold tracking-[0.14em]
          text-[#FA520F]
        "
      >
        {title}
      </div>

      <div className="mt-1 text-[10px] font-semibold text-foreground">
        {value}
      </div>
    </div>
  );
}
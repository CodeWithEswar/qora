"use client";

import * as React from "react";
import Link from "next/link";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  Check,
  CheckCircle2,
  Clock3,
  ExternalLink,
  HeartPulse,
  LockKeyhole,
  Radio,
  RefreshCw,
  Route,
  ShieldCheck,
  Siren,
  Wifi,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { MARKETING_GUARDIAN_PREVIEW } from "@/data/marketing/previews";

export function GuardianPreview() {
  const g = MARKETING_GUARDIAN_PREVIEW;

  return (
    <section
      id="guardian"
      className="
        relative isolate overflow-hidden
        border-b border-border/60
        bg-background
        py-20 sm:py-24 lg:py-32
      "
    >
      {/* ================================================= */}
      {/* AMBIENT BACKGROUND                                */}
      {/* ================================================= */}

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
      >
        <div
          className="
            absolute -right-48 top-[12%]
            h-[34rem] w-[34rem]
            rounded-full bg-emerald-500/[0.04]
            blur-[140px]
          "
        />

        <div
          className="
            absolute -left-48 bottom-[4%]
            h-[30rem] w-[30rem]
            rounded-full bg-primary/[0.035]
            blur-[130px]
          "
        />

        <div
          className="
            absolute inset-0 opacity-[0.3]
            [background-image:linear-gradient(to_right,hsl(var(--border)/.3)_1px,transparent_1px)]
            [background-size:72px_100%]
            [mask-image:linear-gradient(to_bottom,transparent,black_15%,black_85%,transparent)]
          "
        />
      </div>

      <div className="relative mx-auto max-w-[1380px] px-4 sm:px-6 lg:px-8 xl:px-10">
        {/* ================================================= */}
        {/* SECTION HEADER                                    */}
        {/* ================================================= */}

        <div
          className="
            mb-10 grid gap-7
            sm:mb-14
            lg:mb-16
            lg:grid-cols-[minmax(0,1fr)_430px]
            lg:items-end
          "
        >
          <div>
            <div
              className="
                inline-flex items-center gap-2
                font-mono text-[10px] font-semibold
                uppercase tracking-[0.18em]
                text-emerald-600
                dark:text-emerald-400
                sm:text-[11px]
              "
            >
              <span
                className="
                  flex h-6 w-6 items-center justify-center
                  border border-emerald-500/20
                  bg-emerald-500/[0.06]
                "
              >
                <ShieldCheck className="h-3 w-3" />
              </span>

              NXTQR Guardian

              <span className="h-px w-8 bg-emerald-500/30 sm:w-12" />
            </div>

            <h2
              className="
                mt-5 max-w-[900px]
                font-display font-medium
                tracking-[-0.045em]
                text-foreground
                text-[clamp(2.7rem,10vw,4.5rem)]
                leading-[0.95]
                sm:text-[clamp(4rem,8vw,5.8rem)]
                lg:text-[clamp(5rem,6vw,6.4rem)]
              "
            >
              Protect every scan
              <br />

              <span
                className="
                  bg-gradient-to-r
                  from-emerald-600
                  via-emerald-500
                  to-[#FFB83E]
                  bg-clip-text text-transparent
                  dark:from-emerald-400
                  dark:via-emerald-300
                "
              >
                beyond the QR.
              </span>
            </h2>
          </div>

          <div className="lg:pb-1">
            <p className="max-w-[430px] text-sm leading-6 text-muted-foreground sm:text-base sm:leading-7">
              A healthy QR is only useful when the destination behind it is
              healthy too. Guardian gives teams visibility into destination
              availability, response behavior and fallback readiness.
            </p>

            <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2">
              {[
                "Destination health",
                "Failure history",
                "Fallback policies",
              ].map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-1.5 text-[10px] text-muted-foreground"
                >
                  <Check className="h-3 w-3 text-emerald-500" />
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ================================================= */}
        {/* GUARDIAN PROTECTION SURFACE                        */}
        {/* ================================================= */}

        <div
          className="
            overflow-hidden
            rounded-[20px]
            border border-border/70
            bg-card/80
            shadow-[0_35px_110px_rgba(31,31,31,.08)]
            backdrop-blur-xl
            sm:rounded-[24px]
            lg:rounded-[28px]
          "
        >
          {/* Top rail */}
          <div
            className="
              flex h-12 items-center justify-between
              border-b border-border/60
              px-3
              sm:h-14 sm:px-5
              lg:px-6
            "
          >
            <div className="flex min-w-0 items-center gap-2.5">
              <div
                className="
                  flex h-7 w-7 shrink-0 items-center justify-center
                  rounded-lg
                  bg-emerald-500/[0.09]
                  text-emerald-600
                  dark:text-emerald-400
                "
              >
                <HeartPulse className="h-3.5 w-3.5" />
              </div>

              <div className="min-w-0">
                <div className="truncate text-[10px] font-semibold text-foreground sm:text-xs">
                  Destination Protection
                </div>

                <div className="hidden font-mono text-[8px] text-muted-foreground sm:block">
                  GUARDIAN / HEALTH INTELLIGENCE
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="hidden font-mono text-[8px] text-muted-foreground md:block">
                LAST CHECK / {g.lastCheck}
              </span>

              <span
                className="
                  inline-flex items-center gap-1.5
                  rounded-full
                  border border-emerald-500/15
                  bg-emerald-500/[0.06]
                  px-2 py-1
                  font-mono text-[7px]
                  text-emerald-600
                  dark:text-emerald-400
                  sm:text-[8px]
                "
              >
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute h-full w-full animate-ping rounded-full bg-emerald-500 opacity-30 motion-reduce:animate-none" />
                  <span className="relative h-1.5 w-1.5 rounded-full bg-emerald-500" />
                </span>

                MONITORED
              </span>
            </div>
          </div>

          {/* ================================================= */}
          {/* PROTECTION PIPELINE                               */}
          {/* ================================================= */}

          <div className="relative border-b border-border/60 p-5 sm:p-7 lg:p-8">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <div className="font-mono text-[8px] uppercase tracking-[0.16em] text-muted-foreground">
                  Protection path
                </div>

                <div className="mt-1 text-[10px] text-muted-foreground">
                  Scan traffic remains separate from health evaluation
                </div>
              </div>

              <span className="hidden font-mono text-[7px] text-muted-foreground sm:block">
                SCAN → GUARDIAN → DESTINATION
              </span>
            </div>

            <div
              className="
                grid gap-3
                sm:grid-cols-[1fr_auto_1.15fr_auto_1fr]
                sm:items-center
              "
            >
              {/* Incoming traffic */}
              <ProtectionNode
                index="01"
                icon={Radio}
                eyebrow="TRAFFIC"
                title="QR scan"
                description="Incoming resolution request"
              />

              <FlowArrow />

              {/* Guardian */}
              <div
                className="
                  relative overflow-hidden
                  border border-emerald-500/25
                  bg-emerald-500/[0.045]
                  p-4
                  shadow-[0_10px_35px_rgba(16,185,129,.06)]
                  sm:p-5
                "
              >
                <div
                  aria-hidden="true"
                  className="
                    absolute -right-10 -top-10
                    h-24 w-24 rounded-full
                    border-[16px] border-emerald-500/[0.04]
                  "
                />

                <div className="relative flex items-start justify-between">
                  <span
                    className="
                      flex h-9 w-9 items-center justify-center
                      rounded-lg
                      bg-emerald-500
                      text-white
                      shadow-[0_8px_24px_rgba(16,185,129,.18)]
                    "
                  >
                    <ShieldCheck className="h-4 w-4" />
                  </span>

                  <span className="font-mono text-[7px] text-emerald-600 dark:text-emerald-400">
                    02 / GUARD
                  </span>
                </div>

                <div className="relative mt-6">
                  <div className="text-xs font-semibold text-foreground">
                    Guardian checkpoint
                  </div>

                  <p className="mt-1 text-[9px] leading-4 text-muted-foreground">
                    Health state and approved fallback policy are available to
                    the routing layer.
                  </p>
                </div>

                <div className="relative mt-4 flex items-center gap-2 border-t border-emerald-500/15 pt-3">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />

                  <span className="font-mono text-[7px] uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                    Protection ready
                  </span>
                </div>
              </div>

              <FlowArrow />

              {/* Destination */}
              <ProtectionNode
                index="03"
                icon={ExternalLink}
                eyebrow="PRIMARY"
                title="Destination"
                description={g.monitoredUrl}
                healthy
              />
            </div>
          </div>

          {/* ================================================= */}
          {/* HEALTH OBSERVATORY                                */}
          {/* ================================================= */}

          <div
            className="
              grid
              lg:grid-cols-[0.58fr_0.42fr]
            "
          >
            {/* Health signal */}
            <div
              className="
                border-b border-border/60
                p-5
                sm:p-7
                lg:border-b-0 lg:border-r lg:p-8
              "
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <Activity className="h-3.5 w-3.5 text-emerald-500" />

                    <span className="text-xs font-semibold text-foreground">
                      Destination health signal
                    </span>
                  </div>

                  <p className="mt-1 text-[9px] text-muted-foreground">
                    Illustrative endpoint health history
                  </p>
                </div>

                <div className="text-right">
                  <div className="font-mono text-[7px] uppercase tracking-wider text-muted-foreground">
                    HTTP
                  </div>

                  <div className="mt-1 text-xs font-semibold tabular-nums text-emerald-600 dark:text-emerald-400">
                    {g.statusCode}
                  </div>
                </div>
              </div>

              {/* Health graph */}
              <div className="relative mt-8 h-[160px] sm:h-[190px]">
                <div className="absolute inset-0 flex flex-col justify-between">
                  {[0, 1, 2, 3].map((line) => (
                    <div
                      key={line}
                      className="border-t border-dashed border-border/55"
                    />
                  ))}
                </div>

                <svg
                  aria-hidden="true"
                  viewBox="0 0 700 190"
                  preserveAspectRatio="none"
                  className="absolute inset-0 h-full w-full overflow-visible"
                >
                  <defs>
                    <linearGradient
                      id="guardianLine"
                      x1="0"
                      x2="1"
                      y1="0"
                      y2="0"
                    >
                      <stop offset="0%" stopColor="#10B981" />
                      <stop offset="55%" stopColor="#10B981" />
                      <stop offset="72%" stopColor="#F59E0B" />
                      <stop offset="84%" stopColor="#10B981" />
                      <stop offset="100%" stopColor="#10B981" />
                    </linearGradient>

                    <linearGradient
                      id="guardianArea"
                      x1="0"
                      x2="0"
                      y1="0"
                      y2="1"
                    >
                      <stop
                        offset="0%"
                        stopColor="#10B981"
                        stopOpacity=".13"
                      />

                      <stop
                        offset="100%"
                        stopColor="#10B981"
                        stopOpacity="0"
                      />
                    </linearGradient>
                  </defs>

                  <path
                    d="
                      M0 66
                      C55 62 80 68 125 64
                      C170 60 195 66 240 62
                      C285 59 315 64 355 61
                      C395 58 420 62 450 64
                      C480 66 492 125 520 130
                      C548 135 558 70 590 66
                      C625 62 660 64 700 60
                      L700 190
                      L0 190
                      Z
                    "
                    fill="url(#guardianArea)"
                  />

                  <path
                    d="
                      M0 66
                      C55 62 80 68 125 64
                      C170 60 195 66 240 62
                      C285 59 315 64 355 61
                      C395 58 420 62 450 64
                      C480 66 492 125 520 130
                      C548 135 558 70 590 66
                      C625 62 660 64 700 60
                    "
                    fill="none"
                    stroke="url(#guardianLine)"
                    strokeWidth="2"
                    strokeLinecap="round"
                    vectorEffect="non-scaling-stroke"
                  />

                  <circle
                    cx="520"
                    cy="130"
                    r="4"
                    fill="#F59E0B"
                  />

                  <circle
                    cx="700"
                    cy="60"
                    r="4"
                    fill="#10B981"
                  />
                </svg>

                {/* incident marker */}
                <div
                  className="
                    absolute left-[72%] top-[68%]
                    -translate-x-1/2
                  "
                >
                  <span
                    className="
                      flex h-6 w-6 items-center justify-center
                      rounded-full
                      border border-amber-500/20
                      bg-background
                      text-amber-500
                      shadow-sm
                    "
                  >
                    <AlertTriangle className="h-3 w-3" />
                  </span>
                </div>
              </div>

              <div className="mt-3 flex justify-between font-mono text-[7px] text-muted-foreground">
                <span>EARLIER</span>
                <span>HEALTH EVENT</span>
                <span>NOW</span>
              </div>

              {/* Metrics integrated into graph */}
              <div
                className="
                  mt-6 grid grid-cols-3
                  gap-px overflow-hidden
                  border border-border/60
                  bg-border/60
                "
              >
                <HealthMetric
                  label="STATUS"
                  value={g.status}
                  icon={CheckCircle2}
                  healthy
                />

                <HealthMetric
                  label="RESPONSE"
                  value={g.latency}
                  icon={Clock3}
                />

                <HealthMetric
                  label="TLS"
                  value={g.tlsStatus}
                  icon={LockKeyhole}
                  healthy
                />
              </div>
            </div>

            {/* ============================================= */}
            {/* FAILOVER POLICY                                */}
            {/* ============================================= */}

            <div className="p-5 sm:p-7 lg:p-8">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <Route className="h-3.5 w-3.5 text-primary" />

                    <span className="text-xs font-semibold text-foreground">
                      Fallback policy
                    </span>
                  </div>

                  <p className="mt-1 text-[9px] text-muted-foreground">
                    Approved alternate destination
                  </p>
                </div>

                <span
                  className="
                    border border-emerald-500/15
                    bg-emerald-500/[0.06]
                    px-2 py-1
                    font-mono text-[7px]
                    text-emerald-600
                    dark:text-emerald-400
                  "
                >
                  READY
                </span>
              </div>

              {/* Decision engine */}
              <div className="relative mt-8">
                <PolicyStep
                  number="01"
                  icon={RefreshCw}
                  title="Observe"
                  text="Check the configured destination health signal."
                  state="complete"
                />

                <PolicyConnector />

                <PolicyStep
                  number="02"
                  icon={AlertTriangle}
                  title="Confirm"
                  text="Evaluate the configured failure policy before action."
                  state="watch"
                />

                <PolicyConnector />

                <PolicyStep
                  number="03"
                  icon={Route}
                  title="Fallback"
                  text="Use an approved alternate destination when policy conditions are met."
                  state="ready"
                />
              </div>

              {/* fallback destination */}
              <div
                className="
                  mt-7 overflow-hidden
                  border border-primary/15
                  bg-primary/[0.035]
                "
              >
                <div
                  className="
                    flex items-center justify-between
                    border-b border-primary/10
                    px-3 py-2.5
                  "
                >
                  <span className="font-mono text-[7px] uppercase tracking-[0.14em] text-primary">
                    Approved fallback
                  </span>

                  <ShieldCheck className="h-3 w-3 text-primary" />
                </div>

                <div className="flex min-w-0 items-center gap-2 px-3 py-3">
                  <ExternalLink className="h-3 w-3 shrink-0 text-primary" />

                  <span className="min-w-0 truncate font-mono text-[8px] text-foreground sm:text-[9px]">
                    {g.fallbackUrl}
                  </span>
                </div>
              </div>

              <div
                className="
                  mt-5 flex items-start gap-2
                  border-l border-emerald-500/25
                  pl-3
                "
              >
                <Siren className="mt-0.5 h-3 w-3 shrink-0 text-emerald-500" />

                <p className="text-[8px] leading-4 text-muted-foreground">
                  Teams can define how destination failures should be handled
                  instead of discovering broken experiences from customer
                  reports.
                </p>
              </div>
            </div>
          </div>

          {/* ================================================= */}
          {/* SYSTEM RAIL                                       */}
          {/* ================================================= */}

          <div
            className="
              grid grid-cols-2
              border-t border-border/60
              bg-muted/[0.14]
              sm:grid-cols-4
            "
          >
            <GuardianPrinciple
              index="01"
              title="MONITOR"
              value="Destination"
            />

            <GuardianPrinciple
              index="02"
              title="DETECT"
              value="Health change"
            />

            <GuardianPrinciple
              index="03"
              title="DECIDE"
              value="Policy"
            />

            <GuardianPrinciple
              index="04"
              title="PROTECT"
              value="Scan journey"
            />
          </div>
        </div>

        {/* ================================================= */}
        {/* CTA                                                */}
        {/* ================================================= */}

        <div
          className="
            mt-6 flex flex-col gap-4
            sm:flex-row sm:items-center sm:justify-between
          "
        >
          <p className="max-w-[650px] text-[10px] leading-5 text-muted-foreground sm:text-[11px]">
            Give every important QR destination a health signal, history and
            recovery path before it becomes a broken customer experience.
          </p>

          <Button
            asChild
            className="
              group h-10 w-full rounded-lg
              bg-emerald-600 px-5
              text-[11px] font-semibold text-white
              shadow-[0_8px_28px_rgba(16,185,129,.13)]
              hover:bg-emerald-700
              sm:w-auto
            "
          >
            <Link href="/login">
              Explore Guardian

              <ArrowRight
                className="
                  ml-1 h-3.5 w-3.5
                  transition-transform
                  group-hover:translate-x-0.5
                "
              />
            </Link>
          </Button>
        </div>

        {/* Preview disclosure */}
        <p className="mx-auto mt-4 max-w-2xl text-center text-[8px] leading-4 text-muted-foreground/70 sm:text-[9px]">
          Guardian interface and health values shown for product illustration.
        </p>
      </div>
    </section>
  );
}

/* ========================================================= */
/* PROTECTION NODE                                           */
/* ========================================================= */

function ProtectionNode({
  index,
  icon: Icon,
  eyebrow,
  title,
  description,
  healthy = false,
}: {
  index: string;
  icon: React.ComponentType<{ className?: string }>;
  eyebrow: string;
  title: string;
  description: string;
  healthy?: boolean;
}) {
  return (
    <div
      className="
        min-w-0 border border-border/60
        bg-background p-4 sm:p-5
      "
    >
      <div className="flex items-start justify-between">
        <span
          className="
            flex h-8 w-8 items-center justify-center
            border border-border/70
            bg-muted/30
          "
        >
          <Icon
            className={`h-3.5 w-3.5 ${
              healthy
                ? "text-emerald-500"
                : "text-muted-foreground"
            }`}
          />
        </span>

        <span className="font-mono text-[7px] text-muted-foreground">
          {index}
        </span>
      </div>

      <div className="mt-5 font-mono text-[7px] uppercase tracking-[0.14em] text-muted-foreground">
        {eyebrow}
      </div>

      <div className="mt-1 text-[10px] font-semibold text-foreground">
        {title}
      </div>

      <div className="mt-1 truncate text-[8px] text-muted-foreground">
        {description}
      </div>
    </div>
  );
}

/* ========================================================= */
/* FLOW ARROW                                                */
/* ========================================================= */

function FlowArrow() {
  return (
    <>
      {/* Mobile */}
      <div className="flex h-5 justify-center sm:hidden">
        <div className="h-full w-px bg-gradient-to-b from-border via-emerald-500/40 to-border" />
      </div>

      {/* Desktop */}
      <div className="relative hidden w-8 sm:block lg:w-12">
        <div className="h-px w-full bg-border">
          <div className="h-px w-1/2 bg-gradient-to-r from-emerald-500/50 to-transparent" />
        </div>

        <ArrowRight className="absolute -right-0.5 top-1/2 h-3 w-3 -translate-y-1/2 text-emerald-500/40" />
      </div>
    </>
  );
}

/* ========================================================= */
/* HEALTH METRIC                                             */
/* ========================================================= */

function HealthMetric({
  label,
  value,
  icon: Icon,
  healthy = false,
}: {
  label: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  healthy?: boolean;
}) {
  return (
    <div className="min-w-0 bg-background p-3 sm:p-4">
      <div className="flex items-center justify-between gap-2">
        <span className="font-mono text-[6px] tracking-[0.12em] text-muted-foreground sm:text-[7px]">
          {label}
        </span>

        <Icon
          className={`h-3 w-3 ${
            healthy
              ? "text-emerald-500"
              : "text-muted-foreground"
          }`}
        />
      </div>

      <div
        className={`
          mt-3 truncate
          font-display text-base font-semibold
          tabular-nums sm:text-lg
          ${
            healthy
              ? "text-emerald-600 dark:text-emerald-400"
              : "text-foreground"
          }
        `}
      >
        {value}
      </div>
    </div>
  );
}

/* ========================================================= */
/* POLICY STEP                                               */
/* ========================================================= */

function PolicyStep({
  number,
  icon: Icon,
  title,
  text,
  state,
}: {
  number: string;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  text: string;
  state: "complete" | "watch" | "ready";
}) {
  const stateStyles = {
    complete:
      "border-emerald-500/20 bg-emerald-500/[0.04] text-emerald-500",
    watch:
      "border-amber-500/20 bg-amber-500/[0.04] text-amber-500",
    ready:
      "border-primary/20 bg-primary/[0.04] text-primary",
  };

  return (
    <div className="grid grid-cols-[34px_minmax(0,1fr)] gap-3">
      <div
        className={`
          flex h-[34px] w-[34px]
          items-center justify-center
          border
          ${stateStyles[state]}
        `}
      >
        <Icon className="h-3.5 w-3.5" />
      </div>

      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-mono text-[6px] text-muted-foreground">
            {number}
          </span>

          <span className="text-[9px] font-semibold text-foreground">
            {title}
          </span>
        </div>

        <p className="mt-1 text-[8px] leading-4 text-muted-foreground">
          {text}
        </p>
      </div>
    </div>
  );
}

/* ========================================================= */
/* POLICY CONNECTOR                                          */
/* ========================================================= */

function PolicyConnector() {
  return (
    <div className="ml-[16px] h-5 border-l border-dashed border-border" />
  );
}

/* ========================================================= */
/* PRINCIPLE                                                 */
/* ========================================================= */

function GuardianPrinciple({
  index,
  title,
  value,
}: {
  index: string;
  title: string;
  value: string;
}) {
  return (
    <div
      className="
        min-h-[88px]
        border-b border-r border-border/60
        p-3.5
        sm:min-h-[94px]
        sm:border-b-0 sm:p-4
        lg:px-5

        [&:nth-child(2n)]:border-r-0
        sm:[&:nth-child(2n)]:border-r
        sm:last:border-r-0
      "
    >
      <div className="font-mono text-[6px] text-muted-foreground">
        {index}
      </div>

      <div className="mt-3 font-mono text-[7px] tracking-[0.16em] text-emerald-600 dark:text-emerald-400">
        {title}
      </div>

      <div className="mt-1 text-[9px] font-medium text-foreground sm:text-[10px]">
        {value}
      </div>
    </div>
  );
}
"use client";

import * as React from "react";
import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  Globe2,
  MousePointer2,
  ScanLine,
  ShieldCheck,
  Smartphone,
  Target,
  Users,
  Zap,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { MARKETING_ANALYTICS_PREVIEW } from "@/data/marketing/previews";

const activity = [28, 38, 31, 47, 42, 58, 53, 68, 61, 78, 72, 88, 82, 96];

export function AnalyticsPreview() {
  const { kpis, topDevices, topCountries } = MARKETING_ANALYTICS_PREVIEW;

  return (
    <section
      id="analytics"
      className="
        relative isolate overflow-hidden
        border-b border-border/60
        bg-background
        py-20 sm:py-24 lg:py-32
      "
    >
      {/* Ambient infrastructure background */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div
          className="
            absolute left-[-12rem] top-[12%]
            h-[28rem] w-[28rem] rounded-full
            bg-primary/[0.055] blur-[120px]
          "
        />

        <div
          className="
            absolute right-[-12rem] bottom-[5%]
            h-[30rem] w-[30rem] rounded-full
            bg-[#FFD900]/[0.035] blur-[130px]
          "
        />

        <div
          className="
            absolute inset-0 opacity-40
            [background-image:linear-gradient(to_right,hsl(var(--border)/.28)_1px,transparent_1px)]
            [background-size:72px_100%]
            [mask-image:linear-gradient(to_bottom,transparent,black_20%,black_80%,transparent)]
          "
        />
      </div>

      <div className="relative mx-auto max-w-[1380px] px-4 sm:px-6 lg:px-8 xl:px-10">
        {/* ================================================= */}
        {/* HEADER                                            */}
        {/* ================================================= */}

        <div
          className="
            mb-10 grid items-end gap-7
            sm:mb-12
            lg:mb-16 lg:grid-cols-[minmax(0,1fr)_minmax(300px,440px)]
          "
        >
          <div>
            <div
              className="
                inline-flex items-center gap-2
                text-[10px] font-semibold uppercase
                tracking-[0.18em] text-primary
                sm:text-[11px]
              "
            >
              <span className="flex h-6 w-6 items-center justify-center border border-primary/20 bg-primary/[0.05]">
                <BarChart3 className="h-3 w-3" />
              </span>

              NXTQR Analytics

              <span className="h-px w-8 bg-primary/25 sm:w-12" />
            </div>

            <h2
              className="
                mt-5 max-w-[820px]
                font-display font-medium
                tracking-[-0.04em] text-foreground
                text-[clamp(2.5rem,9vw,4rem)]
                leading-[0.98]
                lg:text-[clamp(4rem,5.5vw,5.8rem)]
              "
            >
              Every scan leaves
              <br />

              <span
                className="
                  bg-gradient-to-r
                  from-[#FA520F] via-[#FF8105] to-[#FFB83E]
                  bg-clip-text text-transparent
                "
              >
                a signal.
              </span>
            </h2>
          </div>

          <div className="lg:pb-1">
            <p className="max-w-[430px] text-sm leading-6 text-muted-foreground sm:text-base sm:leading-7">
              Turn anonymous scan activity into useful intelligence across
              time, devices, regions and conversions—without turning QR
              analytics into invasive identity tracking.
            </p>

            <Link
              href="/login"
              className="
                group mt-5 inline-flex items-center gap-2
                text-xs font-semibold text-foreground
                transition-colors hover:text-primary
                sm:text-sm
              "
            >
              Explore Analytics
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>

        {/* ================================================= */}
        {/* ANALYTICS OBSERVATORY                             */}
        {/* ================================================= */}

        <div
          className="
            relative overflow-hidden
            rounded-[20px]
            border border-border/70
            bg-card/80
            shadow-[0_35px_100px_rgba(31,31,31,0.08)]
            backdrop-blur-xl
            sm:rounded-[24px]
            lg:rounded-[28px]
          "
        >
          {/* Top command rail */}
          <div
            className="
              flex h-12 items-center justify-between
              border-b border-border/60
              px-3 sm:h-14 sm:px-5 lg:px-6
            "
          >
            <div className="flex min-w-0 items-center gap-2 sm:gap-3">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary text-white shadow-[0_5px_18px_rgba(250,82,15,.2)]">
                <ScanLine className="h-3.5 w-3.5" />
              </div>

              <div className="min-w-0">
                <div className="truncate text-[10px] font-semibold text-foreground sm:text-xs">
                  Scan Intelligence
                </div>

                <div className="hidden font-mono text-[8px] text-muted-foreground sm:block">
                  EVENT STREAM / MARKETING PREVIEW
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-4">
              <div className="hidden items-center gap-1.5 text-[9px] text-muted-foreground md:flex">
                <ShieldCheck className="h-3 w-3 text-primary" />
                Privacy-aware telemetry
              </div>

              <div
                className="
                  flex items-center gap-1.5
                  rounded-full border border-emerald-500/15
                  bg-emerald-500/[0.06]
                  px-2 py-1
                  text-[8px] font-medium text-emerald-600
                  dark:text-emerald-400
                  sm:text-[9px]
                "
              >
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute h-full w-full animate-ping rounded-full bg-emerald-500 opacity-40 motion-reduce:animate-none" />
                  <span className="relative h-1.5 w-1.5 rounded-full bg-emerald-500" />
                </span>

                LIVE SIGNAL
              </div>
            </div>
          </div>

          {/* ================================================= */}
          {/* TOP INTELLIGENCE AREA                             */}
          {/* ================================================= */}

          <div className="grid lg:grid-cols-[0.34fr_0.66fr]">
            {/* Primary number */}
            <div
              className="
                relative flex flex-col justify-between
                border-b border-border/60
                p-5 sm:p-7
                lg:min-h-[390px] lg:border-b-0 lg:border-r
                lg:p-8
              "
            >
              {/* QR decorative corner */}
              <div
                aria-hidden="true"
                className="absolute right-5 top-5 grid grid-cols-3 gap-1 opacity-30"
              >
                {Array.from({ length: 9 }).map((_, index) => (
                  <span
                    key={index}
                    className={`
                      h-1.5 w-1.5
                      ${
                        [0, 1, 2, 3, 5, 6, 7].includes(index)
                          ? "bg-primary"
                          : "bg-transparent"
                      }
                    `}
                  />
                ))}
              </div>

              <div>
                <div className="flex items-center gap-2 text-[9px] font-mono uppercase tracking-[0.16em] text-muted-foreground sm:text-[10px]">
                  <Zap className="h-3 w-3 text-primary" />
                  Total scan events
                </div>

                <div
                  className="
                    mt-5 font-display font-medium
                    tracking-[-0.05em] text-foreground
                    text-[clamp(3.5rem,16vw,5.6rem)]
                    leading-none
                    tabular-nums
                    lg:text-[5.8rem]
                  "
                >
                  {kpis.totalScans}
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
                  <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                    <Users className="h-3 w-3 text-[#FF9D00]" />
                    <span>
                      <strong className="font-semibold text-foreground">
                        {kpis.uniqueScans}
                      </strong>{" "}
                      estimated unique
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                    <Target className="h-3 w-3 text-primary" />
                    <span>
                      <strong className="font-semibold text-foreground">
                        {kpis.conversionRate}
                      </strong>{" "}
                      conversion
                    </span>
                  </div>
                </div>
              </div>

              {/* Signal path */}
              <div className="mt-10 lg:mt-0">
                <div className="mb-3 flex items-center justify-between">
                  <span className="font-mono text-[8px] uppercase tracking-[0.14em] text-muted-foreground">
                    Signal pipeline
                  </span>

                  <span className="text-[8px] text-muted-foreground">
                    asynchronous
                  </span>
                </div>

                <div className="relative flex items-center">
                  {["SCAN", "EDGE", "EVENT", "INSIGHT"].map((item, index) => (
                    <React.Fragment key={item}>
                      <div className="relative z-10 flex flex-col items-center gap-2">
                        <span
                          className={`
                            h-2.5 w-2.5 rounded-full border
                            ${
                              index === 3
                                ? "border-primary bg-primary shadow-[0_0_0_4px_rgba(250,82,15,.08)]"
                                : "border-primary/30 bg-background"
                            }
                          `}
                        />

                        <span className="font-mono text-[7px] text-muted-foreground sm:text-[8px]">
                          {item}
                        </span>
                      </div>

                      {index < 3 && (
                        <div className="relative -mt-5 h-px flex-1 bg-border">
                          <div className="absolute inset-y-0 left-0 w-1/2 bg-gradient-to-r from-primary/60 to-transparent" />
                        </div>
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            </div>

            {/* Activity intelligence */}
            <div className="relative p-5 sm:p-7 lg:p-8">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold text-foreground sm:text-sm">
                    Scan activity
                  </p>

                  <p className="mt-1 text-[9px] text-muted-foreground sm:text-[10px]">
                    How scan signals move across the selected period
                  </p>
                </div>

                <div className="text-right">
                  <div className="font-mono text-[8px] uppercase tracking-[0.12em] text-muted-foreground">
                    Edge latency
                  </div>

                  <div className="mt-1 text-xs font-semibold tabular-nums text-foreground sm:text-sm">
                    {kpis.avgRedirectLatency}
                  </div>
                </div>
              </div>

              {/* Original signal graph */}
              <div className="relative mt-8 h-[205px] sm:h-[250px] lg:h-[270px]">
                {/* horizontal guides */}
                <div className="absolute inset-0 flex flex-col justify-between">
                  {[0, 1, 2, 3].map((line) => (
                    <div
                      key={line}
                      className="w-full border-t border-dashed border-border/55"
                    />
                  ))}
                </div>

                {/* Vertical bars */}
                <div className="absolute inset-x-0 bottom-0 top-3 flex items-end gap-[3px] sm:gap-1.5">
                  {activity.map((value, index) => (
                    <div
                      key={index}
                      className="group relative flex h-full flex-1 items-end"
                    >
                      <div
                        style={{ height: `${value}%` }}
                        className="
                          relative w-full overflow-hidden
                          rounded-t-[2px]
                          bg-foreground/[0.065]
                          transition-colors duration-300
                          group-hover:bg-primary/15
                        "
                      >
                        <div
                          className="
                            absolute inset-x-0 bottom-0
                            h-[35%]
                            bg-gradient-to-t
                            from-primary/45 to-primary/[0.04]
                          "
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Main SVG signal line */}
                <svg
                  aria-hidden="true"
                  viewBox="0 0 700 250"
                  preserveAspectRatio="none"
                  className="pointer-events-none absolute inset-0 h-full w-full overflow-visible"
                >
                  <defs>
                    <linearGradient
                      id="analyticsSignal"
                      x1="0"
                      x2="1"
                      y1="0"
                      y2="0"
                    >
                      <stop offset="0%" stopColor="#FA520F" />
                      <stop offset="55%" stopColor="#FF8105" />
                      <stop offset="100%" stopColor="#FFD06A" />
                    </linearGradient>

                    <linearGradient
                      id="analyticsArea"
                      x1="0"
                      x2="0"
                      y1="0"
                      y2="1"
                    >
                      <stop offset="0%" stopColor="#FA520F" stopOpacity=".15" />
                      <stop offset="100%" stopColor="#FA520F" stopOpacity="0" />
                    </linearGradient>
                  </defs>

                  <path
                    d="
                      M0 206
                      C42 202 58 184 95 187
                      C130 190 145 165 185 170
                      C226 174 239 142 280 148
                      C321 154 340 119 382 128
                      C421 136 442 93 484 105
                      C524 116 548 76 586 87
                      C625 98 649 54 700 61
                      L700 250
                      L0 250
                      Z
                    "
                    fill="url(#analyticsArea)"
                  />

                  <path
                    d="
                      M0 206
                      C42 202 58 184 95 187
                      C130 190 145 165 185 170
                      C226 174 239 142 280 148
                      C321 154 340 119 382 128
                      C421 136 442 93 484 105
                      C524 116 548 76 586 87
                      C625 98 649 54 700 61
                    "
                    fill="none"
                    stroke="url(#analyticsSignal)"
                    strokeWidth="2"
                    vectorEffect="non-scaling-stroke"
                    strokeLinecap="round"
                  />

                  <circle cx="700" cy="61" r="4" fill="#FA520F" />
                  <circle
                    cx="700"
                    cy="61"
                    r="9"
                    fill="none"
                    stroke="#FA520F"
                    strokeOpacity=".18"
                  />
                </svg>
              </div>

              <div className="mt-3 flex justify-between font-mono text-[7px] text-muted-foreground sm:text-[8px]">
                <span>00:00</span>
                <span>06:00</span>
                <span>12:00</span>
                <span>18:00</span>
                <span>24:00</span>
              </div>
            </div>
          </div>

          {/* ================================================= */}
          {/* SIGNAL BREAKDOWN                                  */}
          {/* ================================================= */}

          <div
            className="
              grid border-t border-border/60
              md:grid-cols-2
              xl:grid-cols-[0.9fr_1.1fr_0.75fr]
            "
          >
            {/* Device constellation */}
            <div
              className="
                border-b border-border/60
                p-5 sm:p-6
                md:border-b-0 md:border-r
              "
            >
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <Smartphone className="h-3.5 w-3.5 text-primary" />

                    <span className="text-[11px] font-semibold text-foreground">
                      Device constellation
                    </span>
                  </div>

                  <p className="mt-1 text-[8px] text-muted-foreground">
                    Distribution of resolved scans
                  </p>
                </div>

                <span className="font-mono text-[7px] uppercase tracking-wider text-muted-foreground">
                  SHARE
                </span>
              </div>

              <div className="space-y-4">
                {topDevices.map((device, index) => (
                  <div key={device.name}>
                    <div className="mb-1.5 flex items-center justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-2">
                        <span
                          className="h-1.5 w-1.5 shrink-0 rounded-full"
                          style={{ backgroundColor: device.color }}
                        />

                        <span className="truncate text-[10px] font-medium text-foreground">
                          {device.name}
                        </span>
                      </div>

                      <span className="font-mono text-[9px] font-semibold tabular-nums text-foreground">
                        {device.share}
                      </span>
                    </div>

                    <div className="relative h-[3px] overflow-hidden bg-muted">
                      <div
                        style={{
                          width: device.share,
                          backgroundColor: device.color,
                        }}
                        className="absolute inset-y-0 left-0"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Geographic signal */}
            <div
              className="
                border-b border-border/60
                p-5 sm:p-6
                md:border-b-0
                xl:border-r
              "
            >
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <Globe2 className="h-3.5 w-3.5 text-primary" />

                    <span className="text-[11px] font-semibold text-foreground">
                      Geographic signal
                    </span>
                  </div>

                  <p className="mt-1 text-[8px] text-muted-foreground">
                    Coarse regional distribution
                  </p>
                </div>

                <span className="font-mono text-[7px] uppercase tracking-wider text-muted-foreground">
                  REGION
                </span>
              </div>

              <div className="space-y-1">
                {topCountries.slice(0, 4).map((country, index) => (
                  <div
                    key={country.code}
                    className="
                      group grid grid-cols-[26px_minmax(0,1fr)_auto]
                      items-center gap-2.5
                      border-b border-border/45
                      py-2.5
                      last:border-0
                    "
                  >
                    <span className="font-mono text-[8px] text-muted-foreground">
                      {String(index + 1).padStart(2, "0")}
                    </span>

                    <div className="flex min-w-0 items-center gap-2">
                      <span
                        className="
                          flex h-6 min-w-7 items-center justify-center
                          border border-border/70
                          bg-muted/40 px-1
                          font-mono text-[7px] font-bold
                          text-muted-foreground
                        "
                      >
                        {country.code}
                      </span>

                      <span className="truncate text-[9px] font-medium text-foreground sm:text-[10px]">
                        {country.name}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="hidden text-[8px] tabular-nums text-muted-foreground sm:block">
                        {country.scans}
                      </span>

                      <span className="min-w-8 text-right font-mono text-[9px] font-semibold tabular-nums text-primary">
                        {country.pct}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Conversion signal */}
            <div
              className="
                relative overflow-hidden
                p-5 sm:p-6
                md:col-span-2 md:border-t md:border-border/60
                xl:col-span-1 xl:border-t-0
              "
            >
              <div
                aria-hidden="true"
                className="
                  absolute -bottom-14 -right-14
                  h-36 w-36 rounded-full
                  border-[22px] border-primary/[0.035]
                "
              />

              <div className="relative">
                <div className="flex items-center gap-2">
                  <Target className="h-3.5 w-3.5 text-primary" />

                  <span className="text-[11px] font-semibold text-foreground">
                    Conversion signal
                  </span>
                </div>

                <div className="mt-7 flex items-end gap-2">
                  <span
                    className="
                      font-display text-4xl font-medium
                      tracking-[-0.04em] text-foreground
                      tabular-nums
                      sm:text-5xl
                    "
                  >
                    {kpis.conversionRate}
                  </span>

                  <span className="mb-1 text-[8px] uppercase tracking-wider text-muted-foreground">
                    goal rate
                  </span>
                </div>

                <div className="mt-5">
                  <div className="relative h-1 overflow-hidden bg-muted">
                    <div
                      className="
                        absolute inset-y-0 left-0 w-[68%]
                        bg-gradient-to-r
                        from-primary via-[#FF8105] to-[#FFD06A]
                      "
                    />
                  </div>

                  <div className="mt-2 flex justify-between font-mono text-[7px] text-muted-foreground">
                    <span>SCAN</span>
                    <span>GOAL</span>
                  </div>
                </div>

                <div className="mt-6 flex items-center gap-2 text-[8px] leading-4 text-muted-foreground">
                  <MousePointer2 className="h-3 w-3 shrink-0 text-primary" />
                  Connect downstream events to understand what scans become.
                </div>
              </div>
            </div>
          </div>

          {/* ================================================= */}
          {/* FOOTER                                            */}
          {/* ================================================= */}

          <div
            className="
              flex flex-col gap-4
              border-t border-border/60
              bg-muted/[0.14]
              px-4 py-4
              sm:flex-row sm:items-center sm:justify-between
              sm:px-6
            "
          >
            <div className="flex max-w-[700px] items-start gap-2.5">
              <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />

              <p className="text-[9px] leading-4 text-muted-foreground sm:text-[10px]">
                Designed around coarse analytics, estimated uniqueness and
                configurable retention instead of unnecessary person-level
                tracking.
              </p>
            </div>

            <Button
              asChild
              size="sm"
              variant="outline"
              className="
                group h-9 w-full rounded-lg
                border-border/80 bg-background
                text-[10px] font-semibold
                sm:w-auto
              "
            >
              <Link href="/login">
                Open Analytics
                <ArrowRight className="ml-1 h-3 w-3 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </Button>
          </div>
        </div>

        {/* Marketing preview disclosure */}
        <p className="mx-auto mt-4 max-w-2xl text-center text-[8px] leading-4 text-muted-foreground/70 sm:text-[9px]">
          Interface shown for product illustration. Preview values are not
          customer analytics.
        </p>
      </div>
    </section>
  );
}
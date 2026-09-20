"use client";

import * as React from "react";
import Link from "next/link";
import {
  ArrowRight,
  CalendarClock,
  Check,
  CirclePause,
  Clock3,
  ExternalLink,
  Fingerprint,
  Package,
  QrCode,
  Radio,
  RefreshCw,
  Route,
  ScanLine,
  Sparkles,
} from "lucide-react";

import { Button } from "@/components/ui/button";

const destinations = [
  {
    stage: "01",
    label: "PRE-LAUNCH",
    title: "Summer preview",
    url: "brand.com/summer-preview",
    description: "Build anticipation before the campaign goes live.",
    icon: Sparkles,
  },
  {
    stage: "02",
    label: "LIVE",
    title: "Product collection",
    url: "brand.com/collection/drop-live",
    description: "Redirect the same printed QR when the launch begins.",
    icon: Radio,
  },
  {
    stage: "03",
    label: "AFTER",
    title: "Rewards experience",
    url: "brand.com/rewards",
    description: "Keep the physical asset useful after the campaign ends.",
    icon: Package,
  },
];

export function DynamicQrSection() {
  const [destinationIndex, setDestinationIndex] = React.useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = React.useState(true);

  React.useEffect(() => {
    if (!isAutoPlaying) return;

    const timer = window.setInterval(() => {
      setDestinationIndex((current) => (current + 1) % destinations.length);
    }, 4200);

    return () => window.clearInterval(timer);
  }, [isAutoPlaying]);

  const current = destinations[destinationIndex];
  const CurrentIcon = current.icon;

  const selectDestination = (index: number) => {
    setDestinationIndex(index);
    setIsAutoPlaying(false);
  };

  return (
    <section
      id="dynamic-qr"
      className="
        relative isolate overflow-hidden
        border-b border-border/60
        bg-background
        py-20 sm:py-24 lg:py-32
      "
    >
      {/* ================================================= */}
      {/* BACKGROUND                                        */}
      {/* ================================================= */}

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
      >
        <div
          className="
            absolute right-[-16rem] top-[8%]
            h-[36rem] w-[36rem]
            rounded-full bg-primary/[0.055]
            blur-[140px]
          "
        />

        <div
          className="
            absolute left-[-14rem] bottom-[5%]
            h-[30rem] w-[30rem]
            rounded-full bg-[#FFD900]/[0.025]
            blur-[130px]
          "
        />

        <div
          className="
            absolute inset-0 opacity-[0.32]
            [background-image:linear-gradient(to_right,hsl(var(--border)/.28)_1px,transparent_1px)]
            [background-size:72px_100%]
            [mask-image:linear-gradient(to_bottom,transparent,black_15%,black_85%,transparent)]
          "
        />
      </div>

      <div className="relative mx-auto max-w-[1380px] px-4 sm:px-6 lg:px-8 xl:px-10">
        {/* ================================================= */}
        {/* EDITORIAL HEADER                                  */}
        {/* ================================================= */}

        <div
          className="
            mb-10 grid gap-7
            sm:mb-14
            lg:mb-16
            lg:grid-cols-[minmax(0,1fr)_420px]
            lg:items-end
          "
        >
          <div>
            <div
              className="
                inline-flex items-center gap-2
                font-mono text-[10px] font-semibold
                uppercase tracking-[0.18em]
                text-primary sm:text-[11px]
              "
            >
              <span
                className="
                  flex h-6 w-6 items-center justify-center
                  border border-primary/20
                  bg-primary/[0.05]
                "
              >
                <RefreshCw className="h-3 w-3" />
              </span>

              Dynamic QR Infrastructure

              <span className="h-px w-8 bg-primary/30 sm:w-12" />
            </div>

            <h2
              className="
                mt-5 max-w-[850px]
                font-display font-medium
                tracking-[-0.045em]
                text-foreground
                text-[clamp(2.7rem,10vw,4.5rem)]
                leading-[0.95]
                sm:text-[clamp(4rem,8vw,5.8rem)]
                lg:text-[clamp(5rem,6vw,6.4rem)]
              "
            >
              Print the identity.
              <br />

              <span
                className="
                  bg-gradient-to-r
                  from-[#FA520F]
                  via-[#FF8105]
                  to-[#FFB83E]
                  bg-clip-text text-transparent
                "
              >
                Change the future.
              </span>
            </h2>
          </div>

          <div className="lg:pb-1">
            <p className="max-w-[430px] text-sm leading-6 text-muted-foreground sm:text-base sm:leading-7">
              A dynamic QR keeps its printed identity while the destination
              behind it can evolve. Update campaigns, schedule experiences or
              pause access without replacing the physical QR.
            </p>

            <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2">
              {[
                "Persistent QR identity",
                "Editable destination",
                "Lifecycle controls",
              ].map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-1.5 text-[10px] text-muted-foreground"
                >
                  <Check className="h-3 w-3 text-primary" />
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ================================================= */}
        {/* LIFECYCLE MACHINE                                 */}
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
          {/* System rail */}
          <div
            className="
              flex h-12 items-center justify-between
              border-b border-border/60
              px-3 sm:h-14 sm:px-5 lg:px-6
            "
          >
            <div className="flex min-w-0 items-center gap-2.5">
              <div
                className="
                  flex h-7 w-7 shrink-0 items-center justify-center
                  rounded-lg
                  bg-gradient-to-br
                  from-[#FA520F] to-[#FFA110]
                  text-white
                  shadow-[0_6px_20px_rgba(250,82,15,.2)]
                "
              >
                <Fingerprint className="h-3.5 w-3.5" />
              </div>

              <div className="min-w-0">
                <div className="truncate text-[10px] font-semibold text-foreground sm:text-xs">
                  Persistent QR Identity
                </div>

                <div className="hidden font-mono text-[8px] text-muted-foreground sm:block">
                  IDENTITY FIXED / DESTINATION MUTABLE
                </div>
              </div>
            </div>

            <div
              className="
                flex items-center gap-1.5
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
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              ACTIVE
            </div>
          </div>

          {/* Main */}
          <div
            className="
              grid
              lg:grid-cols-[0.34fr_0.66fr]
            "
          >
            {/* ============================================= */}
            {/* PERMANENT SIDE                                */}
            {/* ============================================= */}

            <div
              className="
                relative overflow-hidden
                border-b border-border/60
                p-5 sm:p-7
                lg:min-h-[500px]
                lg:border-b-0 lg:border-r
                lg:p-8
              "
            >
              {/* Decorative QR module field */}
              <div
                aria-hidden="true"
                className="
                  absolute -right-8 -top-8
                  grid grid-cols-7 gap-1.5
                  opacity-[0.07]
                "
              >
                {Array.from({ length: 49 }).map((_, i) => (
                  <span
                    key={i}
                    className={`
                      h-3 w-3
                      ${
                        [
                          0, 1, 2, 3, 4, 5, 6, 7, 13, 14, 16, 17, 18, 20,
                          21, 23, 25, 27, 28, 30, 31, 32, 34, 35, 41, 42,
                          43, 44, 45, 46, 47, 48,
                        ].includes(i)
                          ? "bg-foreground"
                          : ""
                      }
                    `}
                  />
                ))}
              </div>

              <div className="relative flex h-full flex-col justify-between">
                <div>
                  <div
                    className="
                      flex items-center gap-2
                      font-mono text-[8px]
                      uppercase tracking-[0.16em]
                      text-muted-foreground
                    "
                  >
                    <QrCode className="h-3 w-3 text-primary" />
                    Physical layer
                  </div>

                  <h3
                    className="
                      mt-5 max-w-[260px]
                      font-display text-2xl font-medium
                      tracking-[-0.03em]
                      text-foreground
                      sm:text-3xl
                    "
                  >
                    One printed QR.
                  </h3>

                  <p className="mt-3 max-w-[300px] text-[10px] leading-5 text-muted-foreground sm:text-[11px]">
                    Packaging, signage, menus and print materials keep the
                    same QR while NXTQR manages what happens after the scan.
                  </p>
                </div>

                {/* QR representation */}
                <div className="my-8 flex justify-center lg:my-6">
                  <div className="relative">
                    <div
                      className="
                        relative flex h-[150px] w-[150px]
                        items-center justify-center
                        bg-[#FFFAEB]
                        shadow-[0_20px_60px_rgba(31,31,31,.08)]
                        sm:h-[175px] sm:w-[175px]
                      "
                    >
                      {/* finder corners */}
                      <FinderCorner className="left-4 top-4" />
                      <FinderCorner className="right-4 top-4 rotate-90" />
                      <FinderCorner className="bottom-4 left-4 -rotate-90" />

                      {/* Center intelligence mark */}
                      <div
                        className="
                          flex h-12 w-12 items-center justify-center
                          rounded-[14px]
                          bg-gradient-to-br
                          from-[#FA520F]
                          via-[#FF8105]
                          to-[#FFD06A]
                          text-white
                          shadow-[0_7px_22px_rgba(250,82,15,.22)]
                        "
                      >
                        <Route className="h-5 w-5" />
                      </div>

                      {/* Decorative QR modules */}
                      <span className="absolute bottom-5 right-5 h-2 w-2 bg-[#1F1F1F]" />
                      <span className="absolute bottom-5 right-9 h-2 w-4 bg-[#1F1F1F]" />
                      <span className="absolute bottom-9 right-5 h-4 w-2 bg-[#1F1F1F]" />
                      <span className="absolute bottom-12 right-10 h-2 w-2 bg-[#1F1F1F]" />
                      <span className="absolute bottom-8 right-14 h-2 w-3 bg-[#1F1F1F]" />
                    </div>

                    <span
                      className="
                        absolute -bottom-3 left-1/2
                        -translate-x-1/2
                        whitespace-nowrap
                        border border-border
                        bg-background px-2 py-1
                        font-mono text-[7px]
                        text-muted-foreground
                      "
                    >
                      ID / QR-01
                    </span>
                  </div>
                </div>

                <div
                  className="
                    flex items-center justify-between
                    border-t border-border/60
                    pt-4
                  "
                >
                  <div>
                    <div className="font-mono text-[7px] uppercase tracking-wider text-muted-foreground">
                      Identity
                    </div>

                    <div className="mt-1 text-[9px] font-semibold text-foreground">
                      Remains unchanged
                    </div>
                  </div>

                  <span
                    className="
                      border border-primary/15
                      bg-primary/[0.05]
                      px-2 py-1
                      font-mono text-[7px]
                      text-primary
                    "
                  >
                    PERMANENT
                  </span>
                </div>
              </div>
            </div>

            {/* ============================================= */}
            {/* MUTABLE DESTINATION SIDE                      */}
            {/* ============================================= */}

            <div className="relative p-5 sm:p-7 lg:p-8">
              {/* heading */}
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div
                    className="
                      flex items-center gap-2
                      font-mono text-[8px]
                      uppercase tracking-[0.16em]
                      text-muted-foreground
                    "
                  >
                    <RefreshCw
                      className={`
                        h-3 w-3 text-primary
                        ${
                          isAutoPlaying
                            ? "motion-safe:animate-[spin_8s_linear_infinite]"
                            : ""
                        }
                      `}
                    />
                    Digital layer
                  </div>

                  <h3 className="mt-3 text-sm font-semibold text-foreground sm:text-base">
                    Destination lifecycle
                  </h3>
                </div>

                <button
                  type="button"
                  onClick={() => setIsAutoPlaying((value) => !value)}
                  aria-label={
                    isAutoPlaying
                      ? "Pause destination preview"
                      : "Play destination preview"
                  }
                  className="
                    flex h-8 items-center gap-1.5
                    border border-border/70
                    bg-background px-2.5
                    font-mono text-[7px]
                    text-muted-foreground
                    transition-colors hover:text-foreground
                  "
                >
                  {isAutoPlaying ? (
                    <>
                      <CirclePause className="h-3 w-3" />
                      PAUSE
                    </>
                  ) : (
                    <>
                      <RefreshCw className="h-3 w-3" />
                      PLAY
                    </>
                  )}
                </button>
              </div>

              {/* =========================================== */}
              {/* TIMELINE                                    */}
              {/* =========================================== */}

              <div className="relative mt-8">
                {/* Desktop line */}
                <div
                  aria-hidden="true"
                  className="
                    absolute left-[8%] right-[8%] top-[17px]
                    hidden h-px bg-border sm:block
                  "
                >
                  <div
                    className="
                      absolute inset-y-0 left-0
                      bg-gradient-to-r
                      from-primary via-[#FF8105] to-[#FFD06A]
                      transition-[width] duration-700
                    "
                    style={{
                      width: `${(destinationIndex / (destinations.length - 1)) * 100}%`,
                    }}
                  />
                </div>

                <div className="grid grid-cols-3 gap-2 sm:gap-4">
                  {destinations.map((destination, index) => {
                    const Icon = destination.icon;
                    const active = destinationIndex === index;
                    const passed = index <= destinationIndex;

                    return (
                      <button
                        key={destination.label}
                        type="button"
                        onClick={() => selectDestination(index)}
                        className="
                          group relative z-10
                          min-w-0 text-left
                          focus-visible:outline-none
                          focus-visible:ring-2
                          focus-visible:ring-primary
                          focus-visible:ring-offset-2
                        "
                      >
                        <div
                          className={`
                            flex h-[34px] w-[34px]
                            items-center justify-center
                            border
                            transition-all duration-300
                            ${
                              active
                                ? "border-primary bg-primary text-white shadow-[0_7px_20px_rgba(250,82,15,.2)]"
                                : passed
                                  ? "border-primary/30 bg-background text-primary"
                                  : "border-border bg-background text-muted-foreground"
                            }
                          `}
                        >
                          <Icon className="h-3.5 w-3.5" />
                        </div>

                        <div className="mt-3 font-mono text-[6px] text-muted-foreground sm:text-[7px]">
                          STAGE {destination.stage}
                        </div>

                        <div
                          className={`
                            mt-1 truncate text-[8px] font-semibold
                            transition-colors
                            sm:text-[10px]
                            ${
                              active
                                ? "text-primary"
                                : "text-foreground"
                            }
                          `}
                        >
                          {destination.label}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* =========================================== */}
              {/* CURRENT DESTINATION                         */}
              {/* =========================================== */}

              <div
                key={destinationIndex}
                className="
                  relative mt-8 overflow-hidden
                  border border-primary/20
                  bg-primary/[0.035]
                  p-4
                  motion-safe:animate-in
                  motion-safe:fade-in
                  motion-safe:slide-in-from-bottom-2
                  motion-safe:duration-500
                  sm:p-5
                "
              >
                <div
                  aria-hidden="true"
                  className="
                    absolute right-[-3rem] top-[-3rem]
                    h-28 w-28 rounded-full
                    border-[18px] border-primary/[0.035]
                  "
                />

                <div className="relative">
                  <div className="flex items-center justify-between gap-3">
                    <div
                      className="
                        flex items-center gap-1.5
                        font-mono text-[7px]
                        uppercase tracking-[0.14em]
                        text-primary
                      "
                    >
                      <span className="relative flex h-1.5 w-1.5">
                        <span className="absolute h-full w-full animate-ping rounded-full bg-primary opacity-30 motion-reduce:animate-none" />
                        <span className="relative h-1.5 w-1.5 rounded-full bg-primary" />
                      </span>

                      Current destination
                    </div>

                    <span className="font-mono text-[7px] text-muted-foreground">
                      {current.stage} / 03
                    </span>
                  </div>

                  <div className="mt-5 flex items-start gap-3">
                    <div
                      className="
                        flex h-10 w-10 shrink-0
                        items-center justify-center
                        border border-primary/15
                        bg-background text-primary
                      "
                    >
                      <CurrentIcon className="h-4 w-4" />
                    </div>

                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-foreground sm:text-base">
                        {current.title}
                      </div>

                      <p className="mt-1 max-w-[470px] text-[9px] leading-4 text-muted-foreground sm:text-[10px]">
                        {current.description}
                      </p>
                    </div>
                  </div>

                  <div
                    className="
                      mt-5 flex min-w-0 items-center gap-2
                      border border-border/60
                      bg-background/80
                      px-3 py-2.5
                    "
                  >
                    <ExternalLink className="h-3 w-3 shrink-0 text-primary" />

                    <span className="min-w-0 truncate font-mono text-[8px] text-muted-foreground sm:text-[9px]">
                      https://{current.url}
                    </span>
                  </div>
                </div>
              </div>

              {/* =========================================== */}
              {/* RESOLUTION FLOW                              */}
              {/* =========================================== */}

              <div className="mt-7">
                <div className="mb-3 flex items-center justify-between">
                  <span className="font-mono text-[7px] uppercase tracking-[0.14em] text-muted-foreground">
                    Resolution flow
                  </span>

                  <span className="font-mono text-[7px] text-muted-foreground">
                    SAME QR / NEW TARGET
                  </span>
                </div>

                <div
                  className="
                    grid grid-cols-[1fr_auto_1fr_auto_1fr]
                    items-center gap-1
                  "
                >
                  <FlowNode
                    icon={ScanLine}
                    label="SCAN"
                    value="Physical"
                  />

                  <FlowConnector />

                  <FlowNode
                    icon={Fingerprint}
                    label="IDENTITY"
                    value="Persistent"
                    active
                  />

                  <FlowConnector />

                  <FlowNode
                    icon={Route}
                    label="TARGET"
                    value={current.label}
                  />
                </div>
              </div>

              {/* =========================================== */}
              {/* CAPABILITIES                                 */}
              {/* =========================================== */}

              <div
                className="
                  mt-7 grid grid-cols-3
                  gap-px overflow-hidden
                  border border-border/60
                  bg-border/60
                "
              >
                <Capability
                  icon={RefreshCw}
                  title="Update"
                  text="Change target"
                />

                <Capability
                  icon={CalendarClock}
                  title="Schedule"
                  text="Control timing"
                />

                <Capability
                  icon={Clock3}
                  title="Lifecycle"
                  text="Pause or expire"
                />
              </div>
            </div>
          </div>

          {/* =============================================== */}
          {/* BOTTOM PRINCIPLE                                */}
          {/* =============================================== */}

          <div
            className="
              grid border-t border-border/60
              bg-muted/[0.14]
              sm:grid-cols-[1fr_auto_1fr]
              sm:items-center
            "
          >
            <div className="p-4 sm:p-5 lg:px-7">
              <div className="font-mono text-[7px] uppercase tracking-[0.16em] text-muted-foreground">
                Physical asset
              </div>

              <div className="mt-1 text-[10px] font-semibold text-foreground sm:text-xs">
                QR identity remains stable.
              </div>
            </div>

            <div
              aria-hidden="true"
              className="
                hidden h-full w-px
                bg-border/60
                sm:block
              "
            />

            <div
              className="
                border-t border-border/60
                p-4
                sm:border-t-0 sm:p-5
                lg:px-7
              "
            >
              <div className="font-mono text-[7px] uppercase tracking-[0.16em] text-primary">
                Digital experience
              </div>

              <div className="mt-1 text-[10px] font-semibold text-foreground sm:text-xs">
                Destination remains adaptable.
              </div>
            </div>
          </div>
        </div>

        {/* ================================================= */}
        {/* CTA                                               */}
        {/* ================================================= */}

        <div
          className="
            mt-6 flex flex-col gap-4
            sm:flex-row sm:items-center sm:justify-between
          "
        >
          <p className="max-w-[620px] text-[10px] leading-5 text-muted-foreground sm:text-[11px]">
            Keep physical QR deployments useful as campaigns, products and
            destinations change over time.
          </p>

          <Button
            asChild
            className="
              group h-10 w-full rounded-lg
              bg-primary px-5
              text-[11px] font-semibold text-white
              shadow-[0_8px_28px_rgba(250,82,15,.15)]
              hover:bg-[#E9480B]
              sm:w-auto
            "
          >
            <Link href="/login">
              Create dynamic QR

              <ArrowRight className="ml-1 h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

/* ========================================================= */
/* SUPPORTING COMPONENTS                                     */
/* ========================================================= */

function FinderCorner({ className = "" }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={`absolute h-9 w-9 border-[5px] border-[#1F1F1F] ${className}`}
    >
      <span className="absolute left-1/2 top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 bg-[#1F1F1F]" />
    </span>
  );
}

function FlowNode({
  icon: Icon,
  label,
  value,
  active = false,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  active?: boolean;
}) {
  return (
    <div
      className={`
        min-w-0 border px-2 py-3 text-center
        ${
          active
            ? "border-primary/25 bg-primary/[0.045]"
            : "border-border/60 bg-background"
        }
      `}
    >
      <Icon
        className={`mx-auto h-3 w-3 ${
          active ? "text-primary" : "text-muted-foreground"
        }`}
      />

      <div className="mt-2 font-mono text-[6px] text-muted-foreground">
        {label}
      </div>

      <div
        className={`
          mt-0.5 truncate text-[7px] font-semibold
          sm:text-[8px]
          ${active ? "text-primary" : "text-foreground"}
        `}
      >
        {value}
      </div>
    </div>
  );
}

function FlowConnector() {
  return (
    <div className="relative w-4 sm:w-7">
      <div className="h-px w-full bg-border">
        <div className="h-px w-1/2 bg-gradient-to-r from-primary/70 to-transparent" />
      </div>

      <ArrowRight className="absolute right-[-2px] top-1/2 h-2.5 w-2.5 -translate-y-1/2 text-primary/40" />
    </div>
  );
}

function Capability({
  icon: Icon,
  title,
  text,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  text: string;
}) {
  return (
    <div className="bg-background p-3 sm:p-4">
      <Icon className="h-3.5 w-3.5 text-primary" />

      <div className="mt-3 text-[8px] font-semibold text-foreground sm:text-[9px]">
        {title}
      </div>

      <div className="mt-0.5 text-[7px] text-muted-foreground sm:text-[8px]">
        {text}
      </div>
    </div>
  );
}
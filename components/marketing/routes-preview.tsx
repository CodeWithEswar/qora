"use client";

import * as React from "react";
import Link from "next/link";
import {
  ArrowRight,
  Check,
  ChevronRight,
  Clock3,
  GitFork,
  Globe2,
  Languages,
  Laptop,
  MapPin,
  MonitorSmartphone,
  MousePointer2,
  Play,
  Radio,
  Route,
  Smartphone,
  Split,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { MARKETING_ROUTING_PREVIEW } from "@/data/marketing/previews";

const routeConditions = [
  {
    id: "device",
    number: "01",
    title: "Device",
    value: "iOS",
    icon: Smartphone,
  },
  {
    id: "region",
    number: "02",
    title: "Region",
    value: "IN",
    icon: MapPin,
  },
  {
    id: "language",
    number: "03",
    title: "Language",
    value: "EN",
    icon: Languages,
  },
  {
    id: "time",
    number: "04",
    title: "Time",
    value: "18:42",
    icon: Clock3,
  },
];

const destinations = [
  {
    id: "ios",
    eyebrow: "DEVICE / IOS",
    title: "iOS experience",
    destination: "brand.com/ios",
    icon: Smartphone,
  },
  {
    id: "android",
    eyebrow: "DEVICE / ANDROID",
    title: "Android experience",
    destination: "brand.com/android",
    icon: MonitorSmartphone,
  },
  {
    id: "default",
    eyebrow: "DEFAULT",
    title: "Web experience",
    destination: "brand.com",
    icon: Laptop,
  },
];

export function RoutesPreview() {
  const previewNodes = MARKETING_ROUTING_PREVIEW?.nodes ?? [];

  const [selectedRuleId, setSelectedRuleId] = React.useState(
    previewNodes[0]?.id ?? "device",
  );

  const [activeDestination, setActiveDestination] =
    React.useState("ios");

  const selectedRule =
    previewNodes.find(
      (node) => node.id === selectedRuleId,
    ) ?? previewNodes[0];

  return (
    <section
      id="routes"
      className="
        relative isolate overflow-hidden
        border-b border-border/60
        bg-background
        py-20 sm:py-24 lg:py-32
      "
    >
      {/* ================================================= */}
      {/* BACKGROUND                                       */}
      {/* ================================================= */}

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
      >
        <div
          className="
            absolute right-[-12rem] top-[12%]
            h-[34rem] w-[34rem]
            rounded-full bg-primary/[0.045]
            blur-[140px]
          "
        />

        <div
          className="
            absolute bottom-[2%] left-[-12rem]
            h-[30rem] w-[30rem]
            rounded-full bg-[#FFD06A]/[0.035]
            blur-[130px]
          "
        />

        <div
          className="
            absolute inset-0 opacity-[0.2]
            [background-image:linear-gradient(to_right,hsl(var(--border)/.3)_1px,transparent_1px)]
            [background-size:72px_100%]
            [mask-image:linear-gradient(to_bottom,transparent,black_12%,black_88%,transparent)]
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
            lg:grid-cols-[minmax(0,1fr)_430px]
            lg:items-end
          "
        >
          <div>
            <div
              className="
                inline-flex items-center gap-2
                font-mono text-[9px] font-semibold
                uppercase tracking-[0.18em]
                text-primary
                sm:text-[10px]
              "
            >
              <span
                className="
                  flex h-6 w-6 items-center justify-center
                  border border-primary/20
                  bg-primary/[0.06]
                "
              >
                <GitFork className="h-3 w-3" />
              </span>

              NXTQR Routes

              <span className="h-px w-8 bg-primary/30 sm:w-12" />
            </div>

            <h2
              className="
                mt-5 max-w-[920px]
                font-display font-medium
                tracking-[-0.05em]
                text-foreground
                text-[clamp(2.8rem,10vw,4.6rem)]
                leading-[0.94]
                sm:text-[clamp(4rem,7.5vw,5.8rem)]
                lg:text-[clamp(5rem,6vw,6.5rem)]
              "
            >
              One scan enters.
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
                The right path leaves.
              </span>
            </h2>
          </div>

          <div className="lg:pb-1">
            <p className="max-w-[430px] text-sm leading-6 text-muted-foreground sm:text-base sm:leading-7">
              Build conditional journeys behind a single QR identity.
              NXTQR Routes can evaluate configured scan context and select
              the destination that matches your routing policy.
            </p>

            <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2">
              {[
                "Device",
                "Region",
                "Language",
                "Time",
              ].map((item) => (
                <div
                  key={item}
                  className="
                    flex items-center gap-1.5
                    text-[9px] text-muted-foreground
                  "
                >
                  <Check className="h-3 w-3 text-primary" />
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ================================================= */}
        {/* ROUTING MACHINE                                   */}
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
          {/* top rail */}

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
              <span
                className="
                  flex h-7 w-7 shrink-0
                  items-center justify-center
                  rounded-lg
                  bg-primary/[0.07]
                  text-primary
                "
              >
                <Route className="h-3.5 w-3.5" />
              </span>

              <div className="min-w-0">
                <div className="truncate text-[10px] font-semibold text-foreground sm:text-xs">
                  Route Decision Canvas
                </div>

                <div className="hidden font-mono text-[7px] text-muted-foreground sm:block">
                  SCAN / CONTEXT / POLICY / DESTINATION
                </div>
              </div>
            </div>

            <div
              className="
                flex items-center gap-1.5
                font-mono text-[7px]
                uppercase tracking-[0.12em]
                text-primary
              "
            >
              <span className="relative flex h-1.5 w-1.5">
                <span
                  className="
                    absolute h-full w-full
                    animate-ping rounded-full
                    bg-primary opacity-30
                    motion-reduce:animate-none
                  "
                />

                <span className="relative h-1.5 w-1.5 rounded-full bg-primary" />
              </span>

              Preview
            </div>
          </div>

          {/* ================================================= */}
          {/* SCAN CONTEXT                                     */}
          {/* ================================================= */}

          <div
            className="
              border-b border-border/60
              px-4 py-4
              sm:px-6 sm:py-5
              lg:px-8
            "
          >
            <div
              className="
                flex flex-col gap-4
                lg:flex-row
                lg:items-center
                lg:justify-between
              "
            >
              <div className="flex items-center gap-3">
                <div
                  className="
                    relative flex h-10 w-10
                    items-center justify-center
                    bg-foreground text-background
                  "
                >
                  <Radio className="h-4 w-4" />

                  <span
                    className="
                      absolute -right-1 -top-1
                      h-2.5 w-2.5 rounded-full
                      border-2 border-card
                      bg-primary
                    "
                  />
                </div>

                <div>
                  <div
                    className="
                      font-mono text-[7px]
                      uppercase tracking-[0.14em]
                      text-primary
                    "
                  >
                    Incoming scan
                  </div>

                  <div className="mt-1 text-[10px] font-semibold text-foreground">
                    Context captured for route evaluation
                  </div>
                </div>
              </div>

              <div
                className="
                  grid grid-cols-2 gap-px
                  overflow-hidden
                  border border-border/60
                  bg-border/60
                  sm:grid-cols-4
                  lg:min-w-[500px]
                "
              >
                {routeConditions.map((condition) => {
                  const Icon = condition.icon;

                  return (
                    <div
                      key={condition.id}
                      className="bg-background px-3 py-2.5"
                    >
                      <div className="flex items-center justify-between">
                        <span
                          className="
                            font-mono text-[6px]
                            uppercase tracking-[0.12em]
                            text-muted-foreground
                          "
                        >
                          {condition.title}
                        </span>

                        <Icon className="h-2.5 w-2.5 text-primary" />
                      </div>

                      <div
                        className="
                          mt-1.5 font-mono
                          text-[8px] font-semibold
                          text-foreground
                        "
                      >
                        {condition.value}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* ================================================= */}
          {/* MAIN DECISION WORKSPACE                          */}
          {/* ================================================= */}

          <div
            className="
              grid
              lg:grid-cols-[0.34fr_0.66fr]
            "
          >
            {/* =============================================== */}
            {/* RULE INDEX                                      */}
            {/* =============================================== */}

            <div
              className="
                border-b border-border/60
                p-4
                sm:p-6
                lg:border-b-0
                lg:border-r
                lg:p-7
              "
            >
              <div className="flex items-center justify-between">
                <div>
                  <div
                    className="
                      font-mono text-[7px]
                      uppercase tracking-[0.16em]
                      text-muted-foreground
                    "
                  >
                    Decision policy
                  </div>

                  <div className="mt-1 text-[10px] font-semibold text-foreground">
                    Evaluate in order
                  </div>
                </div>

                <Split className="h-3.5 w-3.5 text-primary" />
              </div>

              {/* rules */}

              <div className="relative mt-6">
                <div
                  aria-hidden="true"
                  className="
                    absolute bottom-5 left-[17px]
                    top-5 w-px
                    bg-border
                  "
                />

                <div className="relative space-y-2">
                  {previewNodes.map((node, index) => {
                    const selected =
                      node.id === selectedRuleId;

                    return (
                      <button
                        key={node.id}
                        type="button"
                        onClick={() =>
                          setSelectedRuleId(node.id)
                        }
                        className={`
                          group relative z-10
                          grid w-full
                          grid-cols-[34px_minmax(0,1fr)_18px]
                          items-center gap-3
                          border p-2.5
                          text-left
                          transition-all duration-200
                          ${
                            selected
                              ? "border-primary/30 bg-primary/[0.055]"
                              : "border-border/60 bg-background hover:border-primary/15 hover:bg-muted/25"
                          }
                        `}
                      >
                        <span
                          className={`
                            flex h-[34px] w-[34px]
                            items-center justify-center
                            border
                            font-mono text-[7px]
                            ${
                              selected
                                ? "border-primary/25 bg-primary text-white"
                                : "border-border bg-card text-muted-foreground"
                            }
                          `}
                        >
                          {String(index + 1).padStart(
                            2,
                            "0",
                          )}
                        </span>

                        <span className="min-w-0">
                          <span
                            className={`
                              block truncate
                              font-mono text-[8px]
                              font-semibold
                              ${
                                selected
                                  ? "text-primary"
                                  : "text-foreground"
                              }
                            `}
                          >
                            {node.condition}
                          </span>

                          <span
                            className="
                              mt-1 block truncate
                              text-[7px]
                              text-muted-foreground
                            "
                          >
                            {node.destination}
                          </span>
                        </span>

                        <ChevronRight
                          className={`
                            h-3 w-3
                            transition-transform
                            ${
                              selected
                                ? "translate-x-0.5 text-primary"
                                : "text-muted-foreground/40"
                            }
                          `}
                        />
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* fallback */}

              <div
                className="
                  mt-5 flex items-center gap-3
                  border border-dashed border-border
                  px-3 py-2.5
                "
              >
                <span
                  className="
                    flex h-6 w-6 items-center justify-center
                    bg-muted/40
                    font-mono text-[6px]
                    text-muted-foreground
                  "
                >
                  ∞
                </span>

                <div>
                  <div className="font-mono text-[7px] text-muted-foreground">
                    ELSE
                  </div>

                  <div className="mt-0.5 text-[8px] text-foreground">
                    Default destination
                  </div>
                </div>
              </div>
            </div>

            {/* =============================================== */}
            {/* ROUTING GRAPH                                   */}
            {/* =============================================== */}

            <div className="relative min-w-0 p-4 sm:p-6 lg:p-7">
              <div className="flex items-center justify-between">
                <div>
                  <div
                    className="
                      font-mono text-[7px]
                      uppercase tracking-[0.16em]
                      text-muted-foreground
                    "
                  >
                    Route resolution
                  </div>

                  <div className="mt-1 text-[10px] font-semibold text-foreground">
                    One identity → multiple outcomes
                  </div>
                </div>

                <span
                  className="
                    hidden border border-primary/15
                    bg-primary/[0.04]
                    px-2 py-1
                    font-mono text-[7px]
                    text-primary
                    sm:inline-flex
                  "
                >
                  RULE MATCH
                </span>
              </div>

              {/* ============================================= */}
              {/* DESKTOP BRANCHING GRAPH                       */}
              {/* ============================================= */}

              <div
                className="
                  relative mt-7
                  hidden min-h-[360px]
                  md:block
                "
              >
                {/* SVG connections */}

                <svg
                  aria-hidden="true"
                  viewBox="0 0 800 360"
                  preserveAspectRatio="none"
                  className="
                    pointer-events-none
                    absolute inset-0
                    h-full w-full
                  "
                >
                  <defs>
                    <linearGradient
                      id="activeRoute"
                      x1="0"
                      y1="0"
                      x2="1"
                      y2="0"
                    >
                      <stop
                        offset="0%"
                        stopColor="#FA520F"
                        stopOpacity=".25"
                      />

                      <stop
                        offset="50%"
                        stopColor="#FF8105"
                        stopOpacity=".9"
                      />

                      <stop
                        offset="100%"
                        stopColor="#FFD06A"
                        stopOpacity=".6"
                      />
                    </linearGradient>
                  </defs>

                  {/* source -> engine */}

                  <path
                    d="M105 180 C170 180 175 180 250 180"
                    fill="none"
                    stroke="url(#activeRoute)"
                    strokeWidth="2"
                    vectorEffect="non-scaling-stroke"
                  />

                  {/* engine -> destinations */}

                  <path
                    d="M430 180 C510 180 510 65 610 65"
                    fill="none"
                    stroke={
                      activeDestination === "ios"
                        ? "url(#activeRoute)"
                        : "currentColor"
                    }
                    strokeOpacity={
                      activeDestination === "ios"
                        ? 1
                        : 0.15
                    }
                    strokeWidth={
                      activeDestination === "ios"
                        ? 2
                        : 1
                    }
                    vectorEffect="non-scaling-stroke"
                  />

                  <path
                    d="M430 180 C525 180 525 180 610 180"
                    fill="none"
                    stroke={
                      activeDestination === "android"
                        ? "url(#activeRoute)"
                        : "currentColor"
                    }
                    strokeOpacity={
                      activeDestination === "android"
                        ? 1
                        : 0.15
                    }
                    strokeWidth={
                      activeDestination === "android"
                        ? 2
                        : 1
                    }
                    vectorEffect="non-scaling-stroke"
                  />

                  <path
                    d="M430 180 C510 180 510 295 610 295"
                    fill="none"
                    stroke={
                      activeDestination === "default"
                        ? "url(#activeRoute)"
                        : "currentColor"
                    }
                    strokeOpacity={
                      activeDestination === "default"
                        ? 1
                        : 0.15
                    }
                    strokeWidth={
                      activeDestination === "default"
                        ? 2
                        : 1
                    }
                    vectorEffect="non-scaling-stroke"
                  />

                  {/* branch points */}

                  <circle
                    cx="505"
                    cy="180"
                    r="3"
                    fill="#FF8105"
                  />
                </svg>

                {/* Scan source */}

                <div
                  className="
                    absolute left-0 top-1/2
                    w-[135px]
                    -translate-y-1/2
                  "
                >
                  <div
                    className="
                      border border-border/70
                      bg-background
                      p-3
                      shadow-sm
                    "
                  >
                    <div
                      className="
                        flex h-9 w-9
                        items-center justify-center
                        bg-foreground
                        text-background
                      "
                    >
                      <Radio className="h-4 w-4" />
                    </div>

                    <div
                      className="
                        mt-3 font-mono
                        text-[6px] tracking-[0.12em]
                        text-muted-foreground
                      "
                    >
                      INPUT
                    </div>

                    <div className="mt-1 text-[9px] font-semibold text-foreground">
                      Scan context
                    </div>
                  </div>
                </div>

                {/* Decision engine */}

                <div
                  className="
                    absolute left-[31%] top-1/2
                    w-[185px]
                    -translate-y-1/2
                  "
                >
                  <div
                    className="
                      relative overflow-hidden
                      border border-primary/30
                      bg-primary/[0.045]
                      p-4
                      shadow-[0_15px_45px_rgba(250,82,15,.08)]
                    "
                  >
                    <div
                      aria-hidden="true"
                      className="
                        absolute -right-8 -top-8
                        h-20 w-20
                        rounded-full
                        bg-primary/[0.08]
                        blur-[30px]
                      "
                    />

                    <div className="relative">
                      <div className="flex items-center justify-between">
                        <span
                          className="
                            flex h-9 w-9
                            items-center justify-center
                            rounded-lg
                            bg-gradient-to-br
                            from-primary
                            to-[#FFA110]
                            text-white
                          "
                        >
                          <GitFork className="h-4 w-4" />
                        </span>

                        <span
                          className="
                            font-mono text-[6px]
                            uppercase tracking-wider
                            text-primary
                          "
                        >
                          ENGINE
                        </span>
                      </div>

                      <div className="mt-4 text-[10px] font-semibold text-foreground">
                        Route decision
                      </div>

                      <div
                        className="
                          mt-1 line-clamp-2
                          font-mono text-[7px]
                          leading-4
                          text-muted-foreground
                        "
                      >
                        {selectedRule?.condition ??
                          "Configured routing rule"}
                      </div>

                      <div
                        className="
                          mt-4 flex items-center
                          gap-1.5 border-t
                          border-primary/10 pt-3
                        "
                      >
                        <span className="h-1.5 w-1.5 rounded-full bg-primary" />

                        <span className="font-mono text-[6px] text-primary">
                          MATCHED
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Destinations */}

                <div
                  className="
                    absolute bottom-0 right-0 top-0
                    flex w-[205px]
                    flex-col justify-between
                  "
                >
                  {destinations.map((destination) => (
                    <DestinationNode
                      key={destination.id}
                      {...destination}
                      active={
                        activeDestination ===
                        destination.id
                      }
                      onClick={() =>
                        setActiveDestination(
                          destination.id,
                        )
                      }
                    />
                  ))}
                </div>
              </div>

              {/* ============================================= */}
              {/* MOBILE ROUTING FLOW                           */}
              {/* ============================================= */}

              <div className="mt-6 space-y-3 md:hidden">
                <MobileFlowNode
                  icon={Radio}
                  eyebrow="01 / INPUT"
                  title="Scan context"
                />

                <VerticalConnector label="evaluate" />

                <MobileFlowNode
                  icon={GitFork}
                  eyebrow="02 / DECISION"
                  title={
                    selectedRule?.condition ??
                    "Routing policy"
                  }
                  active
                />

                <VerticalConnector label="route" />

                <div className="grid gap-2">
                  {destinations.map((destination) => (
                    <DestinationNode
                      key={destination.id}
                      {...destination}
                      active={
                        activeDestination ===
                        destination.id
                      }
                      onClick={() =>
                        setActiveDestination(
                          destination.id,
                        )
                      }
                    />
                  ))}
                </div>
              </div>

              {/* ============================================= */}
              {/* DECISION TRACE                                */}
              {/* ============================================= */}

              <div
                className="
                  mt-7 overflow-hidden
                  border border-border/60
                  bg-muted/[0.14]
                "
              >
                <div
                  className="
                    flex items-center justify-between
                    border-b border-border/60
                    px-3 py-2.5
                  "
                >
                  <div className="flex items-center gap-2">
                    <MousePointer2 className="h-3 w-3 text-primary" />

                    <span
                      className="
                        font-mono text-[7px]
                        uppercase tracking-[0.14em]
                        text-muted-foreground
                      "
                    >
                      Decision trace
                    </span>
                  </div>

                  <span className="font-mono text-[7px] text-primary">
                    MATCH
                  </span>
                </div>

                <div
                  className="
                    grid gap-px bg-border/60
                    sm:grid-cols-[1fr_auto_1fr_auto_1fr]
                  "
                >
                  <TraceStep
                    label="CONTEXT"
                    value="Device = iOS"
                  />

                  <TraceArrow />

                  <TraceStep
                    label="RULE"
                    value={
                      selectedRule?.badge ??
                      "Device condition"
                    }
                  />

                  <TraceArrow />

                  <TraceStep
                    label="DESTINATION"
                    value={
                      destinations.find(
                        (item) =>
                          item.id ===
                          activeDestination,
                      )?.destination ??
                      "brand.com"
                    }
                    active
                  />
                </div>
              </div>
            </div>
          </div>

          {/* ================================================= */}
          {/* ROUTING CAPABILITY RAIL                          */}
          {/* ================================================= */}

          <div
            className="
              grid grid-cols-2
              border-t border-border/60
              bg-muted/[0.12]
              sm:grid-cols-4
            "
          >
            <RouteCapability
              index="01"
              icon={Smartphone}
              label="DEVICE"
              value="Context"
            />

            <RouteCapability
              index="02"
              icon={Globe2}
              label="REGION"
              value="Location"
            />

            <RouteCapability
              index="03"
              icon={Clock3}
              label="TIME"
              value="Schedule"
            />

            <RouteCapability
              index="04"
              icon={Split}
              label="EXPERIMENT"
              value="Traffic split"
            />
          </div>
        </div>

        {/* ================================================= */}
        {/* CTA                                               */}
        {/* ================================================= */}

        <div
          className="
            mt-6 flex flex-col gap-4
            sm:flex-row
            sm:items-center
            sm:justify-between
          "
        >
          <p
            className="
              max-w-[670px]
              text-[10px] leading-5
              text-muted-foreground
              sm:text-[11px]
            "
          >
            Keep one physical QR identity while the routing policy behind
            it determines which experience each scan should reach.
          </p>

          <Button
            asChild
            className="
              group h-10 w-full
              rounded-lg
              bg-primary px-5
              text-[10px] font-semibold
              text-white
              shadow-[0_8px_28px_rgba(250,82,15,.14)]
              hover:bg-[#E9480B]
              sm:w-auto
            "
          >
            <Link href="/login">
              Build with Routes

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

        <p
          className="
            mx-auto mt-4 max-w-2xl
            text-center text-[8px]
            leading-4 text-muted-foreground/70
            sm:text-[9px]
          "
        >
          Routing conditions and destinations shown above are illustrative
          product-preview data.
        </p>
      </div>
    </section>
  );
}

/* ========================================================= */
/* DESTINATION NODE                                          */
/* ========================================================= */

function DestinationNode({
  eyebrow,
  title,
  destination,
  icon: Icon,
  active,
  onClick,
}: {
  eyebrow: string;
  title: string;
  destination: string;
  icon: React.ComponentType<{ className?: string }>;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        group w-full
        border p-3
        text-left
        transition-all duration-200
        ${
          active
            ? `
              border-primary/30
              bg-primary/[0.055]
              shadow-[0_8px_28px_rgba(250,82,15,.07)]
            `
            : `
              border-border/60
              bg-background
              hover:border-primary/15
              hover:bg-muted/20
            `
        }
      `}
    >
      <div className="flex items-center gap-3">
        <span
          className={`
            flex h-8 w-8 shrink-0
            items-center justify-center
            border
            ${
              active
                ? "border-primary/20 bg-primary text-white"
                : "border-border bg-card text-muted-foreground"
            }
          `}
        >
          <Icon className="h-3.5 w-3.5" />
        </span>

        <span className="min-w-0 flex-1">
          <span
            className={`
              block font-mono
              text-[6px] uppercase
              tracking-[0.12em]
              ${
                active
                  ? "text-primary"
                  : "text-muted-foreground"
              }
            `}
          >
            {eyebrow}
          </span>

          <span className="mt-0.5 block text-[8px] font-semibold text-foreground">
            {title}
          </span>

          <span
            className="
              mt-0.5 block truncate
              font-mono text-[6px]
              text-muted-foreground
            "
          >
            {destination}
          </span>
        </span>

        <ArrowRight
          className={`
            h-3 w-3 shrink-0
            transition-transform
            group-hover:translate-x-0.5
            ${
              active
                ? "text-primary"
                : "text-muted-foreground/30"
            }
          `}
        />
      </div>
    </button>
  );
}

/* ========================================================= */
/* MOBILE FLOW NODE                                          */
/* ========================================================= */

function MobileFlowNode({
  icon: Icon,
  eyebrow,
  title,
  active = false,
}: {
  icon: React.ComponentType<{ className?: string }>;
  eyebrow: string;
  title: string;
  active?: boolean;
}) {
  return (
    <div
      className={`
        flex items-center gap-3
        border p-3
        ${
          active
            ? "border-primary/25 bg-primary/[0.05]"
            : "border-border/60 bg-background"
        }
      `}
    >
      <span
        className={`
          flex h-8 w-8 items-center
          justify-center border
          ${
            active
              ? "border-primary/20 bg-primary text-white"
              : "border-border text-muted-foreground"
          }
        `}
      >
        <Icon className="h-3.5 w-3.5" />
      </span>

      <div>
        <div
          className={`
            font-mono text-[6px]
            tracking-[0.13em]
            ${
              active
                ? "text-primary"
                : "text-muted-foreground"
            }
          `}
        >
          {eyebrow}
        </div>

        <div className="mt-1 text-[9px] font-semibold text-foreground">
          {title}
        </div>
      </div>
    </div>
  );
}

/* ========================================================= */
/* MOBILE CONNECTOR                                          */
/* ========================================================= */

function VerticalConnector({
  label,
}: {
  label: string;
}) {
  return (
    <div className="flex h-8 items-center gap-3 pl-4">
      <span className="h-full border-l border-dashed border-primary/25" />

      <span
        className="
          font-mono text-[6px]
          uppercase tracking-[0.13em]
          text-primary
        "
      >
        {label}
      </span>
    </div>
  );
}

/* ========================================================= */
/* TRACE                                                     */
/* ========================================================= */

function TraceStep({
  label,
  value,
  active = false,
}: {
  label: string;
  value: string;
  active?: boolean;
}) {
  return (
    <div className="min-w-0 bg-background px-3 py-3">
      <div
        className="
          font-mono text-[6px]
          tracking-[0.13em]
          text-muted-foreground
        "
      >
        {label}
      </div>

      <div
        className={`
          mt-1 truncate
          font-mono text-[7px]
          ${
            active
              ? "font-semibold text-primary"
              : "text-foreground"
          }
        `}
      >
        {value}
      </div>
    </div>
  );
}

function TraceArrow() {
  return (
    <div
      className="
        hidden items-center justify-center
        bg-background px-1
        sm:flex
      "
    >
      <ArrowRight className="h-2.5 w-2.5 text-primary/50" />
    </div>
  );
}

/* ========================================================= */
/* CAPABILITY                                                */
/* ========================================================= */

function RouteCapability({
  index,
  icon: Icon,
  label,
  value,
}: {
  index: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
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
      <div className="flex items-start justify-between">
        <Icon className="h-3 w-3 text-primary" />

        <span className="font-mono text-[6px] text-muted-foreground">
          {index}
        </span>
      </div>

      <div
        className="
          mt-4 font-mono
          text-[7px] tracking-[0.16em]
          text-primary
        "
      >
        {label}
      </div>

      <div className="mt-1 text-[9px] font-medium text-foreground sm:text-[10px]">
        {value}
      </div>
    </div>
  );
}
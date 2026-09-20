"use client";

import * as React from "react";
import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  Globe2,
  MonitorSmartphone,
  Route,
  ShieldCheck,
  Smartphone,
} from "lucide-react";

import { Button } from "@/components/ui/button";

const routeItems = [
  {
    label: "iOS",
    destination: "App Store",
    icon: Smartphone,
    position:
      "left-[3%] top-[8%] sm:left-[5%] sm:top-[9%] lg:left-[2%] lg:top-[8%]",
  },
  {
    label: "Android",
    destination: "Play Store",
    icon: MonitorSmartphone,
    position:
      "right-[3%] top-[8%] sm:right-[5%] sm:top-[9%] lg:right-[2%] lg:top-[8%]",
  },
  {
    label: "Global",
    destination: "Website",
    icon: Globe2,
    position:
      "right-[2%] bottom-[8%] sm:right-[5%] sm:bottom-[9%] lg:right-[1%] lg:bottom-[8%]",
  },
];

export function MarketingHero() {
  return (
    <section className="relative isolate overflow-hidden bg-background">
      {/* ------------------------------------------------ */}
      {/* AMBIENT BACKGROUND                               */}
      {/* ------------------------------------------------ */}

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
      >
        {/* Warm top glow */}
        <div className="absolute left-1/2 top-[-18rem] h-[34rem] w-[55rem] -translate-x-1/2 rounded-full bg-primary/[0.08] blur-[110px] sm:h-[40rem] sm:w-[75rem]" />

        {/* Fine infrastructure grid */}
        <div
          className="
            absolute inset-0 opacity-[0.42]
            [background-image:linear-gradient(to_right,hsl(var(--border)/.32)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border)/.32)_1px,transparent_1px)]
            [background-size:44px_44px]
            sm:[background-size:56px_56px]
            [mask-image:linear-gradient(to_bottom,black,black_58%,transparent_95%)]
          "
        />

        {/* QR-inspired decorative modules */}
        <div className="absolute left-[6%] top-[22%] hidden h-2 w-2 bg-primary/20 lg:block" />
        <div className="absolute left-[9%] top-[25%] hidden h-2 w-2 bg-primary/10 lg:block" />
        <div className="absolute right-[8%] top-[30%] hidden h-3 w-3 border border-primary/20 lg:block" />
        <div className="absolute right-[12%] top-[27%] hidden h-1.5 w-1.5 bg-primary/20 lg:block" />
      </div>

      {/* ------------------------------------------------ */}
      {/* HERO CONTENT                                     */}
      {/* ------------------------------------------------ */}

      <div
        className="
          relative z-10 mx-auto flex min-h-[100svh] w-full
          max-w-[1440px] flex-col items-center
          px-4 pb-8 pt-24
          sm:px-6 sm:pb-10 sm:pt-28
          md:px-8
          lg:px-10 lg:pb-12 lg:pt-32
          xl:px-12
        "
      >
        {/* Main headline */}
        <div className="mt-2 max-w-[1040px] text-center sm:mt-4 lg:mt-6">
          <h1
            className="
              font-display font-medium tracking-[-0.045em]
              text-foreground
              text-[clamp(3.6rem,12vw,6.2rem)]
              leading-[0.92]
              lg:text-[clamp(5.5rem,7.4vw,7.3rem)]
              lg:leading-[0.91]
            "
          >
            One QR.
            <br />

            <span className="relative inline-block">
              <span
                className="
                  bg-gradient-to-r
                  from-[#FA520F]
                  via-[#FF8A00]
                  to-[#FFD06A]
                  bg-clip-text text-transparent
                "
              >
                Infinite directions.
              </span>

              <svg
                aria-hidden="true"
                viewBox="0 0 500 20"
                preserveAspectRatio="none"
                className="
                  absolute -bottom-3 left-1/2
                  h-3 w-[88%] -translate-x-1/2
                  text-primary/25
                  sm:-bottom-4 sm:h-4
                "
              >
                <path
                  d="M4 12C110 4 342 3 496 9"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </span>
          </h1>

          <p
            className="
              mx-auto mt-6 max-w-[620px]
              px-2
              text-[13px] leading-5
              text-muted-foreground
              sm:mt-8 sm:text-[15px] sm:leading-6
              md:text-[16px]
            "
          >
            A QR shouldn&apos;t become obsolete when the world behind it
            changes. Design once, redirect anytime, route every scan
            intelligently, and understand what happens next.
          </p>
        </div>

        {/* CTA */}
        <div
          className="
            mt-7 flex w-full max-w-[410px]
            items-center justify-center gap-2.5
            sm:mt-8 sm:w-auto sm:max-w-none sm:gap-3
          "
        >
          <Button
            asChild
            className="
              group h-11 flex-1 rounded-lg
              bg-primary px-4
              text-[12px] font-semibold text-white
              shadow-[0_8px_30px_rgba(250,82,15,0.16)]
              transition-all duration-300
              hover:bg-[#E9480B]
              hover:shadow-[0_12px_36px_rgba(250,82,15,0.22)]
              sm:h-12 sm:flex-none sm:px-6 sm:text-sm
            "
          >
            <Link href="/login">
              Create your first QR

              <ArrowRight
                className="
                  ml-1 h-3.5 w-3.5
                  transition-transform duration-300
                  group-hover:translate-x-0.5
                  sm:h-4 sm:w-4
                "
              />
            </Link>
          </Button>

          <Button
            asChild
            variant="outline"
            className="
              h-11 flex-1 rounded-lg
              border-border/80
              bg-background/70 px-4
              text-[12px] font-medium
              backdrop-blur-sm
              transition-colors
              hover:bg-muted/50
              sm:h-12 sm:flex-none sm:px-6 sm:text-sm
            "
          >
            <Link href="#platform">Explore platform</Link>
          </Button>
        </div>

        <p className="mt-3 text-[10px] text-muted-foreground sm:text-[11px]">
          Start free · No credit card required
        </p>

        {/* ------------------------------------------------ */}
        {/* INTELLIGENCE STAGE                               */}
        {/* ------------------------------------------------ */}

        <div
          id="platform"
          className="
            relative mt-9
            w-full max-w-[1100px]
            sm:mt-11
            lg:mt-12
          "
        >
          {/* Top label */}
          <div className="mb-2 flex items-center justify-between px-2 sm:px-4">
            <div className="flex items-center gap-2 text-[9px] font-medium uppercase tracking-[0.16em] text-muted-foreground sm:text-[10px]">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Live routing model
            </div>

            <span className="hidden text-[10px] font-mono text-muted-foreground sm:block">
              SCAN → RESOLVE → ROUTE
            </span>
          </div>

          <div
            className="
              relative overflow-hidden
              rounded-[20px]
              border border-border/70
              bg-background/80
              shadow-[0_30px_100px_rgba(31,31,31,0.07)]
              backdrop-blur-xl
              sm:rounded-[24px]
            "
          >
            {/* Browser / infrastructure header */}
            <div
              className="
                flex h-10 items-center justify-between
                border-b border-border/60
                px-3
                sm:h-12 sm:px-5
              "
            >
              <div className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-foreground/10 sm:h-2 sm:w-2" />
                <span className="h-1.5 w-1.5 rounded-full bg-foreground/10 sm:h-2 sm:w-2" />
                <span className="h-1.5 w-1.5 rounded-full bg-foreground/10 sm:h-2 sm:w-2" />
              </div>

              <div className="font-mono text-[8px] uppercase tracking-[0.12em] text-muted-foreground sm:text-[10px]">
                NXTQR / Intelligent Resolution
              </div>

              <div className="flex items-center gap-1 text-[8px] text-muted-foreground sm:text-[10px]">
                <ShieldCheck className="h-3 w-3 text-primary" />
                Edge
              </div>
            </div>

            {/* Main visual */}
            <div
              className="
                relative
                min-h-[310px]
                sm:min-h-[390px]
                lg:min-h-[430px]
              "
            >
              {/* Inner dot field */}
              <div
                aria-hidden="true"
                className="
                  absolute inset-0 opacity-[0.5]
                  [background-image:radial-gradient(circle,hsl(var(--foreground)/.12)_1px,transparent_1px)]
                  [background-size:20px_20px]
                  [mask-image:radial-gradient(circle_at_center,black,transparent_74%)]
                "
              />

              {/* Route lines */}
              <svg
                aria-hidden="true"
                className="absolute inset-0 h-full w-full"
                viewBox="0 0 1000 430"
                preserveAspectRatio="none"
              >
                <defs>
                  <linearGradient
                    id="routeGradient"
                    x1="0"
                    x2="1"
                    y1="0"
                    y2="0"
                  >
                    <stop offset="0%" stopColor="#FA520F" stopOpacity="0" />
                    <stop offset="50%" stopColor="#FF8105" stopOpacity=".65" />
                    <stop offset="100%" stopColor="#FFD900" stopOpacity="0" />
                  </linearGradient>
                </defs>

                <path
                  d="M500 215 C380 215 330 90 190 90"
                  fill="none"
                  stroke="url(#routeGradient)"
                  strokeWidth="1.5"
                  strokeDasharray="5 7"
                  vectorEffect="non-scaling-stroke"
                />

                <path
                  d="M500 215 C620 215 670 90 810 90"
                  fill="none"
                  stroke="url(#routeGradient)"
                  strokeWidth="1.5"
                  strokeDasharray="5 7"
                  vectorEffect="non-scaling-stroke"
                />

                <path
                  d="M500 215 C650 215 690 350 820 350"
                  fill="none"
                  stroke="url(#routeGradient)"
                  strokeWidth="1.5"
                  strokeDasharray="5 7"
                  vectorEffect="non-scaling-stroke"
                />
              </svg>

              {/* Destination nodes */}
              {routeItems.map((item) => {
                const Icon = item.icon;

                return (
                  <div
                    key={item.label}
                    className={`
                      absolute ${item.position}
                      z-20
                      hidden
                      min-w-[142px]
                      rounded-xl
                      border border-border/70
                      bg-background/90
                      p-3
                      shadow-sm
                      backdrop-blur-md
                      sm:block
                    `}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/[0.08] text-primary">
                        <Icon className="h-3.5 w-3.5" />
                      </div>

                      <div>
                        <p className="text-[9px] uppercase tracking-[0.12em] text-muted-foreground">
                          {item.label}
                        </p>

                        <p className="mt-0.5 text-[11px] font-semibold text-foreground">
                          {item.destination}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Central NXTQR intelligence node */}
              <div
                className="
                  absolute left-1/2 top-1/2 z-30
                  -translate-x-1/2 -translate-y-1/2
                "
              >
                {/* Outer orbital rings */}
                <div
                  aria-hidden="true"
                  className="
                    absolute left-1/2 top-1/2
                    h-[190px] w-[190px]
                    -translate-x-1/2 -translate-y-1/2
                    rounded-full border border-primary/[0.08]
                    sm:h-[240px] sm:w-[240px]
                  "
                />

                <div
                  aria-hidden="true"
                  className="
                    absolute left-1/2 top-1/2
                    h-[145px] w-[145px]
                    -translate-x-1/2 -translate-y-1/2
                    rounded-full border border-dashed border-primary/[0.15]
                    motion-safe:animate-[spin_28s_linear_infinite]
                    sm:h-[185px] sm:w-[185px]
                  "
                />

                {/* Main intelligence block */}
                <div
                  className="
                    relative flex h-[112px] w-[112px]
                    flex-col items-center justify-center
                    rounded-[26px]
                    border border-primary/20
                    bg-background
                    shadow-[0_20px_60px_rgba(250,82,15,0.13)]
                    sm:h-[142px] sm:w-[142px]
                    sm:rounded-[32px]
                  "
                >
                  {/* QR corners */}
                  <span className="absolute left-3 top-3 h-4 w-4 border-l-2 border-t-2 border-primary/60 sm:h-5 sm:w-5" />
                  <span className="absolute right-3 top-3 h-4 w-4 border-r-2 border-t-2 border-primary/60 sm:h-5 sm:w-5" />
                  <span className="absolute bottom-3 left-3 h-4 w-4 border-b-2 border-l-2 border-primary/60 sm:h-5 sm:w-5" />
                  <span className="absolute bottom-3 right-3 h-4 w-4 border-b-2 border-r-2 border-primary/60 sm:h-5 sm:w-5" />

                  <div
                    className="
                      flex h-9 w-9 items-center justify-center
                      rounded-xl
                      bg-gradient-to-br
                      from-[#FA520F]
                      via-[#FF8105]
                      to-[#FFD900]
                      text-white
                      shadow-[0_7px_24px_rgba(250,82,15,.25)]
                      sm:h-11 sm:w-11
                    "
                  >
                    <Route className="h-4 w-4 sm:h-5 sm:w-5" />
                  </div>

                  <span className="mt-2 text-[9px] font-bold tracking-[0.14em] text-foreground sm:text-[10px]">
                    NXTQR
                  </span>

                  <span className="mt-0.5 font-mono text-[7px] text-muted-foreground sm:text-[8px]">
                    ROUTE ENGINE
                  </span>
                </div>
              </div>

              {/* Mobile destination strip */}
              <div
                className="
                  absolute inset-x-3 bottom-3 z-30
                  grid grid-cols-3 gap-1.5
                  sm:hidden
                "
              >
                {routeItems.map((item) => {
                  const Icon = item.icon;

                  return (
                    <div
                      key={item.label}
                      className="
                        flex min-w-0 flex-col items-center
                        rounded-lg border border-border/70
                        bg-background/90
                        px-1 py-2
                        text-center
                        backdrop-blur
                      "
                    >
                      <Icon className="h-3 w-3 text-primary" />

                      <span className="mt-1 truncate text-[7px] uppercase tracking-wider text-muted-foreground">
                        {item.label}
                      </span>

                      <span className="mt-0.5 w-full truncate text-[8px] font-semibold">
                        {item.destination}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Side intelligence badges */}
              <div
                className="
                  absolute bottom-4 left-4 z-20
                  hidden items-center gap-2
                  rounded-lg border border-border/60
                  bg-background/75 px-3 py-2
                  backdrop-blur
                  lg:flex
                "
              >
                <BarChart3 className="h-3.5 w-3.5 text-primary" />

                <div>
                  <div className="text-[9px] font-medium">
                    Scan intelligence
                  </div>
                  <div className="text-[8px] text-muted-foreground">
                    Captured asynchronously
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom command strip */}
            <div
              className="
                grid grid-cols-3
                border-t border-border/60
                bg-muted/[0.18]
              "
            >
              <HeroStat
                number="01"
                label="Permanent identity"
              />

              <HeroStat
                number="02"
                label="Adaptive routing"
              />

              <HeroStat
                number="03"
                label="Scan intelligence"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function HeroStat({
  number,
  label,
}: {
  number: string;
  label: string;
}) {
  return (
    <div
      className="
        flex min-w-0 items-center justify-center
        gap-1.5 px-2 py-3
        sm:gap-2 sm:px-4 sm:py-3.5
      "
    >
      <span className="font-mono text-[7px] text-primary sm:text-[8px]">
        {number}
      </span>

      <span className="truncate text-[8px] font-medium text-muted-foreground sm:text-[10px]">
        {label}
      </span>
    </div>
  );
}
import * as React from "react";
import Link from "next/link";
import {
  ArrowRight,
  Check,
  Fingerprint,
  Route,
  ScanLine,
  Sparkles,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { BRAND } from "@/config/brand";

export function FinalCta() {
  return (
    <section
      className="
        relative isolate overflow-hidden
        border-t border-border/60
        bg-background
        py-4 sm:py-6
      "
    >
      <div className="mx-auto max-w-[1440px] px-3 sm:px-5 lg:px-7">
        <div
          className="
            relative min-h-[650px] overflow-hidden
            rounded-[22px]
            border border-border/70
            bg-card text-card-foreground dark:bg-[#151515]
            px-4 py-16
            sm:min-h-[700px] sm:rounded-[28px] sm:px-8 sm:py-20
            lg:min-h-[760px] lg:px-12 lg:py-24
          "
        >
          {/* =============================================== */}
          {/* AMBIENT FIELD                                   */}
          {/* =============================================== */}

          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0"
          >
            {/* Central warm glow */}
            <div
              className="
                absolute left-1/2 top-[43%]
                h-[34rem] w-[34rem]
                -translate-x-1/2 -translate-y-1/2
                rounded-full
                bg-[#FA520F]/[0.09]
                blur-[140px]
                sm:h-[44rem] sm:w-[44rem]
              "
            />

            <div
              className="
                absolute left-1/2 top-[46%]
                h-[24rem] w-[45rem]
                -translate-x-1/2 -translate-y-1/2
                rounded-full
                bg-[#FFD900]/[0.025]
                blur-[120px]
              "
            />

            {/* Grid */}
            <div
              className="
                absolute inset-0 opacity-[0.16]
                [background-image:linear-gradient(to_right,#ffffff12_1px,transparent_1px),linear-gradient(to_bottom,#ffffff12_1px,transparent_1px)]
                [background-size:56px_56px]
                sm:[background-size:72px_72px]
                [mask-image:radial-gradient(ellipse_75%_75%_at_50%_45%,black,transparent_90%)]
              "
            />

            {/* giant QR-inspired corner geometry */}
            <div
              className="
                absolute -left-10 top-10
                h-44 w-44
                border-l border-t border-[#FA520F]/10
                sm:left-10 sm:top-14 sm:h-52 sm:w-52
              "
            />

            <div
              className="
                absolute -right-10 bottom-10
                h-44 w-44
                border-b border-r border-[#FFD06A]/10
                sm:right-10 sm:bottom-14 sm:h-52 sm:w-52
              "
            />

            {/* Pixel fragments */}
            <div className="absolute left-[8%] top-[24%] hidden grid-cols-4 gap-1.5 opacity-20 lg:grid">
              {[
                1, 1, 1, 0,
                1, 0, 1, 0,
                1, 1, 1, 1,
                0, 0, 1, 1,
              ].map((visible, i) => (
                <span
                  key={i}
                  className={`h-2 w-2 ${
                    visible ? "bg-[#FA520F]" : ""
                  }`}
                />
              ))}
            </div>

            <div className="absolute right-[9%] top-[18%] hidden grid-cols-3 gap-1.5 opacity-[0.12] lg:grid">
              {[
                1, 1, 0,
                0, 1, 1,
                1, 0, 1,
              ].map((visible, i) => (
                <span
                  key={i}
                  className={`h-2 w-2 ${
                    visible ? "bg-[#FFD06A]" : ""
                  }`}
                />
              ))}
            </div>
          </div>

          {/* =============================================== */}
          {/* ROUTING LINES                                   */}
          {/* =============================================== */}

          <svg
            aria-hidden="true"
            viewBox="0 0 1200 760"
            preserveAspectRatio="none"
            className="
              pointer-events-none
              absolute inset-0
              hidden h-full w-full
              md:block
            "
          >
            <defs>
              <linearGradient
                id="finalRouteLeft"
                x1="0"
                x2="1"
                y1="0"
                y2="0"
              >
                <stop
                  offset="0%"
                  stopColor="#FA520F"
                  stopOpacity="0"
                />

                <stop
                  offset="55%"
                  stopColor="#FA520F"
                  stopOpacity=".28"
                />

                <stop
                  offset="100%"
                  stopColor="#FF8105"
                  stopOpacity=".65"
                />
              </linearGradient>

              <linearGradient
                id="finalRouteRight"
                x1="1"
                x2="0"
                y1="0"
                y2="0"
              >
                <stop
                  offset="0%"
                  stopColor="#FFD06A"
                  stopOpacity="0"
                />

                <stop
                  offset="55%"
                  stopColor="#FFB83E"
                  stopOpacity=".25"
                />

                <stop
                  offset="100%"
                  stopColor="#FF8105"
                  stopOpacity=".6"
                />
              </linearGradient>
            </defs>

            {/* left → center */}
            <path
              d="M0 270 C180 270 240 370 430 370 C505 370 525 350 600 350"
              fill="none"
              stroke="url(#finalRouteLeft)"
              strokeWidth="1.2"
              strokeDasharray="5 8"
              vectorEffect="non-scaling-stroke"
            />

            <path
              d="M0 520 C170 520 250 435 410 435 C500 435 535 390 600 390"
              fill="none"
              stroke="url(#finalRouteLeft)"
              strokeWidth="1"
              strokeDasharray="4 9"
              vectorEffect="non-scaling-stroke"
            />

            {/* right → center */}
            <path
              d="M1200 245 C1015 245 955 340 780 340 C690 340 665 355 600 355"
              fill="none"
              stroke="url(#finalRouteRight)"
              strokeWidth="1.2"
              strokeDasharray="5 8"
              vectorEffect="non-scaling-stroke"
            />

            <path
              d="M1200 525 C1015 525 940 430 790 430 C690 430 660 390 600 390"
              fill="none"
              stroke="url(#finalRouteRight)"
              strokeWidth="1"
              strokeDasharray="4 9"
              vectorEffect="non-scaling-stroke"
            />

            {/* signal nodes */}
            <circle
              cx="405"
              cy="370"
              r="3"
              fill="#FA520F"
              opacity=".6"
            />

            <circle
              cx="795"
              cy="340"
              r="3"
              fill="#FFB83E"
              opacity=".6"
            />
          </svg>

          {/* =============================================== */}
          {/* TOP SYSTEM LABEL                                */}
          {/* =============================================== */}

          <div className="relative z-10 flex justify-center">
            <div
              className="
                inline-flex items-center gap-2
                font-mono text-[9px] font-semibold
                uppercase tracking-[0.18em]
                text-[#FA520F]
                sm:text-[10px]
              "
            >
              <span
                className="
                  flex h-6 w-6 items-center justify-center
                  border border-[#FA520F]/25
                  bg-[#FA520F]/[0.07]
                "
              >
                <ScanLine className="h-3 w-3" />
              </span>

              {BRAND.descriptor}

              <span className="h-px w-8 bg-[#FA520F]/30 sm:w-12" />
            </div>
          </div>

          {/* =============================================== */}
          {/* MAIN CONTENT                                    */}
          {/* =============================================== */}

          <div
            className="
              relative z-10
              mx-auto mt-12
              flex max-w-[980px]
              flex-col items-center
              text-center
              sm:mt-16
              lg:mt-20
            "
          >
            {/* Identity node */}
            <div className="relative mb-8 sm:mb-10">
              {/* orbital system */}
              <div
                aria-hidden="true"
                className="
                  absolute left-1/2 top-1/2
                  h-[92px] w-[92px]
                  -translate-x-1/2 -translate-y-1/2
                  rounded-full
                  border border-[#FA520F]/10
                  sm:h-[110px] sm:w-[110px]
                "
              />

              <div
                aria-hidden="true"
                className="
                  absolute left-1/2 top-1/2
                  h-[72px] w-[72px]
                  -translate-x-1/2 -translate-y-1/2
                  rounded-full
                  border border-dashed border-[#FA520F]/20
                  motion-safe:animate-[spin_24s_linear_infinite]
                  sm:h-[86px] sm:w-[86px]
                "
              />

              <div
                className="
                  relative flex h-14 w-14
                  items-center justify-center
                  rounded-[16px]
                  bg-gradient-to-br
                  from-[#FA520F]
                  via-[#FF8105]
                  to-[#FFD06A]
                  text-white
                  shadow-[0_12px_45px_rgba(250,82,15,.3)]
                  sm:h-16 sm:w-16
                  sm:rounded-[18px]
                "
              >
                <Route className="h-5 w-5 sm:h-6 sm:w-6" />
              </div>
            </div>

            {/* Heading */}
            <h2
              className="
                max-w-[1000px]
                font-display font-medium
                tracking-[-0.05em]
                text-foreground
                text-[clamp(2.7rem,11vw,4.7rem)]
                leading-[0.94]
                sm:text-[clamp(4.3rem,8vw,6.3rem)]
                lg:text-[clamp(5.5rem,6.5vw,7rem)]
              "
            >
              Your QR is printed.
              <br />

              <span
                className="
                  bg-gradient-to-r
                  from-[#FA520F]
                  via-[#FF8A00]
                  to-[#FFD06A]
                  bg-clip-text text-transparent
                "
              >
                Its story isn&apos;t.
              </span>
            </h2>

            <p
              className="
                mx-auto mt-7 max-w-[660px]
                text-sm leading-6
                text-muted-foreground
                sm:mt-8 sm:text-base sm:leading-7
              "
            >
              {BRAND.corePositioning}
            </p>

            {/* CTA */}
            <div
              className="
                mt-8 flex w-full max-w-[420px]
                flex-col gap-2.5
                sm:mt-9 sm:max-w-none
                sm:flex-row sm:justify-center
                sm:gap-3
              "
            >
              <Button
                asChild
                size="lg"
                className="
                  group h-12 w-full
                  rounded-lg
                  bg-[#FA520F] px-6
                  text-xs font-semibold text-white
                  shadow-[0_12px_35px_rgba(250,82,15,.22)]
                  transition-all duration-300
                  hover:bg-[#E9480B]
                  hover:shadow-[0_15px_45px_rgba(250,82,15,.28)]
                  sm:w-auto sm:px-7 sm:text-sm
                "
              >
                <Link href="/login">
                  Start creating

                  <ArrowRight
                    className="
                      ml-1 h-3.5 w-3.5
                      transition-transform duration-300
                      group-hover:translate-x-1
                    "
                  />
                </Link>
              </Button>

              <Button
                asChild
                size="lg"
                variant="outline"
                className="
                  h-12 w-full
                  rounded-lg
                  border-border/80
                  bg-background/60
                  px-6
                  text-xs font-medium
                  text-foreground
                  backdrop-blur
                  hover:border-border
                  hover:bg-muted/50
                  hover:text-white
                  sm:w-auto sm:px-7 sm:text-sm
                "
              >
                <Link href="#studio">
                  Explore NXTQR
                </Link>
              </Button>
            </div>

            {/* Trust line */}
            <div
              className="
                mt-6 flex flex-wrap
                items-center justify-center
                gap-x-5 gap-y-2
                text-[9px] text-muted-foreground
                sm:gap-x-6 sm:text-[10px]
              "
            >
              <span className="flex items-center gap-1.5">
                <Check className="h-3 w-3 text-[#FA520F]" />
                Start free
              </span>

              <span className="flex items-center gap-1.5">
                <Check className="h-3 w-3 text-[#FA520F]" />
                No credit card required
              </span>

              <span className="flex items-center gap-1.5">
                <Check className="h-3 w-3 text-[#FA520F]" />
                Upgrade when you need more
              </span>
            </div>
          </div>

          {/* =============================================== */}
          {/* BOTTOM PRINCIPLE RAIL                           */}
          {/* =============================================== */}

          <div
            className="
              relative z-10
              mx-auto mt-14
              max-w-[920px]
              sm:mt-16
              lg:absolute lg:bottom-8
              lg:left-1/2 lg:w-[calc(100%-4rem)]
              lg:-translate-x-1/2
            "
          >
            <div
              className="
                grid grid-cols-2
                overflow-hidden
                border border-border/70
                bg-muted/[0.08]
                backdrop-blur-md
                sm:grid-cols-4
              "
            >
              <Principle
                number="01"
                label="CREATE"
                value="Once"
              />

              <Principle
                number="02"
                label="CHANGE"
                value="Anytime"
              />

              <Principle
                number="03"
                label="ROUTE"
                value="Intelligently"
              />

              <Principle
                number="04"
                label="MEASURE"
                value="Everything"
              />
            </div>
          </div>

          {/* Side labels - desktop */}
          <div
            className="
              absolute bottom-[31%] left-7
              hidden items-center gap-2
              font-mono text-[7px]
              uppercase tracking-[0.15em]
              text-[#5F5D58]
              xl:flex
            "
          >
            <Fingerprint className="h-3 w-3 text-[#FA520F]/60" />
            Persistent identity
          </div>

          <div
            className="
              absolute bottom-[31%] right-7
              hidden items-center gap-2
              font-mono text-[7px]
              uppercase tracking-[0.15em]
              text-[#5F5D58]
              xl:flex
            "
          >
            Adaptive destination
            <Sparkles className="h-3 w-3 text-[#FFD06A]/60" />
          </div>
        </div>
      </div>
    </section>
  );
}

function Principle({
  number,
  label,
  value,
}: {
  number: string;
  label: string;
  value: string;
}) {
  return (
    <div
      className="
        relative min-h-[86px]
        border-b border-r border-border/60
        p-3.5
        last:border-r-0
        sm:min-h-[92px] sm:border-b-0 sm:p-4
        [&:nth-child(2n)]:border-r-0
        sm:[&:nth-child(2n)]:border-r
        sm:last:border-r-0
      "
    >
      <span className="font-mono text-[6px] text-[#4F4E4A]">
        {number}
      </span>

      <div className="mt-3 font-mono text-[7px] tracking-[0.16em] text-[#FA520F]">
        {label}
      </div>

      <div className="mt-1 text-[9px] font-medium text-foreground sm:text-[10px]">
        {value}
      </div>
    </div>
  );
}
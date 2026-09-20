import * as React from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  Check,
  Circle,
  Radio,
} from "lucide-react";

import { NxtqrLogo } from "@/components/brand/nxtqr-logo";
import { siteConfig } from "@/config/site";
import { BRAND } from "@/config/brand";
import { ThemeSwitcher } from "@/components/shell/theme-switcher";

export function MarketingFooter() {
  return (
    <footer
      className="
        relative isolate overflow-hidden
        border-t border-border/60 bg-muted/[0.15] text-foreground dark:bg-[#111111] dark:text-foreground
      "
    >
      {/* ================================================= */}
      {/* BACKGROUND SYSTEM                                 */}
      {/* ================================================= */}

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
      >
        {/* Subtle vertical infrastructure grid */}
        <div
          className="
            absolute inset-0 opacity-[0.12]
            [background-image:linear-gradient(to_right,#ffffff12_1px,transparent_1px)]
            [background-size:72px_100%]
            [mask-image:linear-gradient(to_bottom,black,black_75%,transparent)]
          "
        />

        {/* Warm brand glow */}
        <div
          className="
            absolute -bottom-[22rem] left-[-12rem]
            h-[42rem] w-[42rem]
            rounded-full bg-[#FA520F]/[0.055]
            blur-[150px]
          "
        />

        <div
          className="
            absolute -right-[15rem] top-[-20rem]
            h-[35rem] w-[35rem]
            rounded-full bg-[#FFD06A]/[0.025]
            blur-[150px]
          "
        />
      </div>

      <div className="relative mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8 xl:px-10">
        {/* ================================================= */}
        {/* TOP IDENTITY RAIL                                 */}
        {/* ================================================= */}

        <div
          className="
            flex flex-col gap-5
            border-b border-border/60
            py-7
            sm:flex-row sm:items-center sm:justify-between
            sm:py-8
          "
        >
          <div className="flex items-center gap-3">
            <span
              className="
                flex h-7 w-7 items-center justify-center
                border border-[#FA520F]/20
                bg-[#FA520F]/[0.06]
              "
            >
              <Radio className="h-3 w-3 text-[#FA520F]" />
            </span>

            <div>
              <div
                className="
                  font-mono text-[8px] uppercase
                  tracking-[0.18em] text-[#FA520F]
                "
              >
                NXTQR
              </div>

              <div className="mt-0.5 text-[9px] text-muted-foreground">
                {BRAND.descriptor}
              </div>
            </div>
          </div>

          <div
            className="
              flex items-center gap-2
              font-mono text-[8px]
              uppercase tracking-[0.12em]
              text-muted-foreground
            "
          >
            <span className="relative flex h-1.5 w-1.5">
              <span
                className="
                  absolute inline-flex h-full w-full
                  animate-ping rounded-full
                  bg-emerald-400 opacity-30
                  motion-reduce:animate-none
                "
              />

              <span className="relative h-1.5 w-1.5 rounded-full bg-emerald-400" />
            </span>

            Infrastructure online
          </div>
        </div>

        {/* ================================================= */}
        {/* MAIN FOOTER                                       */}
        {/* ================================================= */}

        <div
          className="
            grid gap-12
            py-12
            sm:py-14
            lg:grid-cols-[minmax(280px,1.15fr)_minmax(0,1.85fr)]
            lg:gap-16
            lg:py-16
            xl:gap-24
          "
        >
          {/* =============================================== */}
          {/* BRAND FIELD                                     */}
          {/* =============================================== */}

          <div className="relative">
            <Link
              href="/"
              aria-label="NXTQR home"
              className="
                inline-flex
                rounded-md
                focus-visible:outline-none
                focus-visible:ring-2
                focus-visible:ring-[#FA520F]
                focus-visible:ring-offset-4
                focus-visible:ring-offset-background
              "
            >
              <NxtqrLogo size="md" />
            </Link>

            <p
              className="
                mt-6 max-w-[390px]
                text-[11px] leading-5
                text-muted-foreground
                sm:text-xs sm:leading-6
              "
            >
              {BRAND.description}
            </p>

            {/* Positioning */}
            <div
              className="
                mt-7 max-w-[390px]
                border-l border-[#FA520F]/30
                pl-4
              "
            >
              <p
                className="
                  font-display text-lg font-medium
                  leading-snug tracking-[-0.02em]
                  text-foreground
                  sm:text-xl
                "
              >
                Create once.
                <br />
                Change anytime.
              </p>

              <p className="mt-2 font-mono text-[7px] uppercase tracking-[0.15em] text-muted-foreground">
                Route intelligently / Measure everything
              </p>
            </div>

            {/* Tiny QR geometry */}
            <div
              aria-hidden="true"
              className="
                absolute right-0 top-0
                hidden grid-cols-5 gap-1
                opacity-[0.14]
                sm:grid lg:hidden xl:grid
              "
            >
              {[
                1, 1, 1, 0, 1,
                1, 0, 1, 0, 0,
                1, 1, 1, 1, 1,
                0, 0, 1, 0, 1,
                1, 0, 1, 1, 1,
              ].map((visible, index) => (
                <span
                  key={index}
                  className={`
                    h-1.5 w-1.5
                    ${visible ? "bg-[#FA520F]" : ""}
                  `}
                />
              ))}
            </div>
          </div>

          {/* =============================================== */}
          {/* NAVIGATION MATRIX                               */}
          {/* =============================================== */}

          <nav
            aria-label="Footer navigation"
            className="
              grid grid-cols-2
              gap-x-5 gap-y-10
              sm:grid-cols-4
              sm:gap-x-6
            "
          >
            <FooterColumn
              index="01"
              title="Product"
              items={siteConfig.footerNav.product}
            />

            <FooterColumn
              index="02"
              title="Solutions"
              items={siteConfig.footerNav.solutions}
            />

            <FooterColumn
              index="03"
              title="Developers"
              items={siteConfig.footerNav.developers}
            />

            <div>
              <FooterColumn
                index="04"
                title="Company"
                items={siteConfig.footerNav.company}
              />

              {/* Legal separated instead of mixing it with Company */}
              <div className="mt-8 border-t border-border/60 pt-6">
                <div
                  className="
                    mb-3 font-mono text-[7px]
                    uppercase tracking-[0.16em]
                    text-muted-foreground
                  "
                >
                  Legal
                </div>

                <ul className="space-y-2.5">
                  {siteConfig.footerNav.legal.map((item) => (
                    <li key={item.title}>
                      <FooterLink
                        href={item.href}
                        title={item.title}
                      />
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </nav>
        </div>

        {/* ================================================= */}
        {/* INFRASTRUCTURE PRINCIPLE RAIL                      */}
        {/* ================================================= */}

        <div
          className="
            grid grid-cols-2
            border-y border-border/60
            sm:grid-cols-4
          "
        >
          <SystemPrinciple
            index="01"
            label="IDENTITY"
            value="Persistent"
          />

          <SystemPrinciple
            index="02"
            label="DESTINATION"
            value="Adaptable"
          />

          <SystemPrinciple
            index="03"
            label="ROUTING"
            value="Intelligent"
          />

          <SystemPrinciple
            index="04"
            label="SIGNALS"
            value="Measurable"
          />
        </div>

        {/* ================================================= */}
        {/* BOTTOM RAIL                                       */}
        {/* ================================================= */}

        <div
          className="
            flex flex-col gap-5
            py-6
            sm:flex-row sm:items-center
            sm:justify-between
            sm:py-7
          "
        >
          <div
            className="
              flex flex-wrap items-center
              gap-x-4 gap-y-2
              text-[8px] text-muted-foreground
              sm:text-[9px]
            "
          >
            <span>{BRAND.copyright}</span>

            <span
              aria-hidden="true"
              className="hidden h-3 w-px bg-border/60 sm:block"
            />

            <span>Smart QR Infrastructure</span>
            <span aria-hidden="true" className="hidden h-3 w-px bg-border/60 sm:block" />
            <ThemeSwitcher className="h-7 w-7 rounded-md" />
          </div>

          <div
            className="
              flex flex-wrap items-center
              gap-x-4 gap-y-2
              font-mono text-[7px]
              uppercase tracking-[0.1em]
              text-muted-foreground
              sm:justify-end sm:text-[8px]
            "
          >
            <span className="flex items-center gap-1.5">
              <Check className="h-2.5 w-2.5 text-[#FA520F]" />
              Edge architecture
            </span>

            <span className="flex items-center gap-1.5">
              <Check className="h-2.5 w-2.5 text-[#FA520F]" />
              Privacy-aware analytics
            </span>

            <span className="flex items-center gap-1.5">
              <Check className="h-2.5 w-2.5 text-[#FA520F]" />
              Dynamic routing
            </span>
          </div>
        </div>

        {/* ================================================= */}
        {/* GIANT BRAND SIGNATURE                              */}
        {/* ================================================= */}

        <div
          aria-hidden="true"
          className="
            relative overflow-hidden
            border-t border-border/60
            pt-5
          "
        >
          <div
            className="
              select-none whitespace-nowrap
              text-center
              font-display font-medium
              tracking-[-0.075em]
              text-white/[0.025]
              text-[clamp(5rem,21vw,18rem)]
              leading-[0.72]
            "
          >
            NXTQR
          </div>

          {/* Orange scan line */}
          <div
            className="
              absolute bottom-[8%] left-1/2
              h-px w-[38%]
              -translate-x-1/2
              bg-gradient-to-r
              from-transparent
              via-[#FA520F]/30
              to-transparent
            "
          />
        </div>
      </div>
    </footer>
  );
}

/* ========================================================= */
/* FOOTER COLUMN                                             */
/* ========================================================= */

function FooterColumn({
  index,
  title,
  items,
}: {
  index: string;
  title: string;
  items: Array<{
    title: string;
    href: string;
  }>;
}) {
  return (
    <div>
      <div
        className="
          mb-5 flex items-center
          gap-2 border-b border-border/60
          pb-3
        "
      >
        <span className="font-mono text-[6px] text-[#4F4E4A]">
          {index}
        </span>

        <span
          className="
            font-mono text-[8px] font-semibold
            uppercase tracking-[0.15em]
            text-muted-foreground
          "
        >
          {title}
        </span>
      </div>

      <ul className="space-y-3">
        {items.map((item) => (
          <li key={item.title}>
            <FooterLink
              href={item.href}
              title={item.title}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ========================================================= */
/* LINK                                                      */
/* ========================================================= */

function FooterLink({
  href,
  title,
}: {
  href: string;
  title: string;
}) {
  const external =
    href.startsWith("http://") ||
    href.startsWith("https://");

  return (
    <Link
      href={href}
      {...(external
        ? {
            target: "_blank",
            rel: "noopener noreferrer",
          }
        : {})}
      className="
        group inline-flex max-w-full
        items-center gap-1.5
        text-[10px] text-muted-foreground
        transition-colors duration-200
        hover:text-foreground
        focus-visible:outline-none
        focus-visible:text-foreground
        sm:text-[11px]
      "
    >
      <span className="truncate">
        {title}
      </span>

      {external && (
        <ArrowUpRight
          className="
            h-2.5 w-2.5
            shrink-0 opacity-0
            transition-all duration-200
            group-hover:-translate-y-0.5
            group-hover:translate-x-0.5
            group-hover:opacity-100
          "
        />
      )}
    </Link>
  );
}

/* ========================================================= */
/* SYSTEM PRINCIPLE                                          */
/* ========================================================= */

function SystemPrinciple({
  index,
  label,
  value,
}: {
  index: string;
  label: string;
  value: string;
}) {
  return (
    <div
      className="
        relative min-h-[88px]
        border-b border-r border-border/60
        p-3.5
        sm:min-h-[96px]
        sm:border-b-0 sm:p-4
        lg:px-5

        [&:nth-child(2n)]:border-r-0
        sm:[&:nth-child(2n)]:border-r
        sm:last:border-r-0
      "
    >
      <div className="flex items-start justify-between">
        <Circle
          className="
            h-2.5 w-2.5
            fill-[#FA520F]/10
            text-[#FA520F]/50
          "
        />

        <span className="font-mono text-[6px] text-[#3F3E3A]">
          {index}
        </span>
      </div>

      <div
        className="
          mt-4 font-mono
          text-[6px] uppercase
          tracking-[0.16em]
          text-[#FA520F]
          sm:text-[7px]
        "
      >
        {label}
      </div>

      <div
        className="
          mt-1 text-[9px]
          font-medium text-foreground
          sm:text-[10px]
        "
      >
        {value}
      </div>
    </div>
  );
}
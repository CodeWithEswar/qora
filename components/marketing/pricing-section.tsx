import * as React from "react";
import Link from "next/link";
import {
  ArrowRight,
  Check,
  ChevronRight,
  Code2,
  Crown,
  Gauge,
  Layers3,
  Route,
  ShieldCheck,
  Sparkles,
  Users,
  Workflow,
} from "lucide-react";

import { Button } from "@/components/ui/button";

const plans = [
  {
    number: "01",
    name: "Free",
    mode: "CREATE",
    badge: "START",
    audience: "For individuals exploring NXTQR.",
    description:
      "Create and manage essential QR experiences with the core NXTQR workflow.",
    capabilities: [
      "Core QR Studio",
      "Essential QR types",
      "Basic customization",
      "Limited dynamic QR",
      "Basic scan insights",
    ],
    icon: Sparkles,
    cta: "Start free",
    href: "/login",
    featured: false,
  },
  {
    number: "02",
    name: "Pro",
    mode: "OPERATE",
    badge: "PRO",
    audience: "For professionals running active QR campaigns.",
    description:
      "Unlock deeper design, dynamic destinations, routing and operational intelligence.",
    capabilities: [
      "Advanced QR Studio",
      "Dynamic destinations",
      "Basic intelligent routing",
      "Advanced analytics",
      "Guardian monitoring",
      "Developer access",
    ],
    icon: Route,
    cta: "Explore Pro",
    href: "/login",
    featured: true,
  },
  {
    number: "03",
    name: "Business",
    mode: "COORDINATE",
    badge: "TEAMS",
    audience: "For brands and teams managing QR infrastructure together.",
    description:
      "Add collaboration, governance and shared brand controls across a workspace.",
    capabilities: [
      "Advanced routing rules",
      "Teams and workspace roles",
      "Approval workflows",
      "Shared brand governance",
      "Organization analytics",
      "Expanded developer access",
    ],
    icon: Users,
    cta: "Explore Business",
    href: "/login",
    featured: false,
  },
  {
    number: "04",
    name: "Enterprise",
    mode: "GOVERN",
    badge: "CUSTOM",
    audience: "For organizations with advanced infrastructure requirements.",
    description:
      "Extend NXTQR with organization-level controls, integrations and deployment options.",
    capabilities: [
      "Custom domain options",
      "Advanced access controls",
      "Audit capabilities",
      "Configurable retention",
      "Organization integrations",
      "Custom commercial terms",
    ],
    icon: ShieldCheck,
    cta: "Talk to us",
    href: "/contact",
    featured: false,
  },
];

export function PricingSection() {
  return (
    <section
      id="pricing"
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
            absolute left-[15%] top-[18%]
            h-[28rem] w-[28rem]
            rounded-full
            bg-primary/[0.035]
            blur-[130px]
          "
        />

        <div
          className="
            absolute bottom-[-10%] right-[5%]
            h-[30rem] w-[30rem]
            rounded-full
            bg-[#FFD06A]/[0.04]
            blur-[140px]
          "
        />

        <div
          className="
            absolute inset-0 opacity-[0.18]
            [background-image:linear-gradient(to_right,hsl(var(--border)/.35)_1px,transparent_1px)]
            [background-size:72px_100%]
            [mask-image:linear-gradient(to_bottom,transparent,black_12%,black_88%,transparent)]
          "
        />
      </div>

      <div className="relative mx-auto max-w-[1380px] px-4 sm:px-6 lg:px-8 xl:px-10">
        {/* ================================================= */}
        {/* HEADER                                            */}
        {/* ================================================= */}

        <div
          className="
            mb-11 grid gap-7
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
                <Layers3 className="h-3 w-3" />
              </span>

              NXTQR Plans

              <span className="h-px w-8 bg-primary/30 sm:w-12" />
            </div>

            <h2
              className="
                mt-5 max-w-[900px]
                font-display font-medium
                tracking-[-0.045em]
                text-foreground
                text-[clamp(2.7rem,10vw,4.4rem)]
                leading-[0.95]
                sm:text-[clamp(4rem,7vw,5.7rem)]
                lg:text-[clamp(4.8rem,5.8vw,6.2rem)]
              "
            >
              Start creating.
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
                Expand when you need it.
              </span>
            </h2>
          </div>

          <div className="lg:pb-1">
            <p className="text-sm leading-6 text-muted-foreground sm:text-base sm:leading-7">
              NXTQR grows from essential QR creation into routing,
              intelligence, collaboration and organization-level controls.
            </p>

            <Link
              href="/pricing"
              className="
                group mt-5 inline-flex
                items-center gap-2
                text-[10px] font-semibold
                text-foreground
                transition-colors
                hover:text-primary
              "
            >
              Compare complete plan capabilities

              <ArrowRight
                className="
                  h-3 w-3
                  transition-transform
                  group-hover:translate-x-0.5
                "
              />
            </Link>
          </div>
        </div>

        {/* ================================================= */}
        {/* PLAN ARCHITECTURE                                 */}
        {/* ================================================= */}

        <div
          className="
            overflow-hidden
            rounded-[20px]
            border border-border/70
            bg-card/80
            shadow-[0_35px_110px_rgba(31,31,31,.07)]
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
            <div className="flex items-center gap-2.5">
              <span
                className="
                  flex h-7 w-7 items-center justify-center
                  rounded-lg
                  bg-primary/[0.07]
                  text-primary
                "
              >
                <Crown className="h-3.5 w-3.5" />
              </span>

              <div>
                <div className="text-[10px] font-semibold text-foreground sm:text-xs">
                  Capability progression
                </div>

                <div className="hidden font-mono text-[7px] text-muted-foreground sm:block">
                  INDIVIDUAL → PROFESSIONAL → TEAM → ORGANIZATION
                </div>
              </div>
            </div>

            <span
              className="
                font-mono text-[7px]
                uppercase tracking-[0.12em]
                text-muted-foreground
              "
            >
              4 TIERS
            </span>
          </div>

          {/* ================================================= */}
          {/* PROGRESSION RAIL                                 */}
          {/* ================================================= */}

          <div
            className="
              hidden grid-cols-4
              border-b border-border/60
              bg-muted/[0.12]
              lg:grid
            "
          >
            {plans.map((plan, index) => (
              <div
                key={plan.name}
                className="
                  relative border-r border-border/60
                  px-5 py-3
                  last:border-r-0
                "
              >
                <div className="flex items-center gap-2">
                  <span
                    className={`
                      flex h-5 w-5 items-center justify-center
                      rounded-full
                      font-mono text-[6px]
                      ${
                        plan.featured
                          ? "bg-primary text-white"
                          : "border border-border bg-background text-muted-foreground"
                      }
                    `}
                  >
                    {index + 1}
                  </span>

                  <span
                    className={`
                      font-mono text-[7px]
                      font-semibold tracking-[0.14em]
                      ${
                        plan.featured
                          ? "text-primary"
                          : "text-muted-foreground"
                      }
                    `}
                  >
                    {plan.mode}
                  </span>
                </div>

                {index < plans.length - 1 && (
                  <ArrowRight
                    aria-hidden="true"
                    className="
                      absolute -right-1.5 top-1/2 z-10
                      h-3 w-3 -translate-y-1/2
                      bg-card text-border
                    "
                  />
                )}
              </div>
            ))}
          </div>

          {/* ================================================= */}
          {/* PLAN COLUMNS                                     */}
          {/* ================================================= */}

          <div
            className="
              grid
              md:grid-cols-2
              xl:grid-cols-4
            "
          >
            {plans.map((plan) => {
              const Icon = plan.icon;

              return (
                <article
                  key={plan.name}
                  className={`
                    group relative flex min-h-full flex-col
                    border-b border-border/60
                    p-5
                    sm:p-6
                    md:border-r
                    xl:border-b-0
                    xl:p-7

                    md:[&:nth-child(2n)]:border-r-0
                    xl:[&:nth-child(2n)]:border-r
                    xl:last:border-r-0

                    ${
                      plan.featured
                        ? "bg-primary/[0.025]"
                        : "bg-transparent"
                    }
                  `}
                >
                  {/* Pro accent */}
                  {plan.featured && (
                    <div
                      aria-hidden="true"
                      className="
                        absolute inset-x-0 top-0
                        h-[2px]
                        bg-gradient-to-r
                        from-primary
                        via-[#FF8105]
                        to-[#FFB83E]
                      "
                    />
                  )}

                  {/* plan identity */}

                  <div className="flex items-start justify-between gap-4">
                    <div
                      className={`
                        flex h-10 w-10
                        items-center justify-center
                        border
                        ${
                          plan.featured
                            ? "border-primary/20 bg-primary/[0.07] text-primary"
                            : "border-border/70 bg-background text-muted-foreground"
                        }
                      `}
                    >
                      <Icon className="h-4 w-4" />
                    </div>

                    <div className="text-right">
                      <span
                        className={`
                          inline-flex border px-2 py-1
                          font-mono text-[6px]
                          font-semibold uppercase
                          tracking-[0.14em]
                          ${
                            plan.featured
                              ? "border-primary/20 bg-primary/[0.07] text-primary"
                              : "border-border/70 bg-muted/25 text-muted-foreground"
                          }
                        `}
                      >
                        {plan.badge}
                      </span>

                      <div className="mt-2 font-mono text-[6px] text-muted-foreground">
                        {plan.number}
                      </div>
                    </div>
                  </div>

                  <div className="mt-7">
                    <div
                      className={`
                        font-mono text-[7px]
                        font-semibold uppercase
                        tracking-[0.16em]
                        ${
                          plan.featured
                            ? "text-primary"
                            : "text-muted-foreground"
                        }
                      `}
                    >
                      {plan.mode}
                    </div>

                    <h3
                      className="
                        mt-2 font-display
                        text-3xl font-medium
                        tracking-[-0.04em]
                        text-foreground
                        sm:text-[34px]
                      "
                    >
                      {plan.name}
                    </h3>

                    <p className="mt-2 min-h-[32px] text-[9px] leading-4 text-muted-foreground">
                      {plan.audience}
                    </p>
                  </div>

                  {/* capability divider */}

                  <div className="my-6 flex items-center gap-2">
                    <span
                      className={`
                        h-1.5 w-1.5
                        ${
                          plan.featured
                            ? "bg-primary"
                            : "bg-border"
                        }
                      `}
                    />

                    <div className="h-px flex-1 bg-border/70" />

                    <span className="font-mono text-[6px] uppercase tracking-[0.12em] text-muted-foreground">
                      Capability
                    </span>
                  </div>

                  <p className="text-[9px] leading-[1.7] text-muted-foreground sm:text-[10px]">
                    {plan.description}
                  </p>

                  {/* features */}

                  <div className="mt-6 flex-1">
                    <div
                      className="
                        mb-3 font-mono text-[6px]
                        uppercase tracking-[0.15em]
                        text-muted-foreground
                      "
                    >
                      Includes
                    </div>

                    <div className="space-y-3">
                      {plan.capabilities.map((capability) => (
                        <div
                          key={capability}
                          className="flex items-start gap-2.5"
                        >
                          <span
                            className={`
                              mt-[3px] flex h-3.5 w-3.5
                              shrink-0 items-center justify-center
                              border
                              ${
                                plan.featured
                                  ? "border-primary/20 bg-primary/[0.06] text-primary"
                                  : "border-border/70 text-muted-foreground"
                              }
                            `}
                          >
                            <Check className="h-2 w-2" />
                          </span>

                          <span className="text-[9px] leading-4 text-foreground/85">
                            {capability}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* CTA */}

                  <div className="mt-7 border-t border-border/60 pt-5">
                    <Button
                      asChild
                      variant={plan.featured ? "default" : "outline"}
                      className={`
                        group/button h-10 w-full
                        rounded-lg text-[10px]
                        font-semibold
                        ${
                          plan.featured
                            ? `
                              bg-primary text-white
                              shadow-[0_8px_25px_rgba(250,82,15,.15)]
                              hover:bg-[#E9480B]
                            `
                            : `
                              border-border
                              bg-background/50
                              hover:bg-muted/35
                            `
                        }
                      `}
                    >
                      <Link href={plan.href}>
                        {plan.cta}

                        <ArrowRight
                          className="
                            ml-1 h-3 w-3
                            transition-transform
                            group-hover/button:translate-x-0.5
                          "
                        />
                      </Link>
                    </Button>
                  </div>
                </article>
              );
            })}
          </div>

          {/* ================================================= */}
          {/* ENTITLEMENT RAIL                                 */}
          {/* ================================================= */}

          <div
            className="
              grid grid-cols-2
              border-t border-border/60
              bg-muted/[0.13]
              lg:grid-cols-4
            "
          >
            <Entitlement
              icon={Sparkles}
              title="CREATE"
              description="Studio & QR assets"
            />

            <Entitlement
              icon={Route}
              title="ROUTE"
              description="Dynamic behavior"
            />

            <Entitlement
              icon={BarCapabilityIcon}
              title="UNDERSTAND"
              description="Analytics & Guardian"
            />

            <Entitlement
              icon={Workflow}
              title="GOVERN"
              description="Teams & controls"
            />
          </div>
        </div>

        {/* ================================================= */}
        {/* FOOTER                                            */}
        {/* ================================================= */}

        <div
          className="
            mt-6 flex flex-col gap-4
            sm:flex-row
            sm:items-center
            sm:justify-between
          "
        >
          <div className="flex items-start gap-2.5">
            <Gauge className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />

            <p className="max-w-[650px] text-[9px] leading-4 text-muted-foreground sm:text-[10px]">
              Exact quotas, usage limits and commercial terms can be shown on
              the full pricing page and should remain synchronized with the
              production entitlement system.
            </p>
          </div>

          <Link
            href="/pricing"
            className="
              group inline-flex shrink-0
              items-center gap-2
              text-[9px] font-semibold
              text-foreground
              transition-colors
              hover:text-primary
            "
          >
            Full plan comparison

            <ChevronRight
              className="
                h-3 w-3
                transition-transform
                group-hover:translate-x-0.5
              "
            />
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ========================================================= */
/* ENTITLEMENT                                               */
/* ========================================================= */

function Entitlement({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
}) {
  return (
    <div
      className="
        min-h-[88px]
        border-b border-r border-border/60
        p-3.5
        sm:p-4
        lg:min-h-[94px]
        lg:border-b-0
        lg:px-5

        [&:nth-child(2n)]:border-r-0
        lg:[&:nth-child(2n)]:border-r
        lg:last:border-r-0
      "
    >
      <div className="flex items-center justify-between">
        <Icon className="h-3 w-3 text-primary" />

        <ArrowRight className="h-2.5 w-2.5 text-muted-foreground/30" />
      </div>

      <div
        className="
          mt-3 font-mono text-[7px]
          font-semibold tracking-[0.15em]
          text-primary
        "
      >
        {title}
      </div>

      <div className="mt-1 text-[8px] text-muted-foreground sm:text-[9px]">
        {description}
      </div>
    </div>
  );
}

/* Keeps the capability rail visually distinct from normal analytics UI. */
function BarCapabilityIcon({
  className,
}: {
  className?: string;
}) {
  return (
    <span
      className={`flex items-end gap-[2px] ${className ?? ""}`}
      aria-hidden="true"
    >
      <span className="h-1.5 w-[2px] bg-current" />
      <span className="h-2.5 w-[2px] bg-current" />
      <span className="h-2 w-[2px] bg-current" />
    </span>
  );
}
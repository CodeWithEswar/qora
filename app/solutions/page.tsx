"use client";

import * as React from "react";
import Link from "next/link";
import {
  Activity,
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  Boxes,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  Clock3,
  Cpu,
  Eye,
  FileCheck,
  Fingerprint,
  GitFork,
  Globe2,
  Layers,
  LockKeyhole,
  Megaphone,
  Palette,
  QrCode,
  RefreshCw,
  Route,
  ScanLine,
  Server,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Timer,
  Users,
  Zap,
} from "lucide-react";

import { MarketingHeader } from "@/components/marketing/header";
import { MarketingFooter } from "@/components/marketing/footer";
import { Button } from "@/components/ui/button";
import { BRAND } from "@/config/brand";

const solutions = [
  {
    id: "marketing",
    index: "01",
    title: "Marketing & Campaigns",
    badge: "POST-PRINT RETARGETING",
    headline: "Update campaign destinations without reprinting a single flyer.",
    description:
      "Physical print campaigns used to be permanent. With NXTQR dynamic routing, marketing teams can deploy billboards, direct mail, and packaging, then pivot landing pages weekly based on performance or seasonal promos.",
    icon: Megaphone,
    accent: "from-[#FA520F] to-[#FF8A00]",
    features: [
      {
        title: "A/B Destination Split Testing",
        desc: "Split incoming traffic between variant URLs (50/50, 80/20) to measure conversion differences from identical printed materials.",
      },
      {
        title: "Automatic UTM Tag Injection",
        desc: "Inject dynamic UTM campaign, source, and medium parameters on redirect, maintaining immaculate attribution across Google Analytics and Mixpanel.",
      },
      {
        title: "Time-Windowed Promotional Shifts",
        desc: "Pre-program morning vs evening offers, weekend sales, or countdown destinations that transition automatically without manual intervention.",
      },
    ],
    previewData: {
      type: "CAMPAIGN WORKSPACE",
      name: "Q3 Out-of-Home Direct Mailer",
      rules: [
        { condition: "Active Window: Sep 15 – Sep 30", target: "brand.com/promo/fall-kickoff" },
        { condition: "Device: iOS (Apple App Store)", target: "apps.apple.com/app/brand" },
        { condition: "Device: Android (Google Play)", target: "play.google.com/store/brand" },
        { condition: "Default Fallback", target: "brand.com/promo/generic" },
      ],
    },
  },
  {
    id: "retail",
    index: "02",
    title: "Retail & Consumer Packaging",
    badge: "PHYSICAL TO DIGITAL",
    headline: "High-density scanability engineered for carton, glass, and foil.",
    description:
      "Consumer packaged goods demand tiny print footprints and extreme contrast reliability. NXTQR Studio optimizes quiet zones and module density for curved surfaces, frosted glass, and low-light shelf scans.",
    icon: ShoppingBag,
    accent: "from-[#FF8A00] to-[#FFD06A]",
    features: [
      {
        title: "Micro-Footprint Scan Verification",
        desc: "Vector SVG/EPS export calibrated to ISO/IEC 18004 standards, scannable even at 12mm x 12mm print dimensions.",
      },
      {
        title: "Dynamic Product Manuals & Warranty",
        desc: "Link packaging to interactive digital onboarding guides, recipe libraries, and instant warranty registration portals.",
      },
      {
        title: "Batch Identity & Regional Localization",
        desc: "Route European packaging to localized French/German manuals, and US packaging to English/Spanish versions automatically.",
      },
    ],
    previewData: {
      type: "PACKAGING SPECIFICATION",
      name: "Retail CPG Series 4 — Box Print",
      rules: [
        { condition: "Country: France / Belgium", target: "manuals.brand.com/fr/setup" },
        { condition: "Country: Germany / Austria", target: "manuals.brand.com/de/setup" },
        { condition: "Country: Japan", target: "manuals.brand.com/ja/setup" },
        { condition: "Default Global", target: "manuals.brand.com/en/setup" },
      ],
    },
  },
  {
    id: "events",
    index: "03",
    title: "Conferences & Live Events",
    badge: "TIME-AWARE INFRASTRUCTURE",
    headline: "One badge. One table card. Infinite schedule shifts.",
    description:
      "Event organizers don't need to print separate handouts for keynote schedules, breakout rooms, catering maps, and exit surveys. Route attendees throughout the event cycle with automated time-based edge rules.",
    icon: Calendar,
    accent: "from-[#FA520F] to-[#FFD06A]",
    features: [
      {
        title: "Automated Hour-by-Hour Schedules",
        desc: "08:00–12:00 routes to morning keynote agenda; 12:00–14:00 routes to lunch & expo map; 18:00 routes to afterparty access.",
      },
      {
        title: "One-Tap Wi-Fi & Contact Cards",
        desc: "Instant captive Wi-Fi credential onboarding and vCard speaker contact downloads with zero manual typing.",
      },
      {
        title: "Real-Time Peak Velocity Telemetry",
        desc: "Monitor live scan surges across booths and entrance halls to detect attendee congestion and session interest in real time.",
      },
    ],
    previewData: {
      type: "EVENT ACCESS CONTROL",
      name: "Summit 2026 — Main Hall Lanyards",
      rules: [
        { condition: "09:00 – 11:30 AM", target: "summit.io/agenda/keynote-live" },
        { condition: "11:30 – 14:00 PM", target: "summit.io/maps/expo-and-lunch" },
        { condition: "14:00 – 17:30 PM", target: "summit.io/tracks/breakouts" },
        { condition: "17:30 – 22:00 PM", target: "summit.io/survey-and-afterparty" },
      ],
    },
  },
  {
    id: "enterprise",
    index: "04",
    title: "Enterprise Brand Governance",
    badge: "CENTRALIZED CONTROL",
    headline: "Empower 50 global marketing teams without risking brand integrity.",
    description:
      "Decentralized marketing teams often produce inconsistent, broken, or unapproved QR codes. NXTQR provides centralized brand kits, mandatory approval pipelines, and multi-tier RBAC to maintain pristine corporate governance.",
    icon: Building2,
    accent: "from-[#FF8A00] to-[#FA520F]",
    features: [
      {
        title: "Strict Brand Kit Template Locking",
        desc: "Brand managers lock exact hex palettes, SVG logos, error correction rates, and margin constraints. Regional editors cannot deviate.",
      },
      {
        title: "Four-Eye Publish Approval Workflows",
        desc: "Destination URL changes and new campaign releases require explicit sign-off from authorized Brand Managers before going live.",
      },
      {
        title: "Vanity Short Domains & Multi-Tenant RBAC",
        desc: "Host all redirects on custom corporate domains (e.g. qr.yourbrand.com) with SSO, SCIM provisioning, and full audit logs.",
      },
    ],
    previewData: {
      type: "ORGANIZATION WORKSPACE",
      name: "Global Brands Group — Enterprise Plane",
      rules: [
        { condition: "Brand Kit Status", target: "LOCKED (HEX #FA520F / SVG Vector)" },
        { condition: "Publish Approval Flow", target: "Required: Brand Manager Sign-Off" },
        { condition: "Audit Logging", target: "Immutable cryptographic event trail" },
        { condition: "Identity & SSO", target: "Okta / SAML 2.0 (Active)" },
      ],
    },
  },
];

const comparisonData = [
  {
    capability: "Post-Print Destination Editing",
    staticQr: "Impossible (Permanent print)",
    linkShortener: "Basic URL swap",
    nxtqr: "Sub-10ms edge swap + rule branching",
  },
  {
    capability: "Conditional Device / Geo Routing",
    staticQr: "None",
    linkShortener: "Basic query string checks",
    nxtqr: "Visual node engine (OS, Time, Country, Split)",
  },
  {
    capability: "Print Vector Quality & Contrast",
    staticQr: "Low-res raster / unverified",
    linkShortener: "Generic black/white PNG",
    nxtqr: "CMYK, SVG, EPS with quiet zone validation",
  },
  {
    capability: "Broken Link Health Monitoring",
    staticQr: "None (Silent failure)",
    linkShortener: "None",
    nxtqr: "Link Guardian continuous HTTP/TLS probes",
  },
  {
    capability: "Brand Governance & Approvals",
    staticQr: "None",
    linkShortener: "Single shared login",
    nxtqr: "Multi-role RBAC, Brand Kits, Audit Logs",
  },
  {
    capability: "Telemetry Privacy Standard",
    staticQr: "None",
    linkShortener: "Third-party ad cookies / raw IPs",
    nxtqr: "Salted daily hashes · Zero raw IP storage",
  },
];

export default function SolutionsPage() {
  const [activeSolution, setActiveSolution] = React.useState("marketing");

  return (
    <div className="min-h-screen bg-background text-foreground">
      <MarketingHeader />

      <main>
        {/* ================================================= */}
        {/* HERO                                              */}
        {/* ================================================= */}

        <section
          className="
            relative overflow-hidden
            border-b border-border/60
            pt-32 sm:pt-36 lg:pt-40
          "
        >
          {/* Ambient Glow */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0"
          >
            <div
              className="
                absolute left-[10%] top-[15%]
                h-[30rem] w-[30rem]
                rounded-full
                bg-primary/[0.05]
                blur-[150px]
              "
            />
            <div
              className="
                absolute right-[12%] top-[25%]
                h-[28rem] w-[28rem]
                rounded-full
                bg-[#FF8A00]/[0.04]
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
            <div className="max-w-[950px] pb-14 sm:pb-18 lg:pb-20">
              <div
                className="
                  inline-flex items-center gap-2
                  font-mono text-[9px] font-semibold
                  uppercase tracking-[0.18em]
                  text-primary
                "
              >
                <span
                  className="
                    flex h-6 w-6 items-center justify-center
                    border border-primary/20
                    bg-primary/[0.06]
                  "
                >
                  <Layers className="h-3 w-3" />
                </span>

                Industry Solutions

                <span className="h-px w-10 bg-primary/30" />
              </div>

              <h1
                className="
                  mt-6 font-display
                  text-[clamp(3rem,10vw,5rem)]
                  font-medium leading-[0.95]
                  tracking-[-0.05em]
                  text-foreground
                  sm:text-[clamp(4rem,7vw,6rem)]
                "
              >
                Engineered for
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
                  physical-to-digital scale.
                </span>
              </h1>

              <p
                className="
                  mt-7 max-w-[720px]
                  text-sm leading-7
                  text-muted-foreground
                  sm:text-base
                "
              >
                Discover how leading consumer brands, global packaging manufacturers, live event producers,
                and enterprise marketing teams eliminate dead-end prints and enforce governance with {BRAND.name}.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Button asChild className="h-11 rounded-none bg-primary px-6 text-xs font-semibold text-white shadow-md hover:bg-[#E9480B]">
                  <Link href="/login">
                    Deploy Your First Solution
                    <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                  </Link>
                </Button>
                <Button asChild variant="outline" className="h-11 rounded-none border-border/80 px-6 text-xs font-medium">
                  <Link href="/contact">Schedule Technical Consultation</Link>
                </Button>
              </div>
            </div>

            {/* Quick solution badges */}
            <div className="grid border-t border-border/60 sm:grid-cols-4">
              {solutions.map((s, idx) => {
                const Icon = s.icon;
                return (
                  <a
                    key={s.id}
                    href={`#${s.id}`}
                    className={`
                      border-b border-border/60 py-4 sm:border-b-0 sm:px-5
                      ${idx < 3 ? "sm:border-r" : ""}
                      sm:first:pl-0 group transition-colors hover:bg-muted/[0.08]
                    `}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[7px] tracking-[0.14em] text-muted-foreground group-hover:text-primary">
                        0{idx + 1}
                      </span>
                      <Icon className="h-3 w-3 text-primary transition-transform group-hover:scale-110" />
                    </div>
                    <div className="mt-2 text-[10px] font-semibold text-foreground">
                      {s.title}
                    </div>
                  </a>
                );
              })}
            </div>
          </div>
        </section>

        {/* ================================================= */}
        {/* DEEP-DIVE SOLUTION BLOCKS                         */}
        {/* ================================================= */}

        <section className="border-b border-border/60">
          <div className="mx-auto max-w-[1380px] divide-y divide-border/60">
            {solutions.map((solution) => {
              const Icon = solution.icon;
              return (
                <div
                  key={solution.id}
                  id={solution.id}
                  className="scroll-mt-32 px-4 py-16 sm:px-6 sm:py-20 lg:px-8 xl:px-10"
                >
                  <div className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
                    {/* Left Column: Solution Detail */}
                    <div className="space-y-6">
                      <div className="flex items-center gap-2">
                        <div className="flex h-7 w-7 items-center justify-center border border-primary/30 bg-primary/10 text-primary">
                          <Icon className="h-3.5 w-3.5" />
                        </div>
                        <span className="font-mono text-[8px] font-semibold uppercase tracking-[0.16em] text-primary">
                          {solution.badge}
                        </span>
                        <span className="h-px w-8 bg-primary/30" />
                      </div>

                      <h2 className="font-display text-3xl font-medium tracking-tight text-foreground sm:text-4xl">
                        {solution.headline}
                      </h2>

                      <p className="text-sm leading-7 text-muted-foreground">
                        {solution.description}
                      </p>

                      <div className="space-y-4 pt-2">
                        {solution.features.map((f) => (
                          <div key={f.title} className="flex items-start gap-3 border border-border/60 bg-muted/[0.06] p-4">
                            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                            <div>
                              <h3 className="text-xs font-semibold text-foreground">{f.title}</h3>
                              <p className="mt-1 text-[11px] leading-5 text-muted-foreground">{f.desc}</p>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="pt-2">
                        <Button asChild className="h-10 rounded-none bg-primary px-5 text-xs font-semibold text-white hover:bg-[#E9480B]">
                          <Link href="/login">
                            Configure {solution.title}
                            <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                          </Link>
                        </Button>
                      </div>
                    </div>

                    {/* Right Column: Interactive Mock Architecture Terminal */}
                    <div className="border border-border/70 bg-card overflow-hidden shadow-lg">
                      <div className="flex items-center justify-between border-b border-border/60 bg-muted/[0.12] px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="h-2 w-2 rounded-full bg-foreground/20" />
                          <span className="h-2 w-2 rounded-full bg-foreground/20" />
                          <span className="h-2 w-2 rounded-full bg-foreground/20" />
                          <span className="ml-2 font-mono text-[8px] tracking-wider text-muted-foreground uppercase">
                            {solution.previewData.type}
                          </span>
                        </div>
                        <span className="font-mono text-[7px] text-emerald-600 dark:text-emerald-400 uppercase font-semibold">
                          ● RESOLUTION ACTIVE
                        </span>
                      </div>

                      <div className="p-6 space-y-4 font-mono text-xs">
                        <div className="border-b border-border/60 pb-3">
                          <div className="text-[9px] text-muted-foreground uppercase tracking-wider">Asset Context</div>
                          <div className="mt-1 text-sm font-semibold text-foreground">{solution.previewData.name}</div>
                        </div>

                        <div className="space-y-3">
                          <div className="text-[9px] text-muted-foreground uppercase tracking-wider">Configured Resolution Rules</div>
                          {solution.previewData.rules.map((rule, idx) => (
                            <div key={idx} className="border border-border/60 bg-background p-3 space-y-1">
                              <div className="flex items-center justify-between text-[9px] text-primary">
                                <span>RULE 0{idx + 1}</span>
                                <span className="text-[7px] text-muted-foreground">SUB-10MS EDGE</span>
                              </div>
                              <div className="text-[10px] text-muted-foreground">IF: {rule.condition}</div>
                              <div className="text-[11px] text-foreground font-semibold flex items-center gap-1.5 truncate">
                                <ArrowRight className="h-3 w-3 text-primary shrink-0" />
                                <span className="truncate">{rule.target}</span>
                              </div>
                            </div>
                          ))}
                        </div>

                        <div className="border-t border-border/60 pt-3 flex items-center justify-between text-[8px] text-muted-foreground">
                          <span>FAILOVER POLICY: AUTOMATED</span>
                          <span>LATENCY: 4.2MS</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ================================================= */}
        {/* COMPARISON MATRIX                                 */}
        {/* ================================================= */}

        <section className="border-b border-border/60 bg-muted/[0.08]">
          <div className="mx-auto max-w-[1380px] px-4 py-16 sm:px-6 sm:py-20 lg:px-8 xl:px-10 space-y-10">
            <div className="max-w-3xl">
              <div className="font-mono text-[7px] font-semibold uppercase tracking-[0.16em] text-primary">
                INFRASTRUCTURE COMPARISON
              </div>
              <h2 className="mt-2 font-display text-3xl font-medium tracking-tight text-foreground sm:text-4xl">
                Why generic link shorteners fail for physical QR.
              </h2>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                Printing on physical cartons, billboards, or magazines carries permanent capital cost.
                Ordinary web link shorteners were never built for print vector requirements, health failovers,
                or cryptographic privacy standards.
              </p>
            </div>

            <div className="overflow-x-auto border border-border/70 bg-card">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="border-b border-border/60 bg-muted/[0.2] font-semibold text-foreground">
                  <tr>
                    <th className="py-4 px-5">Operational Capability</th>
                    <th className="py-4 px-5 text-muted-foreground">Static QR Code</th>
                    <th className="py-4 px-5 text-muted-foreground">Web Link Shortener</th>
                    <th className="py-4 px-5 text-primary">NXTQR Smart Infrastructure</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {comparisonData.map((row) => (
                    <tr key={row.capability} className="hover:bg-muted/[0.06] transition-colors">
                      <td className="py-4 px-5 font-medium text-foreground">{row.capability}</td>
                      <td className="py-4 px-5 text-muted-foreground">{row.staticQr}</td>
                      <td className="py-4 px-5 text-muted-foreground">{row.linkShortener}</td>
                      <td className="py-4 px-5 font-semibold text-foreground">
                        <span className="inline-flex items-center gap-1.5 text-primary">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          {row.nxtqr}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* ================================================= */}
        {/* CLOSING BANNER                                    */}
        {/* ================================================= */}

        <section className="border-b border-border/60 border-b border-border/60 bg-muted/[0.1] text-foreground dark:bg-[#111111] dark:text-[#F7F4EC]">
          <div className="mx-auto max-w-[1380px] px-4 py-16 sm:px-6 sm:py-20 lg:px-8 xl:px-10">
            <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
              <div className="max-w-2xl space-y-2">
                <div className="font-mono text-[7px] font-semibold uppercase tracking-[0.16em] text-primary">
                  READY FOR DEPLOYMENT
                </div>
                <h3 className="font-display text-3xl font-medium sm:text-4xl">
                  Launch mission-critical QR infrastructure today.
                </h3>
                <p className="text-xs text-muted-foreground">
                  Get started with free dynamic assets or book a dedicated architecture review for enterprise packaging.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3 shrink-0">
                <Button asChild className="h-11 rounded-none bg-primary px-6 text-xs font-semibold text-white shadow-md hover:bg-[#E9480B]">
                  <Link href="/login">Start Free Trial</Link>
                </Button>
                <Button asChild variant="outline" className="h-11 rounded-none border-border/80 px-6 text-xs font-medium text-foreground hover:bg-muted/50">
                  <Link href="/contact">Talk to Enterprise Team</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* ================================================= */}
        {/* BOTTOM STRIP                                      */}
        {/* ================================================= */}

        <section className="border-b border-border/60 bg-muted/[0.1]">
          <div className="mx-auto flex max-w-[1380px] flex-col gap-4 px-4 py-7 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8 xl:px-10">
            <div>
              <div className="font-mono text-[7px] uppercase tracking-[0.15em] text-primary">
                NXTQR / INDUSTRY SOLUTIONS
              </div>
              <p className="mt-1 text-[9px] text-muted-foreground">
                Marketing · Retail Packaging · Live Events · Enterprise Governance
              </p>
            </div>

            <div className="flex flex-wrap gap-x-5 gap-y-2">
              <Link href="/pricing" className="text-[9px] text-muted-foreground transition-colors hover:text-primary">
                Pricing & Entitlements
              </Link>
              <Link href="/developers" className="text-[9px] text-muted-foreground transition-colors hover:text-primary">
                Developer APIs
              </Link>
              <Link href="/security" className="text-[9px] text-muted-foreground transition-colors hover:text-primary">
                Security
              </Link>
              <Link href="/status" className="text-[9px] text-muted-foreground transition-colors hover:text-primary">
                Status
              </Link>
            </div>
          </div>
        </section>
      </main>

      <MarketingFooter />
    </div>
  );
}

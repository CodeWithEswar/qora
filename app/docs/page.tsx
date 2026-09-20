"use client";

import * as React from "react";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  CheckCircle2,
  Code2,
  Copy,
  Cpu,
  Database,
  ExternalLink,
  FileCode,
  FileText,
  Fingerprint,
  GitFork,
  Globe2,
  KeyRound,
  Layers,
  LockKeyhole,
  QrCode,
  RefreshCw,
  Search,
  Server,
  ShieldCheck,
  Terminal,
  Webhook,
  Zap,
} from "lucide-react";

import { MarketingHeader } from "@/components/marketing/header";
import { MarketingFooter } from "@/components/marketing/footer";
import { Button } from "@/components/ui/button";
import { BRAND } from "@/config/brand";

const docCategories = [
  {
    id: "getting-started",
    name: "Getting Started",
    icon: Zap,
    articles: [
      { title: "Quickstart: 2-Minute Dynamic QR", time: "3 min", desc: "Generate your first managed QR asset, retrieve edge short-link, and test live redirects." },
      { title: "Understanding 3-Plane Architecture", time: "6 min", desc: "How decoupling control plane, edge resolvers, and telemetry queues guarantees sub-10ms redirects." },
      { title: "Dynamic vs Static QR Tradeoffs", time: "4 min", desc: "Why physical packaging prints require dynamic edge routing to prevent dead URLs." },
    ],
  },
  {
    id: "studio-design",
    name: "NXTQR Studio & Print Calibration",
    icon: QrCode,
    articles: [
      { title: "ISO/IEC 18004 Compliance Guide", time: "8 min", desc: "Mathematical requirements for quiet zones, module density, and minimum 4:1 print contrast ratios." },
      { title: "Vector SVG, PDF & CMYK Color Modes", time: "5 min", desc: "Exporting print-ready assets for large format offset printing, curved bottles, and packaging foil." },
      { title: "Error Correction Levels (L, M, Q, H)", time: "5 min", desc: "Balancing logo embed space against scan speed in dirty, crumpled, or low-light physical environments." },
    ],
  },
  {
    id: "routing-rules",
    name: "Conditional Routing Engine",
    icon: GitFork,
    articles: [
      { title: "Rule Engine Syntax & Evaluator", time: "7 min", desc: "Deep dive into conditional branching operators for iOS, Android, macOS, Windows, and Linux." },
      { title: "Time-Window & Scheduled Shifts", time: "4 min", desc: "Automate hour-by-hour and date-range destination switches without manual dashboard updates." },
      { title: "Geographic Routing (GeoIP at Edge)", time: "6 min", desc: "Route scanners to localized regional websites based on global edge in-memory country codes." },
      { title: "A/B Destination Traffic Splitting", time: "5 min", desc: "Distribute incoming scans across multiple destination variants with deterministic weighted splits." },
    ],
  },
  {
    id: "guardian-health",
    name: "Link Guardian & Failover",
    icon: ShieldCheck,
    articles: [
      { title: "Automated Health Probes & Polling", time: "5 min", desc: "Configuring synthetic HTTP GET/HEAD destination probes, retry backoffs, and timeout thresholds." },
      { title: "Backup Fallback Routing Policies", time: "4 min", desc: "Defining instant failover landing pages when target upstream servers return 4xx or 5xx errors." },
      { title: "Threat Intelligence & Google Safe Browsing", time: "5 min", desc: "Automated quarantines for compromised destination domains to protect brand reputation." },
    ],
  },
  {
    id: "api-webhooks",
    name: "REST API & Webhooks",
    icon: Terminal,
    articles: [
      { title: "Authentication & Scoped API Keys", time: "4 min", desc: "Generating secret bearer tokens with granular permissions (Read, Write, Route Admin, Telemetry)." },
      { title: "Creating QR Assets via REST API", time: "6 min", desc: "Programmatic POST endpoint specifications, payload schemas, and SVG response handling." },
      { title: "Webhook Signatures (HMAC-SHA256)", time: "7 min", desc: "Validating webhook authenticity, timestamp replay defense, and idempotency headers." },
      { title: "Rate Limits & Concurrency Quotas", time: "3 min", desc: "Understanding tier request ceilings, burst handling, and HTTP 429 backoff headers." },
    ],
  },
];

const codeSnippets = {
  curl: `curl -X POST https://nxtqr.vercel.app/api/v1/qrs \\
  -H "Authorization: Bearer nxt_sec_994a8f..." \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "Q4 Direct Mail Promo",
    "destination": "https://brand.com/fall-sale",
    "format": "svg",
    "errorCorrection": "Q",
    "routingRules": [
      { "type": "device", "operator": "eq", "value": "ios", "target": "https://apps.apple.com/app/brand" },
      { "type": "device", "operator": "eq", "value": "android", "target": "https://play.google.com/store/brand" }
    ]
  }'`,
  typescript: `import { NxtqrClient } from "@nxtqr/sdk";

const client = new NxtqrClient({
  apiKey: process.env.NXTQR_API_KEY,
});

const qr = await client.qr.create({
  name: "Q4 Direct Mail Promo",
  destination: "https://brand.com/fall-sale",
  errorCorrection: "Q",
  routingRules: [
    { type: "device", operator: "eq", value: "ios", target: "https://apps.apple.com/app/brand" },
    { type: "device", operator: "eq", value: "android", target: "https://play.google.com/store/brand" },
  ],
});

console.log("Edge Redirect URL:", qr.shortUrl);
console.log("Vector SVG Data:", qr.svgString);`,
  python: `from nxtqr import NxtqrClient

client = NxtqrClient(api_key="nxt_sec_994a8f...")

qr = client.qr.create(
    name="Q4 Direct Mail Promo",
    destination="https://brand.com/fall-sale",
    error_correction="Q",
    routing_rules=[
        {"type": "device", "operator": "eq", "value": "ios", "target": "https://apps.apple.com/app/brand"},
        {"type": "device", "operator": "eq", "value": "android", "target": "https://play.google.com/store/brand"},
    ]
)

print(f"Edge URL: {qr.short_url}")`,
};

export default function DocsPage() {
  const [selectedLanguage, setSelectedLanguage] = React.useState<"curl" | "typescript" | "python">("curl");
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(codeSnippets[selectedLanguage]);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

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
                absolute left-[12%] top-[18%]
                h-[30rem] w-[30rem]
                rounded-full
                bg-primary/[0.045]
                blur-[150px]
              "
            />
            <div
              className="
                absolute right-[10%] top-[20%]
                h-[26rem] w-[26rem]
                rounded-full
                bg-[#FFD06A]/[0.035]
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
                  <BookOpen className="h-3 w-3" />
                </span>

                Technical Documentation & Reference

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
                Architecture guides,
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
                  APIs, and edge specs.
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
                Complete technical guides for engineering teams, print designers, and system administrators.
                Learn how to calibrate vector QR geometries, program conditional edge routing rules,
                listen to signed webhook streams, and configure Link Guardian failovers.
              </p>
            </div>

            {/* Quick doc metadata rail */}
            <div className="grid border-t border-border/60 sm:grid-cols-4">
              <div className="border-b border-border/60 py-4 sm:border-b-0 sm:border-r sm:px-5 sm:first:pl-0">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[7px] tracking-[0.14em] text-muted-foreground">API VERSION</span>
                  <Code2 className="h-3 w-3 text-primary" />
                </div>
                <div className="mt-2 text-[9px] font-semibold text-foreground">v1 (REST / OpenAPI 3.1)</div>
              </div>

              <div className="border-b border-border/60 py-4 sm:border-b-0 sm:border-r sm:px-5">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[7px] tracking-[0.14em] text-muted-foreground">EDGE LATENCY</span>
                  <Zap className="h-3 w-3 text-primary" />
                </div>
                <div className="mt-2 text-[9px] font-semibold text-foreground">sub-10ms Globally</div>
              </div>

              <div className="border-b border-border/60 py-4 sm:border-b-0 sm:border-r sm:px-5">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[7px] tracking-[0.14em] text-muted-foreground">QR STANDARD</span>
                  <QrCode className="h-3 w-3 text-primary" />
                </div>
                <div className="mt-2 text-[9px] font-semibold text-foreground">ISO/IEC 18004:2015</div>
              </div>

              <div className="py-4 sm:px-5">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[7px] tracking-[0.14em] text-muted-foreground">OFFICIAL SDKS</span>
                  <Terminal className="h-3 w-3 text-primary" />
                </div>
                <div className="mt-2 text-[9px] font-semibold text-foreground">TypeScript, Python, Go</div>
              </div>
            </div>
          </div>
        </section>

        {/* ================================================= */}
        {/* INTERACTIVE CODE QUICKSTART                       */}
        {/* ================================================= */}

        <section className="border-b border-border/60 bg-muted/[0.08]">
          <div className="mx-auto max-w-[1380px] px-4 py-14 sm:px-6 lg:px-8 lg:py-18 xl:px-10">
            <div className="grid gap-8 lg:grid-cols-[1fr_1.3fr] lg:items-center">
              <div>
                <div className="font-mono text-[7px] font-semibold uppercase tracking-[0.16em] text-primary">
                  DEVELOPER QUICKSTART
                </div>
                <h2 className="mt-2 font-display text-2xl font-medium tracking-[-0.03em] sm:text-3xl">
                  Create a dynamic QR via API in 3 lines of code.
                </h2>
                <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
                  Our API returns both clean vector geometry for physical print embedding and a sub-10ms
                  short resolution URL. Update the destination target programmatically anytime without touching the print.
                </p>

                <div className="mt-6 space-y-2.5">
                  <div className="flex items-center gap-2 text-xs text-foreground">
                    <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                    <span>Instant vector SVG, EPS & CMYK raster payloads</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-foreground">
                    <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                    <span>Inline device & geographic conditional routing rule arrays</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-foreground">
                    <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                    <span>Automatic Link Guardian health probe initialization</span>
                  </div>
                </div>

                <div className="mt-8 flex gap-3">
                  <Button asChild className="h-10 rounded-none bg-primary px-5 text-xs font-semibold text-white hover:bg-[#E9480B]">
                    <Link href="/developers">Explore API Reference</Link>
                  </Button>
                  <Button asChild variant="outline" className="h-10 rounded-none border-border/80 px-5 text-xs font-medium">
                    <Link href="/login">Generate API Keys</Link>
                  </Button>
                </div>
              </div>

              {/* Code Terminal */}
              <div className="overflow-hidden border border-border/70 bg-[#0F0F0F] text-[#F7F4EC] shadow-2xl">
                {/* Tab Header */}
                <div className="flex items-center justify-between border-b border-white/10 bg-white/[0.04] px-4 py-2.5">
                  <div className="flex items-center gap-2">
                    {(["curl", "typescript", "python"] as const).map((lang) => (
                      <button
                        key={lang}
                        onClick={() => setSelectedLanguage(lang)}
                        className={`
                          font-mono text-[8px] uppercase tracking-wider px-2.5 py-1 transition-colors
                          ${selectedLanguage === lang ? "bg-primary text-white font-bold" : "text-muted-foreground hover:text-white"}
                        `}
                      >
                        {lang}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-1.5 font-mono text-[7px] text-muted-foreground hover:text-white transition-colors"
                  >
                    <Copy className="h-3 w-3" />
                    <span>{copied ? "COPIED" : "COPY CODE"}</span>
                  </button>
                </div>

                <pre className="p-5 font-mono text-[11px] leading-relaxed overflow-x-auto text-emerald-400">
                  <code>{codeSnippets[selectedLanguage]}</code>
                </pre>
              </div>
            </div>
          </div>
        </section>

        {/* ================================================= */}
        {/* DOCUMENTATION CATEGORIES                          */}
        {/* ================================================= */}

        <section className="border-b border-border/60">
          <div className="mx-auto max-w-[1380px] px-4 py-16 sm:px-6 lg:px-8 lg:py-20 xl:px-10 space-y-16">
            <div>
              <div className="font-mono text-[7px] font-semibold uppercase tracking-[0.16em] text-primary">
                KNOWLEDGE BASE
              </div>
              <h2 className="mt-2 font-display text-3xl font-medium tracking-tight text-foreground sm:text-4xl">
                Explore guides by category.
              </h2>
              <p className="mt-1 max-w-[620px] text-xs text-muted-foreground">
                In-depth documentation covering everything from physical packaging print specs to edge routing algorithms.
              </p>
            </div>

            <div className="space-y-12">
              {docCategories.map((category) => {
                const Icon = category.icon;
                return (
                  <div key={category.id} className="space-y-4">
                    <div className="flex items-center gap-3 border-b border-border/60 pb-3">
                      <div className="flex h-7 w-7 items-center justify-center border border-primary/30 bg-primary/10 text-primary">
                        <Icon className="h-3.5 w-3.5" />
                      </div>
                      <h3 className="font-display text-xl font-medium text-foreground">
                        {category.name}
                      </h3>
                      <span className="font-mono text-[8px] text-muted-foreground ml-auto">
                        {category.articles.length} Guides
                      </span>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      {category.articles.map((art) => (
                        <div
                          key={art.title}
                          className="group border border-border/70 bg-card p-5 space-y-3 hover:border-primary/50 transition-all flex flex-col justify-between"
                        >
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="font-mono text-[7px] text-primary font-semibold uppercase tracking-wider">
                                ARTICLE
                              </span>
                              <span className="font-mono text-[7px] text-muted-foreground">
                                {art.time}
                              </span>
                            </div>
                            <h4 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                              {art.title}
                            </h4>
                            <p className="text-[11px] leading-5 text-muted-foreground">
                              {art.desc}
                            </p>
                          </div>

                          <div className="pt-3 border-t border-border/60 flex items-center justify-between text-[9px] font-semibold text-primary">
                            <span>Read Technical Guide</span>
                            <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
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
                NXTQR / DOCUMENTATION PORTAL
              </div>
              <p className="mt-1 text-[9px] text-muted-foreground">
                Guides, API specs, print calibration, and routing syntax.
              </p>
            </div>

            <div className="flex flex-wrap gap-x-5 gap-y-2">
              <Link href="/developers" className="text-[9px] text-muted-foreground transition-colors hover:text-primary">
                Developer APIs
              </Link>
              <Link href="/security" className="text-[9px] text-muted-foreground transition-colors hover:text-primary">
                Security Architecture
              </Link>
              <Link href="/status" className="text-[9px] text-muted-foreground transition-colors hover:text-primary">
                Status Board
              </Link>
              <Link href="/contact" className="text-[9px] text-muted-foreground transition-colors hover:text-primary">
                Technical Support
              </Link>
            </div>
          </div>
        </section>
      </main>

      <MarketingFooter />
    </div>
  );
}

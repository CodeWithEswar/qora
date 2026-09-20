"use client";

import * as React from "react";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Calendar,
  CheckCircle2,
  Clock,
  Code2,
  Cpu,
  Database,
  EyeOff,
  FileText,
  Fingerprint,
  GitFork,
  Globe2,
  HardDrive,
  Layers,
  Mail,
  Newspaper,
  QrCode,
  Radio,
  Rss,
  Search,
  Server,
  ShieldCheck,
  Sparkles,
  Terminal,
  Zap,
} from "lucide-react";

import { MarketingHeader } from "@/components/marketing/header";
import { MarketingFooter } from "@/components/marketing/footer";
import { Button } from "@/components/ui/button";
import { BRAND } from "@/config/brand";

const categories = ["All", "Architecture", "Print Mathematics", "Security & Privacy", "Edge Performance"];

const articles = [
  {
    slug: "decoupled-3-plane-architecture",
    title: "Why Dynamic QR Codes Require a Decoupled 3-Plane Architecture",
    excerpt:
      "How isolating the control plane, global edge data plane, and asynchronous telemetry ingestion guarantees sub-10ms redirect latency without risk of cascading origin failure.",
    author: "Elena Rostova",
    role: "Principal Infrastructure Architect",
    date: "September 14, 2026",
    readTime: "7 min read",
    category: "Architecture",
    featured: true,
    tags: ["Edge Resolvers", "KV Snapshots", "V8 Isolates", "High Availability"],
  },
  {
    slug: "iso-iec-18004-compliance",
    title: "ISO/IEC 18004 Compliance: The Mathematics of QR Scanability",
    excerpt:
      "Understanding quiet zones, module density, print contrast thresholds, and optical reflectance to ensure physical packaging scans instantly under curved glass and low-light shelf conditions.",
    author: "Marcus Vance",
    role: "Head of Optical Design",
    date: "August 28, 2026",
    readTime: "9 min read",
    category: "Print Mathematics",
    featured: false,
    tags: ["ISO Standard", "Reed-Solomon", "Contrast Ratio", "Packaging CPG"],
  },
  {
    slug: "privacy-preserving-scan-analytics",
    title: "Privacy-Preserving Scan Analytics without Storing Raw IP Addresses",
    excerpt:
      "How daily-rotated cryptographic salts and coarse in-memory GeoIP resolution satisfy GDPR Article 5 data minimization while maintaining high-fidelity marketing campaign attribution.",
    author: "Dr. Aris Thorne",
    role: "Chief Cryptographer",
    date: "August 12, 2026",
    readTime: "6 min read",
    category: "Security & Privacy",
    featured: false,
    tags: ["GDPR", "Salted Hashes", "Zero Raw IP", "Data Minimization"],
  },
  {
    slug: "link-guardian-synthetic-probes",
    title: "Link Guardian: Detecting Broken Target Endpoints Before Customers Do",
    excerpt:
      "Deploying distributed synthetic HTTP/TLS probes across 12 edge regions to catch 404s, expired SSL certificates, and malicious takeovers with automated backup failovers.",
    author: "Siddharth Nair",
    role: "Edge Operations Lead",
    date: "July 30, 2026",
    readTime: "5 min read",
    category: "Architecture",
    featured: false,
    tags: ["Synthetic Probes", "Failover Routing", "SSL Monitoring"],
  },
  {
    slug: "sub-10ms-edge-redirects",
    title: "Benchmarking 10 Million Scans: Eliminating Redirect Latency at the Edge",
    excerpt:
      "A deep dive into distributed routing caches, HTTP/3 0-RTT handshakes, and regional edge memory allocation under massive direct mail scan surges.",
    author: "Elena Rostova",
    role: "Principal Infrastructure Architect",
    date: "July 15, 2026",
    readTime: "8 min read",
    category: "Edge Performance",
    featured: false,
    tags: ["Benchmarking", "HTTP/3", "Edge Routing", "Latency Optimization"],
  },
  {
    slug: "enterprise-rbac-brand-governance",
    title: "Centralized Brand Kits & 4-Eye Approval Flows in Multi-Tenant SaaS",
    excerpt:
      "How enterprise marketing organizations enforce strict brand hex guidelines, vector logo placement, and mandatory review gates across 50+ global subsidiary teams.",
    author: "Marcus Vance",
    role: "Head of Optical Design",
    date: "June 29, 2026",
    readTime: "6 min read",
    category: "Architecture",
    featured: false,
    tags: ["RBAC", "Brand Kit", "Enterprise SaaS", "Audit Trails"],
  },
];

export default function BlogPage() {
  const [selectedCategory, setSelectedCategory] = React.useState("All");
  const [searchQuery, setSearchQuery] = React.useState("");

  const filteredArticles = articles.filter((art) => {
    const matchesCategory = selectedCategory === "All" || art.category === selectedCategory;
    const matchesSearch =
      art.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      art.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      art.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const featuredPost = articles.find((a) => a.featured) || articles[0];

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
                absolute left-[12%] top-[15%]
                h-[30rem] w-[30rem]
                rounded-full
                bg-primary/[0.045]
                blur-[150px]
              "
            />
            <div
              className="
                absolute right-[10%] top-[25%]
                h-[28rem] w-[28rem]
                rounded-full
                bg-[#FF8A00]/[0.035]
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
                  <Newspaper className="h-3 w-3" />
                </span>

                Engineering & Research Publication

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
                Architecture,
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
                  algorithms, & edge specs.
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
                Deep technical dives from the engineers building {BRAND.name}.
                Read our research on sub-10ms redirect topography, ISO 18004 optical scanability,
                and zero-trust data minimization.
              </p>
            </div>

            {/* Publication metadata rail */}
            <div className="grid border-t border-border/60 sm:grid-cols-3">
              <div className="border-b border-border/60 py-4 sm:border-b-0 sm:border-r sm:px-5 sm:first:pl-0">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[7px] tracking-[0.14em] text-muted-foreground">PUBLICATION</span>
                  <BookOpen className="h-3 w-3 text-primary" />
                </div>
                <div className="mt-2 text-[9px] font-semibold text-foreground">NXTQR Engineering Blog</div>
              </div>

              <div className="border-b border-border/60 py-4 sm:border-b-0 sm:border-r sm:px-5">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[7px] tracking-[0.14em] text-muted-foreground">TOPICS</span>
                  <Cpu className="h-3 w-3 text-primary" />
                </div>
                <div className="mt-2 text-[9px] font-semibold text-foreground">Edge Routing · Cryptography · Optics</div>
              </div>

              <div className="py-4 sm:px-5">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[7px] tracking-[0.14em] text-muted-foreground">CADENCE</span>
                  <Rss className="h-3 w-3 text-primary" />
                </div>
                <div className="mt-2 text-[9px] font-semibold text-foreground">Bi-Weekly Technical Reports</div>
              </div>
            </div>
          </div>
        </section>

        {/* ================================================= */}
        {/* FEATURED ARTICLE HERO CARD                        */}
        {/* ================================================= */}

        <section className="border-b border-border/60 bg-muted/[0.08]">
          <div className="mx-auto max-w-[1380px] px-4 py-12 sm:px-6 lg:px-8 xl:px-10">
            <div className="border border-border/70 bg-card p-6 sm:p-10 lg:p-12 hover:border-primary/40 transition-all">
              <div className="flex flex-wrap items-center gap-3 text-[9px] font-mono">
                <span className="border border-primary/30 bg-primary/10 px-2 py-0.5 font-semibold text-primary uppercase tracking-wider">
                  FEATURED DEEP DIVE
                </span>
                <span className="text-muted-foreground">{featuredPost.category}</span>
                <span className="text-muted-foreground">•</span>
                <span className="text-muted-foreground">{featuredPost.date}</span>
                <span className="text-muted-foreground">•</span>
                <span className="text-muted-foreground">{featuredPost.readTime}</span>
              </div>

              <h2 className="mt-5 font-display text-2xl font-medium tracking-tight text-foreground sm:text-3xl lg:text-4xl max-w-4xl">
                {featuredPost.title}
              </h2>

              <p className="mt-4 max-w-3xl text-sm leading-7 text-muted-foreground">
                {featuredPost.excerpt}
              </p>

              <div className="mt-6 flex flex-wrap gap-2">
                {featuredPost.tags.map((tag) => (
                  <span key={tag} className="border border-border/80 bg-background/60 px-2 py-1 font-mono text-[8px] text-muted-foreground">
                    #{tag}
                  </span>
                ))}
              </div>

              <div className="mt-8 flex flex-col gap-4 border-t border-border/60 pt-6 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full border border-primary/30 bg-primary/10 font-mono text-xs font-semibold text-primary">
                    ER
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-foreground">{featuredPost.author}</div>
                    <div className="text-[10px] text-muted-foreground">{featuredPost.role}</div>
                  </div>
                </div>

                <Button asChild className="h-10 rounded-none bg-primary px-5 text-xs font-semibold text-white hover:bg-[#E9480B]">
                  <Link href={`/blog#${featuredPost.slug}`}>
                    Read Full Technical Report
                    <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* ================================================= */}
        {/* ARTICLES GRID & FILTER                            */}
        {/* ================================================= */}

        <section className="border-b border-border/60">
          <div className="mx-auto max-w-[1380px] px-4 py-16 sm:px-6 lg:px-8 lg:py-20 xl:px-10 space-y-10">
            {/* Filter and Search Bar */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex flex-wrap items-center gap-2">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`
                      border px-3.5 py-1.5 font-mono text-[9px] uppercase tracking-wider transition-all
                      ${
                        selectedCategory === cat
                          ? "border-primary bg-primary/10 text-primary font-bold"
                          : "border-border/70 text-muted-foreground hover:border-border"
                      }
                    `}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <div className="relative w-full max-w-xs">
                <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search articles & tags..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full border border-border/80 bg-background pl-9 pr-3.5 py-1.5 text-xs text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none font-mono"
                />
              </div>
            </div>

            {/* Articles Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredArticles.map((art) => (
                <article
                  key={art.slug}
                  id={art.slug}
                  className="group flex flex-col justify-between border border-border/70 bg-card p-6 hover:border-primary/50 transition-all scroll-mt-32"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-[8px] font-mono text-muted-foreground">
                      <span className="text-primary font-semibold uppercase">{art.category}</span>
                      <span>{art.readTime}</span>
                    </div>

                    <h3 className="font-display text-lg font-semibold text-foreground group-hover:text-primary transition-colors leading-snug">
                      {art.title}
                    </h3>

                    <p className="text-xs leading-relaxed text-muted-foreground">
                      {art.excerpt}
                    </p>

                    <div className="flex flex-wrap gap-1.5 pt-2">
                      {art.tags.slice(0, 3).map((tag) => (
                        <span key={tag} className="border border-border/60 bg-muted/[0.08] px-1.5 py-0.5 font-mono text-[7px] text-muted-foreground">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-border/60 flex items-center justify-between text-[9px]">
                    <div className="text-muted-foreground font-mono">
                      <span>{art.author}</span> · <span>{art.date}</span>
                    </div>
                    <ArrowUpRight className="h-3.5 w-3.5 text-primary transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </div>
                </article>
              ))}
            </div>

            {filteredArticles.length === 0 && (
              <div className="border border-dashed border-border/80 p-12 text-center text-muted-foreground">
                <p className="text-sm">No engineering reports match your criteria.</p>
                <button
                  onClick={() => { setSelectedCategory("All"); setSearchQuery(""); }}
                  className="mt-3 text-xs text-primary underline"
                >
                  Clear search filters
                </button>
              </div>
            )}
          </div>
        </section>

        {/* ================================================= */}
        {/* ENGINEERING NEWSLETTER STRIP                      */}
        {/* ================================================= */}

        <section className="border-b border-border/60 border-b border-border/60 bg-muted/[0.1] text-foreground dark:bg-[#111111] dark:text-[#F7F4EC]">
          <div className="mx-auto max-w-[1380px] px-4 py-16 sm:px-6 lg:px-8 xl:px-10">
            <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
              <div className="max-w-xl space-y-2">
                <div className="font-mono text-[7px] font-semibold uppercase tracking-[0.16em] text-primary">
                  ENGINEERING DISPATCH
                </div>
                <h3 className="font-display text-3xl font-medium sm:text-4xl">
                  Subscribe to edge architecture briefs.
                </h3>
                <p className="text-xs text-muted-foreground">
                  No marketing spam. Only in-depth technical reports on distributed DNS, QR optical mathematics, and RFC proposals.
                </p>
              </div>

              <form onSubmit={(e) => { e.preventDefault(); alert("Subscribed to NXTQR Engineering Dispatch."); }} className="flex w-full max-w-md gap-2">
                <input
                  type="email"
                  required
                  placeholder="engineer@company.com"
                  className="flex-1 border border-border/80 bg-background px-4 py-2.5 text-xs text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none font-mono dark:bg-white/[0.06] dark:text-white dark:border-white/20"
                />
                <Button type="submit" className="rounded-none bg-primary px-5 text-xs font-semibold text-white hover:bg-[#E9480B]">
                  Subscribe
                </Button>
              </form>
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
                NXTQR / ENGINEERING PUBLICATIONS
              </div>
              <p className="mt-1 text-[9px] text-muted-foreground">
                Authored by the NXTQR Infrastructure, Optics, and Cryptography teams.
              </p>
            </div>

            <div className="flex flex-wrap gap-x-5 gap-y-2">
              <Link href="/docs" className="text-[9px] text-muted-foreground transition-colors hover:text-primary">
                Documentation
              </Link>
              <Link href="/developers" className="text-[9px] text-muted-foreground transition-colors hover:text-primary">
                API Reference
              </Link>
              <Link href="/security" className="text-[9px] text-muted-foreground transition-colors hover:text-primary">
                Security Architecture
              </Link>
              <Link href="/status" className="text-[9px] text-muted-foreground transition-colors hover:text-primary">
                Edge Status
              </Link>
            </div>
          </div>
        </section>
      </main>

      <MarketingFooter />
    </div>
  );
}

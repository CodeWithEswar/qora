"use client";

import * as React from "react";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  Building2,
  CheckCircle2,
  Clock3,
  Globe2,
  HelpCircle,
  Mail,
  MapPin,
  MessageSquare,
  Radio,
  Send,
  Server,
  ShieldCheck,
  Sparkles,
  Zap,
} from "lucide-react";

import { MarketingHeader } from "@/components/marketing/header";
import { MarketingFooter } from "@/components/marketing/footer";
import { Button } from "@/components/ui/button";
import { BRAND } from "@/config/brand";

const channels = [
  {
    id: "sales",
    title: "Enterprise Solutions & Sales",
    description:
      "Consultation on high-volume dynamic QR deployments, custom SLAs, dedicated IP pools, and volume pricing.",
    email: "sales@nxtqr.io",
    response: "< 4 hours (Business days)",
    icon: Zap,
    popular: true,
  },
  {
    id: "support",
    title: "Technical & Developer Support",
    description:
      "Assistance with REST APIs, webhook signature verification, dynamic routing rules, and edge resolution diagnostics.",
    email: "support@nxtqr.io",
    response: "24/7 Priority for Pro & Enterprise",
    icon: Server,
    popular: false,
  },
  {
    id: "security",
    title: "Security & Legal Compliance",
    description:
      "SOC2 Type II reports, Data Processing Agreements (DPA), vulnerability disclosure, and privacy inquiries.",
    email: "security@nxtqr.io",
    response: "< 12 hours",
    icon: ShieldCheck,
    popular: false,
  },
];

const edgePops = [
  { region: "North America", cities: "San Jose, Ashburn, Chicago, Dallas, Seattle", latency: "sub-6ms" },
  { region: "Europe", cities: "Frankfurt, London, Amsterdam, Paris, Stockholm", latency: "sub-8ms" },
  { region: "Asia Pacific", cities: "Tokyo, Singapore, Sydney, Hong Kong, Mumbai", latency: "sub-9ms" },
  { region: "South America & Africa", cities: "São Paulo, Santiago, Johannesburg", latency: "sub-14ms" },
];

export default function ContactPage() {
  const [selectedCategory, setSelectedCategory] = React.useState("sales");
  const [isSubmitted, setIsSubmitted] = React.useState(false);
  const [formData, setFormData] = React.useState({
    name: "",
    email: "",
    organization: "",
    monthlyScans: "10k-100k",
    message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
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
                absolute left-[15%] top-[15%]
                h-[30rem] w-[30rem]
                rounded-full
                bg-primary/[0.05]
                blur-[150px]
              "
            />
            <div
              className="
                absolute right-[10%] top-[25%]
                h-[26rem] w-[26rem]
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
                  <Mail className="h-3 w-3" />
                </span>

                Direct Communications

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
                Connect with the
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
                  infrastructure team.
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
                Whether planning global product packaging rollouts, configuring multi-tenant
                enterprise governance, or requiring mission-critical routing reliability,
                our engineering and solutions team is available worldwide.
              </p>
            </div>

            {/* Quick stats strip */}
            <div className="grid border-t border-border/60 sm:grid-cols-3">
              <div className="border-b border-border/60 py-4 sm:border-b-0 sm:border-r sm:px-5 sm:first:pl-0">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[7px] tracking-[0.14em] text-muted-foreground">
                    AVERAGE RESPONSE
                  </span>
                  <Clock3 className="h-3 w-3 text-primary" />
                </div>
                <div className="mt-2 text-[9px] font-semibold text-foreground">
                  Under 4 Hours
                </div>
              </div>

              <div className="border-b border-border/60 py-4 sm:border-b-0 sm:border-r sm:px-5">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[7px] tracking-[0.14em] text-muted-foreground">
                    EDGE RESOLUTION SLA
                  </span>
                  <Zap className="h-3 w-3 text-primary" />
                </div>
                <div className="mt-2 text-[9px] font-semibold text-foreground">
                  99.99% Availability
                </div>
              </div>

              <div className="py-4 sm:px-5">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[7px] tracking-[0.14em] text-muted-foreground">
                    GLOBAL POPS
                  </span>
                  <Globe2 className="h-3 w-3 text-primary" />
                </div>
                <div className="mt-2 text-[9px] font-semibold text-foreground">
                  310+ Edge Cities
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ================================================= */}
        {/* CONTACT CHANNELS & FORM                           */}
        {/* ================================================= */}

        <section className="border-b border-border/60">
          <div className="mx-auto max-w-[1380px] px-4 py-14 sm:px-6 lg:px-8 lg:py-20 xl:px-10">
            <div className="grid gap-12 lg:grid-cols-[1fr_1.15fr]">
              {/* Left Column: Specialized Channels */}
              <div className="space-y-6">
                <div>
                  <div className="font-mono text-[7px] font-semibold uppercase tracking-[0.16em] text-primary">
                    DIRECT ROUTING
                  </div>
                  <h2 className="mt-2 font-display text-2xl font-medium tracking-[-0.03em] sm:text-3xl">
                    Dedicated support channels.
                  </h2>
                  <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                    Choose the channel best suited for your inquiry to ensure rapid routing
                    to the responsible domain specialist.
                  </p>
                </div>

                <div className="space-y-4">
                  {channels.map((channel) => {
                    const Icon = channel.icon;
                    const isSelected = selectedCategory === channel.id;

                    return (
                      <div
                        key={channel.id}
                        onClick={() => setSelectedCategory(channel.id)}
                        className={`
                          group relative cursor-pointer border p-5 transition-all
                          ${
                            isSelected
                              ? "border-primary bg-primary/[0.04] shadow-sm"
                              : "border-border/70 bg-card hover:border-border"
                          }
                        `}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div
                              className={`
                                flex h-9 w-9 items-center justify-center border
                                ${
                                  isSelected
                                    ? "border-primary/40 bg-primary/10 text-primary"
                                    : "border-border/80 bg-background text-muted-foreground group-hover:text-primary"
                                }
                              `}
                            >
                              <Icon className="h-4 w-4" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h3 className="text-sm font-semibold text-foreground">
                                  {channel.title}
                                </h3>
                                {channel.popular && (
                                  <span className="border border-primary/30 bg-primary/10 px-1.5 py-0.5 font-mono text-[7px] uppercase tracking-wider text-primary">
                                    Primary
                                  </span>
                                )}
                              </div>
                              <span className="font-mono text-[9px] text-primary">
                                {channel.email}
                              </span>
                            </div>
                          </div>

                          <div className="text-right">
                            <span className="font-mono text-[7px] uppercase tracking-wider text-muted-foreground">
                              Target response
                            </span>
                            <div className="font-mono text-[8px] text-foreground">
                              {channel.response}
                            </div>
                          </div>
                        </div>

                        <p className="mt-3 text-[11px] leading-5 text-muted-foreground">
                          {channel.description}
                        </p>
                      </div>
                    );
                  })}
                </div>

                {/* Status Callout Box */}
                <div className="border border-border/70 bg-muted/[0.08] p-5">
                  <div className="flex items-start gap-3">
                    <Radio className="mt-0.5 h-4 w-4 text-emerald-500" />
                    <div>
                      <h4 className="text-xs font-semibold text-foreground">
                        Need Real-Time Incident Status?
                      </h4>
                      <p className="mt-1 text-[10px] leading-relaxed text-muted-foreground">
                        Check our distributed edge status board for real-time telemetry,
                        active maintenance schedules, and global component availability.
                      </p>
                      <Link
                        href="/status"
                        className="mt-3 inline-flex items-center gap-1.5 text-[9px] font-semibold text-primary hover:underline"
                      >
                        <span>View System Status</span>
                        <ArrowUpRight className="h-3 w-3" />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Interactive Consultation Form */}
              <div className="border border-border/70 bg-card p-6 sm:p-8 lg:p-10">
                {isSubmitted ? (
                  <div className="flex min-h-[460px] flex-col items-center justify-center text-center">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-500">
                      <CheckCircle2 className="h-7 w-7" />
                    </div>
                    <h3 className="mt-6 font-display text-2xl font-medium text-foreground">
                      Message Dispatched to {channels.find((c) => c.id === selectedCategory)?.title}
                    </h3>
                    <p className="mt-2 max-w-[420px] text-xs leading-relaxed text-muted-foreground">
                      Thank you, {formData.name || "Customer"}. Our solutions team has logged your inquiry.
                      Expect our technical response within our documented SLA.
                    </p>
                    <Button
                      onClick={() => setIsSubmitted(false)}
                      variant="outline"
                      size="sm"
                      className="mt-8 text-xs"
                    >
                      Send Another Inquiry
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                      <div className="font-mono text-[7px] font-semibold uppercase tracking-[0.16em] text-primary">
                        TRANSMISSION CONSOLE
                      </div>
                      <h3 className="mt-1 font-display text-xl font-medium text-foreground sm:text-2xl">
                        Send a detailed inquiry
                      </h3>
                      <p className="mt-1 text-[11px] text-muted-foreground">
                        All transmissions are encrypted and dispatched directly to engineering.
                      </p>
                    </div>

                    {/* Inquiry Type Tabs */}
                    <div>
                      <label className="block font-mono text-[8px] uppercase tracking-wider text-muted-foreground mb-2">
                        Inquiry Category
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {channels.map((c) => (
                          <button
                            key={c.id}
                            type="button"
                            onClick={() => setSelectedCategory(c.id)}
                            className={`
                              border px-3 py-2 text-left font-mono text-[8px] uppercase tracking-wider transition-all
                              ${
                                selectedCategory === c.id
                                  ? "border-primary bg-primary/10 text-primary font-bold"
                                  : "border-border/70 text-muted-foreground hover:border-border"
                              }
                            `}
                          >
                            {c.id}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className="block font-mono text-[8px] uppercase tracking-wider text-muted-foreground mb-1.5">
                          Full Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          placeholder="e.g. Jordan Miller"
                          className="w-full border border-border/80 bg-background/60 px-3.5 py-2.5 text-xs text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block font-mono text-[8px] uppercase tracking-wider text-muted-foreground mb-1.5">
                          Business Email *
                        </label>
                        <input
                          type="email"
                          required
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          placeholder="jordan@company.com"
                          className="w-full border border-border/80 bg-background/60 px-3.5 py-2.5 text-xs text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className="block font-mono text-[8px] uppercase tracking-wider text-muted-foreground mb-1.5">
                          Organization / Company
                        </label>
                        <input
                          type="text"
                          value={formData.organization}
                          onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                          placeholder="Acme Global Inc."
                          className="w-full border border-border/80 bg-background/60 px-3.5 py-2.5 text-xs text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block font-mono text-[8px] uppercase tracking-wider text-muted-foreground mb-1.5">
                          Estimated Monthly Scans
                        </label>
                        <select
                          value={formData.monthlyScans}
                          onChange={(e) => setFormData({ ...formData, monthlyScans: e.target.value })}
                          className="w-full border border-border/80 bg-background px-3.5 py-2.5 text-xs text-foreground focus:border-primary focus:outline-none"
                        >
                          <option value="under-10k">&lt; 10,000 / month</option>
                          <option value="10k-100k">10,000 – 100,000 / month</option>
                          <option value="100k-1m">100,000 – 1,000,000 / month</option>
                          <option value="1m+">1,000,000+ / month (Enterprise)</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block font-mono text-[8px] uppercase tracking-wider text-muted-foreground mb-1.5">
                        Technical Requirements or Message *
                      </label>
                      <textarea
                        required
                        rows={5}
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        placeholder="Describe your use case: e.g. physical packaging print run, conditional routing rules by country, white-label vanity domain requirements..."
                        className="w-full border border-border/80 bg-background/60 p-3.5 text-xs text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none leading-relaxed"
                      />
                    </div>

                    <Button
                      type="submit"
                      className="w-full gap-2 rounded-none bg-primary py-6 text-xs font-semibold text-white shadow-md hover:bg-[#E9480B]"
                    >
                      <Send className="h-3.5 w-3.5" />
                      <span>Transmit Message to {channels.find((c) => c.id === selectedCategory)?.title}</span>
                    </Button>

                    <p className="text-center font-mono text-[7px] text-muted-foreground">
                      Submissions are governed by our{" "}
                      <Link href="/privacy" className="text-primary hover:underline">
                        Privacy Policy
                      </Link>{" "}
                      and encrypted in transit via TLS 1.3.
                    </p>
                  </form>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* ================================================= */}
        {/* GLOBAL EDGE POP PRESENCE                          */}
        {/* ================================================= */}

        <section className="border-b border-border/60 bg-muted/[0.08]">
          <div className="mx-auto max-w-[1380px] px-4 py-14 sm:px-6 lg:px-8 lg:py-20 xl:px-10">
            <div className="mb-8">
              <div className="font-mono text-[7px] font-semibold uppercase tracking-[0.16em] text-primary">
                GLOBAL REACH
              </div>
              <h2 className="mt-2 font-display text-2xl font-medium tracking-[-0.03em] sm:text-3xl">
                Edge routing regions & points of presence.
              </h2>
              <p className="mt-1 max-w-[620px] text-xs text-muted-foreground">
                Our redirect resolution plane runs across 310+ edge locations worldwide,
                ensuring sub-10ms scans wherever physical QR codes are read.
              </p>
            </div>

            <div className="grid gap-px overflow-hidden border border-border/70 bg-border/60 sm:grid-cols-2 lg:grid-cols-4">
              {edgePops.map((pop, idx) => (
                <div key={pop.region} className="bg-background p-6 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[7px] text-muted-foreground">0{idx + 1}</span>
                    <span className="font-mono text-[7px] font-semibold text-emerald-600 dark:text-emerald-400">
                      {pop.latency}
                    </span>
                  </div>
                  <h3 className="text-sm font-semibold text-foreground">{pop.region}</h3>
                  <p className="text-[10px] leading-5 text-muted-foreground">{pop.cities}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ================================================= */}
        {/* BOTTOM QUICK STRIP                                */}
        {/* ================================================= */}

        <section className="border-b border-border/60 bg-muted/[0.1]">
          <div className="mx-auto flex max-w-[1380px] flex-col gap-4 px-4 py-7 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8 xl:px-10">
            <div>
              <div className="font-mono text-[7px] uppercase tracking-[0.15em] text-primary">
                NXTQR / CONTACT & INQUIRIES
              </div>
              <p className="mt-1 text-[9px] text-muted-foreground">
                San Francisco, CA & Global Edge Network
              </p>
            </div>

            <div className="flex flex-wrap gap-x-5 gap-y-2">
              <Link href="/terms" className="text-[9px] text-muted-foreground transition-colors hover:text-primary">
                Terms of Service
              </Link>
              <Link href="/privacy" className="text-[9px] text-muted-foreground transition-colors hover:text-primary">
                Privacy Policy
              </Link>
              <Link href="/security" className="text-[9px] text-muted-foreground transition-colors hover:text-primary">
                Security Architecture
              </Link>
              <Link href="/status" className="text-[9px] text-muted-foreground transition-colors hover:text-primary">
                System Status
              </Link>
            </div>
          </div>
        </section>
      </main>

      <MarketingFooter />
    </div>
  );
}

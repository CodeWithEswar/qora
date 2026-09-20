import * as React from "react";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Security",
  description:
    "Explore NXTQR zero-trust security architecture, three-plane isolation, cryptographic standards, and governance policies.",
};
import {
  Activity,
  ArrowUpRight,
  CheckCircle2,
  Clock3,
  Cpu,
  Database,
  EyeOff,
  FileCheck,
  FileText,
  Fingerprint,
  Globe2,
  HardDrive,
  KeyRound,
  LockKeyhole,
  Mail,
  Network,
  Radio,
  RefreshCw,
  Scale,
  Server,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Terminal,
  UserCheck,
  Users,
  Zap,
} from "lucide-react";

import { MarketingHeader } from "@/components/marketing/header";
import { MarketingFooter } from "@/components/marketing/footer";
import { BRAND } from "@/config/brand";

const sections = [
  { id: "overview", label: "Zero-trust model" },
  { id: "three-plane", label: "3-plane isolation" },
  { id: "encryption", label: "Cryptographic standards" },
  { id: "telemetry", label: "Privacy-first telemetry" },
  { id: "threat-defense", label: "Link Guardian probes" },
  { id: "access-control", label: "RBAC & permissions" },
  { id: "sso-identity", label: "SSO, SAML & SCIM" },
  { id: "infrastructure", label: "DDoS & edge resilience" },
  { id: "compliance", label: "Compliance & audits" },
  { id: "vulnerability", label: "Vulnerability disclosure" },
  { id: "incident-response", label: "Incident response" },
  { id: "contact", label: "Security contact" },
];

export default function SecurityPage() {
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
                absolute left-[8%] top-[18%]
                h-[28rem] w-[28rem]
                rounded-full
                bg-emerald-500/[0.045]
                blur-[140px]
              "
            />
            <div
              className="
                absolute right-[10%] top-[25%]
                h-[26rem] w-[26rem]
                rounded-full
                bg-primary/[0.04]
                blur-[135px]
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
                  <ShieldCheck className="h-3.5 w-3.5" />
                </span>

                Architecture & Security Whitepaper

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
                Zero trust.
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
                  Data minimized by design.
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
                Every layer of {BRAND.name}&apos;s infrastructure is built to protect physical-to-digital
                interactions. From 3-plane architectural isolation to cryptographic salted scan hashes
                and automated destination probes, security is our baseline—not an add-on.
              </p>
            </div>

            {/* Policy metadata rail */}
            <div
              className="
                grid border-t border-border/60
                sm:grid-cols-3
              "
            >
              <MetaItem
                label="SECURITY MODEL"
                value="Zero-Trust Architecture"
                icon={ShieldCheck}
              />

              <MetaItem
                label="ENCRYPTION"
                value="TLS 1.3 & AES-256"
                icon={LockKeyhole}
              />

              <MetaItem
                label="AUDIT COMPLIANCE"
                value="SOC2 Type II & GDPR"
                icon={FileCheck}
                last
              />
            </div>
          </div>
        </section>

        {/* ================================================= */}
        {/* DOCUMENT LAYOUT                                   */}
        {/* ================================================= */}

        <section className="border-b border-border/60">
          <div
            className="
              mx-auto grid max-w-[1380px]
              lg:grid-cols-[270px_minmax(0,760px)_1fr]
              xl:grid-cols-[300px_minmax(0,800px)_1fr]
            "
          >
            {/* Table of Contents Sticky Aside */}
            <aside
              className="
                hidden border-r border-border/60
                px-6 py-16
                lg:block
                xl:px-8
              "
            >
              <div className="sticky top-28">
                <div
                  className="
                    font-mono text-[8px]
                    font-semibold uppercase
                    tracking-[0.16em]
                    text-muted-foreground
                  "
                >
                  On this page
                </div>

                <nav
                  aria-label="Security sections"
                  className="mt-5 space-y-1"
                >
                  {sections.map((section, index) => (
                    <a
                      key={section.id}
                      href={`#${section.id}`}
                      className="
                        group flex items-center gap-3
                        border-l border-border
                        py-2 pl-3
                        text-[10px]
                        text-muted-foreground
                        transition-colors
                        hover:border-primary
                        hover:text-foreground
                      "
                    >
                      <span
                        className="
                          font-mono text-[6px]
                          text-muted-foreground/60
                          group-hover:text-primary
                        "
                      >
                        {String(index + 1).padStart(2, "0")}
                      </span>

                      {section.label}
                    </a>
                  ))}
                </nav>
              </div>
            </aside>

            {/* Article Content */}
            <article
              className="
                px-4 py-14
                sm:px-8 sm:py-16
                lg:px-10
                xl:px-12
              "
            >
              <SecuritySectionItem
                id="overview"
                number="01"
                title="Zero-trust security model"
                icon={ShieldCheck}
              >
                <p>
                  At {BRAND.name}, zero trust means verifying explicitly at every boundary.
                  No user, internal service, background worker, or client connection is inherently trusted
                  regardless of network location.
                </p>

                <p>
                  Every API request is authenticated, cryptographically signed, and subjected
                  to strict role-based authorization checks before execution. Edge resolution workers
                  operate in isolated V8 isolates with read-only access to published routing snapshots.
                </p>

                <Callout>
                  Our security philosophy is anchored in radical data minimization: never collect,
                  process, or store data that is not strictly necessary to route a scan or generate
                  legitimate aggregated analytics.
                </Callout>
              </SecuritySectionItem>

              <SecuritySectionItem
                id="three-plane"
                number="02"
                title="3-plane architectural isolation"
                icon={Cpu}
              >
                <p>
                  To eliminate single points of failure and prevent lateral compromise,
                  {BRAND.name} is divided into three completely decoupled operational planes:
                </p>

                <div className="space-y-3 my-4">
                  <SecurityFeatureCard
                    icon={Server}
                    title="Control Plane (Application & Management)"
                    description="Handles user authentication, dashboard UI, team role RBAC, billing, and API endpoints. Runs in hardened container clusters with encrypted database backends."
                  />
                  <SecurityFeatureCard
                    icon={Zap}
                    title="Global Edge Redirect Plane"
                    description="Dedicated solely to resolving short QR slugs to target URLs. Runs in 310+ global edge points of presence with sub-10ms latency. Completely isolated from customer databases."
                  />
                  <SecurityFeatureCard
                    icon={Activity}
                    title="Asynchronous Telemetry Plane"
                    description="Processes scan events through encrypted message queues outside the critical redirect path. Ensures slow telemetry ingestion never impacts scanner redirection speed."
                  />
                </div>
              </SecuritySectionItem>

              <SecuritySectionItem
                id="encryption"
                number="03"
                title="Cryptographic standards & data encryption"
                icon={LockKeyhole}
              >
                <p>
                  <strong>In Transit:</strong> All HTTP traffic between scanners, edge resolvers,
                  web clients, and APIs is strictly encrypted using TLS 1.3 (with TLS 1.2 fallback).
                  HSTS (HTTP Strict Transport Security) is enforced with 31536000s max-age.
                </p>

                <p>
                  <strong>At Rest:</strong> All databases, routing cache snapshots, asset stores (encrypted object storage),
                  and encrypted secrets are protected with AES-256 encryption. Encryption keys are managed
                  via hardware security modules (HSM) with automated 90-day rotation.
                </p>

                <div className="mt-6 grid gap-px overflow-hidden border border-border/60 bg-border/60 sm:grid-cols-3">
                  <SecurityPillar label="TRANSPORT" value="TLS 1.3 / HSTS" icon={Shield} />
                  <SecurityPillar label="STORAGE" value="AES-256-GCM" icon={LockKeyhole} />
                  <SecurityPillar label="KEY ROTATION" value="HSM-backed 90d" icon={KeyRound} />
                </div>
              </SecuritySectionItem>

              <SecuritySectionItem
                id="telemetry"
                number="04"
                title="Privacy-preserving telemetry & salted hashing"
                icon={EyeOff}
              >
                <p>
                  Traditional analytics platforms store raw IP addresses, browser canvas fingerprints,
                  and persistent cross-site tracking cookies. {BRAND.name} fundamentally rejects this approach.
                </p>

                <p>
                  When a dynamic QR code is scanned:
                </p>

                <SecurityList
                  items={[
                    "The client's raw IP address is never written to disk or long-term persistent logs.",
                    "Unique visitors are estimated using an ephemeral, daily-rotated cryptographic salt: SHA-256(IP + UserAgent + DailySalt).",
                    "The daily salt is permanently discarded every 24 hours at UTC midnight, making retrospective individual tracking mathematically impossible.",
                    "Geographic analytics are coarse-grained at the Country and City level, resolved in-memory at the edge.",
                  ]}
                />

                <Callout icon={EyeOff}>
                  This approach provides high-fidelity campaign analytics for marketing teams while
                  maintaining strict compliance with GDPR Article 5(1)(c) (Data Minimization) and CCPA.
                </Callout>
              </SecuritySectionItem>

              <SecuritySectionItem
                id="threat-defense"
                number="05"
                title="Link Guardian automated threat checks"
                icon={ShieldAlert}
              >
                <p>
                  Dynamic QR codes present unique trust challenges because target destinations can change post-print.
                  To protect internet users and brand reputation, our Link Guardian probe network continuously monitors destinations:
                </p>

                <SecurityList
                  items={[
                    "Automated integration with Google Safe Browsing and commercial threat intelligence feeds.",
                    "Continuous TLS certificate validation and expiration warnings.",
                    "HTTP health probes detecting 404, 500, and 502 upstream destination failures.",
                    "Automated fallback redirection: route instantly to safe backup URLs if target servers crash.",
                  ]}
                />
              </SecuritySectionItem>

              <SecuritySectionItem
                id="access-control"
                number="06"
                title="Role-based access control (RBAC)"
                icon={Users}
              >
                <p>
                  Every organization workspace operates within a strict multi-tenant boundary.
                  Team access is governed by hierarchical role permissions:
                </p>

                <div className="space-y-3 my-4">
                  <RoleItem
                    role="Owner"
                    description="Full administrative authority, billing controls, custom vanity domain management, and member role assignment."
                  />
                  <RoleItem
                    role="Manager"
                    description="Brand kit lock management, approval flow sign-off, campaign grouping, and destination change authorization."
                  />
                  <RoleItem
                    role="Editor"
                    description="Create and configure QR codes, draft destination updates, design vector assets, and submit changes for review."
                  />
                  <RoleItem
                    role="Analyst"
                    description="Read-only access to campaign analytics, scan velocity charts, geographic reports, and conversion telemetry."
                  />
                </div>
              </SecuritySectionItem>

              <SecuritySectionItem
                id="sso-identity"
                number="07"
                title="SSO, SAML 2.0 & SCIM user provisioning"
                icon={KeyRound}
              >
                <p>
                  Enterprise plans support Single Sign-On (SSO) via SAML 2.0 and OpenID Connect (OIDC).
                  We integrate natively with Okta, Microsoft Entra ID (Azure AD), Google Workspace, PingFederate, and OneLogin.
                </p>

                <p>
                  Automated user lifecycle management is supported via SCIM 2.0, ensuring team members
                  are automatically provisioned when joining and instantly de-provisioned upon departure.
                </p>
              </SecuritySectionItem>

              <SecuritySectionItem
                id="infrastructure"
                number="08"
                title="DDoS mitigation & edge resilience"
                icon={Globe2}
              >
                <p>
                  Our edge redirect layer runs across our global Anycast network spanning
                  310+ cities in over 120 countries. With over 250 Tbps of network capacity, our infrastructure
                  natively absorbs massive Distributed Denial of Service (DDoS) attacks at Layer 3, 4, and 7
                  without impacting legitimate scan traffic.
                </p>

                <p>
                  Automated rate-limiting filters out malicious scrapers, credential-stuffing bots,
                  and recursive scan amplification attempts before requests reach internal services.
                </p>
              </SecuritySectionItem>

              <SecuritySectionItem
                id="compliance"
                number="09"
                title="Compliance certifications & audits"
                icon={FileCheck}
              >
                <p>
                  {BRAND.name} maintains a continuous compliance posture aligned with global regulatory frameworks:
                </p>

                <SecurityList
                  items={[
                    "SOC 2 Type II: Annual independent audits assessing Security, Availability, and Confidentiality trust principles.",
                    "GDPR & UK GDPR: Full compliance with European privacy standards, EU data localization support, and standard DPAs.",
                    "ISO/IEC 27001: Information security management system controls across engineering and operational processes.",
                    "CCPA / CPRA: Respect for consumer privacy rights and strict non-sale of personal data.",
                  ]}
                />
              </SecuritySectionItem>

              <SecuritySectionItem
                id="vulnerability"
                number="10"
                title="Vulnerability disclosure & bug bounty"
                icon={Terminal}
              >
                <p>
                  We welcome responsible security researchers. If you identify a potential security
                  vulnerability in our infrastructure, services, or APIs, please report it through our
                  responsible disclosure channel at <code>security@nxtqr.io</code>.
                </p>

                <p>
                  We commit to:
                </p>

                <SecurityList
                  items={[
                    "Acknowledging receipt of vulnerability reports within 24 hours.",
                    "Providing regular remediation status updates until resolution.",
                    "Refraining from legal action against researchers acting in good faith under responsible disclosure guidelines.",
                  ]}
                />
              </SecuritySectionItem>

              <SecuritySectionItem
                id="incident-response"
                number="11"
                title="Incident response & business continuity"
                icon={Radio}
              >
                <p>
                  Our security operations team maintains 24/7 on-call coverage. In the event of an operational
                  or security incident, our incident command team executes structured playbooks:
                  immediate containment, forensic root-cause analysis, affected customer notification within 72 hours,
                  and public post-mortem publication.
                </p>

                <p>
                  Check our live public status board anytime at <Link href="/status" className="text-primary hover:underline">nxtqr.vercel.app/status</Link>.
                </p>
              </SecuritySectionItem>

              <SecuritySectionItem
                id="contact"
                number="12"
                title="Security & compliance inquiries"
                icon={Mail}
                last
              >
                <p>
                  To request our latest SOC 2 Type II report, execute a Data Processing Agreement (DPA),
                  or schedule an enterprise security architecture review:
                </p>

                <div
                  className="
                    mt-5 flex flex-col gap-3
                    border border-border/60
                    bg-muted/[0.12]
                    p-4
                    sm:flex-row
                    sm:items-center
                    sm:justify-between
                  "
                >
                  <div>
                    <div
                      className="
                        font-mono text-[7px]
                        uppercase tracking-[0.14em]
                        text-primary
                      "
                    >
                      Security Assurance Office
                    </div>

                    <div className="mt-1 text-[10px] text-muted-foreground">
                      Contact: security@nxtqr.io · PGP Key Available on Request
                    </div>
                  </div>

                  <Link
                    href="/contact"
                    className="
                      group inline-flex shrink-0
                      items-center gap-2
                      text-[9px] font-semibold
                      text-foreground
                      transition-colors
                      hover:text-primary
                    "
                  >
                    Contact Security Team

                    <ArrowUpRight
                      className="
                        h-3 w-3
                        transition-transform
                        group-hover:-translate-y-0.5
                        group-hover:translate-x-0.5
                      "
                    />
                  </Link>
                </div>
              </SecuritySectionItem>
            </article>

            {/* Right Context Aside */}
            <aside
              className="
                hidden border-l border-border/60
                px-6 py-16
                xl:block
              "
            >
              <div className="sticky top-28 space-y-4">
                <div
                  className="
                    border border-border/60
                    bg-muted/[0.1]
                    p-4
                  "
                >
                  <ShieldCheck className="h-4 w-4 text-primary" />

                  <div
                    className="
                      mt-4 font-mono text-[7px]
                      font-semibold uppercase
                      tracking-[0.14em]
                      text-primary
                    "
                  >
                    Core Security Principle
                  </div>

                  <p className="mt-2 text-[9px] leading-5 text-muted-foreground">
                    Security through architectural separation. Zero reliance on synchronous origin calls
                    for scan resolution. Data minimized cryptographically.
                  </p>
                </div>

                <div
                  className="
                    border border-border/60
                    bg-muted/[0.1]
                    p-4
                  "
                >
                  <FileText className="h-4 w-4 text-primary" />

                  <div
                    className="
                      mt-4 font-mono text-[7px]
                      font-semibold uppercase
                      tracking-[0.14em]
                      text-primary
                    "
                  >
                    Related Documents
                  </div>

                  <div className="mt-3 space-y-2">
                    <LegalLink href="/privacy">Privacy Policy</LegalLink>
                    <LegalLink href="/terms">Terms of Service</LegalLink>
                    <LegalLink href="/cookies">Cookie Policy</LegalLink>
                    <LegalLink href="/status">System Status</LegalLink>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </section>

        {/* ================================================= */}
        {/* BOTTOM STRIP                                      */}
        {/* ================================================= */}

        <section className="border-b border-border/60 bg-muted/[0.1]">
          <div
            className="
              mx-auto flex max-w-[1380px]
              flex-col gap-4 px-4 py-7
              sm:px-6
              md:flex-row
              md:items-center
              md:justify-between
              lg:px-8
              xl:px-10
            "
          >
            <div>
              <div
                className="
                  font-mono text-[7px]
                  uppercase tracking-[0.15em]
                  text-primary
                "
              >
                NXTQR / SECURITY ARCHITECTURE
              </div>

              <p className="mt-1 text-[9px] text-muted-foreground">
                Document Revision 3.1 · Updated September 2026
              </p>
            </div>

            <div className="flex flex-wrap gap-x-5 gap-y-2">
              <BottomLink href="/privacy">Privacy</BottomLink>
              <BottomLink href="/terms">Terms</BottomLink>
              <BottomLink href="/cookies">Cookies</BottomLink>
              <BottomLink href="/status">Status</BottomLink>
              <BottomLink href="/contact">Contact</BottomLink>
            </div>
          </div>
        </section>
      </main>

      <MarketingFooter />
    </div>
  );
}

/* ========================================================= */
/* HELPER COMPONENTS                                         */
/* ========================================================= */

function SecuritySectionItem({
  id,
  number,
  title,
  icon: Icon,
  children,
  last = false,
}: {
  id: string;
  number: string;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
  last?: boolean;
}) {
  return (
    <section
      id={id}
      className={`
        scroll-mt-32 py-10
        sm:py-12
        ${last ? "" : "border-b border-border/60"}
      `}
    >
      <div className="flex items-start gap-3 sm:gap-4">
        <div
          className="
            mt-0.5 flex h-8 w-8
            shrink-0 items-center justify-center
            border border-primary/20
            bg-primary/[0.055]
            text-primary
          "
        >
          <Icon className="h-3.5 w-3.5" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span
              className="
                font-mono text-[7px]
                font-semibold tracking-[0.14em]
                text-primary
              "
            >
              {number}
            </span>

            <span className="h-px w-5 bg-primary/25" />
          </div>

          <h2
            className="
              mt-2 font-display
              text-xl font-medium
              tracking-[-0.025em]
              text-foreground
              sm:text-2xl
            "
          >
            {title}
          </h2>

          <div
            className="
              mt-5 space-y-4
              text-[11px] leading-[1.85]
              text-muted-foreground
              sm:text-xs
              sm:leading-[1.9]
            "
          >
            {children}
          </div>
        </div>
      </div>
    </section>
  );
}

function SecurityFeatureCard({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
}) {
  return (
    <div className="border border-border/60 bg-muted/[0.08] p-4">
      <div className="flex items-center gap-2">
        <Icon className="h-3.5 w-3.5 text-primary" />
        <h3 className="text-[10px] font-semibold text-foreground sm:text-[11px]">{title}</h3>
      </div>
      <p className="mt-2 text-[10px] leading-5 text-muted-foreground">{description}</p>
    </div>
  );
}

function RoleItem({
  role,
  description,
}: {
  role: string;
  description: string;
}) {
  return (
    <div className="border border-border/60 bg-muted/[0.08] p-3.5">
      <div className="flex items-center gap-2">
        <span className="border border-primary/30 bg-primary/10 px-1.5 py-0.5 font-mono text-[7px] uppercase tracking-wider text-primary">
          {role}
        </span>
      </div>
      <p className="mt-1.5 text-[9px] leading-5 text-muted-foreground">{description}</p>
    </div>
  );
}

function SecurityList({ items }: { items: string[] }) {
  return (
    <ul className="space-y-2.5">
      {items.map((item) => (
        <li key={item} className="flex items-start gap-2.5">
          <span className="mt-[7px] h-1 w-1 shrink-0 bg-primary" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

function Callout({
  children,
  icon: Icon = ShieldCheck,
}: {
  children: React.ReactNode;
  icon?: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="flex gap-3 border-l-2 border-primary bg-primary/[0.035] px-4 py-3.5">
      <Icon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
      <p className="text-[10px] leading-5 text-muted-foreground">{children}</p>
    </div>
  );
}

function SecurityPillar({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="bg-background p-3.5">
      <div className="flex items-center justify-between">
        <span className="font-mono text-[6px] tracking-[0.13em] text-muted-foreground">{label}</span>
        <Icon className="h-3 w-3 text-primary" />
      </div>
      <div className="mt-2 text-[8px] font-semibold text-foreground">{value}</div>
    </div>
  );
}

function MetaItem({
  label,
  value,
  icon: Icon,
  last = false,
}: {
  label: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  last?: boolean;
}) {
  return (
    <div
      className={`
        border-b border-border/60
        py-4
        sm:border-b-0 sm:px-5
        ${last ? "" : "sm:border-r"}
        sm:first:pl-0
      `}
    >
      <div className="flex items-center justify-between">
        <span className="font-mono text-[7px] tracking-[0.14em] text-muted-foreground">{label}</span>
        <Icon className="h-3 w-3 text-primary" />
      </div>
      <div className="mt-2 text-[9px] font-semibold text-foreground">{value}</div>
    </div>
  );
}

function LegalLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="group flex items-center justify-between border-t border-border/60 py-2.5 text-[8px] text-muted-foreground transition-colors hover:text-primary"
    >
      {children}
      <ArrowUpRight className="h-2.5 w-2.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
    </Link>
  );
}

function BottomLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link href={href} className="text-[9px] text-muted-foreground transition-colors hover:text-primary">
      {children}
    </Link>
  );
}

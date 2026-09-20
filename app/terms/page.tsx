import * as React from "react";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "NXTQR terms of service: platform scope, acceptable use policies, dynamic routing governance, and account obligations.",
};
import {
  AlertTriangle,
  ArrowUpRight,
  BookOpen,
  Building2,
  CheckCircle2,
  Clock3,
  Code2,
  Cpu,
  FileCheck,
  FileText,
  Gavel,
  Globe2,
  HelpCircle,
  KeyRound,
  LockKeyhole,
  Mail,
  RefreshCw,
  Scale,
  Server,
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
  { id: "overview", label: "Acceptance & overview" },
  { id: "scope", label: "Platform scope" },
  { id: "accounts", label: "Accounts & workspaces" },
  { id: "dynamic-qr", label: "QR routing governance" },
  { id: "acceptable-use", label: "Acceptable use policy" },
  { id: "link-guardian", label: "Automated threat checks" },
  { id: "intellectual-property", label: "Intellectual property" },
  { id: "api-terms", label: "APIs & webhooks" },
  { id: "subscriptions", label: "Billing & quotas" },
  { id: "service-levels", label: "Availability & edge SLA" },
  { id: "warranties", label: "Disclaimers & liability" },
  { id: "indemnification", label: "Indemnification" },
  { id: "termination", label: "Suspension & termination" },
  { id: "modifications", label: "Modifications to terms" },
  { id: "governing-law", label: "Governing law" },
  { id: "contact", label: "Legal contact" },
];

export default function TermsPage() {
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
          {/* Ambient background */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0"
          >
            <div
              className="
                absolute left-[10%] top-[18%]
                h-[28rem] w-[28rem]
                rounded-full
                bg-primary/[0.045]
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
                  <Gavel className="h-3 w-3" />
                </span>

                NXTQR Legal Agreement

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
                Terms of service,
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
                  stated with precision.
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
                These Terms of Service govern access to and use of {BRAND.name}&apos;s
                smart QR infrastructure, APIs, web dashboards, routing edge networks,
                and related services. Please review them carefully before creating an account
                or deploying QR assets.
              </p>
            </div>

            {/* Policy metadata */}
            <div
              className="
                grid border-t border-border/60
                sm:grid-cols-3
              "
            >
              <MetaItem
                label="DOCUMENT"
                value="Terms of Service"
                icon={FileText}
              />

              <MetaItem
                label="LAST UPDATED"
                value="September 2026"
                icon={Clock3}
              />

              <MetaItem
                label="APPLIES TO"
                value="All Customers & Workspaces"
                icon={Globe2}
                last
              />
            </div>
          </div>
        </section>

        {/* ================================================= */}
        {/* DOCUMENT                                          */}
        {/* ================================================= */}

        <section className="border-b border-border/60">
          <div
            className="
              mx-auto grid max-w-[1380px]
              lg:grid-cols-[270px_minmax(0,760px)_1fr]
              xl:grid-cols-[300px_minmax(0,800px)_1fr]
            "
          >
            {/* =============================================== */}
            {/* TABLE OF CONTENTS                               */}
            {/* =============================================== */}

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
                  aria-label="Terms of service sections"
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

            {/* =============================================== */}
            {/* TERMS CONTENT                                   */}
            {/* =============================================== */}

            <article
              className="
                px-4 py-14
                sm:px-8 sm:py-16
                lg:px-10
                xl:px-12
              "
            >
              <TermsSection
                id="overview"
                number="01"
                title="Acceptance & overview"
                icon={Gavel}
              >
                <p>
                  By creating an account, authenticating through Single Sign-On (SSO),
                  issuing API calls, or otherwise accessing {BRAND.name} (the &ldquo;Service&rdquo;),
                  you agree to be bound by these Terms of Service (the &ldquo;Terms&rdquo;).
                </p>

                <p>
                  If you are agreeing to these Terms on behalf of an organization, enterprise,
                  or other legal entity, you represent and warrant that you have full legal
                  authority to bind that entity. If you do not possess such authority or do not agree
                  with any part of these Terms, you may not use the Service.
                </p>

                <Callout>
                  {BRAND.name} is engineered for professional, enterprise, and developer use cases.
                  Our infrastructure decouples printed QR geometry from active digital destinations,
                  requiring clear operational responsibilities between {BRAND.name} and customer administrators.
                </Callout>
              </TermsSection>

              <TermsSection
                id="scope"
                number="02"
                title="Platform scope & service architecture"
                icon={Globe2}
              >
                <p>
                  {BRAND.name} provides a multi-tenant software-as-a-service (SaaS) platform
                  composed of three distinct operational planes:
                </p>

                <ServiceCategory
                  icon={Cpu}
                  title="Control Plane (API & Console)"
                >
                  Used by authorized team members to design QR codes, configure routing logic,
                  manage brand kits, administer permissions, and configure webhook subscriptions.
                </ServiceCategory>

                <ServiceCategory
                  icon={Zap}
                  title="Global Edge Data Plane"
                >
                  Distributed edge workers that resolve dynamic QR short-identifiers to their
                  current destination in sub-10ms latency worldwide without synchronous origin calls.
                </ServiceCategory>

                <ServiceCategory
                  icon={ShieldCheck}
                  title="Link Guardian Probe Network"
                >
                  Continuous synthetic destination probes monitoring HTTP/TLS health, detecting broken
                  endpoints, and executing automated fallback routing policies.
                </ServiceCategory>
              </TermsSection>

              <TermsSection
                id="accounts"
                number="03"
                title="Accounts, workspaces & role permissions"
                icon={Users}
              >
                <p>
                  Access to management consoles requires creating an authenticated account.
                  You must provide accurate, current, and complete registration information and maintain
                  its accuracy over time.
                </p>

                <p>
                  Account credentials, multi-factor authentication tokens, and API keys must be kept secure.
                  You are responsible for all activities occurring under your account or organizational workspaces.
                  Notify {BRAND.name} immediately of any suspected unauthorized access or compromised credentials.
                </p>

                <p>
                  Organization administrators are responsible for configuring team roles (Owner, Manager, Editor, Analyst),
                  granting appropriate permissions, and revoking credentials when team members depart.
                </p>
              </TermsSection>

              <TermsSection
                id="dynamic-qr"
                number="04"
                title="Dynamic QR routing governance"
                icon={RefreshCw}
              >
                <p>
                  Dynamic QR codes encode permanent redirect identifiers pointing to {BRAND.name} edge resolvers.
                  Customers retain full discretion over destination URLs, query parameters, device conditional rules,
                  and geographic routing logic.
                </p>

                <p>
                  You are solely responsible for ensuring that destination targets remain operational, secure,
                  legitimate, and compliant with all applicable local, national, and international laws.
                  {BRAND.name} does not endorse or take responsibility for third-party websites or services
                  linked via dynamic QR codes.
                </p>
              </TermsSection>

              <TermsSection
                id="acceptable-use"
                number="05"
                title="Acceptable use policy (AUP)"
                icon={ShieldAlert}
              >
                <p>
                  You agree not to use {BRAND.name} to generate, host, route, or link to any content or activity
                  that violates our Acceptable Use Policy. Strictly prohibited uses include:
                </p>

                <TermsList
                  items={[
                    "Routing to malicious software, phishing pages, ransomware, keyloggers, or trojans.",
                    "Deceptive destination cloaking intended to bypass security scanners or fraud filters.",
                    "Facilitating illegal gambling, counterfeit goods, or unauthorized intellectual property exploitation.",
                    "Transmitting unsolicited bulk communications (spam) or automated scanning abuse.",
                    "Interfering with, circumventing, or disrupting edge resolution infrastructure or rate limits.",
                    "Attempting reverse-engineering, decompilation, or unauthorized penetration testing without prior written consent.",
                  ]}
                />

                <Callout icon={AlertTriangle}>
                  Confirmed violations of our Acceptable Use Policy will result in immediate suspension
                  of affected QR slugs, revocation of API keys, and potential account termination without refund.
                </Callout>
              </TermsSection>

              <TermsSection
                id="link-guardian"
                number="06"
                title="Automated threat checks & Link Guardian"
                icon={ShieldCheck}
              >
                <p>
                  To maintain internet safety and edge reputation, {BRAND.name} employs automated security
                  scanners and health probes (&ldquo;Link Guardian&rdquo;) that periodically evaluate destination URLs.
                </p>

                <p>
                  If an active QR destination returns persistent HTTP 4xx/5xx errors, TLS certificate failures,
                  or is flagged by recognized threat intelligence feeds (such as Google Safe Browsing or Cloudflare Threat Intelligence),
                  {BRAND.name} may automatically route traffic to the customer&apos;s configured fallback URL or a safe error page.
                </p>
              </TermsSection>

              <TermsSection
                id="intellectual-property"
                number="07"
                title="Intellectual property & customer assets"
                icon={FileCheck}
              >
                <p>
                  <strong>Customer Content:</strong> You retain all ownership rights in logos, trademarks,
                  vector graphics, destination URLs, and metadata uploaded to the platform. You grant {BRAND.name}
                  a limited, worldwide license to host, render, and distribute these assets solely as necessary
                  to provide the Service.
                </p>

                <p>
                  <strong>Platform IP:</strong> The {BRAND.name} software, edge algorithms, visual studio,
                  conditional routing engines, logos, and documentation are proprietary property of {BRAND.name}
                  and its licensors, protected by copyright, trade secret, and international intellectual property laws.
                </p>
              </TermsSection>

              <TermsSection
                id="api-terms"
                number="08"
                title="Developer APIs, quotas & webhooks"
                icon={Terminal}
              >
                <p>
                  Developer API access is subject to documented rate limits, concurrent connection thresholds,
                  and monthly request quotas corresponding to your subscribed plan tier.
                </p>

                <p>
                  Customers must not attempt to circumvent API quotas or use programmatic mechanisms to overwhelm
                  control-plane endpoints. Webhook listeners must acknowledge event notifications promptly with HTTP 2xx
                  status codes to prevent automatic retry backoff.
                </p>
              </TermsSection>

              <TermsSection
                id="subscriptions"
                number="09"
                title="Billing, plans & quota enforcement"
                icon={Scale}
              >
                <p>
                  Paid subscriptions are billed in advance on a recurring monthly or annual basis.
                  Applicable fees, seat allowances, dynamic QR limits, and data retention windows are determined
                  by the chosen plan tier.
                </p>

                <p>
                  Upgrades take effect immediately with prorated charges. Downgrades take effect at the conclusion
                  of the current billing period. Fees are non-refundable except where explicitly mandated by applicable law
                  or agreed upon in an enterprise service agreement.
                </p>
              </TermsSection>

              <TermsSection
                id="service-levels"
                number="10"
                title="Service levels & edge availability"
                icon={Server}
              >
                <p>
                  {BRAND.name} strives to maintain a 99.99% monthly availability for the Global Edge Redirect Plane.
                  Our distributed edge architecture ensures that scans resolve across globally cached snapshots
                  even during temporary control-plane maintenance windows.
                </p>

                <p>
                  Scheduled maintenance windows are announced in advance via our official status page.
                  Enterprise customers with dedicated Service Level Agreements (SLAs) are entitled to service credits
                  as specified in their custom contracts.
                </p>
              </TermsSection>

              <TermsSection
                id="warranties"
                number="11"
                title="Disclaimers & limitation of liability"
                icon={LockKeyhole}
              >
                <p>
                  Except as expressly provided herein, the Service is provided on an &ldquo;AS IS&rdquo; and
                  &ldquo;AS AVAILABLE&rdquo; basis without warranties of any kind, whether express, implied, statutory,
                  or otherwise, including warranties of merchantability, fitness for a particular purpose, or non-infringement.
                </p>

                <p>
                  In no event will {BRAND.name}, its affiliates, directors, or employees be liable for any indirect,
                  incidental, special, consequential, or punitive damages, including loss of profits, data, goodwill,
                  or business interruption, arising out of or related to your use of the Service.
                </p>

                <p>
                  The total cumulative liability of {BRAND.name} for all claims related to the Service shall not exceed
                  the amount paid by you to {BRAND.name} during the twelve (12) months immediately preceding the event giving rise to liability.
                </p>
              </TermsSection>

              <TermsSection
                id="indemnification"
                number="12"
                title="Indemnification"
                icon={ShieldCheck}
              >
                <p>
                  You agree to defend, indemnify, and hold harmless {BRAND.name}, its officers, directors, employees,
                  and agents from and against any claims, liabilities, damages, losses, and expenses (including reasonable legal fees)
                  arising out of or in connection with: (a) your use or misuse of the Service; (b) destination content linked through your QR codes;
                  or (c) your violation of these Terms or applicable laws.
                </p>
              </TermsSection>

              <TermsSection
                id="termination"
                number="13"
                title="Suspension & termination"
                icon={AlertTriangle}
              >
                <p>
                  You may close your account and terminate these Terms at any time through the workspace settings.
                  Upon termination, your right to manage QR codes ceases, and dynamic redirects may be deactivated
                  following a grace period.
                </p>

                <p>
                  {BRAND.name} reserves the right to suspend or terminate access immediately if you breach these Terms,
                  fail to pay applicable fees, or engage in activity that poses security risks to other customers or internet users.
                </p>
              </TermsSection>

              <TermsSection
                id="modifications"
                number="14"
                title="Modifications to terms"
                icon={BookOpen}
              >
                <p>
                  We may periodically revise these Terms to reflect changes in our infrastructure, product capabilities,
                  or regulatory requirements. Material revisions will be notified via email or dashboard announcements
                  at least thirty (30) days prior to their effective date.
                </p>

                <p>
                  Continued use of the Service following the effective date of updated Terms constitutes acceptance
                  of the revised terms.
                </p>
              </TermsSection>

              <TermsSection
                id="governing-law"
                number="15"
                title="Governing law & dispute resolution"
                icon={Gavel}
              >
                <p>
                  These Terms shall be governed by and construed in accordance with the laws of the State of Delaware,
                  United States, without regard to its conflict of law principles.
                </p>

                <p>
                  Any dispute, controversy, or claim arising out of or relating to these Terms shall be resolved
                  through binding commercial arbitration administered by the American Arbitration Association (AAA)
                  before a single neutral arbitrator.
                </p>
              </TermsSection>

              <TermsSection
                id="contact"
                number="16"
                title="Legal contact"
                icon={Mail}
                last
              >
                <p>
                  For legal inquiries, copyright notices (DMCA), compliance audits, or enterprise contract questions,
                  contact the {BRAND.name} legal counsel:
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
                      Legal & Compliance Inquiries
                    </div>

                    <div className="mt-1 text-[10px] text-muted-foreground">
                      Official legal notices and enterprise governance requests.
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
                    Contact Legal Team

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
              </TermsSection>
            </article>

            {/* =============================================== */}
            {/* RIGHT CONTEXT ASIDE                             */}
            {/* =============================================== */}

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
                  <Scale className="h-4 w-4 text-primary" />

                  <div
                    className="
                      mt-4 font-mono text-[7px]
                      font-semibold uppercase
                      tracking-[0.14em]
                      text-primary
                    "
                  >
                    Governance Principle
                  </div>

                  <p className="mt-2 text-[9px] leading-5 text-muted-foreground">
                    Clear boundaries. Uncompromised edge reliability. Responsibility for destinations
                    remains with asset publishers.
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
                    Related Legal Policies
                  </div>

                  <div className="mt-3 space-y-2">
                    <LegalLink href="/privacy">
                      Privacy Policy
                    </LegalLink>

                    <LegalLink href="/cookies">
                      Cookie Policy
                    </LegalLink>

                    <LegalLink href="/security">
                      Security Architecture
                    </LegalLink>

                    <LegalLink href="/status">
                      System Status
                    </LegalLink>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </section>

        {/* ================================================= */}
        {/* LEGAL FOOTER STRIP                                */}
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
                NXTQR / TERMS OF SERVICE
              </div>

              <p className="mt-1 text-[9px] text-muted-foreground">
                Effective September 2026. Version 2.4.
              </p>
            </div>

            <div className="flex flex-wrap gap-x-5 gap-y-2">
              <BottomLink href="/privacy">Privacy Policy</BottomLink>
              <BottomLink href="/cookies">Cookie Policy</BottomLink>
              <BottomLink href="/security">Security</BottomLink>
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
/* TERMS SECTION COMPONENT                                   */
/* ========================================================= */

function TermsSection({
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

/* ========================================================= */
/* SERVICE CATEGORY                                          */
/* ========================================================= */

function ServiceCategory({
  icon: Icon,
  title,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className="
        border border-border/60
        bg-muted/[0.08]
        p-4
      "
    >
      <div className="flex items-center gap-2">
        <Icon className="h-3.5 w-3.5 text-primary" />

        <h3 className="text-[10px] font-semibold text-foreground sm:text-[11px]">
          {title}
        </h3>
      </div>

      <p className="mt-2 text-[10px] leading-5 text-muted-foreground">
        {children}
      </p>
    </div>
  );
}

/* ========================================================= */
/* TERMS LIST                                                */
/* ========================================================= */

function TermsList({
  items,
}: {
  items: string[];
}) {
  return (
    <ul className="space-y-2.5">
      {items.map((item) => (
        <li
          key={item}
          className="flex items-start gap-2.5"
        >
          <span
            className="
              mt-[7px] h-1 w-1
              shrink-0 bg-primary
            "
          />

          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

/* ========================================================= */
/* CALLOUT                                                   */
/* ========================================================= */

function Callout({
  children,
  icon: Icon = ShieldCheck,
}: {
  children: React.ReactNode;
  icon?: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div
      className="
        flex gap-3
        border-l-2 border-primary
        bg-primary/[0.035]
        px-4 py-3.5
      "
    >
      <Icon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />

      <p className="text-[10px] leading-5 text-muted-foreground">
        {children}
      </p>
    </div>
  );
}

/* ========================================================= */
/* META ITEM                                                 */
/* ========================================================= */

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
        <span
          className="
            font-mono text-[7px]
            tracking-[0.14em]
            text-muted-foreground
          "
        >
          {label}
        </span>

        <Icon className="h-3 w-3 text-primary" />
      </div>

      <div className="mt-2 text-[9px] font-semibold text-foreground">
        {value}
      </div>
    </div>
  );
}

/* ========================================================= */
/* LINKS                                                     */
/* ========================================================= */

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
      className="
        group flex items-center
        justify-between
        border-t border-border/60
        py-2.5
        text-[8px]
        text-muted-foreground
        transition-colors
        hover:text-primary
      "
    >
      {children}

      <ArrowUpRight
        className="
          h-2.5 w-2.5
          transition-transform
          group-hover:-translate-y-0.5
          group-hover:translate-x-0.5
        "
      />
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
    <Link
      href={href}
      className="
        text-[9px]
        text-muted-foreground
        transition-colors
        hover:text-primary
      "
    >
      {children}
    </Link>
  );
}
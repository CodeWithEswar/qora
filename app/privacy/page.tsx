import * as React from "react";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "NXTQR privacy policy: information processing, dynamic QR scan telemetry, retention, and data security practices.",
};
import {
  ArrowUpRight,
  Building2,
  Cookie,
  Database,
  EyeOff,
  FileText,
  Fingerprint,
  Globe2,
  KeyRound,
  LockKeyhole,
  Mail,
  ScanLine,
  ShieldCheck,
  Trash2,
  UserRound,
  Users,
} from "lucide-react";

import { MarketingHeader } from "@/components/marketing/header";
import { MarketingFooter } from "@/components/marketing/footer";
import { BRAND } from "@/config/brand";

const sections = [
  { id: "overview", label: "Overview" },
  { id: "scope", label: "Scope" },
  { id: "information", label: "Information we process" },
  { id: "scan-data", label: "QR scan data" },
  { id: "accounts", label: "Accounts & workspaces" },
  { id: "content", label: "Customer content" },
  { id: "usage", label: "How information is used" },
  { id: "legal-bases", label: "Legal bases" },
  { id: "sharing", label: "Service providers" },
  { id: "retention", label: "Retention" },
  { id: "security", label: "Security" },
  { id: "rights", label: "Your choices & rights" },
  { id: "international", label: "International processing" },
  { id: "children", label: "Children" },
  { id: "changes", label: "Policy changes" },
  { id: "contact", label: "Contact" },
];

export default function PrivacyPage() {
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
          {/* Background */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0"
          >
            <div
              className="
                absolute left-[8%] top-[20%]
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
                  <ShieldCheck className="h-3 w-3" />
                </span>

                NXTQR Legal

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
                Privacy,
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
                  explained clearly.
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
                This Privacy Policy explains how {BRAND.name} processes
                information when people use our website, create an account,
                manage QR assets, use our platform, or scan QR experiences
                powered by our infrastructure.
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
                value="Privacy Policy"
                icon={FileText}
              />

              <MetaItem
                label="LAST UPDATED"
                value="September 2026"
                icon={Database}
              />

              <MetaItem
                label="PLATFORM"
                value={BRAND.name}
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
                  aria-label="Privacy policy sections"
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
            {/* POLICY CONTENT                                  */}
            {/* =============================================== */}

            <article
              className="
                px-4 py-14
                sm:px-8 sm:py-16
                lg:px-10
                xl:px-12
              "
            >
              {/* Introduction */}

              <PolicySection
                id="overview"
                number="01"
                title="Overview"
                icon={ShieldCheck}
              >
                <p>
                  {BRAND.name} provides tools for creating, managing,
                  routing and understanding QR experiences. We recognize
                  that the platform may process information relating to
                  account holders, organization members, website visitors,
                  developers and people who scan QR codes managed through
                  the service.
                </p>

                <p>
                  This policy describes the categories of information that
                  may be processed, why that processing occurs, how
                  information may be shared and retained, and the choices
                  available to individuals.
                </p>

                <Callout>
                  Our goal is to collect and process information that is
                  reasonably necessary to operate, secure and improve the
                  platform while avoiding unnecessary collection.
                </Callout>
              </PolicySection>

              <PolicySection
                id="scope"
                number="02"
                title="Scope of this policy"
                icon={Globe2}
              >
                <p>
                  This Privacy Policy applies to information processed in
                  connection with the {BRAND.name} website, authenticated
                  platform, QR infrastructure and related services that
                  reference this policy.
                </p>

                <p>
                  QR codes created by customers may direct scanners to
                  websites, applications, forms, stores or other
                  destinations operated by third parties. Once a person
                  reaches a third-party destination, that third party's
                  privacy practices may apply independently of{" "}
                  {BRAND.name}.
                </p>

                <p>
                  Customers using {BRAND.name} are responsible for
                  configuring their QR experiences and for ensuring that
                  their own use of information complies with applicable
                  requirements.
                </p>
              </PolicySection>

              <PolicySection
                id="information"
                number="03"
                title="Information we process"
                icon={Database}
              >
                <p>
                  The information processed by {BRAND.name} depends on how
                  the service is used.
                </p>

                <DataCategory
                  icon={UserRound}
                  title="Account information"
                >
                  Information associated with creating and maintaining an
                  account, such as name, email address, authentication
                  information, profile details and account preferences.
                </DataCategory>

                <DataCategory
                  icon={Building2}
                  title="Organization and workspace information"
                >
                  Workspace names, organization details, membership,
                  invitations, roles, permissions, team configuration and
                  related administrative settings.
                </DataCategory>

                <DataCategory
                  icon={ScanLine}
                  title="QR and scan information"
                >
                  Information needed to resolve QR destinations and provide
                  analytics, such as QR identifiers, timestamps, general
                  device or browser characteristics and approximate
                  geographic information where enabled and available.
                </DataCategory>

                <DataCategory
                  icon={Fingerprint}
                  title="Service and security information"
                >
                  Technical events associated with authentication,
                  security, API usage, administrative actions, errors and
                  service operation.
                </DataCategory>
              </PolicySection>

              <PolicySection
                id="scan-data"
                number="04"
                title="QR scan data"
                icon={ScanLine}
              >
                <p>
                  When someone scans a dynamic QR code managed through{" "}
                  {BRAND.name}, our infrastructure may receive technical
                  information required to resolve the request and return
                  the configured destination.
                </p>

                <p>
                  Depending on the QR configuration and platform features
                  in use, scan events may include information such as:
                </p>

                <PolicyList
                  items={[
                    "The QR or routing identifier associated with the scan.",
                    "Date and time of the request.",
                    "General browser, operating system or device category.",
                    "Approximate geographic information derived from network information where applicable.",
                    "Routing context required to evaluate configured destination rules.",
                    "Referral or campaign information when supplied as part of the request.",
                    "Conversion or event information when a customer explicitly configures supported measurement features.",
                  ]}
                />

                <Callout icon={EyeOff}>
                  NXTQR is being designed around data minimization. Any
                  production claim regarding IP-address handling,
                  pseudonymous uniqueness calculations or rotating salts
                  should correspond exactly to the deployed telemetry
                  implementation.
                </Callout>

                <p>
                  Scan analytics are intended to help customers understand
                  aggregate engagement with QR assets. They should not be
                  used to infer sensitive characteristics about individual
                  scanners.
                </p>
              </PolicySection>

              <PolicySection
                id="accounts"
                number="05"
                title="Accounts, authentication and workspaces"
                icon={Users}
              >
                <p>
                  When you create or use an account, we process information
                  necessary to authenticate you, maintain your profile and
                  determine which workspaces and resources you are
                  authorized to access.
                </p>

                <p>
                  If you participate in an organization workspace, workspace
                  administrators may be able to manage your membership,
                  assign roles, configure permissions and view activity
                  associated with organizational resources, subject to the
                  capabilities available within the service.
                </p>

                <p>
                  Authentication providers may process information
                  according to their own privacy terms when you choose to
                  authenticate through an external identity provider.
                </p>
              </PolicySection>

              <PolicySection
                id="content"
                number="06"
                title="QR assets and customer content"
                icon={FileText}
              >
                <p>
                  Customers may provide information to configure QR assets
                  and related experiences. This can include destination
                  URLs, QR labels, campaign information, uploaded media,
                  landing-page content, routing rules, brand assets and
                  other workspace configuration.
                </p>

                <p>
                  Customers determine what content they submit and which
                  destinations their QR codes reference. Please avoid
                  submitting personal or confidential information that is
                  not necessary for the intended QR experience.
                </p>

                <p>
                  Where collaboration features are used, the service may
                  also process comments, approval activity, change history
                  and other information needed to coordinate work between
                  authorized workspace members.
                </p>
              </PolicySection>

              <PolicySection
                id="usage"
                number="07"
                title="How we use information"
                icon={LockKeyhole}
              >
                <p>
                  We may process information for purposes including:
                </p>

                <PolicyList
                  items={[
                    "Providing and operating the NXTQR platform.",
                    "Authenticating users and maintaining account sessions.",
                    "Resolving dynamic QR destinations and configured routing rules.",
                    "Providing analytics and reporting functionality.",
                    "Maintaining organization, team and permission controls.",
                    "Processing customer-requested operations and platform configuration.",
                    "Detecting abuse, investigating security events and protecting the service.",
                    "Diagnosing errors and maintaining reliability and performance.",
                    "Providing customer support and responding to requests.",
                    "Administering subscriptions and billing where paid services are used.",
                    "Meeting applicable legal and regulatory obligations.",
                    "Improving the platform based on service usage and operational feedback.",
                  ]}
                />
              </PolicySection>

              <PolicySection
                id="legal-bases"
                number="08"
                title="Legal bases for processing"
                icon={FileText}
              >
                <p>
                  Where applicable privacy law requires a legal basis for
                  processing personal information, the basis depends on the
                  context and purpose of the processing.
                </p>

                <p>
                  Depending on the circumstances, processing may be
                  necessary to perform a contract or provide a requested
                  service, comply with legal obligations, pursue legitimate
                  operational or security interests, or act on consent where
                  consent is required.
                </p>

                <p>
                  The precise legal basis may also depend on whether{" "}
                  {BRAND.name} is acting for its own purposes or processing
                  information on behalf of a customer.
                </p>
              </PolicySection>

              <PolicySection
                id="sharing"
                number="09"
                title="Service providers and information sharing"
                icon={Database}
              >
                <p>
                  We may use infrastructure, authentication, communication,
                  payment, monitoring and other service providers to operate{" "}
                  {BRAND.name}. These providers may process information only
                  as necessary for the services they perform and subject to
                  applicable contractual and legal requirements.
                </p>

                <p>
                  Information may also be disclosed when reasonably
                  necessary to comply with applicable law, respond to valid
                  legal process, protect the rights and security of users or
                  the platform, investigate abuse, or complete a corporate
                  transaction subject to appropriate safeguards.
                </p>

                <Callout>
                  A production subprocessor list should identify the actual
                  third-party providers used by NXTQR and should be updated
                  when material providers change.
                </Callout>
              </PolicySection>

              <PolicySection
                id="retention"
                number="10"
                title="Data retention and deletion"
                icon={Trash2}
              >
                <p>
                  We aim to retain information for no longer than reasonably
                  necessary for the purposes described in this policy,
                  subject to operational, contractual, security and legal
                  requirements.
                </p>

                <p>
                  Different categories of information may require different
                  retention periods. For example, account information,
                  customer-created assets, scan analytics, security records,
                  billing records and workspace activity may have different
                  lifecycle requirements.
                </p>

                <p>
                  Where the product provides configurable retention
                  controls, applicable workspace settings and plan
                  entitlements may affect how long certain analytics or
                  operational information remains available.
                </p>

                <p>
                  Some information may need to be retained after an account
                  or workspace is closed when required for legal,
                  accounting, fraud-prevention, dispute-resolution or
                  security purposes.
                </p>
              </PolicySection>

              <PolicySection
                id="security"
                number="11"
                title="Security"
                icon={ShieldCheck}
              >
                <p>
                  We use technical and organizational controls intended to
                  protect information against unauthorized access,
                  alteration, disclosure and loss.
                </p>

                <p>
                  Depending on the relevant service component, controls may
                  include authenticated access, server-side authorization,
                  scoped credentials, encrypted network transport,
                  permission boundaries, operational logging and
                  infrastructure-level security measures.
                </p>

                <p>
                  No internet-connected service can guarantee absolute
                  security. Users are responsible for protecting their
                  credentials, maintaining appropriate access to their
                  accounts and promptly reporting suspected unauthorized
                  activity.
                </p>

                <div
                  className="
                    mt-6 grid gap-px
                    overflow-hidden
                    border border-border/60
                    bg-border/60
                    sm:grid-cols-3
                  "
                >
                  <SecurityItem
                    icon={LockKeyhole}
                    label="ACCESS"
                    value="Authorization boundaries"
                  />

                  <SecurityItem
                    icon={KeyRound}
                    label="CREDENTIALS"
                    value="Scoped access"
                  />

                  <SecurityItem
                    icon={FileText}
                    label="ACTIVITY"
                    value="Operational visibility"
                  />
                </div>
              </PolicySection>

              <PolicySection
                id="rights"
                number="12"
                title="Your choices and privacy rights"
                icon={UserRound}
              >
                <p>
                  Depending on where you live and the laws that apply, you
                  may have rights relating to your personal information.
                  These may include rights to request access, correction,
                  deletion, restriction, portability or objection to
                  certain processing.
                </p>

                <p>
                  Some requests can be fulfilled directly through account or
                  workspace controls where those capabilities are available.
                  Other requests may require contacting us.
                </p>

                <p>
                  If information was processed by {BRAND.name} on behalf of
                  one of our customers, we may direct your request to that
                  customer when they are responsible for determining how
                  the information is processed.
                </p>

                <p>
                  We may need to verify your identity before completing
                  certain privacy requests and may retain limited
                  information about the request where necessary to document
                  our response.
                </p>
              </PolicySection>

              <PolicySection
                id="international"
                number="13"
                title="International processing"
                icon={Globe2}
              >
                <p>
                  The infrastructure and service providers used to operate{" "}
                  {BRAND.name} may process information in locations other
                  than the country where a user or scanner is located.
                </p>

                <p>
                  Where required, appropriate mechanisms should be used for
                  transfers of personal information across jurisdictions.
                  The specific mechanisms depend on the parties, locations
                  and applicable privacy requirements.
                </p>
              </PolicySection>

              <PolicySection
                id="children"
                number="14"
                title="Children's privacy"
                icon={ShieldCheck}
              >
                <p>
                  {BRAND.name} is designed as a QR infrastructure and
                  productivity service and is not intended to knowingly
                  solicit personal information from children in violation
                  of applicable law.
                </p>

                <p>
                  If you believe information relating to a child has been
                  submitted to the service in circumstances that require
                  removal or parental authorization, please contact us so
                  the matter can be reviewed.
                </p>
              </PolicySection>

              <PolicySection
                id="changes"
                number="15"
                title="Changes to this Privacy Policy"
                icon={FileText}
              >
                <p>
                  We may update this Privacy Policy as the platform,
                  applicable requirements or our data practices change.
                  When we make changes, we will update the effective or
                  “Last updated” date displayed on this page.
                </p>

                <p>
                  If a change materially affects how personal information is
                  handled, additional notice may be provided where
                  appropriate or legally required.
                </p>
              </PolicySection>

              <PolicySection
                id="contact"
                number="16"
                title="Contact"
                icon={Mail}
                last
              >
                <p>
                  Questions about this Privacy Policy or requests relating
                  to privacy can be submitted through the official NXTQR
                  contact channel.
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
                      Privacy inquiries
                    </div>

                    <div className="mt-1 text-[10px] text-muted-foreground">
                      Contact the NXTQR team regarding privacy,
                      data or account requests.
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
                    Contact NXTQR

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
              </PolicySection>
            </article>

            {/* =============================================== */}
            {/* RIGHT CONTEXT                                   */}
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
                  <EyeOff className="h-4 w-4 text-primary" />

                  <div
                    className="
                      mt-4 font-mono text-[7px]
                      font-semibold uppercase
                      tracking-[0.14em]
                      text-primary
                    "
                  >
                    Privacy principle
                  </div>

                  <p className="mt-2 text-[9px] leading-5 text-muted-foreground">
                    Collect deliberately. Limit access. Retain with purpose.
                    Give people meaningful controls.
                  </p>
                </div>

                <div
                  className="
                    border border-border/60
                    bg-muted/[0.1]
                    p-4
                  "
                >
                  <Cookie className="h-4 w-4 text-primary" />

                  <div
                    className="
                      mt-4 font-mono text-[7px]
                      font-semibold uppercase
                      tracking-[0.14em]
                      text-primary
                    "
                  >
                    Related documents
                  </div>

                  <div className="mt-3 space-y-2">
                    <LegalLink href="/terms">
                      Terms of Service
                    </LegalLink>

                    <LegalLink href="/security">
                      Security Overview
                    </LegalLink>

                    <LegalLink href="/cookies">
                      Cookie Policy
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
                NXTQR / PRIVACY
              </div>

              <p className="mt-1 text-[9px] text-muted-foreground">
                Last updated September 2026.
              </p>
            </div>

            <div className="flex flex-wrap gap-x-5 gap-y-2">
              <BottomLink href="/terms">Terms</BottomLink>
              <BottomLink href="/security">Security</BottomLink>
              <BottomLink href="/cookies">Cookies</BottomLink>
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
/* POLICY SECTION                                            */
/* ========================================================= */

function PolicySection({
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
/* DATA CATEGORY                                             */
/* ========================================================= */

function DataCategory({
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
/* LIST                                                      */
/* ========================================================= */

function PolicyList({
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
/* SECURITY ITEM                                             */
/* ========================================================= */

function SecurityItem({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="bg-background p-3.5">
      <div className="flex items-center justify-between">
        <span
          className="
            font-mono text-[6px]
            tracking-[0.13em]
            text-muted-foreground
          "
        >
          {label}
        </span>

        <Icon className="h-3 w-3 text-primary" />
      </div>

      <div className="mt-2 text-[8px] font-semibold text-foreground">
        {value}
      </div>
    </div>
  );
}

/* ========================================================= */
/* META                                                      */
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
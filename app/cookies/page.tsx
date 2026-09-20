import * as React from "react";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Cookie Policy",
  description: "NXTQR cookie policy: details on necessary session cookies, preferences, telemetry storage, and scanner privacy.",
};
import {
  ArrowUpRight,
  CheckCircle2,
  Cookie,
  Database,
  EyeOff,
  FileText,
  Fingerprint,
  Globe2,
  KeyRound,
  LockKeyhole,
  Mail,
  MonitorSmartphone,
  QrCode,
  Settings2,
  ShieldCheck,
  SlidersHorizontal,
  TimerReset,
  UserRound,
} from "lucide-react";

import { MarketingHeader } from "@/components/marketing/header";
import { MarketingFooter } from "@/components/marketing/footer";
import { BRAND } from "@/config/brand";

const sections = [
  { id: "overview", label: "Overview" },
  { id: "technologies", label: "Cookies & storage" },
  { id: "necessary", label: "Strictly necessary" },
  { id: "preferences", label: "Preferences" },
  { id: "analytics", label: "Analytics" },
  { id: "scanner", label: "QR scanner privacy" },
  { id: "authentication", label: "Authentication" },
  { id: "third-party", label: "Third parties" },
  { id: "duration", label: "Cookie duration" },
  { id: "choices", label: "Your choices" },
  { id: "changes", label: "Policy changes" },
  { id: "contact", label: "Contact" },
];

const cookieCategories = [
  {
    index: "01",
    title: "Essential",
    status: "REQUIRED",
    description:
      "Storage required to provide core account, authentication, security or service functionality.",
    icon: LockKeyhole,
  },
  {
    index: "02",
    title: "Preferences",
    status: "CONDITIONAL",
    description:
      "Storage used to remember choices such as interface preferences where those features are implemented.",
    icon: Settings2,
  },
  {
    index: "03",
    title: "Analytics",
    status: "CONFIGURATION",
    description:
      "Optional measurement technologies, if enabled, should follow the applicable consent and privacy configuration.",
    icon: Database,
  },
  {
    index: "04",
    title: "Advertising",
    status: "NOT ASSUMED",
    description:
      "NXTQR should not claim to use or avoid advertising cookies until the deployed marketing stack is verified.",
    icon: EyeOff,
  },
];

export default function CookiesPage() {
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
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0"
          >
            <div
              className="
                absolute left-[8%] top-[18%]
                h-[30rem] w-[30rem]
                rounded-full
                bg-primary/[0.045]
                blur-[145px]
              "
            />

            <div
              className="
                absolute right-[5%] top-[42%]
                h-[24rem] w-[24rem]
                rounded-full
                bg-[#FFD06A]/[0.03]
                blur-[130px]
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
            <div className="max-w-[980px] pb-14 sm:pb-18 lg:pb-20">
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
                  <Cookie className="h-3 w-3" />
                </span>

                NXTQR Privacy Controls

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
                Cookies without
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
                  the mystery.
                </span>
              </h1>

              <p
                className="
                  mt-7 max-w-[760px]
                  text-sm leading-7
                  text-muted-foreground
                  sm:text-base
                "
              >
                This Cookie Policy explains how {BRAND.name} may use
                cookies and similar browser technologies, why they are
                used, how they differ between the NXTQR platform and QR
                scan resolution, and what choices may be available to you.
              </p>

              <div className="mt-7 flex flex-wrap gap-x-5 gap-y-2">
                <HeroTag>Authentication</HeroTag>
                <HeroTag>Preferences</HeroTag>
                <HeroTag>Measurement</HeroTag>
                <HeroTag>Scanner privacy</HeroTag>
              </div>
            </div>

            <div className="grid border-t border-border/60 sm:grid-cols-3">
              <MetaItem
                label="DOCUMENT"
                value="Cookie Policy"
                icon={FileText}
              />

              <MetaItem
                label="LAST UPDATED"
                value="September 2026"
                icon={TimerReset}
              />

              <MetaItem
                label="PLATFORM"
                value={BRAND.name}
                icon={Cookie}
                last
              />
            </div>
          </div>
        </section>

        {/* ================================================= */}
        {/* COOKIE ARCHITECTURE                               */}
        {/* ================================================= */}

        <section className="border-b border-border/60 bg-muted/[0.08]">
          <div className="mx-auto max-w-[1380px] px-4 py-12 sm:px-6 lg:px-8 lg:py-16 xl:px-10">
            <div className="mb-7 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <div className="font-mono text-[7px] font-semibold uppercase tracking-[0.16em] text-primary">
                  Storage classification
                </div>

                <h2 className="mt-2 font-display text-2xl font-medium tracking-[-0.03em] sm:text-3xl">
                  Different purposes. Different boundaries.
                </h2>
              </div>

              <p className="max-w-[460px] text-[10px] leading-5 text-muted-foreground">
                The exact technologies in each category should be generated
                from or reconciled with the production cookie and storage
                inventory.
              </p>
            </div>

            <div
              className="
                grid overflow-hidden
                border border-border/60
                bg-border/60
                sm:grid-cols-2
                xl:grid-cols-4
              "
            >
              {cookieCategories.map((category) => {
                const Icon = category.icon;

                return (
                  <div
                    key={category.title}
                    className="bg-background p-5 sm:p-6"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[7px] text-muted-foreground">
                        {category.index}
                      </span>

                      <Icon className="h-4 w-4 text-primary" />
                    </div>

                    <h3 className="mt-8 text-sm font-semibold">
                      {category.title}
                    </h3>

                    <span
                      className="
                        mt-2 inline-block
                        font-mono text-[6px]
                        font-semibold tracking-[0.12em]
                        text-primary
                      "
                    >
                      {category.status}
                    </span>

                    <p className="mt-4 text-[9px] leading-5 text-muted-foreground">
                      {category.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ================================================= */}
        {/* POLICY DOCUMENT                                   */}
        {/* ================================================= */}

        <section className="border-b border-border/60">
          <div
            className="
              mx-auto grid max-w-[1380px]
              lg:grid-cols-[270px_minmax(0,760px)_1fr]
              xl:grid-cols-[300px_minmax(0,800px)_1fr]
            "
          >
            {/* Navigation */}

            <aside className="hidden border-r border-border/60 px-6 py-16 lg:block xl:px-8">
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
                  aria-label="Cookie policy sections"
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

            {/* Content */}

            <article className="px-4 py-14 sm:px-8 sm:py-16 lg:px-10 xl:px-12">
              <PolicySection
                id="overview"
                number="01"
                title="Overview"
                icon={Cookie}
              >
                <p>
                  Cookies are small pieces of information that a website
                  can ask a browser to store. Websites may use cookies to
                  maintain authenticated sessions, remember settings,
                  support security controls, measure service usage or
                  provide other functionality.
                </p>

                <p>
                  {BRAND.name} may also use technologies that perform
                  similar functions, including browser storage or
                  server-side session identifiers. In this policy,
                  references to “cookies” may include similar technologies
                  where appropriate.
                </p>

                <Callout>
                  The production NXTQR cookie inventory should be the
                  authoritative source for cookie names, providers,
                  purposes and expiration periods.
                </Callout>
              </PolicySection>

              <PolicySection
                id="technologies"
                number="02"
                title="Cookies and similar technologies"
                icon={Fingerprint}
              >
                <p>
                  Different browser-storage technologies behave
                  differently. NXTQR may use only those technologies
                  required for the functionality that is actually enabled
                  in the deployed service.
                </p>

                <Technology
                  label="COOKIE"
                  title="Browser cookie"
                  description="A value associated with a website or domain that may be sent with qualifying browser requests."
                />

                <Technology
                  label="SESSION"
                  title="Session state"
                  description="Information used to maintain authenticated or security-sensitive interactions between requests."
                />

                <Technology
                  label="LOCAL"
                  title="Browser storage"
                  description="Client-side storage that may be used for appropriate non-secret preferences or application state."
                />

                <Technology
                  label="SERVER"
                  title="Server-side state"
                  description="Account or workspace state maintained by NXTQR infrastructure rather than stored directly in the browser."
                />
              </PolicySection>

              <PolicySection
                id="necessary"
                number="03"
                title="Strictly necessary technologies"
                icon={LockKeyhole}
              >
                <p>
                  Certain technologies may be necessary to provide
                  requested platform functionality and protect
                  authenticated interactions.
                </p>

                <p>Depending on the deployed authentication architecture, these may support:</p>

                <PolicyList
                  items={[
                    "Maintaining authenticated user sessions.",
                    "Protecting account and workspace access.",
                    "Supporting login, logout and session-expiration behavior.",
                    "Maintaining security-sensitive request state.",
                    "Preventing or detecting unauthorized or abusive interactions.",
                    "Preserving essential application state required for requested functionality.",
                  ]}
                />

                <p>
                  Because these technologies are required to provide
                  security or functionality requested by the user, blocking
                  them may prevent portions of the authenticated platform
                  from operating correctly.
                </p>
              </PolicySection>

              <PolicySection
                id="preferences"
                number="04"
                title="Preference storage"
                icon={SlidersHorizontal}
              >
                <p>
                  NXTQR may remember certain user interface choices where
                  preference functionality is implemented. Examples could
                  include appearance, interface configuration or other
                  non-essential product preferences.
                </p>

                <p>
                  Some preferences may be stored locally in a browser while
                  others may be associated with the authenticated account
                  and stored server-side.
                </p>

                <p>
                  Sensitive authentication credentials or secret API keys
                  should not be placed into ordinary client-side preference
                  storage.
                </p>
              </PolicySection>

              <PolicySection
                id="analytics"
                number="05"
                title="Website and product analytics"
                icon={Database}
              >
                <p>
                  NXTQR may use measurement technologies to understand how
                  the website or product is used, diagnose issues and
                  improve the service.
                </p>

                <p>
                  If optional analytics technologies that require consent
                  are deployed, their activation should respect applicable
                  consent requirements and the user's available privacy
                  choices.
                </p>

                <Callout icon={Settings2}>
                  Do not list a specific analytics provider in this policy
                  until that provider is actually deployed. Once selected,
                  add its name, purpose, storage mechanism and retention
                  behavior to the production cookie inventory.
                </Callout>
              </PolicySection>

              <PolicySection
                id="scanner"
                number="06"
                title="QR scanner privacy"
                icon={QrCode}
              >
                <p>
                  A QR scan is a different interaction from signing into
                  the NXTQR dashboard.
                </p>

                <div
                  className="
                    my-6 grid gap-px
                    overflow-hidden
                    border border-border/60
                    bg-border/60
                    sm:grid-cols-[1fr_70px_1fr]
                  "
                >
                  <ContextBlock
                    icon={QrCode}
                    label="SCAN CONTEXT"
                    title="QR resolution"
                    description="Resolve the QR identity and determine its configured destination."
                  />

                  <div className="hidden items-center justify-center bg-background sm:flex">
                    <ArrowUpRight className="h-4 w-4 rotate-45 text-primary/50" />
                  </div>

                  <ContextBlock
                    icon={UserRound}
                    label="ACCOUNT CONTEXT"
                    title="NXTQR platform"
                    description="Authenticate users and provide workspace management functionality."
                  />
                </div>

                <p>
                  Visiting an NXTQR-managed redirect endpoint should not,
                  by itself, require a scanner to become an authenticated
                  NXTQR user.
                </p>

                <p>
                  If the production redirect service does not set
                  advertising cookies or persistent cross-site tracking
                  identifiers for ordinary QR resolution, that behavior can
                  be stated explicitly here after it has been verified
                  against the deployed edge implementation.
                </p>

                <p>
                  A destination reached after the redirect may use its own
                  cookies or tracking technologies. Those technologies are
                  controlled by the destination operator rather than NXTQR.
                </p>
              </PolicySection>

              <PolicySection
                id="authentication"
                number="07"
                title="Authentication and security"
                icon={KeyRound}
              >
                <p>
                  Authentication may require cookies or related session
                  mechanisms to securely associate browser requests with an
                  authenticated session.
                </p>

                <p>
                  Where cookies contain session identifiers or other
                  security-sensitive values, the implementation should use
                  appropriate browser security attributes based on the
                  authentication architecture.
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
                  <SecurityProperty
                    label="TRANSPORT"
                    value="Secure delivery"
                    icon={ShieldCheck}
                  />

                  <SecurityProperty
                    label="ACCESS"
                    value="Session boundary"
                    icon={LockKeyhole}
                  />

                  <SecurityProperty
                    label="LIFECYCLE"
                    value="Expiry & revocation"
                    icon={TimerReset}
                  />
                </div>
              </PolicySection>

              <PolicySection
                id="third-party"
                number="08"
                title="Third-party technologies"
                icon={Globe2}
              >
                <p>
                  Some NXTQR functionality may depend on third-party
                  providers such as authentication, payment, infrastructure,
                  support or analytics services.
                </p>

                <p>
                  A third-party provider may set or access browser storage
                  when required for a feature that the user chooses to use.
                  Their processing may also be governed by their own privacy
                  documentation.
                </p>

                <p>
                  NXTQR's production cookie inventory should identify
                  relevant third-party technologies rather than describing
                  hypothetical integrations as though they were active.
                </p>
              </PolicySection>

              <PolicySection
                id="duration"
                number="09"
                title="Session and persistent cookies"
                icon={TimerReset}
              >
                <p>
                  Cookies may have different lifetimes depending on their
                  purpose.
                </p>

                <div className="grid gap-3 sm:grid-cols-2">
                  <DurationCard
                    title="Session"
                    description="Generally intended to support a browser session or short-lived interaction."
                  />

                  <DurationCard
                    title="Persistent"
                    description="May remain for a defined period to support an appropriate longer-lived purpose."
                  />
                </div>

                <p>
                  Exact expiration periods should be documented in the
                  production cookie table after the authentication,
                  preferences and analytics implementations are finalized.
                </p>
              </PolicySection>

              <PolicySection
                id="choices"
                number="10"
                title="Your cookie choices"
                icon={Settings2}
              >
                <p>
                  Browsers generally provide controls for viewing,
                  restricting or deleting cookies and site data. Blocking
                  necessary storage may affect login or other product
                  functionality.
                </p>

                <p>
                  Where NXTQR uses optional technologies requiring a user
                  choice, appropriate controls should be provided through a
                  consent interface or privacy settings as required.
                </p>

                <p>
                  Changing a browser or using another device may require
                  preferences to be configured again because browser
                  storage is generally specific to that browser or device.
                </p>
              </PolicySection>

              <PolicySection
                id="changes"
                number="11"
                title="Changes to this policy"
                icon={FileText}
              >
                <p>
                  We may update this Cookie Policy as the platform,
                  browser-storage technologies or applicable requirements
                  change.
                </p>

                <p>
                  When this policy changes, the “Last updated” date will be
                  revised. Material changes may receive additional notice
                  where appropriate or required.
                </p>
              </PolicySection>

              <PolicySection
                id="contact"
                number="12"
                title="Contact"
                icon={Mail}
                last
              >
                <p>
                  Questions regarding cookies, browser storage or privacy
                  controls can be submitted through the official NXTQR
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
                      Cookie, storage and privacy questions.
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

            {/* Right context */}

            <aside className="hidden border-l border-border/60 px-6 py-16 xl:block">
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
                    Scanner boundary
                  </div>

                  <p className="mt-2 text-[9px] leading-5 text-muted-foreground">
                    QR resolution and authenticated workspace access are
                    separate contexts with different technical needs.
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
                    <LegalLink href="/privacy">
                      Privacy Policy
                    </LegalLink>

                    <LegalLink href="/terms">
                      Terms of Service
                    </LegalLink>

                    <LegalLink href="/security">
                      Security Overview
                    </LegalLink>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </section>

        {/* ================================================= */}
        {/* BOTTOM RAIL                                       */}
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
                NXTQR / COOKIES
              </div>

              <p className="mt-1 text-[9px] text-muted-foreground">
                Last updated September 2026.
              </p>
            </div>

            <div className="flex flex-wrap gap-x-5 gap-y-2">
              <BottomLink href="/privacy">Privacy</BottomLink>
              <BottomLink href="/terms">Terms</BottomLink>
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
        scroll-mt-32 py-10 sm:py-12
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
              sm:text-xs sm:leading-[1.9]
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
/* TECHNOLOGY                                                */
/* ========================================================= */

function Technology({
  label,
  title,
  description,
}: {
  label: string;
  title: string;
  description: string;
}) {
  return (
    <div
      className="
        grid gap-2
        border border-border/60
        bg-muted/[0.08]
        p-4
        sm:grid-cols-[90px_150px_1fr]
        sm:items-start
      "
    >
      <span className="font-mono text-[6px] font-semibold tracking-[0.13em] text-primary">
        {label}
      </span>

      <span className="text-[9px] font-semibold text-foreground">
        {title}
      </span>

      <span className="text-[9px] leading-5 text-muted-foreground">
        {description}
      </span>
    </div>
  );
}

/* ========================================================= */
/* POLICY LIST                                               */
/* ========================================================= */

function PolicyList({ items }: { items: string[] }) {
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
/* CONTEXT                                                   */
/* ========================================================= */

function ContextBlock({
  icon: Icon,
  label,
  title,
  description,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  title: string;
  description: string;
}) {
  return (
    <div className="bg-background p-4">
      <Icon className="h-4 w-4 text-primary" />

      <div className="mt-5 font-mono text-[6px] font-semibold tracking-[0.14em] text-primary">
        {label}
      </div>

      <div className="mt-1 text-[10px] font-semibold text-foreground">
        {title}
      </div>

      <p className="mt-2 text-[8px] leading-4 text-muted-foreground">
        {description}
      </p>
    </div>
  );
}

/* ========================================================= */
/* SECURITY PROPERTY                                         */
/* ========================================================= */

function SecurityProperty({
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
        <span className="font-mono text-[6px] tracking-[0.13em] text-muted-foreground">
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
/* DURATION                                                  */
/* ========================================================= */

function DurationCard({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="border border-border/60 bg-muted/[0.08] p-4">
      <TimerReset className="h-3.5 w-3.5 text-primary" />

      <div className="mt-3 text-[9px] font-semibold text-foreground">
        {title}
      </div>

      <p className="mt-2 text-[8px] leading-4 text-muted-foreground">
        {description}
      </p>
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
        <span className="font-mono text-[7px] tracking-[0.14em] text-muted-foreground">
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
/* TAG                                                       */
/* ========================================================= */

function HeroTag({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="
        inline-flex items-center gap-1.5
        font-mono text-[8px]
        uppercase tracking-[0.1em]
        text-muted-foreground
      "
    >
      <span className="h-1 w-1 bg-primary" />
      {children}
    </span>
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
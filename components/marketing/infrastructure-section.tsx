import * as React from "react";
import {
  Activity,
  ArrowDown,
  ArrowRight,
  BarChart3,
  Database,
  Gauge,
  Globe2,
  KeyRound,
  Layers3,
  LockKeyhole,
  Network,
  QrCode,
  Radio,
  Route,
  Server,
  ShieldCheck,
  Zap,
} from "lucide-react";

export function InfrastructureSection() {
  return (
    <section
      id="infrastructure"
      className="
        relative isolate overflow-hidden
        border-b border-border/60
        bg-background
        py-20 sm:py-24 lg:py-32
      "
    >
      {/* ================================================= */}
      {/* BACKGROUND                                       */}
      {/* ================================================= */}

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
      >
        <div
          className="
            absolute left-1/2 top-[45%]
            h-[40rem] w-[60rem]
            -translate-x-1/2 -translate-y-1/2
            rounded-full
            bg-primary/[0.035]
            blur-[150px]
          "
        />

        <div
          className="
            absolute inset-0 opacity-[0.22]
            [background-image:linear-gradient(to_right,hsl(var(--border)/.35)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border)/.25)_1px,transparent_1px)]
            [background-size:64px_64px]
            [mask-image:radial-gradient(ellipse_80%_80%_at_50%_50%,black,transparent)]
          "
        />
      </div>

      <div className="relative mx-auto max-w-[1380px] px-4 sm:px-6 lg:px-8 xl:px-10">
        {/* ================================================= */}
        {/* HEADER                                           */}
        {/* ================================================= */}

        <div
          className="
            mb-12 grid gap-7
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
                <Network className="h-3 w-3" />
              </span>

              NXTQR Infrastructure

              <span className="h-px w-8 bg-primary/30 sm:w-12" />
            </div>

            <h2
              className="
                mt-5 max-w-[880px]
                font-display font-medium
                tracking-[-0.045em]
                text-foreground
                text-[clamp(2.7rem,10vw,4.4rem)]
                leading-[0.96]
                sm:text-[clamp(4rem,7vw,5.7rem)]
                lg:text-[clamp(4.8rem,5.7vw,6.2rem)]
              "
            >
              Three planes.
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
                One scan path.
              </span>
            </h2>
          </div>

          <div className="lg:pb-1">
            <p className="text-sm leading-6 text-muted-foreground sm:text-base sm:leading-7">
              NXTQR separates configuration, redirect resolution and
              intelligence workloads so non-critical processing does not need
              to sit directly in the scan-resolution path.
            </p>

            <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2">
              <ArchitectureTag>Control</ArchitectureTag>
              <ArchitectureTag>Edge</ArchitectureTag>
              <ArchitectureTag>Intelligence</ArchitectureTag>
            </div>
          </div>
        </div>

        {/* ================================================= */}
        {/* ARCHITECTURE FRAME                                */}
        {/* ================================================= */}

        <div
          className="
            overflow-hidden
            rounded-[20px]
            border border-border/70
            bg-card/80
            shadow-[0_35px_100px_rgba(31,31,31,.07)]
            backdrop-blur-xl
            sm:rounded-[24px]
            lg:rounded-[28px]
          "
        >
          {/* System top rail */}

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
                <Layers3 className="h-3.5 w-3.5" />
              </span>

              <div>
                <div className="text-[10px] font-semibold text-foreground sm:text-xs">
                  NXTQR Runtime Topology
                </div>

                <div className="hidden font-mono text-[7px] text-muted-foreground sm:block">
                  CONTROL / EDGE / INTELLIGENCE
                </div>
              </div>
            </div>

            <div
              className="
                hidden items-center gap-4
                font-mono text-[7px]
                uppercase tracking-[0.12em]
                text-muted-foreground
                sm:flex
              "
            >
              <span>Configuration</span>
              <span className="text-primary">→</span>
              <span>Resolution</span>
              <span className="text-primary">→</span>
              <span>Signals</span>
            </div>
          </div>

          {/* ================================================= */}
          {/* MAIN TOPOLOGY                                    */}
          {/* ================================================= */}

          <div className="p-4 sm:p-6 lg:p-8">
            {/* Incoming physical scan */}

            <div className="mb-5 flex justify-center lg:mb-7">
              <div
                className="
                  inline-flex items-center gap-3
                  border border-border/70
                  bg-background
                  px-3 py-2.5
                  shadow-sm
                "
              >
                <span
                  className="
                    flex h-8 w-8 items-center justify-center
                    bg-foreground text-background
                  "
                >
                  <QrCode className="h-3.5 w-3.5" />
                </span>

                <div>
                  <div className="font-mono text-[6px] uppercase tracking-[0.14em] text-muted-foreground">
                    Physical layer
                  </div>

                  <div className="mt-0.5 text-[9px] font-semibold text-foreground">
                    QR scan enters NXTQR
                  </div>
                </div>

                <Radio className="ml-2 h-3 w-3 text-primary" />
              </div>
            </div>

            <div className="flex h-6 justify-center">
              <div
                className="
                  relative h-full w-px
                  bg-gradient-to-b
                  from-primary/60 to-border
                "
              >
                <ArrowDown
                  className="
                    absolute -bottom-1.5 left-1/2
                    h-3 w-3 -translate-x-1/2
                    text-primary
                  "
                />
              </div>
            </div>

            {/* Three plane architecture */}

            <div
              className="
                mt-3 grid gap-4
                lg:grid-cols-[minmax(0,.92fr)_70px_minmax(0,1.16fr)_70px_minmax(0,.92fr)]
                lg:items-stretch
              "
            >
              {/* =========================================== */}
              {/* CONTROL PLANE                               */}
              {/* =========================================== */}

              <Plane
                index="01"
                eyebrow="CONTROL PLANE"
                title="Configure"
                icon={Server}
                accent="primary"
              >
                <p className="text-[9px] leading-4 text-muted-foreground sm:text-[10px]">
                  Manage QR assets, destinations, routing rules, workspace
                  permissions and configuration away from the redirect
                  runtime.
                </p>

                <div className="mt-5 space-y-2">
                  <PlaneModule
                    icon={QrCode}
                    title="QR assets"
                    meta="Identity + destination"
                  />

                  <PlaneModule
                    icon={Route}
                    title="Routing rules"
                    meta="Conditions + policies"
                  />

                  <PlaneModule
                    icon={KeyRound}
                    title="Authorization"
                    meta="Workspace + RBAC"
                  />
                </div>

                <div
                  className="
                    mt-5 border-t border-primary/10
                    pt-4
                  "
                >
                  <SpecLine>Next.js application</SpecLine>
                  <SpecLine>Authoritative Database</SpecLine>
                  <SpecLine>Configuration authority</SpecLine>
                </div>
              </Plane>

              {/* publish connector */}

              <DesktopConnector
                topLabel="PUBLISH"
                bottomLabel="SNAPSHOT"
                tone="primary"
              />

              <MobileConnector
                label="Publish routing state"
                tone="primary"
              />

              {/* =========================================== */}
              {/* EDGE PLANE                                  */}
              {/* =========================================== */}

              <div
                className="
                  relative overflow-hidden
                  border border-[#FFA110]/25
                  bg-[#FFA110]/[0.035]
                  p-4
                  sm:p-5
                  lg:p-6
                "
              >
                {/* core glow */}

                <div
                  aria-hidden="true"
                  className="
                    absolute left-1/2 top-[30%]
                    h-48 w-48
                    -translate-x-1/2
                    rounded-full
                    bg-[#FFA110]/[0.07]
                    blur-[60px]
                  "
                />

                <div className="relative">
                  <div className="flex items-start justify-between">
                    <div>
                      <div
                        className="
                          font-mono text-[7px]
                          font-semibold uppercase
                          tracking-[0.16em]
                          text-[#FF8105]
                        "
                      >
                        02 / EDGE DATA PLANE
                      </div>

                      <h3
                        className="
                          mt-2 font-display
                          text-2xl font-medium
                          tracking-[-0.03em]
                          text-foreground
                          sm:text-3xl
                        "
                      >
                        Resolve
                      </h3>
                    </div>

                    <span
                      className="
                        flex h-10 w-10 items-center justify-center
                        rounded-xl
                        bg-gradient-to-br
                        from-primary via-[#FF8105]
                        to-[#FFB83E]
                        text-white
                        shadow-[0_10px_30px_rgba(255,129,5,.18)]
                      "
                    >
                      <Zap className="h-4 w-4" />
                    </span>
                  </div>

                  <p className="mt-4 text-[9px] leading-4 text-muted-foreground sm:text-[10px]">
                    Resolve the permanent QR identity against published
                    routing state and return the selected destination.
                  </p>

                  {/* Edge resolver visual */}

                  <div
                    className="
                      relative mt-6 overflow-hidden
                      border border-[#FFA110]/20
                      bg-background/80
                      p-4
                    "
                  >
                    <div
                      className="
                        flex items-center justify-between
                        border-b border-border/60
                        pb-3
                      "
                    >
                      <span className="font-mono text-[7px] text-muted-foreground">
                        EDGE RESOLVER
                      </span>

                      <span className="flex items-center gap-1.5 font-mono text-[7px] text-[#FF8105]">
                        <span className="h-1.5 w-1.5 rounded-full bg-[#FFA110]" />
                        HOT PATH
                      </span>
                    </div>

                    <div className="mt-4 grid grid-cols-[1fr_auto_1fr] items-center gap-2">
                      <EdgeNode
                        label="SLUG"
                        value="/summer"
                      />

                      <ArrowRight className="h-3 w-3 text-[#FFA110]" />

                      <EdgeNode
                        label="ROUTE"
                        value="destination"
                      />
                    </div>

                    <div className="mt-4 flex items-center gap-2">
                      <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[#FFA110]/40 to-[#FFA110]/40" />

                      <Globe2 className="h-3 w-3 text-[#FFA110]" />

                      <div className="h-px flex-1 bg-gradient-to-r from-[#FFA110]/40 via-[#FFA110]/40 to-transparent" />
                    </div>

                    <div className="mt-3 text-center font-mono text-[7px] uppercase tracking-[0.12em] text-muted-foreground">
                      Selected destination
                    </div>
                  </div>

                  <div className="mt-5 grid grid-cols-2 gap-px overflow-hidden border border-border/60 bg-border/60">
                    <EdgeProperty
                      label="RUNTIME"
                      value="Workers"
                    />

                    <EdgeProperty
                      label="STATE"
                      value="KV snapshot"
                    />
                  </div>

                  <div className="mt-4">
                    <SpecLine>Redirect-focused runtime</SpecLine>
                    <SpecLine>Published routing snapshot</SpecLine>
                    <SpecLine>Async telemetry handoff</SpecLine>
                  </div>
                </div>
              </div>

              {/* event connector */}

              <DesktopConnector
                topLabel="DISPATCH"
                bottomLabel="ASYNC EVENT"
                tone="emerald"
                dashed
              />

              <MobileConnector
                label="Dispatch scan event asynchronously"
                tone="emerald"
                dashed
              />

              {/* =========================================== */}
              {/* INTELLIGENCE PLANE                          */}
              {/* =========================================== */}

              <Plane
                index="03"
                eyebrow="INTELLIGENCE PLANE"
                title="Understand"
                icon={Activity}
                accent="emerald"
              >
                <p className="text-[9px] leading-4 text-muted-foreground sm:text-[10px]">
                  Process scan events, build analytics and evaluate
                  destination-health signals independently from the redirect
                  response.
                </p>

                <div className="mt-5 space-y-2">
                  <PlaneModule
                    icon={Database}
                    title="Event pipeline"
                    meta="Asynchronous ingestion"
                    accent="emerald"
                  />

                  <PlaneModule
                    icon={BarChart3}
                    title="Analytics"
                    meta="Aggregated signals"
                    accent="emerald"
                  />

                  <PlaneModule
                    icon={ShieldCheck}
                    title="Guardian"
                    meta="Destination health"
                    accent="emerald"
                  />
                </div>

                <div
                  className="
                    mt-5 border-t border-emerald-500/10
                    pt-4
                  "
                >
                  <SpecLine>Durable Event Queue</SpecLine>
                  <SpecLine>Aggregated analytics</SpecLine>
                  <SpecLine>Health evaluation</SpecLine>
                </div>
              </Plane>
            </div>

            {/* ================================================= */}
            {/* OUTPUT PATH                                       */}
            {/* ================================================= */}

            <div className="mt-7 flex justify-center">
              <div
                className="
                  flex w-full max-w-[640px]
                  items-center gap-3
                "
              >
                <div className="h-px flex-1 bg-gradient-to-r from-transparent to-primary/25" />

                <div
                  className="
                    flex items-center gap-2
                    border border-primary/15
                    bg-primary/[0.035]
                    px-3 py-2
                  "
                >
                  <Globe2 className="h-3 w-3 text-primary" />

                  <span
                    className="
                      font-mono text-[7px]
                      uppercase tracking-[0.12em]
                      text-muted-foreground
                    "
                  >
                    Destination response
                  </span>

                  <ArrowRight className="h-3 w-3 text-primary" />
                </div>

                <div className="h-px flex-1 bg-gradient-to-l from-transparent to-primary/25" />
              </div>
            </div>
          </div>

          {/* ================================================= */}
          {/* ARCHITECTURE PRINCIPLES                           */}
          {/* ================================================= */}

          <div
            className="
              grid grid-cols-2
              border-t border-border/60
              bg-muted/[0.13]
              lg:grid-cols-4
            "
          >
            <ArchitecturePrinciple
              index="01"
              icon={ShieldCheck}
              title="ISOLATE"
              value="Critical workloads"
            />

            <ArchitecturePrinciple
              index="02"
              icon={Zap}
              title="RESOLVE"
              value="At the edge"
            />

            <ArchitecturePrinciple
              index="03"
              icon={Activity}
              title="DISPATCH"
              value="Telemetry async"
            />

            <ArchitecturePrinciple
              index="04"
              icon={Database}
              title="ANALYZE"
              value="Outside hot path"
            />
          </div>
        </div>

        {/* ================================================= */}
        {/* EXPLANATION                                       */}
        {/* ================================================= */}

        <div
          className="
            mt-7 grid gap-4
            lg:grid-cols-[1fr_auto_1fr]
            lg:items-center
          "
        >
          <p className="max-w-xl text-[10px] leading-5 text-muted-foreground sm:text-[11px]">
            Configuration and analytics work should not need to execute
            synchronously for every scan. NXTQR&apos;s architecture keeps the
            redirect path focused on resolving and returning a destination.
          </p>

          <div className="hidden h-8 w-px bg-border lg:block" />

          <div
            className="
              flex flex-wrap gap-2
              lg:justify-end
            "
          >
            <TechnicalChip icon={Server}>
              Control
            </TechnicalChip>

            <TechnicalChip icon={Zap}>
              Edge
            </TechnicalChip>

            <TechnicalChip icon={Activity}>
              Intelligence
            </TechnicalChip>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ========================================================= */
/* PLANE                                                     */
/* ========================================================= */

function Plane({
  index,
  eyebrow,
  title,
  icon: Icon,
  accent,
  children,
}: {
  index: string;
  eyebrow: string;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  accent: "primary" | "emerald";
  children: React.ReactNode;
}) {
  const isEmerald = accent === "emerald";

  return (
    <div
      className={`
        relative overflow-hidden
        border p-4 sm:p-5 lg:p-6
        ${
          isEmerald
            ? "border-emerald-500/20 bg-emerald-500/[0.025]"
            : "border-primary/20 bg-primary/[0.025]"
        }
      `}
    >
      <div
        aria-hidden="true"
        className={`
          absolute -right-16 -top-16
          h-36 w-36 rounded-full blur-[60px]
          ${
            isEmerald
              ? "bg-emerald-500/[0.05]"
              : "bg-primary/[0.05]"
          }
        `}
      />

      <div className="relative">
        <div className="flex items-start justify-between">
          <div>
            <div
              className={`
                font-mono text-[7px]
                font-semibold uppercase
                tracking-[0.16em]
                ${
                  isEmerald
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-primary"
                }
              `}
            >
              {index} / {eyebrow}
            </div>

            <h3
              className="
                mt-2 font-display
                text-2xl font-medium
                tracking-[-0.03em]
                text-foreground
                sm:text-3xl
              "
            >
              {title}
            </h3>
          </div>

          <span
            className={`
              flex h-10 w-10
              items-center justify-center
              border
              ${
                isEmerald
                  ? "border-emerald-500/20 bg-emerald-500/[0.06] text-emerald-600 dark:text-emerald-400"
                  : "border-primary/20 bg-primary/[0.06] text-primary"
              }
            `}
          >
            <Icon className="h-4 w-4" />
          </span>
        </div>

        <div className="mt-4">
          {children}
        </div>
      </div>
    </div>
  );
}

/* ========================================================= */
/* PLANE MODULE                                              */
/* ========================================================= */

function PlaneModule({
  icon: Icon,
  title,
  meta,
  accent = "primary",
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  meta: string;
  accent?: "primary" | "emerald";
}) {
  return (
    <div
      className="
        group flex items-center gap-3
        border border-border/60
        bg-background/70
        p-2.5
        transition-colors
        hover:bg-background
      "
    >
      <span
        className={`
          flex h-7 w-7 shrink-0
          items-center justify-center
          border border-border/60
          ${
            accent === "emerald"
              ? "text-emerald-600 dark:text-emerald-400"
              : "text-primary"
          }
        `}
      >
        <Icon className="h-3 w-3" />
      </span>

      <div className="min-w-0">
        <div className="text-[8px] font-semibold text-foreground sm:text-[9px]">
          {title}
        </div>

        <div className="mt-0.5 truncate font-mono text-[6px] text-muted-foreground sm:text-[7px]">
          {meta}
        </div>
      </div>
    </div>
  );
}

/* ========================================================= */
/* EDGE NODE                                                 */
/* ========================================================= */

function EdgeNode({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="min-w-0 text-center">
      <div className="font-mono text-[6px] tracking-[0.12em] text-muted-foreground">
        {label}
      </div>

      <div
        className="
          mt-1 truncate
          border border-[#FFA110]/15
          bg-[#FFA110]/[0.035]
          px-2 py-2
          font-mono text-[7px]
          text-foreground
        "
      >
        {value}
      </div>
    </div>
  );
}

/* ========================================================= */
/* EDGE PROPERTY                                             */
/* ========================================================= */

function EdgeProperty({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="bg-background p-3">
      <div className="font-mono text-[6px] tracking-[0.12em] text-muted-foreground">
        {label}
      </div>

      <div className="mt-1 text-[8px] font-semibold text-foreground">
        {value}
      </div>
    </div>
  );
}

/* ========================================================= */
/* SPEC                                                      */
/* ========================================================= */

function SpecLine({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className="
        flex items-center gap-2
        py-1
        font-mono text-[7px]
        text-muted-foreground
        sm:text-[8px]
      "
    >
      <span className="h-1 w-1 shrink-0 bg-current opacity-50" />
      {children}
    </div>
  );
}

/* ========================================================= */
/* DESKTOP CONNECTOR                                         */
/* ========================================================= */

function DesktopConnector({
  topLabel,
  bottomLabel,
  tone,
  dashed = false,
}: {
  topLabel: string;
  bottomLabel: string;
  tone: "primary" | "emerald";
  dashed?: boolean;
}) {
  const color =
    tone === "emerald"
      ? "text-emerald-500"
      : "text-primary";

  return (
    <div
      className="
        relative hidden
        items-center justify-center
        lg:flex
      "
    >
      <div className="absolute inset-x-0 top-1/2 -translate-y-1/2">
        <div
          className={`
            relative border-t
            ${
              dashed
                ? "border-dashed"
                : ""
            }
            ${
              tone === "emerald"
                ? "border-emerald-500/30"
                : "border-primary/30"
            }
          `}
        >
          <ArrowRight
            className={`
              absolute -right-1.5 top-1/2
              h-3 w-3 -translate-y-1/2
              ${color}
            `}
          />
        </div>
      </div>

      <div
        className="
          relative z-10
          bg-card px-1.5
          text-center font-mono
        "
      >
        <div
          className={`
            text-[6px]
            ${
              tone === "emerald"
                ? "text-emerald-600 dark:text-emerald-400"
                : "text-primary"
            }
          `}
        >
          {topLabel}
        </div>

        <div className="mt-0.5 text-[5px] text-muted-foreground">
          {bottomLabel}
        </div>
      </div>
    </div>
  );
}

/* ========================================================= */
/* MOBILE CONNECTOR                                          */
/* ========================================================= */

function MobileConnector({
  label,
  tone,
  dashed = false,
}: {
  label: string;
  tone: "primary" | "emerald";
  dashed?: boolean;
}) {
  return (
    <div className="flex items-center justify-center gap-3 py-1 lg:hidden">
      <div
        className={`
          h-5 border-l
          ${dashed ? "border-dashed" : ""}
          ${
            tone === "emerald"
              ? "border-emerald-500/35"
              : "border-primary/35"
          }
        `}
      />

      <span
        className={`
          font-mono text-[6px]
          uppercase tracking-[0.12em]
          ${
            tone === "emerald"
              ? "text-emerald-600 dark:text-emerald-400"
              : "text-primary"
          }
        `}
      >
        {label}
      </span>

      <ArrowDown
        className={`
          h-3 w-3
          ${
            tone === "emerald"
              ? "text-emerald-500"
              : "text-primary"
          }
        `}
      />
    </div>
  );
}

/* ========================================================= */
/* PRINCIPLE                                                 */
/* ========================================================= */

function ArchitecturePrinciple({
  index,
  icon: Icon,
  title,
  value,
}: {
  index: string;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  value: string;
}) {
  return (
    <div
      className="
        min-h-[92px]
        border-b border-r border-border/60
        p-3.5
        sm:p-4
        lg:min-h-[100px]
        lg:border-b-0
        lg:px-5

        [&:nth-child(2n)]:border-r-0
        lg:[&:nth-child(2n)]:border-r
        lg:last:border-r-0
      "
    >
      <div className="flex items-start justify-between">
        <Icon className="h-3 w-3 text-primary" />

        <span className="font-mono text-[6px] text-muted-foreground">
          {index}
        </span>
      </div>

      <div className="mt-4 font-mono text-[7px] tracking-[0.16em] text-primary">
        {title}
      </div>

      <div className="mt-1 text-[9px] font-medium text-foreground sm:text-[10px]">
        {value}
      </div>
    </div>
  );
}

/* ========================================================= */
/* TAG                                                       */
/* ========================================================= */

function ArchitectureTag({
  children,
}: {
  children: React.ReactNode;
}) {
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
/* TECHNICAL CHIP                                            */
/* ========================================================= */

function TechnicalChip({
  icon: Icon,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}) {
  return (
    <span
      className="
        inline-flex h-8 items-center
        gap-2 border border-border/70
        bg-card px-3
        font-mono text-[7px]
        uppercase tracking-[0.1em]
        text-muted-foreground
      "
    >
      <Icon className="h-3 w-3 text-primary" />
      {children}
    </span>
  );
}
import * as React from "react";
import Link from "next/link";
import {
  Activity,
  ArrowRight,
  Check,
  Database,
  EyeOff,
  FileKey2,
  FileText,
  Fingerprint,
  KeyRound,
  LockKeyhole,
  Network,
  QrCode,
  Shield,
  ShieldCheck,
  UserRoundCheck,
} from "lucide-react";

import { Button } from "@/components/ui/button";

const controls = [
  {
    number: "01",
    title: "MINIMIZE",
    name: "Scan data",
    description:
      "Collect only the scan information required for routing, operations and privacy-aware analytics.",
    icon: EyeOff,
  },
  {
    number: "02",
    title: "AUTHORIZE",
    name: "Workspace actions",
    description:
      "Validate authenticated membership and permissions on protected server-side operations.",
    icon: UserRoundCheck,
  },
  {
    number: "03",
    title: "PROTECT",
    name: "Developer access",
    description:
      "Use scoped credentials and controlled access boundaries for developer-facing capabilities.",
    icon: KeyRound,
  },
  {
    number: "04",
    title: "TRACE",
    name: "Sensitive changes",
    description:
      "Record security-relevant and administrative activity for operational visibility and review.",
    icon: FileText,
  },
];

export function SecuritySection() {
  return (
    <section
      id="security"
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
            absolute left-1/2 top-[45%]
            h-[34rem] w-[55rem]
            -translate-x-1/2 -translate-y-1/2
            rounded-full
            bg-primary/[0.035]
            blur-[150px]
          "
        />

        <div
          className="
            absolute inset-0 opacity-[0.18]
            [background-image:linear-gradient(to_right,hsl(var(--border)/.3)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border)/.22)_1px,transparent_1px)]
            [background-size:72px_72px]
            [mask-image:radial-gradient(ellipse_80%_75%_at_50%_50%,black,transparent)]
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
            lg:grid-cols-[minmax(0,1fr)_430px]
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
                <Shield className="h-3 w-3" />
              </span>

              Security & Privacy

              <span className="h-px w-8 bg-primary/30 sm:w-12" />
            </div>

            <h2
              className="
                mt-5 max-w-[930px]
                font-display font-medium
                tracking-[-0.05em]
                text-foreground
                text-[clamp(2.8rem,10vw,4.5rem)]
                leading-[0.95]
                sm:text-[clamp(4rem,7.3vw,5.8rem)]
                lg:text-[clamp(4.9rem,5.8vw,6.3rem)]
              "
            >
              Trust should have
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
                visible boundaries.
              </span>
            </h2>
          </div>

          <div className="lg:pb-1">
            <p className="text-sm leading-6 text-muted-foreground sm:text-base sm:leading-7">
              NXTQR is designed around explicit trust boundaries:
              minimize scan data, authorize protected operations, constrain
              developer access and preserve visibility into sensitive changes.
            </p>

            <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2">
              <SecurityTag>Minimize</SecurityTag>
              <SecurityTag>Authorize</SecurityTag>
              <SecurityTag>Protect</SecurityTag>
              <SecurityTag>Trace</SecurityTag>
            </div>
          </div>
        </div>

        {/* ================================================= */}
        {/* TRUST BOUNDARY                                    */}
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
          {/* system rail */}

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
                <LockKeyhole className="h-3.5 w-3.5" />
              </span>

              <div>
                <div className="text-[10px] font-semibold text-foreground sm:text-xs">
                  NXTQR Trust Boundary
                </div>

                <div className="hidden font-mono text-[7px] text-muted-foreground sm:block">
                  DATA / IDENTITY / ACCESS / ACTIVITY
                </div>
              </div>
            </div>

            <div
              className="
                flex items-center gap-1.5
                font-mono text-[7px]
                uppercase tracking-[0.12em]
                text-primary
              "
            >
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              CONTROL MAP
            </div>
          </div>

          {/* ================================================= */}
          {/* MAIN SECURITY MAP                                */}
          {/* ================================================= */}

          <div
            className="
              grid
              lg:grid-cols-[0.35fr_0.65fr]
            "
          >
            {/* =============================================== */}
            {/* LEFT: TRUST PRINCIPLE                           */}
            {/* =============================================== */}

            <div
              className="
                relative overflow-hidden
                border-b border-border/60
                p-5
                sm:p-7
                lg:border-b-0
                lg:border-r
                lg:p-8
              "
            >
              <div
                aria-hidden="true"
                className="
                  absolute -left-20 top-16
                  h-56 w-56 rounded-full
                  bg-primary/[0.05]
                  blur-[90px]
                "
              />

              <div className="relative">
                <div
                  className="
                    font-mono text-[7px]
                    uppercase tracking-[0.16em]
                    text-muted-foreground
                  "
                >
                  Security principle
                </div>

                <h3
                  className="
                    mt-3 max-w-[350px]
                    font-display text-3xl
                    font-medium tracking-[-0.04em]
                    text-foreground
                    sm:text-4xl
                  "
                >
                  Reduce trust.
                  <br />
                  Verify boundaries.
                </h3>

                <p
                  className="
                    mt-4 max-w-[360px]
                    text-[10px] leading-[1.8]
                    text-muted-foreground
                    sm:text-[11px]
                  "
                >
                  Security-sensitive operations should cross explicit
                  authorization and data boundaries instead of relying on
                  assumptions made by the browser or presentation layer.
                </p>

                {/* security core */}

                <div
                  className="
                    relative mx-auto mt-9
                    flex aspect-square
                    max-w-[270px]
                    items-center justify-center
                  "
                >
                  {/* outer boundary */}

                  <div
                    className="
                      absolute inset-0
                      rounded-full
                      border border-dashed
                      border-primary/20
                    "
                  />

                  <div
                    className="
                      absolute inset-[12%]
                      rounded-full
                      border border-primary/10
                    "
                  />

                  <div
                    className="
                      absolute inset-[25%]
                      rounded-full
                      border border-border/80
                      bg-background/80
                    "
                  />

                  {/* cross hairs */}

                  <div className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-gradient-to-b from-transparent via-border/70 to-transparent" />

                  <div className="absolute left-0 top-1/2 h-px w-full -translate-y-1/2 bg-gradient-to-r from-transparent via-border/70 to-transparent" />

                  {/* core */}

                  <div
                    className="
                      relative z-10
                      flex h-[92px] w-[92px]
                      flex-col items-center justify-center
                      rounded-[24px]
                      bg-gradient-to-br
                      from-primary
                      via-[#FF8105]
                      to-[#FFB83E]
                      text-white
                      shadow-[0_20px_55px_rgba(250,82,15,.18)]
                    "
                  >
                    <ShieldCheck className="h-6 w-6" />

                    <span
                      className="
                        mt-2 font-mono text-[6px]
                        uppercase tracking-[0.14em]
                      "
                    >
                      TRUST CORE
                    </span>
                  </div>

                  {/* orbit nodes */}

                  <OrbitNode
                    className="left-[2%] top-[47%]"
                    icon={EyeOff}
                  />

                  <OrbitNode
                    className="right-[2%] top-[47%]"
                    icon={KeyRound}
                  />

                  <OrbitNode
                    className="left-[47%] top-[2%]"
                    icon={LockKeyhole}
                  />

                  <OrbitNode
                    className="bottom-[2%] left-[47%]"
                    icon={FileText}
                  />
                </div>
              </div>
            </div>

            {/* =============================================== */}
            {/* RIGHT: SECURITY FLOW                            */}
            {/* =============================================== */}

            <div className="p-4 sm:p-6 lg:p-8">
              <div className="flex items-center justify-between">
                <div>
                  <div
                    className="
                      font-mono text-[7px]
                      uppercase tracking-[0.16em]
                      text-muted-foreground
                    "
                  >
                    Control sequence
                  </div>

                  <div className="mt-1 text-[10px] font-semibold text-foreground">
                    Boundaries across the platform
                  </div>
                </div>

                <Network className="h-3.5 w-3.5 text-primary" />
              </div>

              {/* flow */}

              <div className="relative mt-7">
                {/* desktop horizontal line */}

                <div
                  aria-hidden="true"
                  className="
                    absolute left-[7%] right-[7%]
                    top-[27px]
                    hidden h-px
                    bg-gradient-to-r
                    from-primary/20
                    via-primary/50
                    to-[#FFD06A]/25
                    md:block
                  "
                />

                <div className="grid gap-3 md:grid-cols-4">
                  {controls.map((control, index) => {
                    const Icon = control.icon;

                    return (
                      <div
                        key={control.number}
                        className="
                          group relative
                          border border-border/60
                          bg-background/70
                          p-3.5
                          transition-colors
                          hover:border-primary/20
                          hover:bg-primary/[0.018]
                          sm:p-4
                        "
                      >
                        <div className="relative z-10 flex items-start justify-between">
                          <span
                            className="
                              flex h-[54px] w-[54px]
                              items-center justify-center
                              border border-primary/20
                              bg-background
                              text-primary
                              shadow-sm
                            "
                          >
                            <Icon className="h-4 w-4" />
                          </span>

                          <span className="font-mono text-[6px] text-muted-foreground">
                            {control.number}
                          </span>
                        </div>

                        <div
                          className="
                            mt-5 font-mono text-[7px]
                            font-semibold uppercase
                            tracking-[0.15em]
                            text-primary
                          "
                        >
                          {control.title}
                        </div>

                        <h4 className="mt-1.5 text-[10px] font-semibold text-foreground">
                          {control.name}
                        </h4>

                        <p
                          className="
                            mt-2 text-[8px]
                            leading-[1.7]
                            text-muted-foreground
                            sm:text-[9px]
                          "
                        >
                          {control.description}
                        </p>

                        {index < controls.length - 1 && (
                          <ArrowRight
                            aria-hidden="true"
                            className="
                              absolute -bottom-2 left-1/2 z-20
                              h-3 w-3
                              -translate-x-1/2 rotate-90
                              bg-card text-primary/50
                              md:-right-2 md:bottom-auto
                              md:left-auto md:top-[22px]
                              md:translate-x-0 md:rotate-0
                            "
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* ============================================= */}
              {/* REQUEST BOUNDARY                              */}
              {/* ============================================= */}

              <div
                className="
                  mt-7 overflow-hidden
                  border border-border/60
                "
              >
                <div
                  className="
                    flex items-center justify-between
                    border-b border-border/60
                    bg-muted/[0.15]
                    px-3 py-2.5
                  "
                >
                  <div className="flex items-center gap-2">
                    <Fingerprint className="h-3 w-3 text-primary" />

                    <span
                      className="
                        font-mono text-[7px]
                        uppercase tracking-[0.14em]
                        text-muted-foreground
                      "
                    >
                      Protected operation
                    </span>
                  </div>

                  <span className="font-mono text-[7px] text-primary">
                    VERIFY
                  </span>
                </div>

                <div
                  className="
                    grid gap-px bg-border/60
                    sm:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr]
                  "
                >
                  <BoundaryStep
                    label="REQUEST"
                    value="Mutation"
                    icon={Activity}
                  />

                  <BoundaryArrow />

                  <BoundaryStep
                    label="IDENTITY"
                    value="Authenticated"
                    icon={Fingerprint}
                  />

                  <BoundaryArrow />

                  <BoundaryStep
                    label="ACCESS"
                    value="Authorized"
                    icon={LockKeyhole}
                  />

                  <BoundaryArrow />

                  <BoundaryStep
                    label="ACTION"
                    value="Execute"
                    icon={Check}
                    active
                  />
                </div>
              </div>

              {/* ============================================= */}
              {/* SECURITY DOMAINS                              */}
              {/* ============================================= */}

              <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
                <SecurityDomain
                  icon={Database}
                  title="DATA"
                  value="Minimized"
                />

                <SecurityDomain
                  icon={LockKeyhole}
                  title="AUTH"
                  value="Server-side"
                />

                <SecurityDomain
                  icon={FileKey2}
                  title="KEYS"
                  value="Scoped"
                />

                <SecurityDomain
                  icon={FileText}
                  title="ACTIVITY"
                  value="Traceable"
                />
              </div>
            </div>
          </div>

          {/* ================================================= */}
          {/* BOTTOM PRINCIPLES                                 */}
          {/* ================================================= */}

          <div
            className="
              grid grid-cols-2
              border-t border-border/60
              bg-muted/[0.12]
              lg:grid-cols-4
            "
          >
            <Principle
              index="01"
              title="MINIMIZE"
              value="Collect deliberately"
              icon={EyeOff}
            />

            <Principle
              index="02"
              title="VERIFY"
              value="Authorize protected actions"
              icon={ShieldCheck}
            />

            <Principle
              index="03"
              title="CONSTRAIN"
              value="Scope developer access"
              icon={KeyRound}
            />

            <Principle
              index="04"
              title="OBSERVE"
              value="Preserve activity context"
              icon={Activity}
            />
          </div>
        </div>

        {/* ================================================= */}
        {/* SECURITY DISCLAIMER + CTA                          */}
        {/* ================================================= */}

        <div
          className="
            mt-6 flex flex-col gap-5
            sm:flex-row
            sm:items-center
            sm:justify-between
          "
        >
          <p
            className="
              max-w-[720px]
              text-[9px] leading-5
              text-muted-foreground
              sm:text-[10px]
            "
          >
            Security capabilities should reflect the controls currently
            implemented by NXTQR. Certifications, compliance attestations,
            availability commitments and other contractual guarantees are
            documented separately when applicable.
          </p>

          <Button
            asChild
            variant="outline"
            className="
              group h-10 w-full
              rounded-lg border-border
              bg-background px-5
              text-[10px] font-semibold
              hover:bg-muted/30
              sm:w-auto
            "
          >
            <Link href="/security">
              Security overview

              <ArrowRight
                className="
                  ml-1 h-3.5 w-3.5
                  transition-transform
                  group-hover:translate-x-0.5
                "
              />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

/* ========================================================= */
/* ORBIT NODE                                                */
/* ========================================================= */

function OrbitNode({
  icon: Icon,
  className,
}: {
  icon: React.ComponentType<{ className?: string }>;
  className: string;
}) {
  return (
    <span
      className={`
        absolute z-10
        flex h-8 w-8
        -translate-x-1/2 -translate-y-1/2
        items-center justify-center
        rounded-lg
        border border-border/80
        bg-card text-primary
        shadow-sm
        ${className}
      `}
    >
      <Icon className="h-3 w-3" />
    </span>
  );
}

/* ========================================================= */
/* BOUNDARY STEP                                             */
/* ========================================================= */

function BoundaryStep({
  label,
  value,
  icon: Icon,
  active = false,
}: {
  label: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  active?: boolean;
}) {
  return (
    <div className="min-w-0 bg-background p-3">
      <div className="flex items-center justify-between gap-2">
        <span
          className="
            font-mono text-[6px]
            uppercase tracking-[0.13em]
            text-muted-foreground
          "
        >
          {label}
        </span>

        <Icon
          className={`
            h-2.5 w-2.5
            ${active ? "text-primary" : "text-muted-foreground/60"}
          `}
        />
      </div>

      <div
        className={`
          mt-1.5 truncate
          font-mono text-[7px]
          ${
            active
              ? "font-semibold text-primary"
              : "text-foreground"
          }
        `}
      >
        {value}
      </div>
    </div>
  );
}

function BoundaryArrow() {
  return (
    <div
      className="
        hidden items-center justify-center
        bg-background px-1
        sm:flex
      "
    >
      <ArrowRight className="h-2.5 w-2.5 text-primary/40" />
    </div>
  );
}

/* ========================================================= */
/* SECURITY DOMAIN                                           */
/* ========================================================= */

function SecurityDomain({
  icon: Icon,
  title,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  value: string;
}) {
  return (
    <div
      className="
        border border-border/60
        bg-muted/[0.1]
        p-3
      "
    >
      <div className="flex items-center justify-between">
        <span
          className="
            font-mono text-[6px]
            tracking-[0.14em]
            text-muted-foreground
          "
        >
          {title}
        </span>

        <Icon className="h-2.5 w-2.5 text-primary" />
      </div>

      <div className="mt-2 text-[8px] font-semibold text-foreground">
        {value}
      </div>
    </div>
  );
}

/* ========================================================= */
/* PRINCIPLE                                                 */
/* ========================================================= */

function Principle({
  index,
  title,
  value,
  icon: Icon,
}: {
  index: string;
  title: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
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

      <div
        className="
          mt-4 font-mono
          text-[7px] tracking-[0.16em]
          text-primary
        "
      >
        {title}
      </div>

      <div className="mt-1 text-[9px] font-medium text-foreground sm:text-[10px]">
        {value}
      </div>
    </div>
  );
}

/* ========================================================= */
/* SECURITY TAG                                              */
/* ========================================================= */

function SecurityTag({
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
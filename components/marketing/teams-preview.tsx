"use client";

import * as React from "react";
import Link from "next/link";
import {
  Activity,
  ArrowRight,
  Check,
  CheckCircle2,
  Clock3,
  Eye,
  FileCheck2,
  Fingerprint,
  FolderKanban,
  History,
  LockKeyhole,
  Palette,
  ShieldCheck,
  UserCheck,
  Users,
} from "lucide-react";

import { Button } from "@/components/ui/button";

const teams = [
  {
    id: "marketing",
    index: "01",
    name: "Marketing",
    role: "Editor",
    permission: "Create & manage",
    icon: FolderKanban,
  },
  {
    id: "brand",
    index: "02",
    name: "Brand",
    role: "Manager",
    permission: "Govern identity",
    icon: Palette,
  },
  {
    id: "analytics",
    index: "03",
    name: "Growth",
    role: "Analyst",
    permission: "View insights",
    icon: Activity,
  },
];

const approvalSteps = [
  {
    index: "01",
    label: "CHANGE",
    title: "Destination edited",
    meta: "Marketing",
    icon: Fingerprint,
  },
  {
    index: "02",
    label: "REVIEW",
    title: "Approval requested",
    meta: "Brand Manager",
    icon: Eye,
  },
  {
    index: "03",
    label: "APPROVE",
    title: "Change accepted",
    meta: "Authorized reviewer",
    icon: UserCheck,
  },
  {
    index: "04",
    label: "PUBLISH",
    title: "Version released",
    meta: "QR asset",
    icon: CheckCircle2,
  },
];

export function TeamsPreview() {
  const [selectedTeam, setSelectedTeam] =
    React.useState("marketing");

  const [selectedStep, setSelectedStep] =
    React.useState(2);

  return (
    <section
      id="teams"
      className="
        relative isolate overflow-hidden
        border-b border-border/60
        bg-background
        py-20 sm:py-24 lg:py-32
      "
    >
      {/* Background */}

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
      >
        <div
          className="
            absolute left-[-14rem] top-[20%]
            h-[34rem] w-[34rem]
            rounded-full
            bg-primary/[0.035]
            blur-[150px]
          "
        />

        <div
          className="
            absolute bottom-[-10rem] right-[-10rem]
            h-[30rem] w-[30rem]
            rounded-full
            bg-[#FFD06A]/[0.035]
            blur-[140px]
          "
        />

        <div
          className="
            absolute inset-0 opacity-[0.17]
            [background-image:linear-gradient(to_right,hsl(var(--border)/.3)_1px,transparent_1px)]
            [background-size:72px_100%]
            [mask-image:linear-gradient(to_bottom,transparent,black_12%,black_88%,transparent)]
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
                <Users className="h-3 w-3" />
              </span>

              NXTQR Teams

              <span className="h-px w-8 bg-primary/30 sm:w-12" />
            </div>

            <h2
              className="
                mt-5 max-w-[950px]
                font-display font-medium
                tracking-[-0.05em]
                text-foreground
                text-[clamp(2.8rem,10vw,4.6rem)]
                leading-[0.94]
                sm:text-[clamp(4rem,7.3vw,5.8rem)]
                lg:text-[clamp(5rem,5.9vw,6.4rem)]
              "
            >
              One workspace.
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
                Controlled together.
              </span>
            </h2>
          </div>

          <div className="lg:pb-1">
            <p className="text-sm leading-6 text-muted-foreground sm:text-base sm:leading-7">
              Organize people around QR assets with roles,
              permissions, review flows and brand controls—so
              collaboration can scale without giving every member
              the same level of access.
            </p>

            <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2">
              <FeatureTag>Workspaces</FeatureTag>
              <FeatureTag>Roles</FeatureTag>
              <FeatureTag>Approvals</FeatureTag>
              <FeatureTag>Activity</FeatureTag>
            </div>
          </div>
        </div>

        {/* ================================================= */}
        {/* GOVERNANCE CONTROL SURFACE                        */}
        {/* ================================================= */}

        <div
          className="
            overflow-hidden
            rounded-[20px]
            border border-border/70
            bg-card/80
            shadow-[0_35px_110px_rgba(31,31,31,.08)]
            backdrop-blur-xl
            sm:rounded-[24px]
            lg:rounded-[28px]
          "
        >
          {/* Top rail */}

          <div
            className="
              flex min-h-14
              items-center justify-between
              gap-4 border-b border-border/60
              px-3 py-2.5
              sm:px-5
              lg:px-6
            "
          >
            <div className="flex min-w-0 items-center gap-3">
              <span
                className="
                  flex h-8 w-8 shrink-0
                  items-center justify-center
                  rounded-lg
                  bg-primary/[0.07]
                  text-primary
                "
              >
                <ShieldCheck className="h-3.5 w-3.5" />
              </span>

              <div className="min-w-0">
                <div className="truncate text-[10px] font-semibold text-foreground sm:text-xs">
                  Organization Control Surface
                </div>

                <div className="hidden font-mono text-[7px] text-muted-foreground sm:block">
                  PEOPLE / ACCESS / REVIEW / PUBLISH
                </div>
              </div>
            </div>

            <div
              className="
                hidden items-center gap-2
                font-mono text-[7px]
                uppercase tracking-[0.12em]
                text-primary
                sm:flex
              "
            >
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              Governance preview
            </div>
          </div>

          {/* ================================================= */}
          {/* WORKSPACE                                        */}
          {/* ================================================= */}

          <div
            className="
              grid
              lg:grid-cols-[0.36fr_0.64fr]
            "
          >
            {/* =============================================== */}
            {/* ORGANIZATION TREE                               */}
            {/* =============================================== */}

            <div
              className="
                border-b border-border/60
                p-4
                sm:p-6
                lg:border-b-0
                lg:border-r
                lg:p-7
              "
            >
              <div className="flex items-center justify-between">
                <div>
                  <div
                    className="
                      font-mono text-[7px]
                      uppercase tracking-[0.16em]
                      text-muted-foreground
                    "
                  >
                    Workspace structure
                  </div>

                  <div className="mt-1 text-[10px] font-semibold text-foreground">
                    Organization access
                  </div>
                </div>

                <FolderKanban className="h-3.5 w-3.5 text-primary" />
              </div>

              {/* Root organization */}

              <div
                className="
                  mt-6 border
                  border-primary/20
                  bg-primary/[0.035]
                  p-3.5
                "
              >
                <div className="flex items-center gap-3">
                  <div
                    className="
                      flex h-10 w-10
                      items-center justify-center
                      rounded-lg
                      bg-foreground text-background
                    "
                  >
                    <ShieldCheck className="h-4 w-4" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div
                      className="
                        font-mono text-[6px]
                        uppercase tracking-[0.13em]
                        text-primary
                      "
                    >
                      Organization
                    </div>

                    <div className="mt-1 text-[10px] font-semibold text-foreground">
                      NXTQR Workspace
                    </div>
                  </div>

                  <span
                    className="
                      border border-border
                      bg-background
                      px-2 py-1
                      font-mono text-[6px]
                      text-muted-foreground
                    "
                  >
                    OWNER
                  </span>
                </div>
              </div>

              {/* hierarchy connector */}

              <div
                aria-hidden="true"
                className="
                  ml-[19px] h-5
                  border-l border-dashed
                  border-primary/25
                "
              />

              {/* teams */}

              <div className="space-y-2">
                {teams.map((team) => {
                  const Icon = team.icon;
                  const active =
                    selectedTeam === team.id;

                  return (
                    <button
                      key={team.id}
                      type="button"
                      onClick={() =>
                        setSelectedTeam(team.id)
                      }
                      aria-pressed={active}
                      className={`
                        group grid w-full
                        grid-cols-[34px_minmax(0,1fr)]
                        items-center gap-3
                        border p-2.5
                        text-left
                        transition-all
                        ${
                          active
                            ? "border-primary/30 bg-primary/[0.05]"
                            : "border-border/60 bg-background hover:border-primary/15"
                        }
                      `}
                    >
                      <span
                        className={`
                          flex h-[34px] w-[34px]
                          items-center justify-center
                          border
                          ${
                            active
                              ? "border-primary/20 bg-primary text-white"
                              : "border-border bg-card text-muted-foreground"
                          }
                        `}
                      >
                        <Icon className="h-3.5 w-3.5" />
                      </span>

                      <span className="min-w-0">
                        <span className="flex items-center justify-between gap-2">
                          <span
                            className={`
                              truncate text-[9px]
                              font-semibold
                              ${
                                active
                                  ? "text-primary"
                                  : "text-foreground"
                              }
                            `}
                          >
                            {team.name}
                          </span>

                          <span className="font-mono text-[6px] text-muted-foreground">
                            {team.index}
                          </span>
                        </span>

                        <span className="mt-1 flex items-center gap-1.5">
                          <span className="font-mono text-[6px] text-muted-foreground">
                            {team.role}
                          </span>

                          <span className="h-[2px] w-[2px] rounded-full bg-muted-foreground/50" />

                          <span className="truncate text-[7px] text-muted-foreground">
                            {team.permission}
                          </span>
                        </span>
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* policy boundary */}

              <div
                className="
                  mt-5 flex items-start gap-3
                  border border-dashed border-border
                  bg-muted/[0.1]
                  p-3
                "
              >
                <LockKeyhole className="mt-0.5 h-3 w-3 shrink-0 text-primary" />

                <div>
                  <div className="font-mono text-[7px] font-semibold text-foreground">
                    Permission boundary
                  </div>

                  <p className="mt-1 text-[7px] leading-4 text-muted-foreground">
                    Protected actions can be evaluated against
                    workspace membership and assigned capabilities.
                  </p>
                </div>
              </div>
            </div>

            {/* =============================================== */}
            {/* GOVERNANCE FLOW                                 */}
            {/* =============================================== */}

            <div className="min-w-0 p-4 sm:p-6 lg:p-7">
              <div className="flex items-center justify-between">
                <div>
                  <div
                    className="
                      font-mono text-[7px]
                      uppercase tracking-[0.16em]
                      text-muted-foreground
                    "
                  >
                    Change governance
                  </div>

                  <div className="mt-1 text-[10px] font-semibold text-foreground">
                    From edit to published state
                  </div>
                </div>

                <FileCheck2 className="h-3.5 w-3.5 text-primary" />
              </div>

              {/* ============================================= */}
              {/* CHANGE OBJECT                                 */}
              {/* ============================================= */}

              <div
                className="
                  mt-6 overflow-hidden
                  border border-border/60
                  bg-background
                "
              >
                <div
                  className="
                    flex flex-col gap-3
                    border-b border-border/60
                    p-4
                    sm:flex-row
                    sm:items-center
                    sm:justify-between
                  "
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="
                        flex h-10 w-10
                        items-center justify-center
                        rounded-lg
                        bg-primary/[0.07]
                        text-primary
                      "
                    >
                      <History className="h-4 w-4" />
                    </div>

                    <div>
                      <div
                        className="
                          font-mono text-[6px]
                          uppercase tracking-[0.13em]
                          text-muted-foreground
                        "
                      >
                        Proposed change
                      </div>

                      <div className="mt-1 text-[10px] font-semibold text-foreground">
                        Summer Campaign / Destination
                      </div>
                    </div>
                  </div>

                  <span
                    className="
                      self-start border
                      border-amber-500/20
                      bg-amber-500/[0.06]
                      px-2.5 py-1.5
                      font-mono text-[6px]
                      font-semibold
                      text-amber-700
                      dark:text-amber-400
                      sm:self-auto
                    "
                  >
                    REVIEW REQUIRED
                  </span>
                </div>

                {/* before / after */}

                <div
                  className="
                    grid gap-px
                    bg-border/60
                    sm:grid-cols-[1fr_40px_1fr]
                  "
                >
                  <ChangeState
                    label="CURRENT"
                    value="brand.com/summer"
                  />

                  <div
                    className="
                      hidden items-center justify-center
                      bg-background
                      sm:flex
                    "
                  >
                    <ArrowRight className="h-3 w-3 text-primary/50" />
                  </div>

                  <ChangeState
                    label="PROPOSED"
                    value="brand.com/summer/live"
                    active
                  />
                </div>
              </div>

              {/* ============================================= */}
              {/* APPROVAL PIPELINE                             */}
              {/* ============================================= */}

              <div className="mt-6">
                <div
                  className="
                    mb-3 flex items-center
                    justify-between
                  "
                >
                  <span
                    className="
                      font-mono text-[7px]
                      uppercase tracking-[0.14em]
                      text-muted-foreground
                    "
                  >
                    Approval path
                  </span>

                  <span className="font-mono text-[6px] text-primary">
                    POLICY FLOW
                  </span>
                </div>

                <div className="relative">
                  <div
                    aria-hidden="true"
                    className="
                      absolute left-[6%] right-[6%]
                      top-[25px]
                      hidden h-px
                      bg-gradient-to-r
                      from-primary/20
                      via-primary/50
                      to-[#FFD06A]/30
                      sm:block
                    "
                  />

                  <div className="grid gap-2 sm:grid-cols-4">
                    {approvalSteps.map(
                      (step, index) => {
                        const Icon = step.icon;
                        const active =
                          index <= selectedStep;
                        const current =
                          index === selectedStep;

                        return (
                          <button
                            key={step.index}
                            type="button"
                            onClick={() =>
                              setSelectedStep(index)
                            }
                            className={`
                              relative z-10
                              border p-3
                              text-left
                              transition-all
                              ${
                                current
                                  ? "border-primary/30 bg-primary/[0.055]"
                                  : active
                                    ? "border-primary/15 bg-background"
                                    : "border-border/60 bg-background"
                              }
                            `}
                          >
                            <div className="flex items-center justify-between">
                              <span
                                className={`
                                  flex h-[50px] w-[50px]
                                  items-center justify-center
                                  border
                                  ${
                                    active
                                      ? "border-primary/20 bg-primary text-white"
                                      : "border-border bg-card text-muted-foreground"
                                  }
                                `}
                              >
                                <Icon className="h-4 w-4" />
                              </span>

                              <span className="font-mono text-[6px] text-muted-foreground">
                                {step.index}
                              </span>
                            </div>

                            <div
                              className={`
                                mt-4 font-mono
                                text-[6px] font-semibold
                                tracking-[0.13em]
                                ${
                                  active
                                    ? "text-primary"
                                    : "text-muted-foreground"
                                }
                              `}
                            >
                              {step.label}
                            </div>

                            <div className="mt-1 text-[8px] font-semibold text-foreground">
                              {step.title}
                            </div>

                            <div className="mt-1 text-[6px] text-muted-foreground">
                              {step.meta}
                            </div>
                          </button>
                        );
                      },
                    )}
                  </div>
                </div>
              </div>

              {/* ============================================= */}
              {/* POLICY RESULT                                 */}
              {/* ============================================= */}

              <div
                className="
                  mt-6 grid gap-px
                  overflow-hidden
                  border border-border/60
                  bg-border/60
                  sm:grid-cols-3
                "
              >
                <GovernanceState
                  icon={Users}
                  label="TEAM"
                  value={
                    teams.find(
                      (team) =>
                        team.id === selectedTeam,
                    )?.name ?? "Marketing"
                  }
                />

                <GovernanceState
                  icon={LockKeyhole}
                  label="POLICY"
                  value="Approval required"
                />

                <GovernanceState
                  icon={CheckCircle2}
                  label="STATE"
                  value="Reviewed"
                  active
                />
              </div>
            </div>
          </div>

          {/* ================================================= */}
          {/* GOVERNANCE PRINCIPLES                             */}
          {/* ================================================= */}

          <div
            className="
              grid grid-cols-2
              border-t border-border/60
              bg-muted/[0.12]
              lg:grid-cols-4
            "
          >
            <GovernancePrinciple
              index="01"
              icon={Users}
              title="ORGANIZE"
              value="Workspaces & teams"
            />

            <GovernancePrinciple
              index="02"
              icon={LockKeyhole}
              title="CONTROL"
              value="Roles & permissions"
            />

            <GovernancePrinciple
              index="03"
              icon={FileCheck2}
              title="REVIEW"
              value="Approval workflows"
            />

            <GovernancePrinciple
              index="04"
              icon={History}
              title="TRACE"
              value="Change history"
            />
          </div>
        </div>

        {/* ================================================= */}
        {/* CTA                                               */}
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
            Teams, roles and approval states shown here are
            illustrative product-preview data. Available
            permissions and governance capabilities should follow
            the entitlement and authorization model implemented in
            the production workspace.
          </p>

          <Button
            asChild
            className="
              group h-10 w-full
              rounded-lg
              bg-primary px-5
              text-[10px] font-semibold
              text-white
              shadow-[0_8px_28px_rgba(250,82,15,.14)]
              hover:bg-[#E9480B]
              sm:w-auto
            "
          >
            <Link href="/login">
              Explore Teams

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
/* CHANGE STATE                                              */
/* ========================================================= */

function ChangeState({
  label,
  value,
  active = false,
}: {
  label: string;
  value: string;
  active?: boolean;
}) {
  return (
    <div className="min-w-0 bg-background p-3.5">
      <div
        className={`
          font-mono text-[6px]
          tracking-[0.13em]
          ${
            active
              ? "text-primary"
              : "text-muted-foreground"
          }
        `}
      >
        {label}
      </div>

      <div
        className={`
          mt-2 truncate
          font-mono text-[8px]
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

/* ========================================================= */
/* GOVERNANCE STATE                                          */
/* ========================================================= */

function GovernanceState({
  icon: Icon,
  label,
  value,
  active = false,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  active?: boolean;
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

        <Icon
          className={`
            h-3 w-3
            ${
              active
                ? "text-primary"
                : "text-muted-foreground/60"
            }
          `}
        />
      </div>

      <div
        className={`
          mt-2 text-[8px]
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

/* ========================================================= */
/* PRINCIPLE                                                 */
/* ========================================================= */

function GovernancePrinciple({
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
/* FEATURE TAG                                               */
/* ========================================================= */

function FeatureTag({
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
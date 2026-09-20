import * as React from "react";
import Link from "next/link";
import {
  ArrowRight,
  Braces,
  Check,
  ChevronRight,
  Code2,
  KeyRound,
  Radio,
  Route,
  ShieldCheck,
  Terminal,
  Webhook,
  Zap,
} from "lucide-react";

import { Button } from "@/components/ui/button";

const requestCode = `const qr = await nxtqr.qr.create({
  name: "Summer launch",
  type: "dynamic",
  destination: "https://brand.com/summer",

  routes: [
    {
      when: { device: "ios" },
      destination: "https://brand.com/ios"
    }
  ]
});`;

const responseCode = `{
  "id": "qr_01...",
  "status": "ACTIVE",
  "type": "dynamic",
  "destination": "https://brand.com/summer"
}`;

const pipeline = [
  {
    id: "01",
    label: "REQUEST",
    detail: "REST API",
    icon: Braces,
  },
  {
    id: "02",
    label: "AUTHORIZE",
    detail: "Scoped key",
    icon: KeyRound,
  },
  {
    id: "03",
    label: "RESOLVE",
    detail: "Edge route",
    icon: Route,
  },
  {
    id: "04",
    label: "DELIVER",
    detail: "Webhook",
    icon: Webhook,
  },
];

export function DeveloperPreview() {
  return (
    <section
      id="developers"
      className="
        relative isolate overflow-hidden
        border-b border-border/60
        bg-background text-foreground
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
            absolute left-1/2 top-[-24rem]
            h-[42rem] w-[65rem]
            -translate-x-1/2 rounded-full
            bg-[#FA520F]/[0.07]
            blur-[150px]
          "
        />

        <div
          className="
            absolute inset-0 opacity-[0.16]
            [background-image:linear-gradient(to_right,#ffffff12_1px,transparent_1px),linear-gradient(to_bottom,#ffffff12_1px,transparent_1px)]
            [background-size:64px_64px]
            [mask-image:linear-gradient(to_bottom,transparent,black_15%,black_80%,transparent)]
          "
        />

        <div className="absolute left-[8%] top-[25%] hidden grid-cols-3 gap-1 opacity-20 lg:grid">
          {Array.from({ length: 9 }).map((_, i) => (
            <span
              key={i}
              className={
                [0, 1, 2, 3, 6, 8].includes(i)
                  ? "h-1.5 w-1.5 bg-[#FA520F]"
                  : "h-1.5 w-1.5"
              }
            />
          ))}
        </div>
      </div>

      <div className="relative mx-auto max-w-[1380px] px-4 sm:px-6 lg:px-8 xl:px-10">
        {/* ================================================= */}
        {/* EDITORIAL HEADER                                  */}
        {/* ================================================= */}

        <div
          className="
            mb-10 grid gap-7
            sm:mb-14
            lg:mb-16
            lg:grid-cols-[minmax(0,1fr)_420px]
            lg:items-end
          "
        >
          <div>
            <div
              className="
                inline-flex items-center gap-2
                font-mono text-[10px] font-semibold
                uppercase tracking-[0.18em]
                text-[#FA520F]
                sm:text-[11px]
              "
            >
              <span
                className="
                  flex h-6 w-6 items-center justify-center
                  border border-[#FA520F]/25
                  bg-[#FA520F]/[0.07]
                "
              >
                <Code2 className="h-3 w-3" />
              </span>

              NXTQR Developers

              <span className="h-px w-8 bg-[#FA520F]/30 sm:w-12" />
            </div>

            <h2
              className="
                mt-5 max-w-[850px]
                font-display font-medium
                tracking-[-0.045em]
                text-[clamp(2.7rem,10vw,4.5rem)]
                leading-[0.95]
                sm:text-[clamp(4rem,8vw,5.8rem)]
                lg:text-[clamp(5rem,6vw,6.5rem)]
              "
            >
              QR infrastructure,
              <br />

              <span
                className="
                  bg-gradient-to-r
                  from-[#FA520F]
                  via-[#FF8105]
                  to-[#FFD06A]
                  bg-clip-text text-transparent
                "
              >
                programmable.
              </span>
            </h2>
          </div>

          <div className="lg:pb-1">
            <p
              className="
                max-w-[420px]
                text-sm leading-6 text-muted-foreground
                sm:text-base sm:leading-7
              "
            >
              Create and manage QR assets programmatically, control access
              through scoped credentials, and connect lifecycle events to the
              systems your team already uses.
            </p>

            <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2">
              {["REST architecture", "Scoped access", "Event delivery"].map(
                (item) => (
                  <div
                    key={item}
                    className="flex items-center gap-1.5 text-[10px] text-muted-foreground"
                  >
                    <Check className="h-3 w-3 text-[#FA520F]" />
                    {item}
                  </div>
                ),
              )}
            </div>
          </div>
        </div>

        {/* ================================================= */}
        {/* DEVELOPER CONTROL SURFACE                         */}
        {/* ================================================= */}

        <div
          className="
            overflow-hidden rounded-[20px]
            border border-border/70
            bg-card text-card-foreground dark:bg-card dark:bg-[#151515]
            shadow-[0_40px_120px_rgba(0,0,0,.4)]
            sm:rounded-[24px]
            lg:rounded-[28px]
          "
        >
          {/* Top system rail */}
          <div
            className="
              flex h-12 items-center justify-between
              border-b border-border/60
              px-3 sm:h-14 sm:px-5 lg:px-6
            "
          >
            <div className="flex min-w-0 items-center gap-2.5">
              <div
                className="
                  flex h-7 w-7 shrink-0 items-center justify-center
                  rounded-lg
                  bg-gradient-to-br
                  from-[#FA520F] to-[#FF9D00]
                  shadow-[0_6px_22px_rgba(250,82,15,.22)]
                "
              >
                <Terminal className="h-3.5 w-3.5 text-white" />
              </div>

              <div className="min-w-0">
                <div className="truncate text-[10px] font-semibold text-white sm:text-xs">
                  Developer Console
                </div>

                <div className="hidden font-mono text-[8px] text-muted-foreground sm:block">
                  NXTQR / API WORKSPACE
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="hidden font-mono text-[8px] text-muted-foreground md:inline">
                ENV / SANDBOX
              </span>

              <span
                className="
                  inline-flex items-center gap-1.5
                  rounded-full
                  border border-emerald-500/15
                  bg-emerald-500/[0.06]
                  px-2 py-1
                  font-mono text-[7px]
                  text-emerald-400
                  sm:text-[8px]
                "
              >
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                READY
              </span>
            </div>
          </div>

          {/* ================================================= */}
          {/* REQUEST PIPELINE                                  */}
          {/* ================================================= */}

          <div className="border-b border-border/60 px-4 py-5 sm:px-6 lg:px-8">
            <div className="mb-4 flex items-center justify-between">
              <span className="font-mono text-[8px] uppercase tracking-[0.16em] text-muted-foreground">
                Request lifecycle
              </span>

              <span className="hidden font-mono text-[8px] text-[#5F5D58] sm:block">
                REQUEST → POLICY → EDGE → EVENT
              </span>
            </div>

            {/* Desktop */}
            <div className="hidden items-center md:flex">
              {pipeline.map((item, index) => {
                const Icon = item.icon;

                return (
                  <React.Fragment key={item.id}>
                    <div className="group min-w-[130px]">
                      <div className="flex items-center gap-2.5">
                        <span
                          className="
                            flex h-8 w-8 items-center justify-center
                            border border-border/70
                            bg-white/[0.035]
                            text-[#FA520F]
                            transition-colors
                            group-hover:border-[#FA520F]/25
                            group-hover:bg-[#FA520F]/[0.06]
                          "
                        >
                          <Icon className="h-3.5 w-3.5" />
                        </span>

                        <div>
                          <div className="font-mono text-[7px] text-[#5F5D58]">
                            {item.id}
                          </div>

                          <div className="font-mono text-[9px] font-semibold text-foreground">
                            {item.label}
                          </div>

                          <div className="mt-0.5 text-[8px] text-muted-foreground">
                            {item.detail}
                          </div>
                        </div>
                      </div>
                    </div>

                    {index < pipeline.length - 1 && (
                      <div className="relative mx-4 h-px flex-1 bg-border/60">
                        <div
                          className="
                            absolute inset-y-0 left-0 w-1/2
                            bg-gradient-to-r
                            from-[#FA520F]/60
                            to-transparent
                          "
                        />

                        <ChevronRight
                          className="
                            absolute right-[-6px] top-1/2
                            h-3 w-3 -translate-y-1/2
                            text-[#FA520F]/40
                          "
                        />
                      </div>
                    )}
                  </React.Fragment>
                );
              })}
            </div>

            {/* Mobile */}
            <div className="grid grid-cols-2 gap-px overflow-hidden border border-border/60 bg-border/60 md:hidden">
              {pipeline.map((item) => {
                const Icon = item.icon;

                return (
                  <div
                    key={item.id}
                    className="flex items-center gap-2.5 bg-card dark:bg-[#151515] p-3"
                  >
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center bg-white/[0.04] text-[#FA520F]">
                      <Icon className="h-3 w-3" />
                    </span>

                    <div className="min-w-0">
                      <div className="font-mono text-[6px] text-[#5F5D58]">
                        {item.id}
                      </div>

                      <div className="truncate font-mono text-[8px] font-semibold text-white">
                        {item.label}
                      </div>

                      <div className="truncate text-[7px] text-muted-foreground">
                        {item.detail}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ================================================= */}
          {/* CODE WORKSPACE                                    */}
          {/* ================================================= */}

          <div className="grid lg:grid-cols-[minmax(0,1.45fr)_minmax(300px,.55fr)]">
            {/* Editor */}
            <div className="min-w-0 border-b border-border/60 lg:border-b-0 lg:border-r">
              {/* Tabs */}
              <div
                className="
                  flex h-11 items-center
                  border-b border-border/60
                  bg-[#131313]
                  px-2
                "
              >
                <div
                  className="
                    flex h-full items-center gap-2
                    border-b border-[#FA520F]
                    px-3
                    font-mono text-[8px]
                    text-foreground
                    sm:text-[9px]
                  "
                >
                  <span className="text-[#FF8105]">TS</span>
                  create-qr.ts
                </div>

                <div className="hidden h-full items-center px-3 font-mono text-[9px] text-[#5F5D58] sm:flex">
                  webhook.ts
                </div>
              </div>

              <div className="relative overflow-hidden">
                {/* Line numbers */}
                <div
                  aria-hidden="true"
                  className="
                    absolute bottom-0 left-0 top-0
                    hidden w-11
                    border-r border-border/60
                    bg-[#121212]
                    pt-5 text-right
                    font-mono text-[9px]
                    leading-[1.9rem]
                    text-[#484743]
                    sm:block
                  "
                >
                  {Array.from({ length: 12 }).map((_, i) => (
                    <div key={i} className="pr-3">
                      {i + 1}
                    </div>
                  ))}
                </div>

                <pre
                  className="
                    overflow-x-auto
                    px-4 py-5
                    font-mono text-[10px]
                    leading-[1.8rem]
                    text-[#D6D3CB]
                    sm:pl-16 sm:pr-6 sm:text-[11px]
                    lg:min-h-[390px]
                    [&::-webkit-scrollbar]:h-1.5
                    [&::-webkit-scrollbar-thumb]:bg-white/10
                  "
                >
                  <code>
                    <span className="text-[#C792EA]">const</span>{" "}
                    <span className="text-foreground">qr</span>{" "}
                    <span className="text-muted-foreground">=</span>{" "}
                    <span className="text-[#C792EA]">await</span>{" "}
                    <span className="text-[#FFB83E]">nxtqr</span>
                    <span className="text-muted-foreground">.</span>
                    <span className="text-[#FFD06A]">qr</span>
                    <span className="text-muted-foreground">.</span>
                    <span className="text-[#82AAFF]">create</span>
                    <span className="text-muted-foreground">{"({"}</span>
                    {"\n"}
                    {"  "}
                    <span className="text-foreground">name</span>
                    <span className="text-muted-foreground">:</span>{" "}
                    <span className="text-[#C3E88D]">
                      &quot;Summer launch&quot;
                    </span>
                    <span className="text-muted-foreground">,</span>
                    {"\n"}
                    {"  "}
                    <span className="text-foreground">type</span>
                    <span className="text-muted-foreground">:</span>{" "}
                    <span className="text-[#C3E88D]">
                      &quot;dynamic&quot;
                    </span>
                    <span className="text-muted-foreground">,</span>
                    {"\n"}
                    {"  "}
                    <span className="text-foreground">destination</span>
                    <span className="text-muted-foreground">:</span>{" "}
                    <span className="text-[#C3E88D]">
                      &quot;https://brand.com/summer&quot;
                    </span>
                    <span className="text-muted-foreground">,</span>
                    {"\n\n"}
                    {"  "}
                    <span className="text-foreground">routes</span>
                    <span className="text-muted-foreground">:</span>{" "}
                    <span className="text-muted-foreground">{"["}</span>
                    {"\n"}
                    {"    "}
                    <span className="text-muted-foreground">{"{"}</span>
                    {"\n"}
                    {"      "}
                    <span className="text-foreground">when</span>
                    <span className="text-muted-foreground">:</span>{" "}
                    <span className="text-muted-foreground">{"{"}</span>{" "}
                    <span className="text-foreground">device</span>
                    <span className="text-muted-foreground">:</span>{" "}
                    <span className="text-[#C3E88D]">
                      &quot;ios&quot;
                    </span>{" "}
                    <span className="text-muted-foreground">{"}"}</span>
                    <span className="text-muted-foreground">,</span>
                    {"\n"}
                    {"      "}
                    <span className="text-foreground">destination</span>
                    <span className="text-muted-foreground">:</span>{" "}
                    <span className="text-[#C3E88D]">
                      &quot;https://brand.com/ios&quot;
                    </span>
                    {"\n"}
                    {"    "}
                    <span className="text-muted-foreground">{"}"}</span>
                    {"\n"}
                    {"  "}
                    <span className="text-muted-foreground">{"]"}</span>
                    {"\n"}
                    <span className="text-muted-foreground">{"});"}</span>
                  </code>
                </pre>

                {/* Request footer */}
                <div
                  className="
                    flex items-center justify-between
                    border-t border-border/60
                    bg-[#121212]
                    px-3 py-2
                    sm:px-5
                  "
                >
                  <div className="flex items-center gap-3 font-mono text-[7px] text-[#5F5D58]">
                    <span>UTF-8</span>
                    <span>TypeScript</span>
                    <span className="hidden sm:inline">NXTQR API</span>
                  </div>

                  <span className="flex items-center gap-1.5 font-mono text-[7px] text-emerald-400">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    VALID
                  </span>
                </div>
              </div>
            </div>

            {/* Response / event rail */}
            <div className="min-w-0 bg-[#131313]">
              {/* Response */}
              <div className="border-b border-border/60 p-4 sm:p-5 lg:p-6">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[8px] uppercase tracking-[0.14em] text-muted-foreground">
                    Response
                  </span>

                  <span
                    className="
                      border border-emerald-500/15
                      bg-emerald-500/[0.06]
                      px-2 py-1
                      font-mono text-[7px]
                      text-emerald-400
                    "
                  >
                    CREATED
                  </span>
                </div>

                <pre
                  className="
                    mt-5 overflow-x-auto
                    font-mono text-[9px]
                    leading-6 text-muted-foreground
                    sm:text-[10px]
                  "
                >
                  <code>
                    <span className="text-muted-foreground">{"{"}</span>
                    {"\n  "}
                    <span className="text-[#82AAFF]">&quot;id&quot;</span>
                    <span className="text-muted-foreground">: </span>
                    <span className="text-[#C3E88D]">
                      &quot;qr_01...&quot;
                    </span>
                    <span className="text-muted-foreground">,</span>
                    {"\n  "}
                    <span className="text-[#82AAFF]">&quot;status&quot;</span>
                    <span className="text-muted-foreground">: </span>
                    <span className="text-[#C3E88D]">
                      &quot;ACTIVE&quot;
                    </span>
                    <span className="text-muted-foreground">,</span>
                    {"\n  "}
                    <span className="text-[#82AAFF]">&quot;type&quot;</span>
                    <span className="text-muted-foreground">: </span>
                    <span className="text-[#C3E88D]">
                      &quot;dynamic&quot;
                    </span>
                    {"\n"}
                    <span className="text-muted-foreground">{"}"}</span>
                  </code>
                </pre>
              </div>

              {/* Event */}
              <div className="p-4 sm:p-5 lg:p-6">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[8px] uppercase tracking-[0.14em] text-muted-foreground">
                    Event stream
                  </span>

                  <Radio className="h-3 w-3 text-[#FA520F]" />
                </div>

                <div className="mt-5 space-y-3">
                  <EventRow
                    time="00:00"
                    event="qr.created"
                    state="delivered"
                  />

                  <EventRow
                    time="00:01"
                    event="qr.published"
                    state="delivered"
                  />

                  <EventRow
                    time="00:08"
                    event="scan.received"
                    state="event"
                  />
                </div>

                <div
                  className="
                    mt-6 border-l border-[#FA520F]/30
                    pl-3 text-[8px] leading-4
                    text-muted-foreground
                  "
                >
                  Lifecycle events can connect NXTQR to your own applications
                  and workflows.
                </div>
              </div>
            </div>
          </div>

          {/* ================================================= */}
          {/* CAPABILITY RAIL                                   */}
          {/* ================================================= */}

          <div
            className="
              grid border-t border-border/60
              bg-[#121212]
              grid-cols-2
              lg:grid-cols-4
            "
          >
            <Capability
              index="01"
              icon={KeyRound}
              title="Scoped access"
              text="Control what each integration can read or modify."
            />

            <Capability
              index="02"
              icon={Webhook}
              title="Event delivery"
              text="Connect QR lifecycle events to external systems."
            />

            <Capability
              index="03"
              icon={Zap}
              title="Edge architecture"
              text="Keep redirect delivery separate from the control plane."
            />

            <Capability
              index="04"
              icon={ShieldCheck}
              title="Observable"
              text="Design API activity and delivery history for inspection."
            />
          </div>
        </div>

        {/* ================================================= */}
        {/* BOTTOM CTA                                         */}
        {/* ================================================= */}

        <div
          className="
            mt-6 flex flex-col gap-4
            sm:flex-row sm:items-center sm:justify-between
          "
        >
          <p className="max-w-[580px] text-[10px] leading-5 text-muted-foreground sm:text-[11px]">
            Build QR creation, routing and lifecycle management directly into
            your product without coupling your application to the dashboard.
          </p>

          <Button
            asChild
            className="
              group h-10 w-full rounded-lg
              bg-[#FA520F] px-5
              text-[11px] font-semibold text-white
              hover:bg-[#E9480B]
              sm:w-auto
            "
          >
            <Link href="/developers">
              Developer platform

              <ArrowRight className="ml-1 h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

function EventRow({
  time,
  event,
  state,
}: {
  time: string;
  event: string;
  state: "delivered" | "event";
}) {
  return (
    <div
      className="
        grid grid-cols-[36px_minmax(0,1fr)_auto]
        items-center gap-2
        border-b border-border/60
        pb-3
      "
    >
      <span className="font-mono text-[7px] text-[#5F5D58]">
        {time}
      </span>

      <span className="truncate font-mono text-[8px] text-muted-foreground">
        {event}
      </span>

      <span
        className={`
          h-1.5 w-1.5 rounded-full
          ${
            state === "delivered"
              ? "bg-emerald-400"
              : "bg-[#FA520F]"
          }
        `}
      />
    </div>
  );
}

function Capability({
  index,
  icon: Icon,
  title,
  text,
}: {
  index: string;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  text: string;
}) {
  return (
    <div
      className="
        relative min-h-[145px]
        border-b border-r border-border/60
        p-4
        sm:p-5
        lg:min-h-[160px] lg:border-b-0 lg:p-6
        [&:nth-child(2n)]:border-r-0
        lg:[&:nth-child(2n)]:border-r
        lg:last:border-r-0
      "
    >
      <div className="flex items-start justify-between">
        <Icon className="h-4 w-4 text-[#FA520F]" />

        <span className="font-mono text-[7px] text-[#4E4D49]">
          {index}
        </span>
      </div>

      <h3 className="mt-6 text-[10px] font-semibold text-foreground sm:text-[11px]">
        {title}
      </h3>

      <p className="mt-1.5 max-w-[220px] text-[8px] leading-4 text-muted-foreground sm:text-[9px]">
        {text}
      </p>
    </div>
  );
}
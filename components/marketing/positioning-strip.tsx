import * as React from "react";
import {
  ArrowRight,
  BarChart3,
  GitFork,
  RefreshCw,
  Sparkles,
} from "lucide-react";

const pillars = [
  {
    number: "01",
    title: "CREATE",
    emphasis: "ONCE",
    product: "NXTQR Studio",
    description:
      "Design scan-ready QR assets with reusable visual controls and brand consistency.",
    icon: Sparkles,
    accent: "primary" as const,
  },
  {
    number: "02",
    title: "CHANGE",
    emphasis: "ANYTIME",
    product: "Dynamic QR",
    description:
      "Keep the printed QR identity while updating the destination behind it.",
    icon: RefreshCw,
    accent: "orange" as const,
  },
  {
    number: "03",
    title: "ROUTE",
    emphasis: "INTELLIGENTLY",
    product: "NXTQR Routes",
    description:
      "Resolve scans using configured conditions such as device, region, language, or time.",
    icon: GitFork,
    accent: "amber" as const,
  },
  {
    number: "04",
    title: "MEASURE",
    emphasis: "EVERYTHING",
    product: "NXTQR Analytics",
    description:
      "Turn scan events into useful traffic, device, geography, and conversion signals.",
    icon: BarChart3,
    accent: "emerald" as const,
  },
];

export function PositioningStrip() {
  return (
    <section
      aria-label="NXTQR platform lifecycle"
      className="
        relative isolate overflow-hidden
        border-y border-border/60
        bg-background
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
            absolute left-1/2 top-1/2
            h-52 w-[70%]
            -translate-x-1/2 -translate-y-1/2
            rounded-full bg-primary/[0.035]
            blur-[100px]
          "
        />

        <div
          className="
            absolute inset-0 opacity-[0.18]
            [background-image:linear-gradient(to_right,hsl(var(--border)/.35)_1px,transparent_1px)]
            [background-size:72px_100%]
          "
        />
      </div>

      <div className="relative mx-auto max-w-[1380px] px-4 sm:px-6 lg:px-8 xl:px-10">
        {/* ================================================= */}
        {/* TOP RAIL                                         */}
        {/* ================================================= */}

        <div
          className="
            flex items-center justify-between
            border-b border-border/60
            py-3.5
          "
        >
          <div
            className="
              flex items-center gap-2
              font-mono text-[7px]
              uppercase tracking-[0.16em]
              text-muted-foreground
              sm:text-[8px]
            "
          >
            <span className="h-1.5 w-1.5 bg-primary" />

            NXTQR lifecycle
          </div>

          <div
            className="
              hidden items-center gap-2
              font-mono text-[7px]
              uppercase tracking-[0.13em]
              text-muted-foreground
              sm:flex
            "
          >
            <span>Physical QR</span>

            <ArrowRight className="h-2.5 w-2.5 text-primary" />

            <span>Adaptive infrastructure</span>

            <ArrowRight className="h-2.5 w-2.5 text-primary" />

            <span>Intelligence</span>
          </div>

          <span className="font-mono text-[7px] text-primary sm:hidden">
            01 → 04
          </span>
        </div>

        {/* ================================================= */}
        {/* LIFECYCLE                                        */}
        {/* ================================================= */}

        <div
          className="
            relative grid
            sm:grid-cols-2
            lg:grid-cols-4
          "
        >
          {/* Desktop signal line */}
          <div
            aria-hidden="true"
            className="
              absolute left-[7%] right-[7%] top-[45px]
              hidden h-px
              bg-gradient-to-r
              from-primary/20
              via-[#FF8105]/40
              to-emerald-500/25
              lg:block
            "
          >
            {/* signal dots */}
            <span
              className="
                absolute left-0 top-1/2
                h-1.5 w-1.5
                -translate-y-1/2
                rounded-full bg-primary
              "
            />

            <span
              className="
                absolute left-1/3 top-1/2
                h-1.5 w-1.5
                -translate-y-1/2
                rounded-full bg-[#FF8105]
              "
            />

            <span
              className="
                absolute left-2/3 top-1/2
                h-1.5 w-1.5
                -translate-y-1/2
                rounded-full bg-[#FFB83E]
              "
            />

            <span
              className="
                absolute right-0 top-1/2
                h-1.5 w-1.5
                -translate-y-1/2
                rounded-full bg-emerald-500
              "
            />
          </div>

          {pillars.map((pillar, index) => (
            <React.Fragment key={pillar.number}>
              <LifecycleStage
                {...pillar}
                index={index}
              />
            </React.Fragment>
          ))}
        </div>

        {/* ================================================= */}
        {/* BOTTOM POSITIONING                               */}
        {/* ================================================= */}

        <div
          className="
            flex flex-col gap-3
            border-t border-border/60
            py-4
            sm:flex-row
            sm:items-center
            sm:justify-between
          "
        >
          <p
            className="
              font-display text-[13px]
              font-medium tracking-[-0.01em]
              text-foreground
              sm:text-sm
            "
          >
            One QR asset. A lifecycle behind every scan.
          </p>

          <div
            className="
              flex items-center gap-2
              font-mono text-[7px]
              uppercase tracking-[0.14em]
              text-muted-foreground
            "
          >
            <span className="text-primary">
              CREATE
            </span>

            <span>→</span>

            <span className="text-[#FF8105]">
              CHANGE
            </span>

            <span>→</span>

            <span className="text-[#D99000] dark:text-[#FFB83E]">
              ROUTE
            </span>

            <span>→</span>

            <span className="text-emerald-600 dark:text-emerald-400">
              MEASURE
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ========================================================= */
/* LIFECYCLE STAGE                                           */
/* ========================================================= */

function LifecycleStage({
  number,
  title,
  emphasis,
  product,
  description,
  icon: Icon,
  accent,
  index,
}: {
  number: string;
  title: string;
  emphasis: string;
  product: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  accent: "primary" | "orange" | "amber" | "emerald";
  index: number;
}) {
  const accentStyles = {
    primary: {
      text: "text-primary",
      border: "border-primary/20",
      background: "bg-primary/[0.055]",
      dot: "bg-primary",
    },

    orange: {
      text: "text-[#FF8105]",
      border: "border-[#FF8105]/20",
      background: "bg-[#FF8105]/[0.05]",
      dot: "bg-[#FF8105]",
    },

    amber: {
      text: "text-[#D99000] dark:text-[#FFB83E]",
      border: "border-[#FFB83E]/20",
      background: "bg-[#FFB83E]/[0.05]",
      dot: "bg-[#FFB83E]",
    },

    emerald: {
      text: "text-emerald-600 dark:text-emerald-400",
      border: "border-emerald-500/20",
      background: "bg-emerald-500/[0.045]",
      dot: "bg-emerald-500",
    },
  };

  const style = accentStyles[accent];

  return (
    <article
      className={`
        group relative
        min-h-[245px]
        border-b border-border/60
        py-6
        sm:min-h-[270px]
        sm:px-5
        lg:min-h-[290px]
        lg:border-b-0
        lg:border-r
        lg:px-6
        lg:py-7
        lg:last:border-r-0

        ${index % 2 === 0 ? "sm:border-r" : ""}
        ${index >= 2 ? "sm:border-b-0" : ""}
      `}
    >
      {/* mobile/tablet connector */}
      {index < pillars.length - 1 && (
        <div
          aria-hidden="true"
          className="
            absolute bottom-[-11px] left-6 z-10
            flex h-[22px] w-[22px]
            items-center justify-center
            rounded-full
            border border-border
            bg-background
            lg:hidden
          "
        >
          <ArrowRight className="h-2.5 w-2.5 rotate-90 text-muted-foreground sm:rotate-0" />
        </div>
      )}

      {/* Stage header */}
      <div className="relative flex items-start justify-between">
        <div
          className={`
            relative z-10
            flex h-9 w-9
            items-center justify-center
            border
            transition-all duration-300
            ${style.border}
            ${style.background}
            ${style.text}
            group-hover:scale-[1.04]
          `}
        >
          <Icon className="h-3.5 w-3.5" />
        </div>

        <span
          className="
            font-mono text-[7px]
            text-muted-foreground/70
          "
        >
          {number}
        </span>
      </div>

      {/* Product */}
      <div
        className={`
          mt-7 font-mono
          text-[7px] font-semibold
          uppercase tracking-[0.16em]
          ${style.text}
        `}
      >
        {product}
      </div>

      {/* Positioning */}
      <h3
        className="
          mt-2 font-display
          text-xl font-medium
          tracking-[-0.035em]
          text-foreground
          sm:text-[22px]
          lg:text-2xl
        "
      >
        {title}

        <span
          className={`
            ml-1.5
            ${style.text}
          `}
        >
          {emphasis.toLowerCase()}.
        </span>
      </h3>

      <p
        className="
          mt-3 max-w-[270px]
          text-[9px] leading-[1.7]
          text-muted-foreground
          sm:text-[10px]
        "
      >
        {description}
      </p>

      {/* Bottom state */}
      <div
        className="
          absolute bottom-5 left-0 right-0
          hidden px-6
          lg:block
        "
      >
        <div className="flex items-center gap-2">
          <span
            className={`
              h-1 w-1
              ${style.dot}
            `}
          />

          <span
            className="
              font-mono text-[6px]
              uppercase tracking-[0.14em]
              text-muted-foreground
            "
          >
            Stage {number}
          </span>

          <span className="h-px flex-1 bg-border/70" />
        </div>
      </div>
    </article>
  );
}
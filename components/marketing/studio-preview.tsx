"use client";

import * as React from "react";
import Link from "next/link";
import {
  ArrowRight,
  Check,
  ChevronDown,
  Download,
  Eye,
  Frame,
  Grid3X3,
  ImageIcon,
  Layers3,
  Palette,
  QrCode,
  ScanLine,
  SlidersHorizontal,
  Sparkles,
} from "lucide-react";

import { Button } from "@/components/ui/button";

type EyeStyle = "square" | "rounded" | "leaf";
type PixelStyle = "squares" | "rounded" | "dots";

const colors = [
  {
    color: "#FA520F",
    label: "NXTQR Orange",
  },
  {
    color: "#1F1F1F",
    label: "Ink",
  },
  {
    color: "#FF8105",
    label: "Signal Orange",
  },
  {
    color: "#FFA110",
    label: "Amber",
  },
  {
    color: "#059669",
    label: "Emerald",
  },
];

const modules = [
  [65, 18],
  [77, 18],
  [89, 18],
  [101, 28],
  [65, 40],
  [89, 40],

  [18, 65],
  [30, 65],
  [42, 65],
  [65, 65],
  [77, 65],
  [89, 65],
  [101, 65],
  [113, 65],
  [125, 65],
  [137, 65],
  [149, 65],

  [22, 77],
  [42, 77],
  [65, 77],
  [101, 77],
  [125, 77],
  [149, 77],

  [18, 89],
  [30, 89],
  [65, 89],
  [77, 89],
  [89, 89],
  [125, 89],
  [137, 89],

  [65, 101],
  [77, 101],
  [101, 101],
  [113, 101],
  [137, 101],
  [149, 101],

  [65, 113],
  [89, 113],
  [101, 113],
  [125, 113],
  [149, 113],

  [65, 125],
  [77, 125],
  [89, 125],
  [113, 125],
  [125, 125],
  [149, 125],

  [77, 137],
  [101, 137],
  [125, 137],
  [137, 137],

  [65, 149],
  [89, 149],
  [113, 149],
  [149, 149],
];

export function StudioPreview() {
  const [selectedEye, setSelectedEye] =
    React.useState<EyeStyle>("rounded");

  const [selectedPixel, setSelectedPixel] =
    React.useState<PixelStyle>("rounded");

  const [selectedColor, setSelectedColor] =
    React.useState("#FA520F");

  const [activeTool, setActiveTool] =
    React.useState("modules");

  return (
    <section
      id="studio"
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
            absolute -left-48 top-[25%]
            h-[32rem] w-[32rem]
            rounded-full
            bg-primary/[0.04]
            blur-[140px]
          "
        />

        <div
          className="
            absolute right-[-12rem] top-[45%]
            h-[28rem] w-[28rem]
            rounded-full
            bg-[#FFD06A]/[0.04]
            blur-[130px]
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
                <Sparkles className="h-3 w-3" />
              </span>

              NXTQR Studio

              <span className="h-px w-8 bg-primary/30 sm:w-12" />
            </div>

            <h2
              className="
                mt-5 max-w-[900px]
                font-display font-medium
                tracking-[-0.05em]
                text-foreground
                text-[clamp(2.8rem,10vw,4.6rem)]
                leading-[0.94]
                sm:text-[clamp(4rem,7.3vw,5.8rem)]
                lg:text-[clamp(5rem,5.9vw,6.4rem)]
              "
            >
              Design the QR.
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
                Protect the scan.
              </span>
            </h2>
          </div>

          <div className="lg:pb-1">
            <p className="text-sm leading-6 text-muted-foreground sm:text-base sm:leading-7">
              Shape modules, finder patterns, colors, frames and brand
              elements while keeping scan behavior visible throughout the
              design process.
            </p>

            <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2">
              <StudioTag>Design</StudioTag>
              <StudioTag>Preview</StudioTag>
              <StudioTag>Validate</StudioTag>
              <StudioTag>Export</StudioTag>
            </div>
          </div>
        </div>

        {/* ================================================= */}
        {/* STUDIO APPLICATION WINDOW                         */}
        {/* ================================================= */}

        <div
          className="
            overflow-hidden
            rounded-[20px]
            border border-border/70
            bg-card
            shadow-[0_40px_120px_rgba(31,31,31,.09)]
            sm:rounded-[24px]
            lg:rounded-[28px]
          "
        >
          {/* ================================================= */}
          {/* WINDOW HEADER                                     */}
          {/* ================================================= */}

          <div
            className="
              flex min-h-14
              items-center justify-between
              gap-3 border-b border-border/60
              px-3 py-2.5
              sm:px-5
              lg:px-6
            "
          >
            <div className="flex min-w-0 items-center gap-3">
              <div className="hidden items-center gap-1.5 sm:flex">
                <span className="h-2 w-2 rounded-full bg-border" />
                <span className="h-2 w-2 rounded-full bg-border" />
                <span className="h-2 w-2 rounded-full bg-primary/40" />
              </div>

              <div className="hidden h-5 w-px bg-border sm:block" />

              <div className="min-w-0">
                <div className="truncate text-[10px] font-semibold text-foreground sm:text-xs">
                  Summer campaign
                </div>

                <div className="hidden font-mono text-[7px] text-muted-foreground sm:block">
                  QR ASSET / DESIGN PREVIEW
                </div>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-2">
              <div
                className="
                  hidden items-center gap-1.5
                  border border-emerald-500/15
                  bg-emerald-500/[0.04]
                  px-2.5 py-1.5
                  font-mono text-[7px]
                  text-emerald-700
                  dark:text-emerald-400
                  sm:flex
                "
              >
                <Check className="h-2.5 w-2.5" />
                PREVIEW READY
              </div>

              <Button
                variant="outline"
                size="sm"
                className="
                  hidden h-8 rounded-lg
                  px-3 text-[9px]
                  sm:inline-flex
                "
              >
                <Download className="mr-1 h-3 w-3" />
                Export
              </Button>

              <Button
                asChild
                size="sm"
                className="
                  h-8 rounded-lg
                  bg-primary px-3
                  text-[9px] font-semibold
                  text-white
                  hover:bg-[#E9480B]
                "
              >
                <Link href="/login">
                  Open Studio
                </Link>
              </Button>
            </div>
          </div>

          {/* ================================================= */}
          {/* APPLICATION                                      */}
          {/* ================================================= */}

          <div
            className="
              grid
              lg:grid-cols-[58px_310px_minmax(0,1fr)]
              xl:grid-cols-[62px_330px_minmax(0,1fr)]
            "
          >
            {/* ================================================= */}
            {/* TOOL RAIL                                         */}
            {/* ================================================= */}

            <div
              className="
                order-1
                flex overflow-x-auto
                border-b border-border/60
                bg-muted/[0.12]
                lg:flex-col
                lg:border-b-0
                lg:border-r
              "
            >
              <ToolButton
                label="Modules"
                icon={Grid3X3}
                active={activeTool === "modules"}
                onClick={() => setActiveTool("modules")}
              />

              <ToolButton
                label="Eyes"
                icon={Eye}
                active={activeTool === "eyes"}
                onClick={() => setActiveTool("eyes")}
              />

              <ToolButton
                label="Colors"
                icon={Palette}
                active={activeTool === "colors"}
                onClick={() => setActiveTool("colors")}
              />

              <ToolButton
                label="Frame"
                icon={Frame}
                active={activeTool === "frame"}
                onClick={() => setActiveTool("frame")}
              />

              <ToolButton
                label="Logo"
                icon={ImageIcon}
                active={activeTool === "logo"}
                onClick={() => setActiveTool("logo")}
              />
            </div>

            {/* ================================================= */}
            {/* CONTROL PANEL                                     */}
            {/* ================================================= */}

            <div
              className="
                order-3
                border-t border-border/60
                bg-background
                p-4
                sm:p-5
                lg:order-2
                lg:border-r
                lg:border-t-0
                lg:p-6
              "
            >
              <div className="flex items-center justify-between">
                <div>
                  <div
                    className="
                      font-mono text-[7px]
                      uppercase tracking-[0.15em]
                      text-muted-foreground
                    "
                  >
                    Appearance
                  </div>

                  <div className="mt-1 text-[11px] font-semibold text-foreground">
                    QR geometry
                  </div>
                </div>

                <SlidersHorizontal className="h-3.5 w-3.5 text-primary" />
              </div>

              {/* Module style */}

              <ControlGroup
                number="01"
                title="Data modules"
                icon={Grid3X3}
              >
                <div className="grid grid-cols-3 gap-1.5">
                  {(
                    [
                      "squares",
                      "rounded",
                      "dots",
                    ] as PixelStyle[]
                  ).map((style) => (
                    <StyleSelector
                      key={style}
                      label={style}
                      selected={selectedPixel === style}
                      onClick={() =>
                        setSelectedPixel(style)
                      }
                    >
                      <PixelSample
                        style={style}
                        color={selectedColor}
                      />
                    </StyleSelector>
                  ))}
                </div>
              </ControlGroup>

              {/* Finder */}

              <ControlGroup
                number="02"
                title="Finder geometry"
                icon={Eye}
              >
                <div className="grid grid-cols-3 gap-1.5">
                  {(
                    [
                      "square",
                      "rounded",
                      "leaf",
                    ] as EyeStyle[]
                  ).map((style) => (
                    <StyleSelector
                      key={style}
                      label={style}
                      selected={selectedEye === style}
                      onClick={() =>
                        setSelectedEye(style)
                      }
                    >
                      <EyeSample
                        style={style}
                        color={selectedColor}
                      />
                    </StyleSelector>
                  ))}
                </div>
              </ControlGroup>

              {/* Color */}

              <ControlGroup
                number="03"
                title="Brand tone"
                icon={Palette}
              >
                <div className="flex flex-wrap gap-2">
                  {colors.map((item) => (
                    <button
                      key={item.color}
                      type="button"
                      title={item.label}
                      aria-label={`Use ${item.label}`}
                      aria-pressed={
                        selectedColor === item.color
                      }
                      onClick={() =>
                        setSelectedColor(item.color)
                      }
                      className={`
                        relative flex h-9 w-9
                        items-center justify-center
                        rounded-lg border
                        transition-transform
                        ${
                          selectedColor === item.color
                            ? "scale-[1.05] border-primary"
                            : "border-border hover:scale-[1.03]"
                        }
                      `}
                    >
                      <span
                        className="h-5 w-5 rounded-md"
                        style={{
                          backgroundColor: item.color,
                        }}
                      />

                      {selectedColor === item.color && (
                        <span
                          className="
                            absolute -right-1 -top-1
                            flex h-3.5 w-3.5
                            items-center justify-center
                            rounded-full
                            bg-primary text-white
                          "
                        >
                          <Check className="h-2 w-2" />
                        </span>
                      )}
                    </button>
                  ))}
                </div>

                <div
                  className="
                    mt-3 flex items-center justify-between
                    border border-border/60
                    bg-muted/[0.12]
                    px-3 py-2
                  "
                >
                  <span className="font-mono text-[7px] text-muted-foreground">
                    HEX
                  </span>

                  <span className="font-mono text-[8px] font-semibold text-foreground">
                    {selectedColor}
                  </span>
                </div>
              </ControlGroup>

              {/* Additional controls */}

              <div className="mt-6 space-y-2">
                <SettingRow
                  label="Error correction"
                  value="Q"
                />

                <SettingRow
                  label="Quiet zone"
                  value="Auto"
                />

                <SettingRow
                  label="Frame"
                  value="Minimal"
                />
              </div>
            </div>

            {/* ================================================= */}
            {/* LIVE CANVAS                                       */}
            {/* ================================================= */}

            <div
              className="
                order-2
                relative min-h-[520px]
                overflow-hidden
                bg-[#F7F4EC]
                lg:order-3
                lg:min-h-[660px]
              "
            >
              {/* Canvas grid */}

              <div
                aria-hidden="true"
                className="
                  absolute inset-0
                  opacity-[0.38]
                  [background-image:linear-gradient(to_right,rgba(31,31,31,.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(31,31,31,.06)_1px,transparent_1px)]
                  [background-size:28px_28px]
                "
              />

              {/* canvas top bar */}

              <div
                className="
                  relative z-10
                  flex items-center justify-between
                  border-b border-black/[0.06]
                  px-4 py-3
                  sm:px-5
                "
              >
                <div
                  className="
                    flex items-center gap-2
                    font-mono text-[7px]
                    uppercase tracking-[0.13em]
                    text-[#6A6A6A]
                  "
                >
                  <Layers3 className="h-3 w-3" />
                  Live canvas
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className="
                      hidden font-mono
                      text-[7px] text-[#8A8A8A]
                      sm:block
                    "
                  >
                    100%
                  </span>

                  <ChevronDown className="h-3 w-3 text-[#8A8A8A]" />
                </div>
              </div>

              {/* ================================================= */}
              {/* QR ARTBOARD                                       */}
              {/* ================================================= */}

              <div
                className="
                  relative z-10
                  flex min-h-[450px]
                  items-center justify-center
                  px-4 py-10
                  sm:px-8
                  lg:min-h-[580px]
                "
              >
                <div
                  className="
                    relative w-full
                    max-w-[390px]
                  "
                >
                  {/* measurement marks */}

                  <div
                    aria-hidden="true"
                    className="
                      absolute -left-7 top-0
                      hidden h-full
                      flex-col justify-between
                      font-mono text-[6px]
                      text-[#A8A8A8]
                      sm:flex
                    "
                  >
                    <span>0</span>
                    <span>50</span>
                    <span>100</span>
                  </div>

                  <div
                    className="
                      border border-black/[0.08]
                      bg-white
                      p-5
                      shadow-[0_30px_90px_rgba(31,31,31,.12)]
                      sm:p-7
                    "
                  >
                    <div className="text-center">
                      <span
                        className="
                          font-mono text-[8px]
                          font-semibold uppercase
                          tracking-[0.2em]
                          text-[#3D3D3D]
                        "
                      >
                        SCAN TO EXPLORE
                      </span>
                    </div>

                    <div className="mx-auto mt-5 max-w-[260px]">
                      <QrPreview
                        eye={selectedEye}
                        pixel={selectedPixel}
                        color={selectedColor}
                      />
                    </div>

                    <div
                      className="
                        mx-auto mt-5
                        h-px w-10
                        bg-black/10
                      "
                    />

                    <div
                      className="
                        mt-4 text-center
                        font-mono text-[8px]
                        text-[#6A6A6A]
                      "
                    >
                      Dynamic destination
                    </div>
                  </div>

                  {/* scan indicator */}

                  <div
                    className="
                      absolute -bottom-4
                      left-1/2
                      flex -translate-x-1/2
                      items-center gap-2
                      whitespace-nowrap
                      border border-emerald-500/20
                      bg-white
                      px-3 py-2
                      shadow-sm
                    "
                  >
                    <ScanLine className="h-3 w-3 text-emerald-600" />

                    <span
                      className="
                        font-mono text-[7px]
                        font-semibold uppercase
                        tracking-[0.12em]
                        text-emerald-700
                      "
                    >
                      Scan preview
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ================================================= */}
          {/* VALIDATION / OUTPUT RAIL                          */}
          {/* ================================================= */}

          <div
            className="
              grid grid-cols-2
              border-t border-border/60
              bg-muted/[0.12]
              sm:grid-cols-4
            "
          >
            <StudioMetric
              number="01"
              icon={Grid3X3}
              label="MODULES"
              value={selectedPixel}
            />

            <StudioMetric
              number="02"
              icon={Eye}
              label="FINDERS"
              value={selectedEye}
            />

            <StudioMetric
              number="03"
              icon={ScanLine}
              label="SCAN CHECK"
              value="Preview"
            />

            <StudioMetric
              number="04"
              icon={Download}
              label="OUTPUT"
              value="PNG / SVG"
            />
          </div>
        </div>

        {/* ================================================= */}
        {/* BOTTOM COPY + CTA                                  */}
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
              max-w-[690px]
              text-[9px] leading-5
              text-muted-foreground
              sm:text-[10px]
            "
          >
            The Studio preview demonstrates visual customization controls.
            Production scanability guidance should be generated from the
            actual encoded payload, QR geometry, error-correction settings
            and validation logic.
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
              Create with Studio

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
/* QR PREVIEW                                                */
/* ========================================================= */

function QrPreview({
  eye,
  pixel,
  color,
}: {
  eye: EyeStyle;
  pixel: PixelStyle;
  color: string;
}) {
  const outerRadius =
    eye === "rounded"
      ? 11
      : eye === "leaf"
        ? 17
        : 2;

  const innerRadius =
    eye === "rounded"
      ? 5
      : eye === "leaf"
        ? 8
        : 1;

  const moduleRadius =
    pixel === "dots"
      ? 4.5
      : pixel === "rounded"
        ? 2.5
        : 0.5;

  return (
    <svg
      viewBox="0 0 180 180"
      role="img"
      aria-label="Illustrative customizable QR preview"
      className="block h-auto w-full"
    >
      {/* quiet zone is represented by SVG whitespace */}

      <Finder
        x={10}
        y={10}
        color={color}
        outerRadius={outerRadius}
        innerRadius={innerRadius}
      />

      <Finder
        x={125}
        y={10}
        color={color}
        outerRadius={outerRadius}
        innerRadius={innerRadius}
      />

      <Finder
        x={10}
        y={125}
        color={color}
        outerRadius={outerRadius}
        innerRadius={innerRadius}
      />

      <g fill={color}>
        {modules.map(([x, y], index) => (
          <rect
            key={`${x}-${y}-${index}`}
            x={x}
            y={y}
            width="9"
            height="9"
            rx={moduleRadius}
          />
        ))}
      </g>
    </svg>
  );
}

function Finder({
  x,
  y,
  color,
  outerRadius,
  innerRadius,
}: {
  x: number;
  y: number;
  color: string;
  outerRadius: number;
  innerRadius: number;
}) {
  return (
    <>
      <rect
        x={x}
        y={y}
        width="45"
        height="45"
        rx={outerRadius}
        fill="none"
        stroke={color}
        strokeWidth="6"
      />

      <rect
        x={x + 12}
        y={y + 12}
        width="21"
        height="21"
        rx={innerRadius}
        fill={color}
      />
    </>
  );
}

/* ========================================================= */
/* TOOL BUTTON                                               */
/* ========================================================= */

function ToolButton({
  label,
  icon: Icon,
  active,
  onClick,
}: {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      title={label}
      className={`
        group relative
        flex min-w-[64px]
        flex-1 flex-col
        items-center justify-center
        gap-1.5
        px-2 py-3
        transition-colors
        lg:min-h-[66px]
        lg:min-w-0
        lg:flex-none
        ${
          active
            ? "bg-primary/[0.06] text-primary"
            : "text-muted-foreground hover:bg-muted/30 hover:text-foreground"
        }
      `}
    >
      {active && (
        <span
          className="
            absolute bottom-0 left-1/2
            h-[2px] w-5
            -translate-x-1/2
            bg-primary
            lg:bottom-auto
            lg:left-0
            lg:top-1/2
            lg:h-5
            lg:w-[2px]
            lg:-translate-x-0
            lg:-translate-y-1/2
          "
        />
      )}

      <Icon className="h-3.5 w-3.5" />

      <span
        className="
          font-mono text-[6px]
          uppercase tracking-[0.08em]
        "
      >
        {label}
      </span>
    </button>
  );
}

/* ========================================================= */
/* CONTROL GROUP                                             */
/* ========================================================= */

function ControlGroup({
  number,
  title,
  icon: Icon,
  children,
}: {
  number: string;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}) {
  return (
    <div className="mt-6 border-t border-border/60 pt-5">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className="h-3 w-3 text-primary" />

          <span className="text-[9px] font-semibold text-foreground">
            {title}
          </span>
        </div>

        <span className="font-mono text-[6px] text-muted-foreground">
          {number}
        </span>
      </div>

      {children}
    </div>
  );
}

/* ========================================================= */
/* STYLE SELECTOR                                            */
/* ========================================================= */

function StyleSelector({
  label,
  selected,
  onClick,
  children,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={`
        min-w-0 border
        p-2 transition-all
        ${
          selected
            ? "border-primary/40 bg-primary/[0.055]"
            : "border-border/70 bg-muted/[0.12] hover:border-primary/15"
        }
      `}
    >
      <div className="flex h-8 items-center justify-center">
        {children}
      </div>

      <div
        className={`
          mt-1 truncate
          font-mono text-[6px]
          uppercase
          ${
            selected
              ? "font-semibold text-primary"
              : "text-muted-foreground"
          }
        `}
      >
        {label}
      </div>
    </button>
  );
}

/* ========================================================= */
/* PIXEL SAMPLE                                              */
/* ========================================================= */

function PixelSample({
  style,
  color,
}: {
  style: PixelStyle;
  color: string;
}) {
  const radius =
    style === "dots"
      ? "50%"
      : style === "rounded"
        ? "2px"
        : "0px";

  return (
    <div className="grid grid-cols-3 gap-[2px]">
      {[1, 1, 1, 1, 0, 1, 1, 1, 1].map(
        (visible, index) => (
          <span
            key={index}
            className="h-[5px] w-[5px]"
            style={{
              opacity: visible ? 1 : 0,
              backgroundColor: color,
              borderRadius: radius,
            }}
          />
        ),
      )}
    </div>
  );
}

/* ========================================================= */
/* EYE SAMPLE                                                */
/* ========================================================= */

function EyeSample({
  style,
  color,
}: {
  style: EyeStyle;
  color: string;
}) {
  const radius =
    style === "rounded"
      ? "5px"
      : style === "leaf"
        ? "8px 2px 8px 2px"
        : "1px";

  return (
    <span
      className="
        flex h-6 w-6
        items-center justify-center
        border-[3px]
      "
      style={{
        borderColor: color,
        borderRadius: radius,
      }}
    >
      <span
        className="h-2 w-2"
        style={{
          backgroundColor: color,
          borderRadius: radius,
        }}
      />
    </span>
  );
}

/* ========================================================= */
/* SETTING ROW                                               */
/* ========================================================= */

function SettingRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div
      className="
        flex items-center justify-between
        border border-border/60
        bg-muted/[0.1]
        px-3 py-2.5
      "
    >
      <span className="text-[8px] text-muted-foreground">
        {label}
      </span>

      <span className="font-mono text-[7px] font-semibold text-foreground">
        {value}
      </span>
    </div>
  );
}

/* ========================================================= */
/* METRIC                                                    */
/* ========================================================= */

function StudioMetric({
  number,
  icon: Icon,
  label,
  value,
}: {
  number: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div
      className="
        min-h-[88px]
        border-b border-r border-border/60
        p-3.5
        sm:min-h-[94px]
        sm:border-b-0
        sm:p-4
        lg:px-5

        [&:nth-child(2n)]:border-r-0
        sm:[&:nth-child(2n)]:border-r
        sm:last:border-r-0
      "
    >
      <div className="flex items-start justify-between">
        <Icon className="h-3 w-3 text-primary" />

        <span className="font-mono text-[6px] text-muted-foreground">
          {number}
        </span>
      </div>

      <div
        className="
          mt-4 font-mono
          text-[7px] tracking-[0.15em]
          text-primary
        "
      >
        {label}
      </div>

      <div className="mt-1 truncate text-[9px] font-medium capitalize text-foreground sm:text-[10px]">
        {value}
      </div>
    </div>
  );
}

/* ========================================================= */
/* TAG                                                       */
/* ========================================================= */

function StudioTag({
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
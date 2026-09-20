"use client";

import * as React from "react";
import Link from "next/link";
import {
  ArrowRight,
  ChevronDown,
  Menu,
  X,
  QrCode,
  Route,
  BarChart3,
  ShieldCheck,
  Code2,
  ArrowUpRight,
} from "lucide-react";

import { NxtqrLogo } from "@/components/brand/nxtqr-logo";
import { Button } from "@/components/ui/button";
import { ThemeSwitcher } from "@/components/shell/theme-switcher";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";

const featureIcons = [
  QrCode,
  Route,
  BarChart3,
  ShieldCheck,
  Code2,
];

export function MarketingHeader() {
  const [isScrolled, setIsScrolled] = React.useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [activeDropdown, setActiveDropdown] = React.useState<string | null>(
    null,
  );
  const [mobileExpanded, setMobileExpanded] = React.useState<string | null>(
    null,
  );

  const headerRef = React.useRef<HTMLElement>(null);

  /* ------------------------------------------------------- */
  /* Scroll state                                            */
  /* ------------------------------------------------------- */

  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 16);
    };

    handleScroll();

    window.addEventListener("scroll", handleScroll, {
      passive: true,
    });

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  /* ------------------------------------------------------- */
  /* Escape / outside click                                  */
  /* ------------------------------------------------------- */

  React.useEffect(() => {
    const handlePointerDown = (event: PointerEvent) => {
      if (
        headerRef.current &&
        !headerRef.current.contains(event.target as Node)
      ) {
        setActiveDropdown(null);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setActiveDropdown(null);
        setMobileMenuOpen(false);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  /* ------------------------------------------------------- */
  /* Mobile scroll lock                                      */
  /* ------------------------------------------------------- */

  React.useEffect(() => {
    if (!mobileMenuOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [mobileMenuOpen]);

  const closeNavigation = () => {
    setActiveDropdown(null);
    setMobileMenuOpen(false);
  };

  return (
    <>
      <header
        ref={headerRef}
        className={cn(
          "fixed inset-x-0 top-0 z-50 w-full transition-colors duration-200 border-b",
          isScrolled
            ? "border-border/80 bg-background/90 backdrop-blur-xl shadow-xs supports-[backdrop-filter]:bg-background/85"
            : "border-border/60 bg-background/75 backdrop-blur-md supports-[backdrop-filter]:bg-background/65",
        )}
      >
        <div className="relative mx-auto flex h-16 w-full max-w-[1440px] items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* subtle active scan line on bottom border */}
          {isScrolled && (
            <div
              aria-hidden="true"
              className="
                absolute bottom-[-1px] left-1/2
                h-px w-[40%]
                -translate-x-1/2
                bg-gradient-to-r
                from-transparent via-primary/35 to-transparent
              "
            />
          )}

            {/* =============================================== */}
            {/* LOGO                                            */}
            {/* =============================================== */}

            <Link
              href="/"
              onClick={closeNavigation}
              aria-label="NXTQR home"
              className="
                group relative z-10
                inline-flex shrink-0 items-center
                rounded-md
                focus-visible:outline-none
                focus-visible:ring-2
                focus-visible:ring-primary
                focus-visible:ring-offset-2
              "
            >
              <NxtqrLogo size="md" />
            </Link>

            {/* =============================================== */}
            {/* DESKTOP NAVIGATION                              */}
            {/* =============================================== */}

            <nav
              aria-label="Primary navigation"
              className="
                absolute left-1/2
                hidden -translate-x-1/2
                items-center gap-0.5
                lg:flex
              "
            >
              {siteConfig.mainNav.map((item, navIndex) => {
                const hasChildren = Boolean(
                  item.items && item.items.length > 0,
                );

                if (!hasChildren) {
                  return (
                    <Link
                      key={item.title}
                      href={item.href}
                      onClick={() => setActiveDropdown(null)}
                      className="
                        relative rounded-lg
                        px-3 py-2
                        text-[11px] font-medium
                        text-muted-foreground
                        transition-colors duration-200
                        hover:bg-muted/40
                        hover:text-foreground
                        focus-visible:outline-none
                        focus-visible:ring-2
                        focus-visible:ring-primary/50
                      "
                    >
                      {item.title}
                    </Link>
                  );
                }

                const isOpen = activeDropdown === item.title;

                return (
                  <div
                    key={item.title}
                    className="relative"
                    onMouseEnter={() =>
                      setActiveDropdown(item.title)
                    }
                    onMouseLeave={() =>
                      setActiveDropdown(null)
                    }
                  >
                    <button
                      type="button"
                      aria-expanded={isOpen}
                      aria-haspopup="true"
                      onClick={() =>
                        setActiveDropdown(
                          isOpen ? null : item.title,
                        )
                      }
                      className={cn(
                        `
                          flex items-center gap-1.5
                          rounded-lg px-3 py-2
                          text-[11px] font-medium
                          transition-colors duration-200
                          focus-visible:outline-none
                          focus-visible:ring-2
                          focus-visible:ring-primary/50
                        `,
                        isOpen
                          ? "bg-muted/50 text-foreground"
                          : "text-muted-foreground hover:bg-muted/40 hover:text-foreground",
                      )}
                    >
                      {item.title}

                      <ChevronDown
                        className={cn(
                          "h-3 w-3 transition-transform duration-200",
                          isOpen && "rotate-180",
                        )}
                      />
                    </button>

                    {isOpen && (
                      <DesktopDropdown
                        title={item.title}
                        index={navIndex}
                        items={item.items ?? []}
                        onClose={() =>
                          setActiveDropdown(null)
                        }
                      />
                    )}
                  </div>
                );
              })}
            </nav>

            {/* =============================================== */}
            {/* DESKTOP AUTH                                    */}
            {/* =============================================== */}

            <div className="hidden items-center gap-2 lg:flex">
              <ThemeSwitcher className="h-9 w-9 rounded-lg" />

              <Button
                size="sm"
                asChild
                className="
                  group h-9 rounded-lg
                  bg-primary px-4
                  text-[11px] font-semibold text-white
                  shadow-[0_7px_22px_rgba(250,82,15,.16)]
                  transition-all
                  hover:bg-[#E9480B]
                  hover:shadow-[0_9px_28px_rgba(250,82,15,.22)]
                "
              >
                <Link href="/login">
                  Create QR

                  <ArrowRight
                    className="
                      ml-1 h-3 w-3
                      transition-transform
                      group-hover:translate-x-0.5
                    "
                  />
                </Link>
              </Button>
            </div>

            {/* =============================================== */}
            {/* TABLET / MOBILE                                 */}
            {/* =============================================== */}

            <div className="flex items-center gap-1.5 lg:hidden">
              <ThemeSwitcher className="h-8 w-8 rounded-lg" />

              <Button
                size="sm"
                asChild
                className="
                  hidden sm:inline-flex
                  h-8 rounded-lg
                  bg-primary px-3
                  text-[10px] font-semibold text-white
                  shadow-[0_6px_18px_rgba(250,82,15,.16)]
                  hover:bg-[#E9480B]
                "
              >
                <Link href="/login">
                  Create QR
                  <ArrowRight className="ml-1 h-3 w-3" />
                </Link>
              </Button>

              <button
                type="button"
                aria-label={
                  mobileMenuOpen
                    ? "Close navigation"
                    : "Open navigation"
                }
                aria-expanded={mobileMenuOpen}
                onClick={() =>
                  setMobileMenuOpen((open) => !open)
                }
                className={cn(
                  `
                    flex h-9 w-9 items-center
                    justify-center rounded-lg
                    border transition-colors
                    focus-visible:outline-none
                    focus-visible:ring-2
                    focus-visible:ring-primary
                  `,
                  mobileMenuOpen
                    ? "border-primary/20 bg-primary/[0.06] text-primary"
                    : "border-border/70 bg-background/50 text-foreground",
                )}
              >
                {mobileMenuOpen ? (
                  <X className="h-4 w-4" />
                ) : (
                  <Menu className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>
      </header>

      {/* =================================================== */}
      {/* MOBILE NAVIGATION                                   */}
      {/* =================================================== */}

      {mobileMenuOpen && (
        <MobileNavigation
          expanded={mobileExpanded}
          setExpanded={setMobileExpanded}
          onClose={closeNavigation}
        />
      )}
    </>
  );
}

/* ========================================================= */
/* DESKTOP DROPDOWN                                          */
/* ========================================================= */

function DesktopDropdown({
  title,
  index,
  items,
  onClose,
}: {
  title: string;
  index: number;
  items: Array<{
    title: string;
    href: string;
    description?: string;
  }>;
  onClose: () => void;
}) {
  return (
    <div
      className="
        absolute left-1/2 top-full
        w-[420px] -translate-x-1/2
        pt-3
        animate-in
        fade-in-0
        slide-in-from-top-1
        duration-150
      "
    >
      <div
        className="
          relative overflow-hidden
          rounded-[18px]
          border border-border/70
          bg-card/95
          shadow-[0_25px_70px_rgba(31,31,31,.14)]
          backdrop-blur-xl
        "
      >
        {/* Header */}
        <div
          className="
            flex items-center justify-between
            border-b border-border/60
            px-4 py-3
          "
        >
          <div className="flex items-center gap-2">
            <span className="font-mono text-[7px] text-muted-foreground">
              {String(index + 1).padStart(2, "0")}
            </span>

            <span
              className="
                font-mono text-[8px]
                font-semibold uppercase
                tracking-[0.15em]
                text-primary
              "
            >
              {title}
            </span>
          </div>

          <span className="font-mono text-[7px] text-muted-foreground">
            NXTQR
          </span>
        </div>

        {/* Items */}
        <div className="grid gap-px bg-border/50 p-px">
          {items.map((item, itemIndex) => {
            const Icon =
              featureIcons[
                itemIndex % featureIcons.length
              ];

            return (
              <Link
                key={item.title}
                href={item.href}
                onClick={onClose}
                className="
                  group grid
                  grid-cols-[34px_minmax(0,1fr)_20px]
                  items-start gap-3
                  bg-card px-4 py-3.5
                  transition-colors
                  hover:bg-muted/35
                  focus-visible:outline-none
                  focus-visible:bg-muted/35
                "
              >
                <span
                  className="
                    flex h-[34px] w-[34px]
                    items-center justify-center
                    border border-border/70
                    bg-background
                    text-muted-foreground
                    transition-all
                    group-hover:border-primary/20
                    group-hover:bg-primary/[0.04]
                    group-hover:text-primary
                  "
                >
                  <Icon className="h-3.5 w-3.5" />
                </span>

                <span className="min-w-0">
                  <span
                    className="
                      block text-[10px] font-semibold
                      text-foreground
                      transition-colors
                      group-hover:text-primary
                    "
                  >
                    {item.title}
                  </span>

                  {item.description && (
                    <span
                      className="
                        mt-1 block
                        text-[9px] leading-4
                        text-muted-foreground
                      "
                    >
                      {item.description}
                    </span>
                  )}
                </span>

                <ArrowUpRight
                  className="
                    mt-1 h-3 w-3
                    text-muted-foreground/40
                    transition-all
                    group-hover:-translate-y-0.5
                    group-hover:translate-x-0.5
                    group-hover:text-primary
                  "
                />
              </Link>
            );
          })}
        </div>

        {/* Bottom rail */}
        <div
          className="
            flex items-center justify-between
            border-t border-border/60
            bg-muted/[0.18]
            px-4 py-2.5
          "
        >
          <span className="font-mono text-[7px] text-muted-foreground">
            SMART QR INFRASTRUCTURE
          </span>

          <span className="flex items-center gap-1 font-mono text-[7px] text-primary">
            EXPLORE
            <ArrowRight className="h-2.5 w-2.5" />
          </span>
        </div>
      </div>
    </div>
  );
}

/* ========================================================= */
/* MOBILE NAVIGATION                                         */
/* ========================================================= */

function MobileNavigation({
  expanded,
  setExpanded,
  onClose,
}: {
  expanded: string | null;
  setExpanded: React.Dispatch<
    React.SetStateAction<string | null>
  >;
  onClose: () => void;
}) {
  return (
    <div
      className="
        fixed inset-0 z-40
        overflow-y-auto
        bg-background
        pt-16
        lg:hidden
        animate-in fade-in-0 duration-150
      "
    >
      {/* Background geometry */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <div
          className="
            absolute -right-36 top-20
            h-80 w-80 rounded-full
            bg-primary/[0.055]
            blur-[110px]
          "
        />

        <div
          className="
            absolute inset-0 opacity-[0.22]
            [background-image:linear-gradient(to_right,hsl(var(--border)/.35)_1px,transparent_1px)]
            [background-size:48px_100%]
          "
        />
      </div>

      <div className="relative flex min-h-[calc(100svh-64px)] flex-col">
        {/* Navigation */}
        <nav
          aria-label="Mobile navigation"
          className="flex-1 px-4 pb-8 sm:px-6"
        >
          <div
            className="
              mb-5 flex items-center justify-between
              border-b border-border/60
              pb-4
            "
          >
            <span
              className="
                font-mono text-[8px]
                uppercase tracking-[0.17em]
                text-muted-foreground
              "
            >
              Navigation
            </span>

            <span className="font-mono text-[7px] text-primary">
              NXTQR / 01
            </span>
          </div>

          <div>
            {siteConfig.mainNav.map((item, index) => {
              const hasChildren = Boolean(
                item.items && item.items.length > 0,
              );

              const isExpanded =
                expanded === item.title;

              return (
                <div
                  key={item.title}
                  className="
                    border-b border-border/60
                  "
                >
                  <div className="flex items-center">
                    <Link
                      href={item.href}
                      onClick={onClose}
                      className="
                        flex min-w-0 flex-1
                        items-center gap-4
                        py-5
                      "
                    >
                      <span className="w-5 font-mono text-[7px] text-muted-foreground">
                        {String(index + 1).padStart(2, "0")}
                      </span>

                      <span
                        className="
                          font-display text-xl
                          font-medium
                          tracking-[-0.02em]
                          text-foreground
                          sm:text-2xl
                        "
                      >
                        {item.title}
                      </span>
                    </Link>

                    {hasChildren && (
                      <button
                        type="button"
                        aria-label={`Toggle ${item.title} submenu`}
                        aria-expanded={isExpanded}
                        onClick={() =>
                          setExpanded(
                            isExpanded
                              ? null
                              : item.title,
                          )
                        }
                        className="
                          flex h-10 w-10
                          items-center justify-center
                          rounded-lg
                          text-muted-foreground
                          hover:bg-muted/40
                          hover:text-foreground
                        "
                      >
                        <ChevronDown
                          className={cn(
                            "h-4 w-4 transition-transform",
                            isExpanded && "rotate-180",
                          )}
                        />
                      </button>
                    )}
                  </div>

                  {hasChildren && isExpanded && (
                    <div
                      className="
                        ml-9 grid gap-px
                        border-l border-primary/20
                        pb-5 pl-4
                        animate-in
                        fade-in-0
                        slide-in-from-top-1
                        duration-150
                      "
                    >
                      {item.items?.map(
                        (sub, subIndex) => {
                          const Icon =
                            featureIcons[
                              subIndex %
                                featureIcons.length
                            ];

                          return (
                            <Link
                              key={sub.title}
                              href={sub.href}
                              onClick={onClose}
                              className="
                                group flex
                                items-start gap-3
                                rounded-lg
                                px-2 py-2.5
                                hover:bg-muted/35
                              "
                            >
                              <Icon
                                className="
                                  mt-0.5 h-3.5 w-3.5
                                  shrink-0
                                  text-primary
                                "
                              />

                              <span className="min-w-0">
                                <span
                                  className="
                                    block text-[11px]
                                    font-semibold
                                    text-foreground
                                  "
                                >
                                  {sub.title}
                                </span>

                                {sub.description && (
                                  <span
                                    className="
                                      mt-0.5 block
                                      text-[9px] leading-4
                                      text-muted-foreground
                                    "
                                  >
                                    {sub.description}
                                  </span>
                                )}
                              </span>
                            </Link>
                          );
                        },
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </nav>

        {/* Mobile action area */}
        <div
          className="
            sticky bottom-0
            border-t border-border/60
            bg-background/90
            px-4 py-4
            backdrop-blur-xl
            sm:px-6
          "
        >
          <div className="mb-3 flex items-center justify-between">
            <div>
              <div
                className="
                  font-mono text-[7px]
                  uppercase tracking-[0.14em]
                  text-primary
                "
              >
                Smart QR Infrastructure
              </div>

              <div className="mt-1 text-[9px] text-muted-foreground">
                Create once. Change anytime.
              </div>
            </div>

            <div
              aria-hidden="true"
              className="grid grid-cols-3 gap-1 opacity-40"
            >
              {[1, 1, 1, 1, 0, 1, 1, 1, 1].map(
                (visible, index) => (
                  <span
                    key={index}
                    className={cn(
                      "h-1.5 w-1.5",
                      visible && "bg-primary",
                    )}
                  />
                ),
              )}
            </div>
          </div>

          <Button
            asChild
            className="
              group h-11 w-full rounded-lg
              bg-primary
              text-[11px] font-semibold
              text-white
              shadow-[0_8px_25px_rgba(250,82,15,.18)]
              hover:bg-[#E9480B]
            "
          >
            <Link
              href="/login"
              onClick={onClose}
            >
              Create QR

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
    </div>
  );
}
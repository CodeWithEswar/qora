"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  LANDING_PAGE_STARTER_LAYOUTS,
  type LandingPageStarterLayout,
} from "@nxtqr/contracts";
import { LandingPageRenderer } from "../renderer/landing-page-renderer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { NxtqrIcon } from "@/components/icons/nxtqr-icon";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface CreatePageViewProps {
  orgSlug: string;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function CreatePageView({ orgSlug }: CreatePageViewProps) {
  const router = useRouter();

  const [selectedLayoutId, setSelectedLayoutId] = useState<string>("blank");
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugCustomized, setSlugCustomized] = useState(false);
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedLayout =
    LANDING_PAGE_STARTER_LAYOUTS.find((l) => l.id === selectedLayoutId) ||
    LANDING_PAGE_STARTER_LAYOUTS[0];

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setName(val);
    if (!slugCustomized) {
      setSlug(slugify(val));
    }
  };

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-_]/g, ""));
    setSlugCustomized(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Page name is required");
      return;
    }
    if (!slug.trim()) {
      toast.error("Destination slug is required");
      return;
    }

    setIsSubmitting(true);
    try {
      toast.loading("Creating destination landing page...", { id: "create-lp" });

      const res = await fetch("/api/v1/landing-pages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          slug: slug.trim(),
          description: description.trim() || undefined,
          starterLayoutId: selectedLayoutId,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error?.message || "Failed to create landing page");
      }

      const { data: page } = await res.json();
      toast.success("Landing page created", {
        id: "create-lp",
        description: `Now configuring in Destination Studio`,
      });

      router.push(`/${orgSlug}/landing-pages/${page.id}/edit`);
    } catch (err: any) {
      toast.error("Creation failed", {
        id: "create-lp",
        description: err.message,
      });
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-8 max-w-7xl mx-auto w-full pb-16">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border/40 pb-5">
        <div>
          <nav className="flex items-center gap-2 text-xs font-mono text-muted-foreground uppercase tracking-wider mb-1">
            <Link href={`/${orgSlug}/landing-pages`} className="hover:text-foreground transition-colors">
              Landing Pages
            </Link>
            <span>/</span>
            <span className="text-foreground font-semibold">New Destination</span>
          </nav>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            Create a destination
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Choose how the experience after the scan should begin.
          </p>
        </div>

        <Button asChild variant="outline" size="sm">
          <Link href={`/${orgSlug}/landing-pages`}>
            Cancel
          </Link>
        </Button>
      </div>

      {/* Main Grid: Left Template Picker & Config, Right Device Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Starter Layouts & Configuration Form */}
        <div className="lg:col-span-7 space-y-8">
          {/* 1. Starter Layouts */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
                Starter Layouts
              </Label>
              <span className="text-xs text-muted-foreground">
                Design presets • Fully customizable
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {LANDING_PAGE_STARTER_LAYOUTS.map((layout) => {
                const isSelected = layout.id === selectedLayoutId;
                return (
                  <button
                    key={layout.id}
                    type="button"
                    onClick={() => setSelectedLayoutId(layout.id)}
                    className={cn(
                      "p-4 rounded-2xl border text-left transition-all duration-200 flex flex-col justify-between group cursor-pointer",
                      isSelected
                        ? "border-[#FA520F] bg-[#FA520F]/5 ring-1 ring-[#FA520F] shadow-sm"
                        : "border-border/60 bg-card hover:border-border hover:bg-muted/30"
                    )}
                  >
                    <div className="flex items-start justify-between w-full mb-3">
                      <div
                        className={cn(
                          "w-9 h-9 rounded-xl flex items-center justify-center transition-colors",
                          isSelected
                            ? "bg-[#FA520F] text-white"
                            : "bg-muted text-muted-foreground group-hover:text-foreground"
                        )}
                      >
                        <NxtqrIcon icon={layout.icon} size={18} />
                      </div>

                      <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                        {layout.category}
                      </span>
                    </div>

                    <div>
                      <h3 className="font-bold text-sm text-foreground group-hover:text-primary transition-colors">
                        {layout.name}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                        {layout.description}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Destination Details Form */}
          <form onSubmit={handleSubmit} className="rounded-2xl border border-border/60 bg-card p-6 space-y-5 shadow-xs">
            <div className="border-b border-border/40 pb-3">
              <h2 className="font-bold text-base text-foreground">Destination Identity</h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Define the title and public URL path for this landing page.
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="page-name" className="text-xs font-semibold">
                  Page Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="page-name"
                  value={name}
                  onChange={handleNameChange}
                  placeholder="e.g. Summer Collection Launch"
                  required
                  className="h-10 text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="page-slug" className="text-xs font-semibold">
                  Public Path / URL Slug <span className="text-destructive">*</span>
                </Label>
                <div className="flex items-center rounded-md border border-input bg-muted/20 px-3 h-10 text-xs font-mono text-muted-foreground focus-within:ring-1 focus-within:ring-primary focus-within:border-primary">
                  <span>nxtqr.vercel.app/p/</span>
                  <input
                    id="page-slug"
                    value={slug}
                    onChange={handleSlugChange}
                    placeholder="summer-collection-launch"
                    required
                    className="flex-1 bg-transparent text-foreground placeholder:text-muted-foreground focus:outline-none ml-0.5"
                  />
                </div>
                <p className="text-[11px] text-muted-foreground">
                  The destination URL visitors arrive at after scanning attached QR codes.
                </p>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="page-desc" className="text-xs font-semibold">
                  Description <span className="text-muted-foreground font-normal">(optional)</span>
                </Label>
                <Textarea
                  id="page-desc"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Internal note about the campaign, destination goals, or team owner..."
                  className="text-xs min-h-[70px]"
                />
              </div>
            </div>

            <div className="pt-3 flex items-center justify-end gap-3 border-t border-border/40">
              <Button asChild variant="outline">
                <Link href={`/${orgSlug}/landing-pages`}>Cancel</Link>
              </Button>

              <Button
                type="submit"
                disabled={isSubmitting || !name.trim() || !slug.trim()}
                className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2 font-semibold shadow-sm"
              >
                {isSubmitting ? (
                  <>
                    <NxtqrIcon icon="solar:refresh-linear" size={16} className="animate-spin" />
                    <span>Creating Destination...</span>
                  </>
                ) : (
                  <>
                    <span>Create & Open Studio</span>
                    <NxtqrIcon icon="solar:arrow-right-linear" size={16} />
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>

        {/* Right Column: Live Phone Mockup Preview */}
        <div className="lg:col-span-5 flex flex-col items-center">
          <div className="sticky top-6 w-full max-w-[340px] flex flex-col items-center">
            <div className="flex items-center justify-between w-full mb-3 text-xs font-mono text-muted-foreground px-1">
              <span>STARTER PREVIEW</span>
              <span className="text-[#FA520F] font-semibold">{selectedLayout.name}</span>
            </div>

            {/* Technical Minimal Phone Frame (340px scaled) */}
            <div className="relative w-full rounded-[40px] border-[6px] border-[#2B2B2B] dark:border-[#1F1F1F] bg-card shadow-2xl overflow-hidden aspect-[9/18] flex flex-col">
              {/* Top Dynamic Island / Notch Bar */}
              <div className="h-7 w-full flex items-center justify-center shrink-0 bg-transparent z-20 pt-1">
                <div className="w-20 h-4 rounded-full bg-black/80 dark:bg-black/90 flex items-center justify-end px-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                </div>
              </div>

              {/* Scrollable Document Canvas */}
              <div className="flex-1 overflow-y-auto overflow-x-hidden no-scrollbar">
                <LandingPageRenderer
                  document={selectedLayout.document}
                  device="phone"
                  mode="preview"
                />
              </div>

              {/* Bottom Home Indicator */}
              <div className="h-5 w-full flex items-center justify-center shrink-0 bg-transparent z-20 pb-1">
                <div className="w-24 h-1 rounded-full bg-black/20 dark:bg-white/20" />
              </div>
            </div>

            <p className="text-[11px] text-muted-foreground mt-3 text-center">
              Previewing initial layout. Colors, typography, and sections can be modified in Destination Studio.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

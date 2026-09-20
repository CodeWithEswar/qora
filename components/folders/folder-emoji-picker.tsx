"use client";

import * as React from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { NxtqrIcon } from "@/components/icons/nxtqr-icon";
import { cn } from "@/lib/utils";

interface EmojiItem {
  glyph: string;
  name: string;
  keywords: string[];
}

const FOLDER_EMOJI_CATEGORIES: Array<{ id: string; label: string; emojis: EmojiItem[] }> = [
  {
    id: "recommended",
    label: "Suggested for QR Folders",
    emojis: [
      { glyph: "📁", name: "Folder", keywords: ["folder", "file", "directory", "general"] },
      { glyph: "📣", name: "Megaphone", keywords: ["marketing", "ad", "promo", "shout", "announce"] },
      { glyph: "📦", name: "Package", keywords: ["product", "packaging", "box", "shipping"] },
      { glyph: "🚀", name: "Rocket", keywords: ["launch", "fast", "growth", "initiative"] },
      { glyph: "🛍️", name: "Shopping", keywords: ["retail", "store", "commerce", "shop"] },
      { glyph: "🎟️", name: "Tickets", keywords: ["event", "pass", "ticket", "access", "conference"] },
      { glyph: "🏢", name: "Office", keywords: ["internal", "company", "headquarters", "team"] },
      { glyph: "🎓", name: "Education", keywords: ["school", "campus", "training", "learn"] },
      { glyph: "🧪", name: "Lab", keywords: ["experiment", "test", "innovation", "research"] },
      { glyph: "🌍", name: "Global", keywords: ["world", "international", "global", "regional"] },
      { glyph: "🍽️", name: "Dining", keywords: ["menu", "restaurant", "food", "dining", "cafe"] },
      { glyph: "💳", name: "Payment", keywords: ["upi", "billing", "checkout", "finance", "pay"] },
    ],
  },
  {
    id: "business",
    label: "Business & Teams",
    emojis: [
      { glyph: "💼", name: "Briefcase", keywords: ["work", "business", "corporate"] },
      { glyph: "📊", name: "Chart", keywords: ["analytics", "metrics", "growth", "stats"] },
      { glyph: "🎯", name: "Target", keywords: ["goal", "kpi", "focus", "aim"] },
      { glyph: "💡", name: "Idea", keywords: ["bright", "innovation", "concept"] },
      { glyph: "🤝", name: "Partnership", keywords: ["deal", "partner", "handshake"] },
      { glyph: "⚙️", name: "Settings", keywords: ["config", "infrastructure", "system"] },
    ],
  },
  {
    id: "marketing",
    label: "Marketing & Campaigns",
    emojis: [
      { glyph: "✨", name: "Sparkles", keywords: ["new", "fresh", "premium", "magic"] },
      { glyph: "🔥", name: "Fire", keywords: ["trending", "hot", "deal", "popular"] },
      { glyph: "🏷️", name: "Tag", keywords: ["discount", "label", "price", "sale"] },
      { glyph: "🎁", name: "Gift", keywords: ["giveaway", "reward", "bonus"] },
      { glyph: "📱", name: "Mobile", keywords: ["app", "download", "phone", "ios", "android"] },
      { glyph: "🌐", name: "Web", keywords: ["link", "url", "website", "online"] },
    ],
  },
];

export interface FolderEmojiPickerProps {
  value?: string | null;
  onChange: (emoji: string) => void;
  className?: string;
  size?: "sm" | "default" | "lg";
}

export function FolderEmojiPicker({
  value,
  onChange,
  className,
  size = "default",
}: FolderEmojiPickerProps) {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const currentEmoji = value || "📁";

  const filteredCategories = React.useMemo(() => {
    if (!search.trim()) return FOLDER_EMOJI_CATEGORIES;
    const q = search.toLowerCase().trim();
    return FOLDER_EMOJI_CATEGORIES.map((cat) => ({
      ...cat,
      emojis: cat.emojis.filter(
        (e) =>
          e.name.toLowerCase().includes(q) ||
          e.keywords.some((k) => k.toLowerCase().includes(q)) ||
          e.glyph.includes(q)
      ),
    })).filter((cat) => cat.emojis.length > 0);
  }, [search]);

  const handleSelect = (glyph: string) => {
    onChange(glyph);
    setOpen(false);
    setSearch("");
  };

  const triggerButton = (
    <Button
      type="button"
      variant="outline"
      size="sm"
      className={cn(
        "relative shrink-0 flex items-center justify-center font-emoji transition-all duration-150 hover:bg-neutral-100 dark:hover:bg-neutral-800 border-border/80 shadow-xs",
        size === "sm" && "h-8 w-8 text-base p-0",
        size === "default" && "h-9 w-9 text-lg p-0",
        size === "lg" && "h-11 w-11 text-2xl p-0",
        className
      )}
    >
      <span aria-hidden="true">{currentEmoji}</span>
      <span className="sr-only">Change folder emoji</span>
    </Button>
  );

  const pickerContent = (
    <div className="flex flex-col h-[320px] w-full">
      <div className="p-2.5 border-b border-border/60">
        <div className="relative">
          <NxtqrIcon
            icon="solar:magnifer-linear"
            size={14}
            className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search emoji (e.g. market, launch, retail)..."
            className="pl-8 h-8 text-xs bg-muted/30 dark:bg-muted/10"
            autoFocus
          />
        </div>
      </div>

      <ScrollArea className="flex-1 p-2">
        {filteredCategories.length === 0 ? (
          <div className="py-8 text-center text-xs text-muted-foreground">
            No emojis match &quot;{search}&quot;
          </div>
        ) : (
          <div className="space-y-3">
            {filteredCategories.map((cat) => (
              <div key={cat.id} className="space-y-1.5">
                <div className="text-[10px] font-mono tracking-wider uppercase text-muted-foreground/80 px-1">
                  {cat.label}
                </div>
                <div className="grid grid-cols-6 gap-1">
                  {cat.emojis.map((emoji) => (
                    <button
                      key={emoji.name}
                      type="button"
                      onClick={() => handleSelect(emoji.glyph)}
                      title={emoji.name}
                      className={cn(
                        "h-9 w-9 flex items-center justify-center text-lg rounded-md transition-all duration-100",
                        "hover:bg-primary/10 hover:scale-110 active:scale-95",
                        value === emoji.glyph && "bg-primary/15 ring-1 ring-primary/40 font-bold"
                      )}
                    >
                      <span aria-hidden="true">{emoji.glyph}</span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );

  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>{triggerButton}</SheetTrigger>
        <SheetContent side="bottom" className="h-[420px] p-0 rounded-t-2xl">
          <SheetHeader className="p-4 pb-2 border-b border-border/60">
            <SheetTitle className="text-sm font-semibold">Choose Folder Identity</SheetTitle>
          </SheetHeader>
          {pickerContent}
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>{triggerButton}</PopoverTrigger>
      <PopoverContent className="w-72 p-0 shadow-lg border-border/80" align="start">
        {pickerContent}
      </PopoverContent>
    </Popover>
  );
}

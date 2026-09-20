"use client";

import * as React from "react";
import { Icon } from "@iconify/react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface EmojiItem {
  glyph: string;
  name: string;
  keywords: string[];
}

const EMOJI_CATEGORIES: Array<{ id: string; label: string; emojis: EmojiItem[] }> = [
  {
    id: "suggested",
    label: "Suggested",
    emojis: [
      { glyph: "🚀", name: "Rocket", keywords: ["rocket", "launch", "fast", "growth", "ship"] },
      { glyph: "🎯", name: "Direct Hit", keywords: ["target", "bullseye", "goal", "focus", "aim"] },
      { glyph: "📣", name: "Megaphone", keywords: ["megaphone", "announcement", "shout", "marketing", "promo"] },
      { glyph: "🛍️", name: "Shopping Bags", keywords: ["shopping", "bags", "retail", "store", "commerce"] },
      { glyph: "🎟️", name: "Admission Tickets", keywords: ["ticket", "event", "pass", "entry", "vip"] },
      { glyph: "🏷️", name: "Label", keywords: ["tag", "label", "price", "discount", "sale"] },
      { glyph: "✨", name: "Sparkles", keywords: ["sparkles", "magic", "new", "fresh", "premium"] },
      { glyph: "💡", name: "Light Bulb", keywords: ["lightbulb", "idea", "innovate", "bright", "smart"] },
      { glyph: "⚡", name: "High Voltage", keywords: ["lightning", "power", "fast", "bolt", "electric"] },
      { glyph: "🔥", name: "Fire", keywords: ["fire", "hot", "trending", "flame", "deal"] },
      { glyph: "⭐", name: "Star", keywords: ["star", "favorite", "best", "rating", "top"] },
      { glyph: "🏆", name: "Trophy", keywords: ["trophy", "winner", "prize", "award", "champion"] },
    ],
  },
  {
    id: "launch",
    label: "Launch",
    emojis: [
      { glyph: "🚀", name: "Rocket", keywords: ["rocket", "launch", "ship"] },
      { glyph: "🛸", name: "Flying Saucer", keywords: ["ufo", "space", "alien"] },
      { glyph: "🛰️", name: "Satellite", keywords: ["satellite", "orbit", "tech"] },
      { glyph: "🏁", name: "Chequered Flag", keywords: ["flag", "finish", "race", "start"] },
      { glyph: "⏱️", name: "Stopwatch", keywords: ["timer", "countdown", "clock"] },
      { glyph: "📢", name: "Loudspeaker", keywords: ["speaker", "announcement", "sound"] },
      { glyph: "🧭", name: "Compass", keywords: ["compass", "direction", "navigate"] },
      { glyph: "⚓", name: "Anchor", keywords: ["anchor", "stable", "sea"] },
    ],
  },
  {
    id: "commerce",
    label: "Commerce",
    emojis: [
      { glyph: "🛒", name: "Shopping Cart", keywords: ["cart", "store", "checkout", "buy"] },
      { glyph: "🛍️", name: "Shopping Bags", keywords: ["bags", "retail", "fashion"] },
      { glyph: "📦", name: "Package", keywords: ["package", "box", "shipping", "delivery"] },
      { glyph: "🏷️", name: "Label", keywords: ["tag", "price", "sale"] },
      { glyph: "💳", name: "Credit Card", keywords: ["card", "payment", "bank"] },
      { glyph: "🎁", name: "Wrapped Gift", keywords: ["gift", "present", "bonus"] },
      { glyph: "💰", name: "Money Bag", keywords: ["money", "cash", "revenue"] },
      { glyph: "🧾", name: "Receipt", keywords: ["receipt", "bill", "invoice"] },
      { glyph: "🏪", name: "Convenience Store", keywords: ["store", "shop", "market"] },
      { glyph: "💎", name: "Gem Stone", keywords: ["diamond", "gem", "luxury"] },
    ],
  },
  {
    id: "events",
    label: "Events",
    emojis: [
      { glyph: "🎉", name: "Party Popper", keywords: ["party", "celebrate", "tada"] },
      { glyph: "🎟️", name: "Admission Tickets", keywords: ["ticket", "entry", "pass"] },
      { glyph: "🎤", name: "Microphone", keywords: ["mic", "sing", "speaker", "conference"] },
      { glyph: "🎪", name: "Circus Tent", keywords: ["circus", "festival", "show"] },
      { glyph: "📅", name: "Calendar", keywords: ["date", "schedule", "event"] },
      { glyph: "🎫", name: "Ticket", keywords: ["ticket", "boarding", "concert"] },
      { glyph: "🎭", name: "Performing Arts", keywords: ["theater", "drama", "arts"] },
      { glyph: "🎬", name: "Clapper Board", keywords: ["movie", "film", "cinema"] },
      { glyph: "🎈", name: "Balloon", keywords: ["balloon", "celebration", "birthday"] },
      { glyph: "🥂", name: "Clinking Glasses", keywords: ["cheers", "toast", "drinks"] },
    ],
  },
  {
    id: "food",
    label: "Food & Drink",
    emojis: [
      { glyph: "☕", name: "Hot Beverage", keywords: ["coffee", "tea", "cafe", "cup"] },
      { glyph: "🍔", name: "Hamburger", keywords: ["burger", "food", "fastfood"] },
      { glyph: "🍕", name: "Pizza", keywords: ["pizza", "slice", "italian"] },
      { glyph: "🍜", name: "Steaming Bowl", keywords: ["noodles", "ramen", "soup"] },
      { glyph: "🍣", name: "Sushi", keywords: ["sushi", "japanese", "fish"] },
      { glyph: "🍰", name: "Shortcake", keywords: ["cake", "dessert", "sweet"] },
      { glyph: "🍷", name: "Wine Glass", keywords: ["wine", "drink", "bar"] },
      { glyph: "🍦", name: "Soft Ice Cream", keywords: ["icecream", "gelato", "cone"] },
    ],
  },
  {
    id: "education",
    label: "Education",
    emojis: [
      { glyph: "🎓", name: "Graduation Cap", keywords: ["graduate", "school", "university"] },
      { glyph: "📚", name: "Books", keywords: ["books", "library", "study"] },
      { glyph: "🔬", name: "Microscope", keywords: ["science", "lab", "research"] },
      { glyph: "📐", name: "Triangular Ruler", keywords: ["measure", "math", "design"] },
      { glyph: "🏫", name: "School", keywords: ["school", "building", "campus"] },
      { glyph: "🧠", name: "Brain", keywords: ["brain", "intelligence", "smart"] },
      { glyph: "🎨", name: "Artist Palette", keywords: ["art", "design", "color"] },
      { glyph: "🧩", name: "Puzzle Piece", keywords: ["puzzle", "problem", "solve"] },
    ],
  },
  {
    id: "business",
    label: "Business",
    emojis: [
      { glyph: "🏢", name: "Office Building", keywords: ["office", "building", "company"] },
      { glyph: "💼", name: "Briefcase", keywords: ["work", "job", "career"] },
      { glyph: "📈", name: "Chart Increasing", keywords: ["growth", "chart", "metrics", "sales"] },
      { glyph: "🤝", name: "Handshake", keywords: ["deal", "partner", "agreement"] },
      { glyph: "🏛️", name: "Classical Building", keywords: ["bank", "institution", "governance"] },
      { glyph: "🌐", name: "Globe with Meridians", keywords: ["globe", "world", "international"] },
      { glyph: "📍", name: "Round Pushpin", keywords: ["location", "pin", "place"] },
      { glyph: "⚖️", name: "Balance Scale", keywords: ["law", "justice", "compliance"] },
    ],
  },
  {
    id: "tech",
    label: "Technology",
    emojis: [
      { glyph: "📱", name: "Mobile Phone", keywords: ["phone", "mobile", "app", "qr"] },
      { glyph: "💻", name: "Laptop", keywords: ["computer", "code", "dev"] },
      { glyph: "🤖", name: "Robot", keywords: ["ai", "bot", "automations"] },
      { glyph: "🧪", name: "Test Tube", keywords: ["experiment", "ab-test", "lab"] },
      { glyph: "📡", name: "Satellite Antenna", keywords: ["signal", "network", "telemetry"] },
      { glyph: "🔋", name: "Battery", keywords: ["power", "energy", "charge"] },
      { glyph: "🕹️", name: "Joystick", keywords: ["game", "play", "interactive"] },
      { glyph: "💾", name: "Floppy Disk", keywords: ["save", "data", "storage"] },
    ],
  },
  {
    id: "symbols",
    label: "Symbols",
    emojis: [
      { glyph: "❤️", name: "Red Heart", keywords: ["love", "heart", "favorite"] },
      { glyph: "⭐", name: "Star", keywords: ["star", "rating"] },
      { glyph: "🔥", name: "Fire", keywords: ["hot", "fire"] },
      { glyph: "💎", name: "Gem", keywords: ["gem", "diamond"] },
      { glyph: "🍀", name: "Four Leaf Clover", keywords: ["luck", "clover"] },
      { glyph: "🔔", name: "Bell", keywords: ["notification", "alert"] },
      { glyph: "🔑", name: "Key", keywords: ["key", "access", "unlock"] },
      { glyph: "🛡️", name: "Shield", keywords: ["shield", "security", "protect"] },
    ],
  },
];

export interface CampaignEmojiPickerProps {
  value?: string | null;
  onChange: (emoji: string | null) => void;
  children?: React.ReactNode;
  disabled?: boolean;
  campaignName?: string;
}

export function CampaignEmojiPicker({
  value,
  onChange,
  children,
  disabled = false,
}: CampaignEmojiPickerProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const filteredCategories = React.useMemo(() => {
    if (!search.trim()) return EMOJI_CATEGORIES;
    const query = search.trim().toLowerCase();

    return EMOJI_CATEGORIES.map((cat) => ({
      ...cat,
      emojis: cat.emojis.filter(
        (e) =>
          e.name.toLowerCase().includes(query) ||
          e.glyph.includes(query) ||
          e.keywords.some((k) => k.includes(query))
      ),
    })).filter((cat) => cat.emojis.length > 0);
  }, [search]);

  const handleSelect = (emoji: string) => {
    onChange(emoji);
    setIsOpen(false);
  };

  const handleRemove = () => {
    onChange(null);
    setIsOpen(false);
  };

  const pickerBody = (
    <div className="flex flex-col h-80 select-none">
      {/* Search Bar */}
      <div className="p-3 border-b border-border/50">
        <div className="relative">
          <Icon
            icon="hugeicons:search-01"
            className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none"
          />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search emoji..."
            className="pl-8 text-xs h-8 bg-surface-elevated"
            autoFocus
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <Icon icon="hugeicons:cancel-01" className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Emoji Catalog List */}
      <ScrollArea className="flex-1 p-3">
        {filteredCategories.length === 0 ? (
          <div className="py-8 text-center text-xs text-muted-foreground">
            No emojis found for &ldquo;{search}&rdquo;
          </div>
        ) : (
          <div className="space-y-4">
            {filteredCategories.map((cat) => (
              <div key={cat.id}>
                <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                  {cat.label}
                </div>
                <div className="grid grid-cols-6 gap-1">
                  {cat.emojis.map((emoji) => (
                    <button
                      key={emoji.name}
                      type="button"
                      aria-label={emoji.name}
                      onClick={() => handleSelect(emoji.glyph)}
                      className={cn(
                        "h-10 w-10 flex items-center justify-center text-xl rounded-lg transition-all",
                        "hover:bg-[#FFF8E0] dark:hover:bg-white/10 hover:scale-110 active:scale-95",
                        value === emoji.glyph && "bg-[#FFF8E0] dark:bg-white/15 ring-2 ring-primary/40"
                      )}
                    >
                      <span>{emoji.glyph}</span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>

      {/* Footer with Remove Option */}
      {value && (
        <div className="p-2 border-t border-border/50 flex justify-between items-center bg-surface-elevated/40">
          <span className="text-xs text-muted-foreground">Current: {value}</span>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleRemove}
            className="text-xs h-7 text-rose-500 hover:text-rose-600 hover:bg-rose-500/10 gap-1.5"
          >
            <Icon icon="hugeicons:delete-02" className="w-3.5 h-3.5" />
            <span>Remove icon</span>
          </Button>
        </div>
      )}
    </div>
  );

  if (isMobile) {
    return (
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild disabled={disabled}>
          {children || (
            <button
              type="button"
              className="h-11 w-11 flex items-center justify-center rounded-xl bg-surface border border-border text-2xl hover:border-primary/50 transition-colors"
            >
              {value || "🚀"}
            </button>
          )}
        </SheetTrigger>
        <SheetContent side="bottom" className="p-0 max-h-[85vh] rounded-t-2xl">
          <SheetHeader className="p-4 pb-2 border-b border-border/50 text-left">
            <SheetTitle className="text-sm font-semibold tracking-tight">Campaign Icon</SheetTitle>
          </SheetHeader>
          {pickerBody}
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild disabled={disabled}>
        {children || (
          <button
            type="button"
            className="h-12 w-12 flex items-center justify-center rounded-xl bg-surface border border-border text-2xl hover:border-primary/50 transition-colors shadow-xs"
          >
            {value || "🚀"}
          </button>
        )}
      </PopoverTrigger>
      <PopoverContent className="w-72 p-0 shadow-xl border-border" align="start">
        <div className="px-3 pt-3 pb-1 border-b border-border/40 text-[11px] font-bold text-muted-foreground tracking-wider uppercase">
          Campaign Icon
        </div>
        {pickerBody}
      </PopoverContent>
    </Popover>
  );
}

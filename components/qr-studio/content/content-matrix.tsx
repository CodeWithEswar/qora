import * as React from "react";
import {
  Search,
  ArrowRight,
  Sparkles,
  AlertTriangle,
  X,
  Layers,
  ArrowUpRight,
} from "lucide-react";
import {
  QrContentV1,
  QrCategory,
  QrTypeDefinition,
  QR_CATEGORIES,
  QR_TYPE_REGISTRY,
  searchQrTypes,
} from "@nxtqr/qr-core";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { QrTypeIcon } from "@/components/icons/qr-type-icon";

interface ContentMatrixProps {
  isOpen: boolean;
  onClose: () => void;
  currentType: string;
  currentContent: QrContentV1;
  onSelectType: (nextDef: QrTypeDefinition) => void;
}

const QUICK_START_IDS = ["url", "multi_link", "wifi", "vcard", "pdf", "app", "upi", "instagram"];

export function ContentMatrix({
  isOpen,
  onClose,
  currentType,
  currentContent,
  onSelectType,
}: ContentMatrixProps) {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedCategory, setSelectedCategory] = React.useState<QrCategory>("all");
  const [pendingType, setPendingType] = React.useState<QrTypeDefinition | null>(null);
  const [showConfirmAlert, setShowConfirmAlert] = React.useState(false);

  const searchInputRef = React.useRef<HTMLInputElement>(null);

  // Keyboard shortcut ⌘K / Ctrl+K to focus search or open
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        if (isOpen) {
          e.preventDefault();
          searchInputRef.current?.focus();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  // Reset search when opening
  React.useEffect(() => {
    if (isOpen) {
      setSearchQuery("");
      setSelectedCategory("all");
      setTimeout(() => searchInputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  const filteredTypes = React.useMemo(() => {
    return searchQrTypes(selectedCategory, searchQuery);
  }, [selectedCategory, searchQuery]);

  const currentDef = QR_TYPE_REGISTRY[currentType] || QR_TYPE_REGISTRY.url;

  // Check if current content has non-empty user-entered data
  const hasExistingData = React.useMemo(() => {
    if (currentContent.type === "url" && currentContent.url) return true;
    if (currentContent.type === "platform_link" && currentContent.targetUrl) return true;
    if (currentContent.type === "text" && currentContent.text) return true;
    if (currentContent.type === "wifi" && (currentContent.ssid || currentContent.password)) return true;
    if (currentContent.type === "vcard" && (currentContent.firstName || currentContent.phone || currentContent.email)) return true;
    if (currentContent.type === "email" && currentContent.recipient) return true;
    if (currentContent.type === "phone" && currentContent.phoneNumber) return true;
    if (currentContent.type === "sms" && currentContent.phoneNumber) return true;
    if (currentContent.type === "location" && (currentContent.label || currentContent.latitude !== 0)) return true;
    if (currentContent.type === "calendar" && currentContent.title) return true;
    if (currentContent.type === "app" && (currentContent.iosUrl || currentContent.androidUrl || currentContent.fallbackUrl)) return true;
    if (currentContent.type === "file" && currentContent.assetId) return true;
    if (currentContent.type === "payment" && currentContent.payeeAddress) return true;
    return false;
  }, [currentContent]);

  const handleTileClick = (typeDef: QrTypeDefinition) => {
    if (typeDef.id === currentType) {
      onClose();
      return;
    }

    // If current content has non-empty data and target type family is fundamentally different
    if (hasExistingData) {
      setPendingType(typeDef);
      setShowConfirmAlert(true);
    } else {
      onSelectType(typeDef);
      onClose();
    }
  };

  const handleConfirmChange = () => {
    if (pendingType) {
      onSelectType(pendingType);
      setPendingType(null);
    }
    setShowConfirmAlert(false);
    onClose();
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="max-w-4xl h-[90vh] sm:h-[84vh] p-0 flex flex-col gap-0 border-border bg-background shadow-2xl overflow-hidden rounded-xl">
          {/* Header */}
          <div className="p-4 sm:p-5 pb-3 border-b border-border bg-surface-elevated/40 shrink-0">
            <div className="flex items-center justify-between gap-3 mb-3">
              <div className="flex items-center gap-2">
                <div className="h-6 w-6 rounded bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                  <Layers className="h-3.5 w-3.5" />
                </div>
                <div>
                  <DialogTitle className="text-base font-bold tracking-tight text-foreground flex items-center gap-2">
                    QR Content Matrix
                    <span className="text-[10px] uppercase font-mono font-bold tracking-wider px-1.5 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
                      50+ Workflows
                    </span>
                  </DialogTitle>
                  <DialogDescription className="text-xs text-muted-foreground">
                    Choose what this QR code will do when scanned by users
                  </DialogDescription>
                </div>
              </div>
            </div>

            {/* Search Input Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                ref={searchInputRef}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search QR types by name, category, or workflow (e.g. instagram, wifi, upi, pdf)..."
                className="pl-9 pr-16 h-10 bg-background text-xs sm:text-sm border-border focus-visible:ring-primary"
              />
              <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none">
                <kbd className="hidden sm:inline-flex items-center gap-0.5 rounded border border-border bg-muted/60 px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground">
                  ⌘K
                </kbd>
              </div>
            </div>

            {/* Category Filter Chips Rail */}
            <div className="flex items-center gap-1.5 overflow-x-auto pt-3 pb-1 scrollbar-none">
              {QR_CATEGORIES.map((cat) => {
                const isActive = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                      isActive
                        ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                        : "bg-surface-elevated hover:bg-surface-hover text-muted-foreground hover:text-foreground border border-border/80"
                    }`}
                  >
                    {cat.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Body with ScrollArea */}
          <ScrollArea className="flex-1">
            <div className="p-4 sm:p-6 space-y-6 max-w-full">
              {/* Quick Start Pinned Row (Only when on 'all' or empty search) */}
              {!searchQuery && selectedCategory === "all" && (
                <div className="space-y-3">
                  <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    <Sparkles className="h-3.5 w-3.5 text-primary" />
                    <span>Quick Start Essentials</span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
                    {QUICK_START_IDS.map((id) => {
                      const def = QR_TYPE_REGISTRY[id];
                      if (!def) return null;
                      const isSelected = currentType === def.id;

                      return (
                        <button
                          key={def.id}
                          type="button"
                          onClick={() => handleTileClick(def)}
                          className={`group relative p-3 sm:p-3.5 rounded-xl border-2 text-left transition-all duration-200 cursor-pointer flex items-center gap-3 select-none ${
                            isSelected
                              ? "border-primary bg-primary/[0.08] ring-2 ring-primary/20 shadow-xs z-10"
                              : "border-border/70 bg-surface hover:border-primary/60 hover:bg-primary/[0.03] hover:shadow-md hover:-translate-y-0.5 z-0 hover:z-10"
                          }`}
                        >
                          <div
                            className={`h-9 w-9 rounded-lg border flex items-center justify-center shrink-0 transition-all duration-200 ${
                              isSelected
                                ? "bg-primary text-white border-primary shadow-xs"
                                : "bg-surface-elevated text-foreground border-border/80 group-hover:border-primary/50 group-hover:bg-primary/10 group-hover:scale-105 shadow-2xs"
                            }`}
                          >
                            <QrTypeIcon
                              type={def.id}
                              size="sm"
                              tone={isSelected ? "default" : "brand"}
                              className={isSelected ? "text-white" : ""}
                            />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="text-xs font-bold text-foreground truncate group-hover:text-primary transition-colors">
                              {def.label}
                            </div>
                            <div className="text-[10px] text-muted-foreground truncate leading-tight mt-0.5">
                              {def.shortDescription}
                            </div>
                          </div>
                          <ArrowUpRight
                            className={`h-3.5 w-3.5 shrink-0 opacity-40 group-hover:opacity-100 group-hover:text-primary group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-200 ${
                              isSelected ? "text-primary opacity-100" : "text-muted-foreground"
                            }`}
                          />
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Main Grid of Content Tiles */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  <span>Available QR Workflows ({filteredTypes.length})</span>
                  {selectedCategory !== "all" && (
                    <button
                      type="button"
                      onClick={() => setSelectedCategory("all")}
                      className="text-[11px] text-primary hover:underline lowercase font-normal cursor-pointer"
                    >
                      show all categories
                    </button>
                  )}
                </div>

                {filteredTypes.length === 0 ? (
                  <div className="py-12 text-center space-y-2 border border-dashed border-border rounded-xl bg-surface-elevated/20">
                    <p className="text-sm font-medium text-foreground">No QR types found</p>
                    <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                      No QR type matches &ldquo;{searchQuery}&rdquo;. Try another name, category, or search term like &ldquo;social&rdquo;, &ldquo;wifi&rdquo;, &ldquo;contact&rdquo;, or &ldquo;upi&rdquo;.
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSearchQuery("");
                        setSelectedCategory("all");
                      }}
                      className="mt-2 text-xs"
                    >
                      Clear Search & Filters
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-3.5 pb-10">
                    {filteredTypes.map((t) => {
                      const isSelected = currentType === t.id;

                      return (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => handleTileClick(t)}
                          className={`group relative p-3.5 sm:p-4 rounded-xl border-2 text-left transition-all duration-200 cursor-pointer flex flex-col justify-between gap-3 select-none ${
                            isSelected
                              ? "border-primary bg-primary/[0.08] ring-2 ring-primary/20 shadow-xs z-10"
                              : "border-border/70 bg-surface hover:border-primary/60 hover:bg-primary/[0.03] hover:shadow-md hover:-translate-y-0.5 z-0 hover:z-10"
                          }`}
                        >
                          {/* Top Row: Icon & Status / Signals */}
                          <div className="flex items-start justify-between gap-2.5">
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div
                                className={`h-9 w-9 rounded-lg border flex items-center justify-center shrink-0 transition-all duration-200 ${
                                  isSelected
                                    ? "bg-primary text-white border-primary shadow-xs"
                                    : "bg-surface-elevated text-foreground border-border/80 group-hover:border-primary/50 group-hover:bg-primary/10 group-hover:scale-105 shadow-2xs"
                                }`}
                              >
                                <QrTypeIcon
                                  type={t.id}
                                  size="md"
                                  tone={isSelected ? "default" : "brand"}
                                  className={isSelected ? "text-white" : ""}
                                />
                              </div>
                              <div className="min-w-0">
                                <h4 className="text-xs font-bold tracking-tight text-foreground truncate group-hover:text-primary transition-colors">
                                  {t.label}
                                </h4>
                                <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">
                                  {t.category.replace("_", " ")}
                                </span>
                              </div>
                            </div>

                            {/* Signal Indicator */}
                            {isSelected ? (
                              <span className="h-2.5 w-2.5 rounded-full bg-primary ring-4 ring-primary/25 shadow-xs shrink-0 mt-1" />
                            ) : (
                              <ArrowRight className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-200 text-primary shrink-0 mt-1" />
                            )}
                          </div>

                          {/* Description */}
                          <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed my-0.5">
                            {t.shortDescription}
                          </p>

                          {/* Footer Badges */}
                          <div className="flex items-center gap-1.5 pt-2 mt-auto border-t border-border/50 text-[10px] text-muted-foreground">
                            {t.supportsDynamic && (
                              <span className="px-2 py-0.5 rounded-md bg-muted/80 font-mono text-[9px] font-medium uppercase tracking-wider">
                                Dynamic Link
                              </span>
                            )}
                            {t.supportsStatic && (
                              <span className="px-2 py-0.5 rounded-md bg-muted/50 font-mono text-[9px] font-medium uppercase tracking-wider">
                                Offline QR
                              </span>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </ScrollArea>

          {/* Footer Bar with Current Active Info */}
          <div className="p-3 px-5 border-t border-border bg-surface-elevated/60 flex items-center justify-between text-xs shrink-0">
            <div className="flex items-center gap-2 text-muted-foreground">
              <span>Current active type:</span>
              <Badge variant="outline" className="text-foreground font-semibold">
                {currentDef.label}
              </Badge>
            </div>

            <Button variant="ghost" size="sm" onClick={onClose} className="h-7 text-xs">
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog on Incompatible Type Change */}
      <AlertDialog open={showConfirmAlert} onOpenChange={setShowConfirmAlert}>
        <AlertDialogContent className="border-border">
          <AlertDialogHeader>
            <div className="flex items-center gap-2 text-amber-500 mb-1">
              <AlertTriangle className="h-5 w-5" />
              <AlertDialogTitle className="text-base font-bold">Change QR Content Type?</AlertDialogTitle>
            </div>
            <AlertDialogDescription asChild>
              <div className="text-xs text-muted-foreground space-y-2">
                <p>
                  Changing from <strong className="text-foreground">{currentDef.label}</strong> to{" "}
                  <strong className="text-foreground">{pendingType?.label}</strong> will replace existing content with default fields for the new type.
                </p>
                <div className="p-2.5 rounded border border-border bg-muted/30 font-mono text-[11px] text-foreground">
                  Target workflow: {pendingType?.label} ({pendingType?.shortDescription})
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setPendingType(null)} className="text-xs">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmChange}
              className="bg-primary hover:bg-[#cc3a05] text-white text-xs font-semibold"
            >
              Change Type & Reset Content
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

import * as React from "react";
import {
  Globe,
  Upload,
  AlertTriangle,
  Eye,
  EyeOff,
  Layers,
  ExternalLink,
  MapPin,
  Calendar,
  Mail,
  Phone,
  MessageSquare,
  CreditCard,
  CheckCircle2,
} from "lucide-react";
import {
  QrContentV1,
  QrTypeDefinition,
  QR_TYPE_REGISTRY,
} from "@nxtqr/qr-core";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BRAND } from "@/lib/brand";
import { buildQrResolverUrl, RESOLVER_CONFIG } from "@nxtqr/config";
import { ContentMatrix } from "./content-matrix";
import { QrTypeIcon, cleanDomainFromUrl } from "@/components/icons/qr-type-icon";

interface ContentPanelProps {
  content: QrContentV1;
  onChange: (next: QrContentV1) => void;
  orgSlug: string;
  isDynamic: boolean;
  onDynamicChange: (dynamic: boolean) => void;
  shortSlug?: string;
}

export function ContentPanel({
  content,
  onChange,
  orgSlug,
  isDynamic,
  onDynamicChange,
  shortSlug,
}: ContentPanelProps) {
  const [isMatrixOpen, setIsMatrixOpen] = React.useState(false);
  const [showWifiPassword, setShowWifiPassword] = React.useState(false);
  const [isUploadingFile, setIsUploadingFile] = React.useState(false);

  const displayResolverLink = `${RESOLVER_CONFIG.defaultHost}/s/${shortSlug || "preview"}`;

  // Find active type definition in canonical registry
  const activeDef: QrTypeDefinition =
    (content.type === "platform_link"
      ? QR_TYPE_REGISTRY[content.platform]
      : QR_TYPE_REGISTRY[content.type]) || QR_TYPE_REGISTRY.url;

  // Handle Type Change selected from ContentMatrix
  const handleSelectTypeFromMatrix = (nextDef: QrTypeDefinition) => {
    // Determine dynamic routing support
    if (!nextDef.supportsDynamic) {
      onDynamicChange(false);
    } else if (nextDef.id === "url" || nextDef.category === "social" || nextDef.id === "app" || nextDef.id === "file" || nextDef.id === "pdf") {
      onDynamicChange(true);
    }

    const defaultContent = nextDef.createDefault();
    onChange(defaultContent);
  };

  // Upload handler for File / PDF QR
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingFile(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("resourceType", "qr_file");

      const res = await fetch(`/api/v1/organizations/${orgSlug}/assets`, {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const json = await res.json();
        const data = json.data;
        onChange({
          type: "file",
          assetId: data.assetId,
          fileName: data.fileName,
          fileSize: data.sizeBytes,
          mimeType: data.contentType,
          downloadUrl: data.url,
        });
      }
    } catch {
      // Error handled cleanly
    } finally {
      setIsUploadingFile(false);
    }
  };

  // Is current type capable of dynamic routing
  const canBeDynamic =
    content.type === "url" ||
    content.type === "platform_link" ||
    content.type === "app" ||
    content.type === "file";

  return (
    <div className="space-y-4">
      {/* Content & Type Configuration Card */}
      <Card className="border-border shadow-2xs">
        <CardHeader className="p-3.5 sm:p-4 pb-3 border-b border-border">
          <div className="flex flex-col xs:flex-row xs:items-center justify-between gap-2.5">
            <div className="min-w-0">
              <CardTitle className="text-sm font-semibold tracking-tight">1. Content & Type</CardTitle>
              <CardDescription className="text-xs text-muted-foreground truncate">
                Define payload and destination workflow
              </CardDescription>
            </div>

            {/* Change Type Button (Opens Content Matrix) */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsMatrixOpen(true)}
              className="h-8 gap-1.5 px-2.5 text-xs font-medium border-border hover:bg-surface-hover hover:border-primary/50 self-start xs:self-auto shrink-0 cursor-pointer transition-colors"
            >
              <QrTypeIcon type={activeDef.id} size="sm" tone="brand" className="shrink-0" />
              <span className="font-semibold text-foreground truncate max-w-[120px] sm:max-w-[140px]">
                {activeDef.label}
              </span>
              <span className="text-[10px] uppercase font-mono text-primary font-bold bg-primary/10 px-1 py-0.2 rounded ml-0.5">
                Change
              </span>
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-4 space-y-4 text-xs">
          {/* Dynamic vs Static Routing Toggle */}
          {canBeDynamic && (
            <div className="p-3 rounded-lg border border-border bg-surface-elevated/50 space-y-1.5">
              <div className="flex items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-1.5 min-w-0">
                  <span className="font-semibold text-xs sm:text-sm text-foreground whitespace-nowrap">
                    Dynamic Routing
                  </span>
                  <span className="text-[9px] font-bold tracking-wider text-primary bg-primary/10 px-1.5 py-0.5 rounded uppercase">
                    RECOMMENDED
                  </span>
                </div>
                <Switch checked={isDynamic} onCheckedChange={onDynamicChange} className="shrink-0" />
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                {isDynamic
                  ? "QR encodes stable short link. You can update the destination anytime after print."
                  : "Content is physically baked into the QR matrix. Cannot be changed after printing."}
              </p>
            </div>
          )}

          {/* =========================================================================
              TYPE 1: Website URL
              ========================================================================= */}
          {content.type === "url" && (
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Destination URL *</Label>
                <Input
                  type="url"
                  value={content.url}
                  onChange={(e) => onChange({ ...content, url: e.target.value })}
                  placeholder="https://yourbrand.com/promo"
                  className="font-mono text-xs"
                />
                {content.url && !/^https?:\/\//i.test(content.url) && (
                  <p className="text-[11px] text-rose-500 flex items-center gap-1 mt-1">
                    <AlertTriangle className="h-3 w-3 shrink-0" />
                    URL must begin with http:// or https://
                  </p>
                )}

                {content.url && (
                  (() => {
                    const info = cleanDomainFromUrl(content.url);
                    if (!info.cleanDomain) return null;
                    return (
                      <div className="flex items-center justify-between px-2.5 py-1.5 rounded-md border border-border/80 bg-surface-elevated/70 text-[11px] transition-all">
                        <div className="flex items-center gap-2 min-w-0">
                          <QrTypeIcon
                            type={info.brandKey}
                            domain={info.cleanDomain}
                            faviconUrl={info.faviconUrl}
                            size={16}
                            tone="brand"
                          />
                          <span className="font-semibold text-foreground truncate">{info.displayName}</span>
                          <span className="text-[10px] text-muted-foreground font-mono truncate">({info.cleanDomain})</span>
                        </div>
                        <span className="text-[9px] font-mono text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-500/10 px-1.5 py-0.5 rounded shrink-0">
                          Detected Domain
                        </span>
                      </div>
                    );
                  })()
                )}
              </div>

              {/* Resolver Identity Preview */}
              {isDynamic && (
                <div className="p-2.5 rounded-md border border-border bg-surface text-[11px] space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-foreground text-[11px]">Stable Resolver Link</span>
                    <span className="text-[9px] font-mono text-muted-foreground uppercase">Edge Compiled</span>
                  </div>
                  <div className="px-2.5 py-1 rounded bg-muted/40 border border-border/60 font-mono text-primary font-semibold text-[11px] break-all select-all">
                    {displayResolverLink}
                  </div>
                  <p className="text-[10px] text-muted-foreground leading-normal">
                    Physical scans resolve to this permanent address, redirecting to your destination.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* =========================================================================
              TYPE 2: Platform Link (Social / Commerce / Media / Productivity)
              ========================================================================= */}
          {content.type === "platform_link" && (
            <div className="space-y-3">
              <div className="p-2.5 rounded-lg border border-border bg-surface flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-7 w-7 rounded-md bg-surface-elevated border border-border/80 flex items-center justify-center shrink-0">
                    <QrTypeIcon type={activeDef.id} size="sm" tone="brand" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-foreground capitalize">{content.platform} Destination</div>
                    <div className="text-[10px] text-muted-foreground">{activeDef.shortDescription}</div>
                  </div>
                </div>
                <Badge variant="outline" className="text-[10px] uppercase font-mono">
                  {activeDef.category}
                </Badge>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">
                  {content.platform.toUpperCase()} URL or Handle *
                </Label>
                <div className="relative">
                  <Input
                    value={content.targetUrl}
                    onChange={(e) => {
                      const val = e.target.value;
                      onChange({ ...content, targetUrl: val });
                    }}
                    placeholder={activeDef.placeholder ? `${activeDef.prefixUrl || ""}${activeDef.placeholder}` : "https://..."}
                    className="font-mono text-xs"
                  />
                </div>
                {activeDef.prefixUrl && !content.targetUrl.startsWith("http") && content.targetUrl.length > 0 && (
                  <p className="text-[11px] text-muted-foreground">
                    Tip: Enter handle or paste full URL (will resolve to {activeDef.prefixUrl}...)
                  </p>
                )}
              </div>

              {/* Resolver Preview if dynamic */}
              {isDynamic && (
                <div className="p-2.5 rounded-md border border-border bg-surface text-[11px] space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-foreground text-[11px]">Stable Resolver Link</span>
                    <span className="text-[9px] font-mono text-muted-foreground uppercase">Edge Compiled</span>
                  </div>
                  <div className="px-2.5 py-1 rounded bg-muted/40 border border-border/60 font-mono text-primary font-semibold text-[11px] break-all select-all">
                    {displayResolverLink}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* =========================================================================
              TYPE 3: Plain Text
             ========================================================================= */}
          {content.type === "text" && (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold">Plain Text Message</Label>
                <span className="text-[10px] text-muted-foreground font-mono">
                  {content.text.length} / 2000 chars
                </span>
              </div>
              <Textarea
                value={content.text}
                onChange={(e) => onChange({ ...content, text: e.target.value })}
                placeholder="Enter text to display when scanned..."
                rows={4}
                className="text-xs"
              />
              {content.text.length > 500 && (
                <p className="text-[10px] text-amber-500">
                  Tip: Longer text creates denser QR matrices that require larger print sizes.
                </p>
              )}
            </div>
          )}

          {/* =========================================================================
              TYPE 4: Wi-Fi Access
             ========================================================================= */}
          {content.type === "wifi" && (
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Network Name (SSID) *</Label>
                <Input
                  value={content.ssid}
                  onChange={(e) => onChange({ ...content, ssid: e.target.value })}
                  placeholder="e.g. Guest-Office-5G"
                  className="text-xs font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1.5">
                  <Select
                    value={content.security}
                    onValueChange={(val) =>
                      onChange({
                        ...content,
                        security: val as "WPA" | "WEP" | "nopass",
                      })
                    }
                  >
                    <SelectTrigger className="h-8 w-full text-xs">
                      <SelectValue placeholder="Security" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="WPA" className="text-xs">WPA / WPA2</SelectItem>
                      <SelectItem value="WEP" className="text-xs">WEP</SelectItem>
                      <SelectItem value="nopass" className="text-xs">None (Open)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {content.security !== "nopass" && (
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">Password</Label>
                    <div className="relative">
                      <Input
                        type={showWifiPassword ? "text" : "password"}
                        value={content.password}
                        onChange={(e) => onChange({ ...content, password: e.target.value })}
                        placeholder="Wi-Fi Password"
                        className="text-xs font-mono pr-8"
                      />
                      <button
                        type="button"
                        onClick={() => setShowWifiPassword(!showWifiPassword)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showWifiPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between pt-1">
                <Label className="text-xs cursor-pointer">Hidden Network</Label>
                <Switch
                  checked={content.hidden}
                  onCheckedChange={(checked) => onChange({ ...content, hidden: checked })}
                />
              </div>
            </div>
          )}

          {/* =========================================================================
              TYPE 5: vCard Contact Card
             ========================================================================= */}
          {content.type === "vcard" && (
            <div className="space-y-2.5">
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label className="text-[11px] font-semibold">First Name *</Label>
                  <Input
                    value={content.firstName}
                    onChange={(e) => onChange({ ...content, firstName: e.target.value })}
                    placeholder="Alex"
                    className="text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-[11px] font-semibold">Last Name</Label>
                  <Input
                    value={content.lastName || ""}
                    onChange={(e) => onChange({ ...content, lastName: e.target.value })}
                    placeholder="Rivera"
                    className="text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label className="text-[11px] font-semibold">Phone Number</Label>
                  <Input
                    type="tel"
                    value={content.phone || ""}
                    onChange={(e) => onChange({ ...content, phone: e.target.value })}
                    placeholder="+1 555-0199"
                    className="text-xs font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-[11px] font-semibold">Email Address</Label>
                  <Input
                    type="email"
                    value={content.email || ""}
                    onChange={(e) => onChange({ ...content, email: e.target.value })}
                    placeholder="alex@acme.com"
                    className="text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label className="text-[11px] font-semibold">Organization</Label>
                  <Input
                    value={content.organization || ""}
                    onChange={(e) => onChange({ ...content, organization: e.target.value })}
                    placeholder="Company Name"
                    className="text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-[11px] font-semibold">Job Title</Label>
                  <Input
                    value={content.jobTitle || ""}
                    onChange={(e) => onChange({ ...content, jobTitle: e.target.value })}
                    placeholder="Design Lead"
                    className="text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-[11px] font-semibold">Website</Label>
                <Input
                  type="url"
                  value={content.website || ""}
                  onChange={(e) => onChange({ ...content, website: e.target.value })}
                  placeholder="https://portfolio.com"
                  className="text-xs font-mono"
                />
              </div>
            </div>
          )}

          {/* =========================================================================
              TYPE 6: Send Email (mailto)
             ========================================================================= */}
          {content.type === "email" && (
            <div className="space-y-2.5">
              <div className="space-y-1">
                <Label className="text-xs font-semibold">Recipient Email *</Label>
                <Input
                  type="email"
                  value={content.recipient}
                  onChange={(e) => onChange({ ...content, recipient: e.target.value })}
                  placeholder="support@company.com"
                  className="text-xs font-mono"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-semibold">Subject Line</Label>
                <Input
                  value={content.subject || ""}
                  onChange={(e) => onChange({ ...content, subject: e.target.value })}
                  placeholder="Product Inquiry"
                  className="text-xs"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-semibold">Message Body</Label>
                <Textarea
                  value={content.body || ""}
                  onChange={(e) => onChange({ ...content, body: e.target.value })}
                  placeholder="Hello, I would like to learn more about..."
                  rows={3}
                  className="text-xs"
                />
              </div>
            </div>
          )}

          {/* =========================================================================
              TYPE 7: Call Phone (tel)
             ========================================================================= */}
          {content.type === "phone" && (
            <div className="space-y-2.5">
              <div className="space-y-1">
                <Label className="text-xs font-semibold">Phone Number *</Label>
                <Input
                  type="tel"
                  value={content.phoneNumber}
                  onChange={(e) => onChange({ ...content, phoneNumber: e.target.value })}
                  placeholder="+1 (555) 234-5678"
                  className="text-xs font-mono"
                />
                <p className="text-[11px] text-muted-foreground">
                  Include international country code for universal smartphone dialing.
                </p>
              </div>
            </div>
          )}

          {/* =========================================================================
              TYPE 8: Send SMS (sms)
             ========================================================================= */}
          {content.type === "sms" && (
            <div className="space-y-2.5">
              <div className="space-y-1">
                <Label className="text-xs font-semibold">Recipient Phone Number *</Label>
                <Input
                  type="tel"
                  value={content.phoneNumber}
                  onChange={(e) => onChange({ ...content, phoneNumber: e.target.value })}
                  placeholder="+1 (555) 234-5678"
                  className="text-xs font-mono"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-semibold">Pre-filled SMS Message</Label>
                <Textarea
                  value={content.message || ""}
                  onChange={(e) => onChange({ ...content, message: e.target.value })}
                  placeholder="START"
                  rows={3}
                  className="text-xs"
                />
              </div>
            </div>
          )}

          {/* =========================================================================
              TYPE 9: Location & Maps (geo)
             ========================================================================= */}
          {content.type === "location" && (
            <div className="space-y-2.5">
              <div className="space-y-1">
                <Label className="text-xs font-semibold">Place or Address Label</Label>
                <Input
                  value={content.label || ""}
                  onChange={(e) => onChange({ ...content, label: e.target.value })}
                  placeholder="e.g. Empire State Building, New York"
                  className="text-xs"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label className="text-[11px] font-semibold">Latitude</Label>
                  <Input
                    type="number"
                    step="0.000001"
                    value={content.latitude || 0}
                    onChange={(e) => onChange({ ...content, latitude: Number(e.target.value) })}
                    className="text-xs font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-[11px] font-semibold">Longitude</Label>
                  <Input
                    type="number"
                    step="0.000001"
                    value={content.longitude || 0}
                    onChange={(e) => onChange({ ...content, longitude: Number(e.target.value) })}
                    className="text-xs font-mono"
                  />
                </div>
              </div>
            </div>
          )}

          {/* =========================================================================
              TYPE 10: Calendar Event
             ========================================================================= */}
          {content.type === "calendar" && (
            <div className="space-y-2.5">
              <div className="space-y-1">
                <Label className="text-xs font-semibold">Event Title *</Label>
                <Input
                  value={content.title}
                  onChange={(e) => onChange({ ...content, title: e.target.value })}
                  placeholder="Product Launch Keynote"
                  className="text-xs"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label className="text-[11px] font-semibold">Start Date & Time *</Label>
                  <Input
                    type="datetime-local"
                    value={content.startDate}
                    onChange={(e) => onChange({ ...content, startDate: e.target.value })}
                    className="text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-[11px] font-semibold">End Date & Time *</Label>
                  <Input
                    type="datetime-local"
                    value={content.endDate}
                    onChange={(e) => onChange({ ...content, endDate: e.target.value })}
                    className="text-xs"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-semibold">Location / Link</Label>
                <Input
                  value={content.location || ""}
                  onChange={(e) => onChange({ ...content, location: e.target.value })}
                  placeholder="Conference Hall A / Zoom Link"
                  className="text-xs"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-semibold">Description</Label>
                <Textarea
                  value={content.description || ""}
                  onChange={(e) => onChange({ ...content, description: e.target.value })}
                  placeholder="Details about the event..."
                  rows={2}
                  className="text-xs"
                />
              </div>
            </div>
          )}

          {/* =========================================================================
              TYPE 11: Payment Payloads (UPI, PayPal, Venmo, Cash App, PIX)
             ========================================================================= */}
          {content.type === "payment" && (
            <div className="space-y-3">
              <div className="p-2.5 rounded-lg border border-border bg-surface flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-primary" />
                  <div>
                    <div className="text-xs font-bold text-foreground uppercase tracking-wider">
                      {content.scheme.toUpperCase()} Payment QR
                    </div>
                    <div className="text-[10px] text-muted-foreground">Direct scan-to-pay standard payload</div>
                  </div>
                </div>
                <Badge variant="outline" className="text-[10px] font-mono uppercase">
                  {content.scheme}
                </Badge>
              </div>

              {content.scheme === "upi" ? (
                <div className="space-y-2.5">
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold">UPI VPA (Virtual Payment Address) *</Label>
                    <Input
                      value={content.payeeAddress}
                      onChange={(e) => onChange({ ...content, payeeAddress: e.target.value })}
                      placeholder="merchant@okhdfcbank"
                      className="text-xs font-mono"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold">Payee Name</Label>
                    <Input
                      value={content.payeeName || ""}
                      onChange={(e) => onChange({ ...content, payeeName: e.target.value })}
                      placeholder="Store or Business Name"
                      className="text-xs"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <Label className="text-[11px] font-semibold">Amount (INR, Optional)</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={content.amount || ""}
                        onChange={(e) =>
                          onChange({
                            ...content,
                            amount: e.target.value ? Number(e.target.value) : undefined,
                          })
                        }
                        placeholder="Leave blank for any amount"
                        className="text-xs font-mono"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[11px] font-semibold">Transaction Note</Label>
                      <Input
                        value={content.note || ""}
                        onChange={(e) => onChange({ ...content, note: e.target.value })}
                        placeholder="Invoice #492"
                        className="text-xs"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-2.5">
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold">Payee Handle / Address *</Label>
                    <Input
                      value={content.payeeAddress}
                      onChange={(e) => onChange({ ...content, payeeAddress: e.target.value })}
                      placeholder={content.scheme === "cashapp" ? "$cashtag" : "handle or address"}
                      className="text-xs font-mono"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <Label className="text-[11px] font-semibold">Amount (Optional)</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={content.amount || ""}
                        onChange={(e) =>
                          onChange({
                            ...content,
                            amount: e.target.value ? Number(e.target.value) : undefined,
                          })
                        }
                        className="text-xs font-mono"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[11px] font-semibold">Currency</Label>
                      <Input
                        value={content.currency || "USD"}
                        onChange={(e) => onChange({ ...content, currency: e.target.value.toUpperCase() })}
                        className="text-xs font-mono uppercase"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Safety notice distinguishing Customer Payment QR from NXTQR Cashfree SaaS billing */}
              <div className="p-2.5 rounded border border-border/80 bg-muted/20 text-[10px] text-muted-foreground leading-relaxed">
                <strong>Payment Safety:</strong> NXTQR encodes standard financial payment URIs directly into the QR pattern. NXTQR does not process or hold client payments (NXTQR SaaS billing is powered independently by Cashfree).
              </div>
            </div>
          )}

          {/* =========================================================================
              TYPE 12: App Store Link
             ========================================================================= */}
          {content.type === "app" && (
            <div className="space-y-2.5">
              <div className="space-y-1">
                <Label className="text-xs font-semibold">App Name *</Label>
                <Input
                  value={content.appName}
                  onChange={(e) => onChange({ ...content, appName: e.target.value })}
                  placeholder="My Mobile App"
                  className="text-xs"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-semibold">iOS App Store URL</Label>
                <Input
                  type="url"
                  value={content.iosUrl}
                  onChange={(e) => onChange({ ...content, iosUrl: e.target.value })}
                  placeholder="https://apps.apple.com/app/id..."
                  className="text-xs font-mono"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-semibold">Google Play Store URL</Label>
                <Input
                  type="url"
                  value={content.androidUrl}
                  onChange={(e) => onChange({ ...content, androidUrl: e.target.value })}
                  placeholder="https://play.google.com/store/apps/details?id=..."
                  className="text-xs font-mono"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-semibold">Fallback Web URL *</Label>
                <Input
                  type="url"
                  value={content.fallbackUrl}
                  onChange={(e) => onChange({ ...content, fallbackUrl: e.target.value })}
                  placeholder="https://mybrand.com/download"
                  className="text-xs font-mono"
                />
              </div>

              {/* Resolver Preview if dynamic */}
              {isDynamic && (
                <div className="p-2.5 rounded-md border border-border bg-surface text-[11px] space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-foreground text-[11px]">Stable Resolver Link</span>
                    <span className="text-[9px] font-mono text-muted-foreground uppercase">Edge Compiled</span>
                  </div>
                  <div className="px-2.5 py-1 rounded bg-muted/40 border border-border/60 font-mono text-primary font-semibold text-[11px] break-all select-all">
                    {displayResolverLink}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* =========================================================================
              TYPE 13: File / Document / PDF
             ========================================================================= */}
          {content.type === "file" && (
            <div className="space-y-3">
              {content.assetId ? (
                <div className="p-3 rounded-lg border border-border bg-surface-elevated flex items-center justify-between">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
                    <div className="min-w-0">
                      <p className="font-semibold text-foreground truncate text-xs">{content.fileName}</p>
                      <p className="text-[10px] text-muted-foreground">
                        {Math.round(content.fileSize / 1024)} KB • {content.mimeType}
                      </p>
                    </div>
                  </div>
                  <label className="text-xs text-primary hover:underline cursor-pointer">
                    Replace
                    <input type="file" onChange={handleFileUpload} className="hidden" />
                  </label>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-border hover:border-primary/50 rounded-xl cursor-pointer transition-colors bg-surface-elevated/30 text-center">
                  <Upload className="h-6 w-6 text-muted-foreground mb-2" />
                  <span className="text-xs font-medium text-foreground">
                    {isUploadingFile ? "Uploading document…" : "Click to upload document (PDF, PNG, JPG)"}
                  </span>
                  <span className="text-[10px] text-muted-foreground mt-0.5">Maximum file size: 5 MB</span>
                  <input
                    type="file"
                    onChange={handleFileUpload}
                    disabled={isUploadingFile}
                    accept="application/pdf,image/png,image/jpeg"
                    className="hidden"
                  />
                </label>
              )}

              {/* Resolver Preview if dynamic */}
              {isDynamic && (
                <div className="p-2.5 rounded-md border border-border bg-surface text-[11px] space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-foreground text-[11px]">Stable Resolver Link</span>
                    <span className="text-[9px] font-mono text-muted-foreground uppercase">Edge Compiled</span>
                  </div>
                  <div className="px-2.5 py-1 rounded bg-muted/40 border border-border/60 font-mono text-primary font-semibold text-[11px] break-all select-all">
                    {displayResolverLink}
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Content Matrix Modal Dialog */}
      <ContentMatrix
        isOpen={isMatrixOpen}
        onClose={() => setIsMatrixOpen(false)}
        currentType={activeDef.id}
        currentContent={content}
        onSelectType={handleSelectTypeFromMatrix}
      />
    </div>
  );
}

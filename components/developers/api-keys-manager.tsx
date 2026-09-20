"use client";

import * as React from "react";
import {
  KeyRound,
  Plus,
  Copy,
  Check,
  Trash2,
  AlertTriangle,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/empty-state";

export interface ApiKeyItem {
  id: string;
  name: string;
  prefix: string;
  scopes: string[];
  status: "active" | "revoked";
  lastUsedAt?: number;
  createdAt: number;
}

interface ApiKeysManagerProps {
  initialKeys?: ApiKeyItem[];
  orgSlug: string;
}

export function ApiKeysManager({ initialKeys = [], orgSlug }: ApiKeysManagerProps) {
  const [keys, setKeys] = React.useState<ApiKeyItem[]>(initialKeys);
  const [isCreating, setIsCreating] = React.useState(false);
  const [newKeyName, setNewKeyName] = React.useState("");
  const [selectedScopes, setSelectedScopes] = React.useState<string[]>([
    "qr.read",
    "qr.create",
    "routing.read",
    "analytics.read",
  ]);
  const [generatedSecret, setGeneratedSecret] = React.useState<string | null>(null);
  const [copied, setCopied] = React.useState(false);

  const [isSubmitting, setIsSubmitting] = React.useState(false);

  React.useEffect(() => {
    fetch(`/api/v1/organizations/${orgSlug}/keys`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.success && Array.isArray(data.keys)) {
          setKeys(data.keys);
        }
      })
      .catch(() => {});
  }, [orgSlug]);

  const handleGenerateKey = async () => {
    if (!newKeyName.trim() || isSubmitting) return;
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/v1/organizations/${orgSlug}/keys`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newKeyName.trim(),
          scopes: selectedScopes,
        }),
      });
      const data = await res.json();
      if (res.ok && data?.key && data?.secret) {
        setKeys((prev) => [data.key, ...prev]);
        setGeneratedSecret(data.secret);
        setNewKeyName("");
      }
    } catch {
      // Error handled safely
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopySecret = () => {
    if (generatedSecret) {
      navigator.clipboard.writeText(generatedSecret);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleRevoke = async (id: string) => {
    try {
      const res = await fetch(`/api/v1/organizations/${orgSlug}/keys/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setKeys((prev) =>
          prev.map((k) => (k.id === id ? { ...k, status: "revoked" as const } : k))
        );
      }
    } catch {
      // Error handled safely
    }
  };

  return (
    <div className="space-y-6">
      {/* Creation Modal / Banner when secret was generated */}
      {generatedSecret && (
        <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 p-5 space-y-3">
          <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-semibold text-sm">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <span>Copy this secret key now. You will not be able to view it again.</span>
          </div>
          <p className="text-xs text-muted-foreground">
            For your security, NXTQR stores only a one-way cryptographic SHA-256 hash of this key. If you lose it, you will need to generate a new key.
          </p>
          <div className="flex items-center gap-2">
            <input
              readOnly
              value={generatedSecret}
              className="flex-1 text-xs font-mono bg-background border border-input rounded-md px-3 py-2 text-foreground select-all"
            />
            <Button
              size="sm"
              onClick={handleCopySecret}
              className="gap-1.5 text-xs bg-primary text-white hover:bg-primary/90"
            >
              {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              <span>{copied ? "Copied" : "Copy Secret"}</span>
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setGeneratedSecret(null)}
              className="text-xs"
            >
              Done
            </Button>
          </div>
        </div>
      )}

      {/* Generator Drawer */}
      {isCreating && !generatedSecret && (
        <Card className="border-border bg-card">
          <CardHeader className="border-b border-border pb-3">
            <CardTitle className="text-sm font-semibold">Generate New Secret Key</CardTitle>
            <CardDescription className="text-xs">
              Scoped API credentials for automated QR generation and telemetry streaming.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-5 space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">Key Name / Description</label>
              <input
                type="text"
                placeholder="e.g. CI/CD Production Pipeline"
                value={newKeyName}
                onChange={(e) => setNewKeyName(e.target.value)}
                className="w-full text-xs rounded-md border border-input bg-background px-3 py-2 text-foreground focus:ring-1 focus:ring-primary"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-foreground">Assigned Scopes</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                {[
                  "qr.read",
                  "qr.create",
                  "qr.publish",
                  "routing.read",
                  "routing.publish",
                  "analytics.read",
                  "analytics.export",
                  "guardian.manage",
                ].map((scope) => (
                  <label key={scope} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedScopes.includes(scope)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedScopes((prev) => [...prev, scope]);
                        } else {
                          setSelectedScopes((prev) => prev.filter((s) => s !== scope));
                        }
                      }}
                      className="rounded border-input text-primary focus:ring-primary"
                    />
                    <span className="font-mono text-[11px] text-muted-foreground">{scope}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsCreating(false)}
                className="text-xs"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleGenerateKey}
                disabled={!newKeyName.trim()}
                className="text-xs bg-primary text-white hover:bg-primary/90"
              >
                Create Key
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Keys List / Empty State */}
      {keys.length === 0 ? (
        <div className="rounded-2xl border border-border bg-card p-6">
          <EmptyState
            preset="apiKeys"
            actionLabel="Create API key"
            onAction={() => setIsCreating(true)}
          />
        </div>
      ) : (
        <Card className="border-border bg-card overflow-hidden">
          <CardHeader className="border-b border-border bg-surface flex flex-row items-center justify-between p-4">
            <div>
              <CardTitle className="text-xs font-semibold text-foreground">
                Active & Revoked Credentials
              </CardTitle>
              <CardDescription className="text-[11px]">
                {keys.filter((k) => k.status === "active").length} active keys
              </CardDescription>
            </div>
            {!isCreating && (
              <Button
                size="sm"
                onClick={() => setIsCreating(true)}
                className="gap-1.5 text-xs bg-primary text-white hover:bg-primary/90 h-8"
              >
                <Plus className="h-3 w-3" />
                <span>Create Secret Key</span>
              </Button>
            )}
          </CardHeader>
          <div className="divide-y divide-border">
            {keys.map((key) => (
              <div key={key.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-foreground">{key.name}</span>
                    <Badge variant={key.status === "active" ? "success" : "neutral"} className="text-[10px]">
                      {key.status === "active" ? "Active" : "Revoked"}
                    </Badge>
                  </div>
                  <p className="font-mono text-[11px] text-muted-foreground">
                    Prefix: {key.prefix}
                  </p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {key.scopes.map((s) => (
                      <span key={s} className="font-mono text-[10px] bg-muted/60 text-muted-foreground px-1.5 py-0.5 rounded">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  {key.status === "active" && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRevoke(key.id)}
                      className="text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-500/10 border-rose-500/20"
                    >
                      <Trash2 className="h-3 w-3 mr-1" />
                      Revoke
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}

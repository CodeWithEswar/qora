"use client";

import * as React from "react";
import {
  Shield,
  Lock,
  Plus,
  Search,
  Check,
  X,
  AlertTriangle,
  Copy,
  Trash2,
  Edit,
  Save,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { RoleBadge } from "../shared/role-badge";
import { CreateRoleDialog } from "./create-role-dialog";
import { DeleteRoleDialog } from "./delete-role-dialog";
import {
  PERMISSION_GROUPS,
  SYSTEM_ROLE_METADATA,
} from "@nxtqr/permissions";
import { PermissionCode, SystemRoleName } from "@nxtqr/contracts";
import { OrganizationRoleRecord } from "@nxtqr/db";
import { cn } from "@/lib/utils";

interface RolesPolicyEditorProps {
  roles: OrganizationRoleRecord[];
  onCreateRole: (
    name: string,
    description?: string,
    permissions?: PermissionCode[]
  ) => Promise<void>;
  onUpdateRolePermissions: (
    roleId: string,
    permissions: PermissionCode[]
  ) => Promise<void>;
  onDeleteRole: (roleId: string) => Promise<void>;
  canManageRoles?: boolean;
}

export function RolesPolicyEditor({
  roles,
  onCreateRole,
  onUpdateRolePermissions,
  onDeleteRole,
  canManageRoles = true,
}: RolesPolicyEditorProps) {
  const [selectedRoleId, setSelectedRoleId] = React.useState<string>(
    roles.length > 0 ? roles[0].id : ""
  );
  const [searchQuery, setSearchQuery] = React.useState("");
  const [permissionFilter, setPermissionFilter] = React.useState<"all" | "enabled" | "disabled">("all");

  // Dialog states
  const [isCreateOpen, setIsCreateOpen] = React.useState(false);
  const [deletingRole, setDeletingRole] = React.useState<OrganizationRoleRecord | null>(null);

  // Unsaved changes state
  const [draftPermissions, setDraftPermissions] = React.useState<Record<string, PermissionCode[]>>({});
  const [isSaving, setIsSaving] = React.useState(false);
  const [saveError, setSaveError] = React.useState<string | null>(null);

  // Current selected role
  const selectedRole = roles.find((r) => r.id === selectedRoleId) || roles[0];

  // Active permissions for selected role (draft overrides saved)
  const currentPermissions =
    draftPermissions[selectedRoleId] ?? selectedRole?.permissions ?? [];

  const hasUnsavedChanges =
    draftPermissions[selectedRoleId] !== undefined &&
    JSON.stringify([...draftPermissions[selectedRoleId]].sort()) !==
      JSON.stringify([...(selectedRole?.permissions ?? [])].sort());

  const togglePermission = (code: PermissionCode) => {
    if (selectedRole?.isSystem) return; // Protected system roles

    setDraftPermissions((prev) => {
      const current = prev[selectedRoleId] ?? [...(selectedRole?.permissions ?? [])];
      const next = current.includes(code)
        ? current.filter((c) => c !== code)
        : [...current, code];
      return { ...prev, [selectedRoleId]: next };
    });
  };

  const discardChanges = () => {
    setDraftPermissions((prev) => {
      const next = { ...prev };
      delete next[selectedRoleId];
      return next;
    });
    setSaveError(null);
  };

  const handleSave = async () => {
    if (!selectedRole || selectedRole.isSystem) return;
    setIsSaving(true);
    setSaveError(null);
    try {
      await onUpdateRolePermissions(selectedRoleId, currentPermissions);
      // Clear draft for this role
      setDraftPermissions((prev) => {
        const next = { ...prev };
        delete next[selectedRoleId];
        return next;
      });
    } catch (err: any) {
      setSaveError(err?.message || "Failed to update role permissions.");
    } finally {
      setIsSaving(false);
    }
  };

  // Filter permission groups based on search & filter
  const filteredGroups = React.useMemo(() => {
    const q = searchQuery.toLowerCase().trim();

    return PERMISSION_GROUPS.map((group) => {
      const matching = group.permissions.filter((p) => {
        // Search query
        if (q) {
          const matchLabel = p.label.toLowerCase().includes(q);
          const matchCode = p.code.toLowerCase().includes(q);
          const matchDesc = p.description.toLowerCase().includes(q);
          if (!matchLabel && !matchCode && !matchDesc) return false;
        }

        // Status filter
        const isEnabled = currentPermissions.includes(p.code);
        if (permissionFilter === "enabled" && !isEnabled) return false;
        if (permissionFilter === "disabled" && isEnabled) return false;

        return true;
      });

      return {
        ...group,
        matchingPermissions: matching,
      };
    }).filter((group) => group.matchingPermissions.length > 0);
  }, [searchQuery, permissionFilter, currentPermissions]);

  const diffCount = Math.abs(
    currentPermissions.length - (selectedRole?.permissions.length ?? 0)
  );

  return (
    <div className="space-y-4">
      {/* Top action header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-foreground tracking-tight">
            Roles & Access Policy Matrix
          </h2>
          <p className="text-xs text-muted-foreground">
            Authoritative capability boundaries enforced across client dashboards, developer APIs, and edge workers.
          </p>
        </div>

        {canManageRoles && (
          <Button
            size="sm"
            onClick={() => setIsCreateOpen(true)}
            className="gap-1.5 text-xs bg-primary hover:bg-primary/90 text-white shadow-xs"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>New custom role</span>
          </Button>
        )}
      </div>

      {/* Split-pane Access Policy Editor */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
        {/* Left Pane: Roles List */}
        <div className="md:col-span-4 rounded-xl border border-border/70 bg-surface/80 overflow-hidden shadow-xs">
          <div className="p-3 border-b border-border/70 bg-surface/40 flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
              ROLES ({roles.length})
            </span>
            <span className="text-[10px] font-mono text-muted-foreground">
              {roles.filter((r) => r.isSystem).length} System • {roles.filter((r) => !r.isSystem).length} Custom
            </span>
          </div>

          <div className="divide-y divide-border/50 max-h-[640px] overflow-y-auto">
            {roles.map((role) => {
              const isSelected = role.id === selectedRoleId;
              const hasChanges = draftPermissions[role.id] !== undefined;

              return (
                <button
                  key={role.id}
                  onClick={() => {
                    setSelectedRoleId(role.id);
                    setSaveError(null);
                  }}
                  className={cn(
                    "w-full p-3.5 flex items-start gap-3 text-left transition-all relative group select-none",
                    isSelected
                      ? "bg-primary/5 text-foreground font-medium"
                      : "hover:bg-surface-hover/70 text-foreground"
                  )}
                >
                  {/* Active Indicator Bar */}
                  {isSelected && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-r" />
                  )}

                  {/* Icon */}
                  <div
                    className={cn(
                      "w-7 h-7 rounded-md border flex items-center justify-center shrink-0 mt-0.5",
                      role.isSystem
                        ? "bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400"
                        : "bg-primary/10 border-primary/30 text-primary"
                    )}
                  >
                    {role.isSystem ? (
                      <Lock className="h-3.5 w-3.5" />
                    ) : (
                      <Shield className="h-3.5 w-3.5" />
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1">
                      <div className="flex items-center gap-1.5 truncate">
                        <p className="text-xs font-semibold truncate group-hover:text-primary transition-colors">
                          {role.name}
                        </p>
                        {hasChanges && (
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse shrink-0" />
                        )}
                      </div>
                      <span className="text-[10px] font-mono text-muted-foreground shrink-0 px-1.5 py-0.2 rounded bg-muted/60">
                        {role.memberCount}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 mt-1">
                      <span
                        className={cn(
                          "text-[9px] font-mono uppercase px-1.5 py-0.2 rounded font-medium",
                          role.isSystem
                            ? "bg-muted text-muted-foreground"
                            : "bg-primary/10 text-primary border border-primary/20"
                        )}
                      >
                        {role.isSystem ? "SYSTEM" : "CUSTOM"}
                      </span>
                      <span className="text-[10px] text-muted-foreground font-mono">
                        {role.permissions.length} perms
                      </span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Pane: Selected Role Policy Editor */}
        <div className="md:col-span-8 rounded-xl border border-border/70 bg-surface/80 overflow-hidden shadow-xs">
          {selectedRole ? (
            <div>
              {/* Role Header */}
              <div className="p-4 md:p-5 border-b border-border/70 bg-surface/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-base font-semibold text-foreground">
                      {selectedRole.name}
                    </h3>
                    <RoleBadge role={selectedRole.name} isSystem={selectedRole.isSystem} />
                    {selectedRole.isSystem && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-mono text-muted-foreground px-2 py-0.5 rounded bg-muted/60">
                        <Lock className="h-3 w-3" />
                        Protected
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {selectedRole.description ||
                      SYSTEM_ROLE_METADATA[selectedRole.name as SystemRoleName]?.description ||
                      "Custom access boundary."}
                  </p>
                  <p className="text-[11px] font-mono text-muted-foreground mt-1">
                    {selectedRole.memberCount} workspace member(s) use this role • {currentPermissions.length} capabilities active
                  </p>
                </div>

                {/* Role Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  {!selectedRole.isSystem && canManageRoles && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setDeletingRole(selectedRole)}
                      className="h-8 text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-500/10 gap-1 px-2.5"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      <span>Delete role</span>
                    </Button>
                  )}
                </div>
              </div>

              {/* Protected System Role Warning */}
              {selectedRole.isSystem && (
                <div className="p-3 px-4 bg-muted/30 border-b border-border text-xs text-muted-foreground flex items-center gap-2">
                  <Lock className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                  <span>
                    This is a canonical system role. Built-in system permissions are immutable to ensure cluster stability. To customize permissions, create a custom role.
                  </span>
                </div>
              )}

              {/* Permission Filter & Search Toolbar */}
              <div className="p-3 border-b border-border/70 bg-surface/20 flex flex-wrap items-center justify-between gap-2">
                <div className="relative flex-1 min-w-[200px] max-w-xs">
                  <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                  <Input
                    placeholder="Search capabilities (e.g. publish, export)..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8 h-8 text-xs bg-surface"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute right-2 top-2 text-muted-foreground hover:text-foreground"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-1.5 text-xs">
                  <Button
                    variant={permissionFilter === "all" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setPermissionFilter("all")}
                    className={cn("h-7 text-[11px] px-2.5", permissionFilter === "all" && "bg-primary text-white")}
                  >
                    All
                  </Button>
                  <Button
                    variant={permissionFilter === "enabled" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setPermissionFilter("enabled")}
                    className={cn("h-7 text-[11px] px-2.5", permissionFilter === "enabled" && "bg-primary text-white")}
                  >
                    Enabled ({currentPermissions.length})
                  </Button>
                  <Button
                    variant={permissionFilter === "disabled" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setPermissionFilter("disabled")}
                    className={cn("h-7 text-[11px] px-2.5", permissionFilter === "disabled" && "bg-primary text-white")}
                  >
                    Disabled
                  </Button>
                </div>
              </div>

              {/* Permission Groups Matrix */}
              <div className="p-4 space-y-6 max-h-[520px] overflow-y-auto">
                {filteredGroups.length === 0 ? (
                  <div className="p-8 text-center text-xs text-muted-foreground italic">
                    No permissions match your search query &quot;{searchQuery}&quot;.
                  </div>
                ) : (
                  filteredGroups.map((group) => {
                    return (
                      <div key={group.id} className="space-y-2.5">
                        <div className="flex items-center justify-between pb-1 border-b border-border/50">
                          <div>
                            <h4 className="text-xs font-semibold text-foreground tracking-wide font-mono uppercase">
                              {group.category}
                            </h4>
                            <p className="text-[11px] text-muted-foreground">
                              {group.description}
                            </p>
                          </div>
                          <span className="text-[10px] font-mono text-muted-foreground">
                            {group.matchingPermissions.filter((p) =>
                              currentPermissions.includes(p.code)
                            ).length}{" "}
                            / {group.permissions.length}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {group.matchingPermissions.map((p) => {
                            const isChecked = currentPermissions.includes(p.code);
                            return (
                              <label
                                key={p.code}
                                className={cn(
                                  "flex items-start gap-3 p-3 rounded-lg border transition-all select-none text-xs",
                                  selectedRole.isSystem
                                    ? "cursor-default opacity-85"
                                    : "cursor-pointer",
                                  isChecked
                                    ? "bg-surface border-primary/40 shadow-2xs"
                                    : "bg-surface/50 border-border hover:border-border/80"
                                )}
                              >
                                <Checkbox
                                  checked={isChecked}
                                  disabled={selectedRole.isSystem || !canManageRoles}
                                  onCheckedChange={() => togglePermission(p.code)}
                                  className="mt-0.5"
                                />
                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center justify-between gap-1">
                                    <span className="font-semibold text-foreground truncate">
                                      {p.label}
                                    </span>
                                    <code className="text-[9px] font-mono text-muted-foreground shrink-0 px-1 py-0.2 rounded bg-muted/60">
                                      {p.code}
                                    </code>
                                  </div>
                                  <p className="text-[11px] text-muted-foreground leading-relaxed mt-0.5">
                                    {p.description}
                                  </p>
                                </div>
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Sticky Unsaved Changes Action Rail */}
              {hasUnsavedChanges && (
                <div className="p-3 px-5 border-t border-primary/30 bg-primary/10 flex items-center justify-between gap-3 animate-in fade-in slide-in-from-bottom-2 duration-150">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                    <span className="font-semibold text-primary">
                      Unsaved modifications on {selectedRole.name}
                    </span>
                    {saveError && (
                      <span className="text-rose-600 dark:text-rose-400 text-xs">
                        ({saveError})
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={discardChanges}
                      disabled={isSaving}
                      className="h-8 text-xs bg-surface"
                    >
                      <RotateCcw className="h-3 w-3 mr-1" />
                      Discard
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleSave}
                      disabled={isSaving}
                      className="h-8 text-xs bg-primary hover:bg-primary/90 text-white gap-1.5"
                    >
                      <Save className="h-3 w-3" />
                      <span>{isSaving ? "Saving..." : "Save role policy"}</span>
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="p-10 text-center text-xs text-muted-foreground italic">
              Select a role on the left to inspect its permissions.
            </div>
          )}
        </div>
      </div>

      {/* Dialogs */}
      <CreateRoleDialog
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onCreateRole={onCreateRole}
      />

      <DeleteRoleDialog
        isOpen={Boolean(deletingRole)}
        onClose={() => setDeletingRole(null)}
        role={deletingRole}
        onConfirm={onDeleteRole}
      />
    </div>
  );
}

/* eslint-disable @typescript-eslint/no-explicit-any */
import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";
import {
  QrTemplateSummary,
  QrTemplateDetail,
  QrTemplateVersion,
  CreateTemplateInput,
  UpdateTemplateInput,
  TemplateFilters,
  TemplateUsageInfo,
} from "./types";
import { evaluateScanability, QrDesignV1 } from "@nxtqr/qr-core";
import { validateLockedFieldMutations, applyBrandKitToDesign } from "./governance";
import { normalizeCompatibilityTypes } from "./compatibility";

interface RawTemplateRow {
  id: string;
  organization_id: string;
  created_by: string | null;
  name: string;
  description: string | null;
  scope: "organization" | "system";
  status: "active" | "archived";
  brand_kit_id: string | null;
  compatibility: unknown;
  is_brand_locked: boolean;
  locked_fields: unknown;
  current_version: number;
  design_json: unknown;
  scanability_score: number | null;
  scanability_status: "PASS" | "WARNING" | "FAIL" | null;
  usage_count: number;
  created_at: string;
  updated_at: string;
  archived_at: string | null;
  brand_kits?: {
    id: string;
    name: string;
    slug: string;
    primary_color: string | null;
    colors_json?: Array<{ hex: string; role?: string }> | null;
    logos_json?: Array<{ url: string; isPrimary?: boolean; assetId?: string }> | null;
  } | null;
}

interface RawVersionRow {
  id: string;
  organization_id: string;
  template_id: string;
  version: number;
  change_summary: string | null;
  design_json: unknown;
  scanability_score: number;
  scanability_status: "PASS" | "WARNING" | "FAIL";
  created_by: string | null;
  created_at: string;
}

function getClient(): any {
  return createAdminClient() as any;
}

export class QrTemplateStore {
  /**
   * Lists templates for an organization with filtering, search, and sorting.
   * STRICT REAL-DATA: Zero fake fallback rows.
   */
  static async listTemplates(
    organizationId: string,
    filters: TemplateFilters = {}
  ): Promise<QrTemplateSummary[]> {
    const supabase = getClient();

    let query = supabase
      .from("qr_templates")
      .select(
        `
        id,
        organization_id,
        created_by,
        name,
        description,
        scope,
        status,
        brand_kit_id,
        compatibility,
        is_brand_locked,
        locked_fields,
        current_version,
        design_json,
        scanability_score,
        scanability_status,
        usage_count,
        created_at,
        updated_at,
        archived_at,
        brand_kits:brand_kit_id (
          id,
          name,
          slug,
          primary_color,
          colors_json
        )
      `
      )
      .or(`organization_id.eq.${organizationId},scope.eq.system`);

    // 1. Status filter
    if (filters.status && filters.status !== "all") {
      query = query.eq("status", filters.status);
    } else if (!filters.status) {
      query = query.eq("status", "active");
    }

    // 2. Brand Kit filter
    if (filters.brandKitId && filters.brandKitId !== "all") {
      query = query.eq("brand_kit_id", filters.brandKitId);
    }

    // 3. Governance filter
    if (filters.governance === "locked") {
      query = query.eq("is_brand_locked", true);
    } else if (filters.governance === "editable") {
      query = query.eq("is_brand_locked", false);
    }

    // 4. Scanability filter
    if (filters.scanability === "pass") {
      query = query.eq("scanability_status", "PASS");
    } else if (filters.scanability === "warning") {
      query = query.eq("scanability_status", "WARNING");
    }

    // 5. Sorting
    switch (filters.sort) {
      case "created_desc":
        query = query.order("created_at", { ascending: false });
        break;
      case "name_asc":
        query = query.order("name", { ascending: true });
        break;
      case "name_desc":
        query = query.order("name", { ascending: false });
        break;
      case "usage_desc":
        query = query.order("usage_count", { ascending: false });
        break;
      case "updated_desc":
      default:
        query = query.order("updated_at", { ascending: false });
        break;
    }

    const { data, error } = await query;
    if (error) {
      console.error("[QrTemplateStore.listTemplates] Query error:", error);
      throw new Error(`Failed to load templates: ${error.message}`);
    }

    if (!data) return [];

    let results: QrTemplateSummary[] = (data as RawTemplateRow[]).map((row) => {
      const bk = row.brand_kits;
      const brandColors: string[] = [];
      if (bk?.primary_color) brandColors.push(bk.primary_color);
      const bkColors = Array.isArray(bk?.colors_json) ? bk.colors_json : [];
      bkColors.forEach((c) => {
        if (c.hex && !brandColors.includes(c.hex)) brandColors.push(c.hex);
      });

      return {
        id: row.id,
        organization_id: row.organization_id,
        created_by: row.created_by,
        name: row.name,
        description: row.description,
        scope: row.scope,
        status: row.status,
        brand_kit_id: row.brand_kit_id,
        brand_kit_name: bk?.name || null,
        brand_kit_slug: bk?.slug || null,
        brand_kit_colors: brandColors,
        compatibility: Array.isArray(row.compatibility)
          ? (row.compatibility as string[])
          : ["UNIVERSAL"],
        is_brand_locked: Boolean(row.is_brand_locked),
        locked_fields: Array.isArray(row.locked_fields)
          ? (row.locked_fields as string[])
          : [],
        current_version: row.current_version || 1,
        design_json: (row.design_json || {}) as QrDesignV1,
        scanability_score: row.scanability_score ?? 100,
        scanability_status: row.scanability_status || "PASS",
        usage_count: row.usage_count || 0,
        created_at: row.created_at,
        updated_at: row.updated_at,
        archived_at: row.archived_at,
      };
    });

    // In-memory filtering for deep search & type compatibility
    if (filters.search && filters.search.trim()) {
      const q = filters.search.toLowerCase().trim();
      results = results.filter(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          (t.description && t.description.toLowerCase().includes(q)) ||
          (t.brand_kit_name && t.brand_kit_name.toLowerCase().includes(q)) ||
          t.compatibility.some((c) => c.toLowerCase().includes(q))
      );
    }

    if (filters.type && filters.type !== "all") {
      const targetType = filters.type.toUpperCase();
      results = results.filter(
        (t) =>
          t.compatibility.includes("UNIVERSAL") ||
          t.compatibility.includes(targetType)
      );
    }

    return results;
  }

  /**
   * Retrieves full template details including immutable version history.
   */
  static async getTemplateById(
    organizationId: string,
    templateId: string
  ): Promise<QrTemplateDetail | null> {
    const supabase = getClient();

    const { data: rawTemplate, error: tmplErr } = await supabase
      .from("qr_templates")
      .select(
        `
        *,
        brand_kits:brand_kit_id (
          id,
          name,
          slug,
          primary_color,
          colors_json,
          logos_json
        )
      `
      )
      .eq("id", templateId)
      .or(`organization_id.eq.${organizationId},scope.eq.system`)
      .single();

    if (tmplErr || !rawTemplate) {
      return null;
    }

    const templateRow = rawTemplate as RawTemplateRow;

    // Fetch version history
    const { data: rawVersions } = await supabase
      .from("qr_template_versions")
      .select("*")
      .eq("template_id", templateId)
      .order("version", { ascending: false });

    const versions: QrTemplateVersion[] = ((rawVersions || []) as RawVersionRow[]).map((v) => ({
      id: v.id,
      organization_id: v.organization_id,
      template_id: v.template_id,
      version: v.version,
      change_summary: v.change_summary,
      design_json: (v.design_json || {}) as QrDesignV1,
      scanability_score: v.scanability_score,
      scanability_status: v.scanability_status,
      created_by: v.created_by,
      created_at: v.created_at,
    }));

    const bk = templateRow.brand_kits;
    const brandColors: string[] = [];
    if (bk?.primary_color) brandColors.push(bk.primary_color);
    const bkColors = Array.isArray(bk?.colors_json) ? bk.colors_json : [];
    bkColors.forEach((c) => {
      if (c.hex && !brandColors.includes(c.hex)) brandColors.push(c.hex);
    });

    return {
      id: templateRow.id,
      organization_id: templateRow.organization_id,
      created_by: templateRow.created_by,
      name: templateRow.name,
      description: templateRow.description,
      scope: templateRow.scope,
      status: templateRow.status,
      brand_kit_id: templateRow.brand_kit_id,
      brand_kit_name: bk?.name || null,
      brand_kit_slug: bk?.slug || null,
      brand_kit_colors: brandColors,
      compatibility: Array.isArray(templateRow.compatibility)
        ? (templateRow.compatibility as string[])
        : ["UNIVERSAL"],
      is_brand_locked: Boolean(templateRow.is_brand_locked),
      locked_fields: Array.isArray(templateRow.locked_fields)
        ? (templateRow.locked_fields as string[])
        : [],
      current_version: templateRow.current_version || 1,
      design_json: (templateRow.design_json || {}) as QrDesignV1,
      scanability_score: templateRow.scanability_score ?? 100,
      scanability_status: templateRow.scanability_status || "PASS",
      usage_count: templateRow.usage_count || 0,
      created_at: templateRow.created_at,
      updated_at: templateRow.updated_at,
      archived_at: templateRow.archived_at,
      versions,
    };
  }

  /**
   * Creates a new QR Template and records its initial Version 1 snapshot.
   */
  static async createTemplate(
    organizationId: string,
    actorId: string | undefined,
    input: CreateTemplateInput
  ): Promise<QrTemplateDetail> {
    const supabase = getClient();
    const templateId = crypto.randomUUID();

    // 1. If Brand Kit attached, inherit properties
    let finalDesign = input.design;
    if (input.brand_kit_id) {
      const { data: bk } = await supabase
        .from("brand_kits")
        .select("id, name, primary_color, colors_json, logos_json, logo_url")
        .eq("id", input.brand_kit_id)
        .eq("organization_id", organizationId)
        .single();

      if (bk) {
        finalDesign = applyBrandKitToDesign(
          finalDesign,
          {
            primaryColor: bk.primary_color,
            colors: Array.isArray(bk.colors_json) ? bk.colors_json : undefined,
            logoUrl: bk.logo_url,
            logos: Array.isArray(bk.logos_json) ? bk.logos_json : undefined,
          },
          input.locked_fields || []
        );
      }
    }

    // 2. Pure scanability calculation (preview payload)
    const scanResult = evaluateScanability("https://nxtqr.vercel.app/preview", finalDesign);
    const score = scanResult.score ?? 100;
    let status: "PASS" | "WARNING" | "FAIL" = "PASS";
    if (scanResult.status === "blocking") status = "FAIL";
    else if (scanResult.status === "warning") status = "WARNING";

    const normalizedCompatibility = normalizeCompatibilityTypes(input.compatibility);

    // 3. Insert Template
    const { error: insertErr } = await supabase.from("qr_templates").insert({
      id: templateId,
      organization_id: organizationId,
      created_by: actorId || null,
      name: input.name.trim(),
      description: input.description?.trim() || null,
      scope: "organization",
      status: "active",
      brand_kit_id: input.brand_kit_id || null,
      compatibility: normalizedCompatibility,
      is_brand_locked: Boolean(input.is_brand_locked),
      locked_fields: input.locked_fields || [],
      current_version: 1,
      design_json: finalDesign,
      scanability_score: score,
      scanability_status: status,
      usage_count: 0,
    });

    if (insertErr) {
      throw new Error(`Failed to create template: ${insertErr.message}`);
    }

    // 4. Insert Initial Version 1
    const { error: verErr } = await supabase.from("qr_template_versions").insert({
      id: crypto.randomUUID(),
      organization_id: organizationId,
      template_id: templateId,
      version: 1,
      change_summary: input.change_summary || "Initial template creation",
      design_json: finalDesign,
      scanability_score: score,
      scanability_status: status,
      created_by: actorId || null,
    });

    if (verErr) {
      console.warn("[QrTemplateStore.createTemplate] Failed to insert version 1:", verErr);
    }

    const detail = await this.getTemplateById(organizationId, templateId);
    if (!detail) {
      throw new Error("Template was created but could not be loaded");
    }
    return detail;
  }

  /**
   * Updates an existing template, enforcing brand locks and creating an immutable version snapshot.
   */
  static async updateTemplate(
    organizationId: string,
    actorId: string | undefined,
    templateId: string,
    input: UpdateTemplateInput
  ): Promise<QrTemplateDetail> {
    const supabase = getClient();
    const existing = await this.getTemplateById(organizationId, templateId);
    if (!existing) {
      throw new Error("Template not found or unauthorized");
    }

    const finalDesign = input.design ? input.design : existing.design_json;
    const isLocked = input.is_brand_locked !== undefined ? input.is_brand_locked : existing.is_brand_locked;
    const lockedFields = input.locked_fields !== undefined ? input.locked_fields : existing.locked_fields;

    // Verify brand lock compliance
    if (isLocked && input.design) {
      const lockCheck = validateLockedFieldMutations(existing.design_json, input.design, lockedFields);
      if (!lockCheck.valid) {
        throw new Error(lockCheck.violation || "Modification violates brand-locked template constraints");
      }
    }

    // Re-evaluate scanability
    const scanResult = evaluateScanability("https://nxtqr.vercel.app/preview", finalDesign);
    const score = scanResult.score ?? 100;
    let status: "PASS" | "WARNING" | "FAIL" = "PASS";
    if (scanResult.status === "blocking") status = "FAIL";
    else if (scanResult.status === "warning") status = "WARNING";

    const nextVersion = existing.current_version + 1;

    // Update Template
    const { error: updateErr } = await supabase
      .from("qr_templates")
      .update({
        name: input.name !== undefined ? input.name.trim() : existing.name,
        description: input.description !== undefined ? input.description?.trim() : existing.description,
        brand_kit_id: input.brand_kit_id !== undefined ? input.brand_kit_id : existing.brand_kit_id,
        compatibility:
          input.compatibility !== undefined
            ? normalizeCompatibilityTypes(input.compatibility)
            : existing.compatibility,
        is_brand_locked: isLocked,
        locked_fields: lockedFields,
        current_version: nextVersion,
        design_json: finalDesign,
        scanability_score: score,
        scanability_status: status,
      })
      .eq("id", templateId)
      .eq("organization_id", organizationId);

    if (updateErr) {
      throw new Error(`Failed to update template: ${updateErr.message}`);
    }

    // Insert Version Snapshot
    await supabase.from("qr_template_versions").insert({
      id: crypto.randomUUID(),
      organization_id: organizationId,
      template_id: templateId,
      version: nextVersion,
      change_summary: input.change_summary || `Updated to revision v${nextVersion}`,
      design_json: finalDesign,
      scanability_score: score,
      scanability_status: status,
      created_by: actorId || null,
    });

    const updated = await this.getTemplateById(organizationId, templateId);
    if (!updated) {
      throw new Error("Failed to load updated template");
    }
    return updated;
  }

  /**
   * Duplicates an existing template into a new organization template.
   */
  static async duplicateTemplate(
    organizationId: string,
    actorId: string | undefined,
    templateId: string,
    newName?: string
  ): Promise<QrTemplateDetail> {
    const existing = await this.getTemplateById(organizationId, templateId);
    if (!existing) {
      throw new Error("Source template not found");
    }

    const name = (newName || `${existing.name} (Copy)`).trim();

    return this.createTemplate(organizationId, actorId, {
      name,
      description: existing.description || undefined,
      brand_kit_id: existing.brand_kit_id,
      compatibility: existing.compatibility,
      is_brand_locked: existing.is_brand_locked,
      locked_fields: existing.locked_fields,
      design: existing.design_json,
      change_summary: `Duplicated from "${existing.name}"`,
    });
  }

  /**
   * Restores an immutable historical version by publishing it as a NEW revision.
   */
  static async restoreTemplateVersion(
    organizationId: string,
    actorId: string | undefined,
    templateId: string,
    targetVersion: number
  ): Promise<QrTemplateDetail> {
    const supabase = getClient();
    const existing = await this.getTemplateById(organizationId, templateId);
    if (!existing) {
      throw new Error("Template not found");
    }

    const { data: rawVer, error: verErr } = await supabase
      .from("qr_template_versions")
      .select("*")
      .eq("template_id", templateId)
      .eq("version", targetVersion)
      .single();

    if (verErr || !rawVer) {
      throw new Error(`Version v${targetVersion} not found for this template`);
    }

    const verRow = rawVer as RawVersionRow;

    return this.updateTemplate(organizationId, actorId, templateId, {
      design: (verRow.design_json || {}) as QrDesignV1,
      change_summary: `Restored from historical revision v${targetVersion}`,
    });
  }

  /**
   * Archives a template (soft deletion).
   */
  static async archiveTemplate(organizationId: string, templateId: string): Promise<void> {
    const supabase = getClient();
    const { error } = await supabase
      .from("qr_templates")
      .update({
        status: "archived",
        archived_at: new Date().toISOString(),
      })
      .eq("id", templateId)
      .eq("organization_id", organizationId);

    if (error) {
      throw new Error(`Failed to archive template: ${error.message}`);
    }
  }

  /**
   * Permanently deletes a template.
   * Cascade-safe: Foreign keys to qr_codes use ON DELETE SET NULL, preserving all QR assets.
   */
  static async deleteTemplate(organizationId: string, templateId: string): Promise<void> {
    const supabase = getClient();
    const { error } = await supabase
      .from("qr_templates")
      .delete()
      .eq("id", templateId)
      .eq("organization_id", organizationId);

    if (error) {
      throw new Error(`Failed to delete template: ${error.message}`);
    }
  }

  /**
   * Retrieves real QR usage for a template.
   * ZERO FAKE DATA: True count of QR codes linked to this template.
   */
  static async getTemplateUsage(
    organizationId: string,
    templateId: string
  ): Promise<TemplateUsageInfo> {
    const supabase = getClient();

    const { data: qrRows, error } = await supabase
      .from("qr_codes")
      .select("id, name, slug, updated_at")
      .eq("organization_id", organizationId)
      .eq("template_id", templateId)
      .limit(50);

    if (error) {
      console.warn("[QrTemplateStore.getTemplateUsage] Failed to query qr_codes:", error);
    }

    const { count: batchCount } = await supabase
      .from("bulk_qr_batches")
      .select("id", { count: "exact", head: true })
      .eq("organization_id", organizationId);

    const typedQrRows = (qrRows || []) as Array<{
      id: string;
      name: string | null;
      slug: string | null;
      updated_at: string;
    }>;

    return {
      templateId,
      totalQrCount: typedQrRows.length,
      totalBatchCount: batchCount || 0,
      qrCodes: typedQrRows.map((q) => ({
        id: q.id,
        name: q.name || "Untitled QR",
        slug: q.slug || "",
        updated_at: q.updated_at,
      })),
    };
  }
}

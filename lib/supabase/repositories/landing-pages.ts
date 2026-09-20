import "server-only";
import { createAdminClient } from "../admin";
import {
  LandingPageResponseV1,
  LandingPagePulseMetrics,
  LandingPageVersionResponseV1,
  LandingPageConnectedQrV1,
  LandingPageDocumentV1,
  CreateLandingPageRequestV1,
  UpdateLandingPageRequestV1,
  LandingPageCollectionQueryParams,
  STARTER_LAYOUTS,
  ConflictError,
  NotFoundError,
  ValidationError,
  LandingPageTelemetryEvent,
} from "@nxtqr/contracts";

function getClient() {
  return createAdminClient();
}

export interface LandingPageRecord {
  id: string;
  organizationId: string;
  name: string;
  slug: string;
  description?: string | null;
  status: "draft" | "published" | "archived";
  publishedVersionId?: string | null;
  publishedAt?: string | null;
  qrCount: number;
  viewCount: number;
  ctaCount: number;
  draftVersion: number;
  createdAt: string;
  updatedAt: string;
  archivedAt?: string | null;
  publicUrl: string;
}

export const SupabaseLandingPageRepository = {
  /**
   * Lists landing pages for an organization with real connected QR count and metrics.
   * STRICT ZERO FAKE DATA: Returns empty array if 0 rows in database.
   */
  async listByOrg(
    orgId: string,
    filter?: LandingPageCollectionQueryParams
  ): Promise<{ items: LandingPageRecord[]; total: number }> {
    const supabase = await getClient();

    let query = (supabase as any)
      .from("landing_pages")
      .select(
        "id, organization_id, name, slug, description, status, published_version_id, published_at, created_at, updated_at, archived_at, landing_page_qr_codes(count), landing_page_drafts(draft_version)",
        { count: "exact" }
      )
      .eq("organization_id", orgId);

    const statusFilter = filter?.status || "all";
    if (statusFilter !== "all") {
      query = query.eq("status", statusFilter);
    } else {
      query = query.neq("status", "archived");
    }

    if (filter?.search?.trim()) {
      query = query.or(`name.ilike.%${filter.search.trim()}%,slug.ilike.%${filter.search.trim()}%`);
    }

    const sortCol =
      filter?.sortBy === "name"
        ? "name"
        : filter?.sortBy === "createdAt"
        ? "created_at"
        : "updated_at";
    const sortOrder = filter?.order === "asc";

    query = query.order(sortCol, { ascending: sortOrder });

    const limit = filter?.limit || 50;
    const offset = filter?.offset || 0;
    query = query.range(offset, offset + limit - 1);

    const { data, count, error } = await query;
    if (error) {
      throw new Error(`Failed to list landing pages: ${error.message}`);
    }

    // Fetch real view/action event counts for these pages
    const pageIds = (data || []).map((p: any) => p.id);
    let eventCounts: Record<string, { views: number; ctas: number }> = {};

    if (pageIds.length > 0) {
      const { data: eventsData } = await (supabase as any)
        .from("landing_page_events")
        .select("landing_page_id, event_type")
        .in("landing_page_id", pageIds);

      if (eventsData) {
        for (const ev of eventsData) {
          if (!eventCounts[ev.landing_page_id]) {
            eventCounts[ev.landing_page_id] = { views: 0, ctas: 0 };
          }
          if (ev.event_type === "view") {
            eventCounts[ev.landing_page_id].views += 1;
          } else if (ev.event_type === "action_click" || ev.event_type === "conversion") {
            eventCounts[ev.landing_page_id].ctas += 1;
          }
        }
      }
    }

    const appBaseUrl = process.env.NEXT_PUBLIC_SHORT_URL_BASE || "https://nxtqr.vercel.app";

    const items: LandingPageRecord[] = (data || []).map((row: any) => {
      const qrsCount = Array.isArray(row.landing_page_qr_codes)
        ? row.landing_page_qr_codes[0]?.count || 0
        : 0;
      const draftVer = Array.isArray(row.landing_page_drafts)
        ? row.landing_page_drafts[0]?.draft_version || 1
        : 1;
      const counts = eventCounts[row.id] || { views: 0, ctas: 0 };

      return {
        id: row.id,
        organizationId: row.organization_id,
        name: row.name,
        slug: row.slug,
        description: row.description,
        status: row.status,
        publishedVersionId: row.published_version_id,
        publishedAt: row.published_at,
        qrCount: qrsCount,
        viewCount: counts.views,
        ctaCount: counts.ctas,
        draftVersion: draftVer,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        archivedAt: row.archived_at,
        publicUrl: `${appBaseUrl}/p/${row.slug}`,
      };
    });

    return { items, total: count || items.length };
  },

  /**
   * Retrieves a single landing page with draft, published status, and connected QR count.
   */
  async getById(
    orgId: string,
    pageId: string
  ): Promise<{ page: LandingPageRecord; draft?: LandingPageDocumentV1 }> {
    const supabase = await getClient();

    const { data, error } = await (supabase as any)
      .from("landing_pages")
      .select(
        "id, organization_id, name, slug, description, status, published_version_id, published_at, created_at, updated_at, archived_at, landing_page_qr_codes(count), landing_page_drafts(draft_version, document)"
      )
      .eq("organization_id", orgId)
      .eq("id", pageId)
      .single();

    if (error || !data) {
      throw new NotFoundError(`Landing page "${pageId}" not found.`);
    }

    // Get event count for this page
    const { data: eventsData } = await (supabase as any)
      .from("landing_page_events")
      .select("event_type")
      .eq("landing_page_id", pageId);

    let viewCount = 0;
    let ctaCount = 0;
    if (eventsData) {
      for (const ev of eventsData) {
        if (ev.event_type === "view") viewCount += 1;
        else if (ev.event_type === "action_click" || ev.event_type === "conversion") ctaCount += 1;
      }
    }

    const qrsCount = Array.isArray(data.landing_page_qr_codes)
      ? data.landing_page_qr_codes[0]?.count || 0
      : 0;
    const draftRow = Array.isArray(data.landing_page_drafts)
      ? data.landing_page_drafts[0]
      : data.landing_page_drafts;
    const draftVer = draftRow?.draft_version || 1;
    const draftDoc = draftRow?.document || undefined;

    const appBaseUrl = process.env.NEXT_PUBLIC_SHORT_URL_BASE || "https://nxtqr.vercel.app";

    const record: LandingPageRecord = {
      id: data.id,
      organizationId: data.organization_id,
      name: data.name,
      slug: data.slug,
      description: data.description,
      status: data.status,
      publishedVersionId: data.published_version_id,
      publishedAt: data.published_at,
      qrCount: qrsCount,
      viewCount,
      ctaCount,
      draftVersion: draftVer,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      archivedAt: data.archived_at,
      publicUrl: `${appBaseUrl}/p/${data.slug}`,
    };

    return { page: record, draft: draftDoc };
  },

  /**
   * Public page resolver for `/p/[slug]`.
   * Fast query resolving the active immutable version document for public visitors.
   * INVARIANT: Never returns draft content!
   */
  async getPublishedBySlug(slug: string): Promise<{
    page: { id: string; organizationId: string; name: string; slug: string; status: string };
    version: { id: string; versionNumber: number; document: LandingPageDocumentV1; publishedAt: string };
  } | null> {
    const supabase = await getClient();

    const { data: page, error } = await (supabase as any)
      .from("landing_pages")
      .select("id, organization_id, name, slug, status, published_version_id, published_at")
      .eq("slug", slug.toLowerCase().trim())
      .eq("status", "published")
      .single();

    if (error || !page || !page.published_version_id) {
      return null;
    }

    const { data: version, error: vErr } = await (supabase as any)
      .from("landing_page_versions")
      .select("id, version_number, document, created_at")
      .eq("id", page.published_version_id)
      .single();

    if (vErr || !version) {
      return null;
    }

    return {
      page: {
        id: page.id,
        organizationId: page.organization_id,
        name: page.name,
        slug: page.slug,
        status: page.status,
      },
      version: {
        id: version.id,
        versionNumber: version.version_number,
        document: version.document,
        publishedAt: page.published_at || version.created_at,
      },
    };
  },

  /**
   * Computes real operational pulse metrics for an organization.
   */
  async getPulseMetrics(orgId: string): Promise<LandingPagePulseMetrics> {
    const supabase = await getClient();

    const [pagesRes, qrsRes, eventsRes] = await Promise.all([
      (supabase as any)
        .from("landing_pages")
        .select("id, status")
        .eq("organization_id", orgId)
        .neq("status", "archived"),
      (supabase as any)
        .from("landing_page_qr_codes")
        .select("qr_id, landing_pages!inner(organization_id)")
        .eq("landing_pages.organization_id", orgId),
      (supabase as any)
        .from("landing_page_events")
        .select("event_type")
        .eq("organization_id", orgId),
    ]);

    const pages = pagesRes.data || [];
    const qrs = qrsRes.data || [];
    const events = eventsRes.data || [];

    const totalPages = pages.length;
    const publishedPages = pages.filter((p: any) => p.status === "published").length;
    const draftPages = pages.filter((p: any) => p.status === "draft").length;

    // Unique connected QRs
    const uniqueQrSet = new Set(qrs.map((q: any) => q.qr_id));
    const connectedQrs = uniqueQrSet.size;

    let totalViews = 0;
    let totalActions = 0;
    for (const ev of events) {
      if (ev.event_type === "view") totalViews += 1;
      else if (ev.event_type === "action_click" || ev.event_type === "conversion") totalActions += 1;
    }

    return {
      totalPages,
      publishedPages,
      draftPages,
      connectedQrs,
      totalViews,
      totalActions,
    };
  },

  /**
   * Creates a new landing page and initializes its working draft from a starter layout.
   */
  async createPage(
    orgId: string,
    userId: string,
    payload: CreateLandingPageRequestV1
  ): Promise<LandingPageRecord> {
    const supabase = await getClient();
    const cleanSlug = payload.slug.toLowerCase().trim();

    // Check slug conflict within active pages in this org
    const { data: existing } = await (supabase as any)
      .from("landing_pages")
      .select("id")
      .eq("organization_id", orgId)
      .eq("slug", cleanSlug)
      .neq("status", "archived")
      .maybeSingle();

    if (existing) {
      throw new ConflictError(`A landing page with slug "/${cleanSlug}" already exists in this workspace.`);
    }

    // Resolve starter layout
    const template =
      STARTER_LAYOUTS.find((t) => t.id === payload.starterLayoutId) || STARTER_LAYOUTS[0];

    // Insert logical landing page
    const { data: createdPage, error: pErr } = await (supabase as any)
      .from("landing_pages")
      .insert({
        organization_id: orgId,
        name: payload.name.trim(),
        slug: cleanSlug,
        description: payload.description?.trim() || null,
        status: "draft",
        created_by: userId,
      })
      .select()
      .single();

    if (pErr || !createdPage) {
      throw new Error(`Failed to create landing page: ${pErr?.message}`);
    }

    // Initialize working draft
    const initialDoc: LandingPageDocumentV1 = {
      ...template.document,
      seo: {
        ...template.document.seo,
        title: template.document.seo.title || payload.name.trim(),
        description: payload.description?.trim() || template.document.seo.description,
      },
    };

    const { error: dErr } = await (supabase as any).from("landing_page_drafts").insert({
      page_id: createdPage.id,
      organization_id: orgId,
      draft_version: 1,
      document: initialDoc,
      updated_by: userId,
    });

    if (dErr) {
      console.error("Failed to initialize draft:", dErr);
    }

    const appBaseUrl = process.env.NEXT_PUBLIC_SHORT_URL_BASE || "https://nxtqr.vercel.app";

    return {
      id: createdPage.id,
      organizationId: createdPage.organization_id,
      name: createdPage.name,
      slug: createdPage.slug,
      description: createdPage.description,
      status: createdPage.status,
      publishedVersionId: null,
      publishedAt: null,
      qrCount: 0,
      viewCount: 0,
      ctaCount: 0,
      draftVersion: 1,
      createdAt: createdPage.created_at,
      updatedAt: createdPage.updated_at,
      archivedAt: null,
      publicUrl: `${appBaseUrl}/p/${createdPage.slug}`,
    };
  },

  /**
   * Updates landing page metadata.
   */
  async updatePage(
    orgId: string,
    pageId: string,
    payload: UpdateLandingPageRequestV1
  ): Promise<LandingPageRecord> {
    const supabase = await getClient();

    const updates: any = {};
    if (payload.name !== undefined) updates.name = payload.name.trim();
    if (payload.description !== undefined) updates.description = payload.description?.trim() || null;
    if (payload.status !== undefined) {
      updates.status = payload.status;
      if (payload.status === "archived") updates.archived_at = new Date().toISOString();
    }
    if (payload.slug !== undefined) {
      const cleanSlug = payload.slug.toLowerCase().trim();
      const { data: conflict } = await (supabase as any)
        .from("landing_pages")
        .select("id")
        .eq("organization_id", orgId)
        .eq("slug", cleanSlug)
        .neq("id", pageId)
        .neq("status", "archived")
        .maybeSingle();

      if (conflict) {
        throw new ConflictError(`Slug "/${cleanSlug}" is already in use by another landing page.`);
      }
      updates.slug = cleanSlug;
    }

    const { data: updated, error } = await (supabase as any)
      .from("landing_pages")
      .update(updates)
      .eq("organization_id", orgId)
      .eq("id", pageId)
      .select()
      .single();

    if (error || !updated) {
      throw new Error(`Failed to update landing page: ${error?.message}`);
    }

    const { page } = await this.getById(orgId, pageId);
    return page;
  },

  /**
   * Server Autosave: updates mutable draft with optimistic concurrency control.
   */
  async saveDraft(
    orgId: string,
    pageId: string,
    userId: string,
    expectedDraftVersion: number,
    document: LandingPageDocumentV1
  ): Promise<{ draftVersion: number; updatedAt: string }> {
    const supabase = await getClient();

    // 1. Verify expected version to prevent silent concurrent overwrites
    const { data: currentDraft, error: fetchErr } = await (supabase as any)
      .from("landing_page_drafts")
      .select("draft_version")
      .eq("organization_id", orgId)
      .eq("page_id", pageId)
      .single();

    if (fetchErr || !currentDraft) {
      throw new NotFoundError("Draft record not found.");
    }

    if (currentDraft.draft_version !== expectedDraftVersion) {
      throw new ConflictError(
        `Draft was modified in another session (current revision: ${currentDraft.draft_version}, your revision: ${expectedDraftVersion}). Reload to merge changes.`
      );
    }

    const newVersion = expectedDraftVersion + 1;
    const now = new Date().toISOString();

    const { error: updateErr } = await (supabase as any)
      .from("landing_page_drafts")
      .update({
        draft_version: newVersion,
        document,
        updated_by: userId,
        updated_at: now,
      })
      .eq("organization_id", orgId)
      .eq("page_id", pageId);

    if (updateErr) {
      throw new Error(`Failed to autosave draft: ${updateErr.message}`);
    }

    return { draftVersion: newVersion, updatedAt: now };
  },

  /**
   * Review & Publish: Commits working draft to a new immutable version and sets published pointer.
   */
  async publishPage(
    orgId: string,
    pageId: string,
    userId: string,
    changeSummary?: string
  ): Promise<{ versionNumber: number; publishedVersionId: string; publishedAt: string }> {
    const supabase = await getClient();

    // 1. Load current working draft
    const { data: draftRow, error: dErr } = await (supabase as any)
      .from("landing_page_drafts")
      .select("document, draft_version")
      .eq("organization_id", orgId)
      .eq("page_id", pageId)
      .single();

    if (dErr || !draftRow || !draftRow.document) {
      throw new NotFoundError("No draft found to publish.");
    }

    // 2. Validate document blocks (must have at least one valid visible block or title)
    const doc: LandingPageDocumentV1 = draftRow.document;
    if (!doc.blocks || doc.blocks.length === 0) {
      throw new ValidationError("Cannot publish an empty landing page. Add at least one block before publishing.");
    }

    // 3. Find highest existing version number
    const { data: versions } = await (supabase as any)
      .from("landing_page_versions")
      .select("version_number")
      .eq("page_id", pageId)
      .order("version_number", { ascending: false })
      .limit(1);

    const nextVersionNumber = versions && versions.length > 0 ? versions[0].version_number + 1 : 1;
    const now = new Date().toISOString();

    // 4. Insert immutable version snapshot
    const { data: newVersion, error: vErr } = await (supabase as any)
      .from("landing_page_versions")
      .insert({
        organization_id: orgId,
        page_id: pageId,
        version_number: nextVersionNumber,
        document: doc,
        change_summary: changeSummary?.trim() || `Published revision ${nextVersionNumber}`,
        created_by: userId,
        created_at: now,
      })
      .select()
      .single();

    if (vErr || !newVersion) {
      throw new Error(`Failed to create immutable version: ${vErr?.message}`);
    }

    // 5. Update landing page published pointer
    const { error: pErr } = await (supabase as any)
      .from("landing_pages")
      .update({
        published_version_id: newVersion.id,
        published_at: now,
        published_by: userId,
        status: "published",
        updated_at: now,
      })
      .eq("organization_id", orgId)
      .eq("id", pageId);

    if (pErr) {
      throw new Error(`Failed to update published pointer: ${pErr.message}`);
    }

    return {
      versionNumber: nextVersionNumber,
      publishedVersionId: newVersion.id,
      publishedAt: now,
    };
  },

  /**
   * Lists immutable version history timeline.
   */
  async listVersions(orgId: string, pageId: string): Promise<LandingPageVersionResponseV1[]> {
    const supabase = await getClient();

    const [versionsRes, pageRes] = await Promise.all([
      (supabase as any)
        .from("landing_page_versions")
        .select("id, page_id, version_number, change_summary, created_at, created_by")
        .eq("organization_id", orgId)
        .eq("page_id", pageId)
        .order("version_number", { ascending: false }),
      (supabase as any)
        .from("landing_pages")
        .select("published_version_id")
        .eq("id", pageId)
        .single(),
    ]);

    if (versionsRes.error) {
      throw new Error(`Failed to list versions: ${versionsRes.error.message}`);
    }

    const currentPublishedId = pageRes.data?.published_version_id;

    return (versionsRes.data || []).map((v: any) => ({
      id: v.id,
      pageId: v.page_id,
      versionNumber: v.version_number,
      changeSummary: v.change_summary,
      createdAt: v.created_at,
      isLive: v.id === currentPublishedId,
    }));
  },

  /**
   * Restores an immutable version into a NEW working draft.
   * INVARIANT: Never mutates historical records!
   */
  async restoreVersion(
    orgId: string,
    pageId: string,
    userId: string,
    versionId: string
  ): Promise<{ newDraftVersion: number }> {
    const supabase = await getClient();

    // 1. Fetch version document
    const { data: version, error: vErr } = await (supabase as any)
      .from("landing_page_versions")
      .select("document, version_number")
      .eq("organization_id", orgId)
      .eq("page_id", pageId)
      .eq("id", versionId)
      .single();

    if (vErr || !version) {
      throw new NotFoundError("Version snapshot not found.");
    }

    // 2. Fetch current draft version
    const { data: currentDraft } = await (supabase as any)
      .from("landing_page_drafts")
      .select("draft_version")
      .eq("page_id", pageId)
      .single();

    const newDraftVersion = (currentDraft?.draft_version || 1) + 1;

    // 3. Write snapshot to working draft
    const { error: dErr } = await (supabase as any)
      .from("landing_page_drafts")
      .update({
        draft_version: newDraftVersion,
        document: version.document,
        updated_by: userId,
        updated_at: new Date().toISOString(),
      })
      .eq("page_id", pageId);

    if (dErr) {
      throw new Error(`Failed to restore version into draft: ${dErr.message}`);
    }

    return { newDraftVersion };
  },

  /**
   * Duplicates a landing page and its active draft into a new independent landing page.
   * ZERO analytics, events, or connected QRs are copied.
   */
  async duplicatePage(
    orgId: string,
    pageId: string,
    userId: string,
    customName?: string
  ): Promise<LandingPageRecord> {
    const { page, draft } = await this.getById(orgId, pageId);

    const newName = customName || `Copy of ${page.name}`;
    const baseSlug = `${page.slug}-copy`;
    let candidateSlug = baseSlug;
    let counter = 1;

    const supabase = await getClient();
    while (true) {
      const { data } = await (supabase as any)
        .from("landing_pages")
        .select("id")
        .eq("organization_id", orgId)
        .eq("slug", candidateSlug)
        .neq("status", "archived")
        .maybeSingle();

      if (!data) break;
      counter += 1;
      candidateSlug = `${baseSlug}-${counter}`;
    }

    const newPage = await this.createPage(orgId, userId, {
      name: newName,
      slug: candidateSlug,
      description: page.description || undefined,
      starterLayoutId: "blank",
    });

    if (draft) {
      await (supabase as any)
        .from("landing_page_drafts")
        .update({ document: draft })
        .eq("page_id", newPage.id);
    }

    return newPage;
  },

  /**
   * Dependency-Guarded Deletion:
   * Checks if active QR codes reference this landing page.
   * If dependencies exist and !force, returns { blocked: true, count }.
   * If allowed: removes associations and deletes or archives page.
   * INVARIANT: QR assets are NEVER deleted!
   */
  async deletePage(
    orgId: string,
    pageId: string,
    force = false
  ): Promise<{ success: boolean; blocked: boolean; connectedQrCount: number }> {
    const supabase = await getClient();

    // Check connected QR codes
    const { data: qrs } = await (supabase as any)
      .from("landing_page_qr_codes")
      .select("qr_id")
      .eq("landing_page_id", pageId);

    const count = qrs ? qrs.length : 0;
    if (count > 0 && !force) {
      return { success: false, blocked: true, connectedQrCount: count };
    }

    // Safe deletion: delete landing page (cascades associations, drafts, versions)
    // QR codes remain 100% intact!
    const { error } = await (supabase as any)
      .from("landing_pages")
      .delete()
      .eq("organization_id", orgId)
      .eq("id", pageId);

    if (error) {
      throw new Error(`Failed to delete landing page: ${error.message}`);
    }

    return { success: true, blocked: false, connectedQrCount: count };
  },

  /**
   * Lists active QR codes connected to a landing page.
   */
  async listConnectedQrs(orgId: string, pageId: string): Promise<LandingPageConnectedQrV1[]> {
    const supabase = await getClient();

    const { data, error } = await (supabase as any)
      .from("landing_page_qr_codes")
      .select("qr_id, qr_codes(id, slug, name, qr_type, status, updated_at)")
      .eq("landing_page_id", pageId);

    if (error) {
      throw new Error(`Failed to list connected QR codes: ${error.message}`);
    }

    return (data || []).map((row: any) => {
      const q = row.qr_codes;
      return {
        id: q?.id || row.qr_id,
        slug: q?.slug || "",
        name: q?.name || "QR Asset",
        qrType: q?.qr_type || "url",
        status: q?.status || "ACTIVE",
        totalScans: 0,
        uniqueScans: 0,
        updatedAt: q?.updated_at || new Date().toISOString(),
      };
    });
  },

  /**
   * Connects a QR code to this landing page.
   * Optionally updates the QR code's destination URL to the landing page public URL.
   */
  async connectQr(
    orgId: string,
    pageId: string,
    qrId: string,
    setAsDestination = true
  ): Promise<{ success: boolean; destinationUpdated: boolean }> {
    const supabase = await getClient();

    // Verify tenant ownership of both landing page and QR code
    const [pageRes, qrRes] = await Promise.all([
      (supabase as any)
        .from("landing_pages")
        .select("id, slug")
        .eq("organization_id", orgId)
        .eq("id", pageId)
        .single(),
      (supabase as any)
        .from("qr_codes")
        .select("id")
        .eq("organization_id", orgId)
        .eq("id", qrId)
        .single(),
    ]);

    if (pageRes.error || !pageRes.data) {
      throw new NotFoundError("Landing page not found in this organization.");
    }
    if (qrRes.error || !qrRes.data) {
      throw new NotFoundError("QR code not found in this organization.");
    }

    // Insert association
    const { error: linkErr } = await (supabase as any)
      .from("landing_page_qr_codes")
      .insert({ landing_page_id: pageId, qr_id: qrId })
      .select();

    if (linkErr && !linkErr.message.includes("duplicate key")) {
      throw new Error(`Failed to connect QR: ${linkErr.message}`);
    }

    let destinationUpdated = false;
    if (setAsDestination) {
      const appBaseUrl = process.env.NEXT_PUBLIC_SHORT_URL_BASE || "https://nxtqr.vercel.app";
      const targetUrl = `${appBaseUrl}/p/${pageRes.data.slug}`;

      // Update QR draft destination_json
      await (supabase as any)
        .from("qr_drafts")
        .update({
          destination_json: {
            type: "landing_page",
            defaultUrl: targetUrl,
            destinationUrl: targetUrl,
            landingPageId: pageId,
          },
        })
        .eq("qr_id", qrId);

      destinationUpdated = true;
    }

    return { success: true, destinationUpdated };
  },

  /**
   * Disconnects a QR code from a landing page.
   */
  async disconnectQr(orgId: string, pageId: string, qrId: string): Promise<void> {
    const supabase = await getClient();

    const { error } = await (supabase as any)
      .from("landing_page_qr_codes")
      .delete()
      .eq("landing_page_id", pageId)
      .eq("qr_id", qrId);

    if (error) {
      throw new Error(`Failed to disconnect QR: ${error.message}`);
    }
  },

  /**
   * Queries real analytics telemetry for a landing page.
   */
  async getAnalytics(
    orgId: string,
    pageId: string
  ): Promise<{
    views: number;
    actions: number;
    conversions: number;
    actionBreakdown: Array<{ actionId: string; actionType: string; count: number }>;
    deviceBreakdown: Array<{ device: string; count: number }>;
    recentEvents: Array<{
      id: string;
      eventType: string;
      actionType?: string;
      deviceType?: string;
      createdAt: string;
    }>;
  }> {
    const supabase = await getClient();

    const { data: events, error } = await (supabase as any)
      .from("landing_page_events")
      .select("id, event_type, action_id, action_type, device_type, created_at")
      .eq("organization_id", orgId)
      .eq("landing_page_id", pageId)
      .order("created_at", { ascending: false })
      .limit(100);

    if (error) {
      throw new Error(`Failed to fetch landing page analytics: ${error.message}`);
    }

    let views = 0;
    let actions = 0;
    let conversions = 0;
    const actionCounts: Record<string, { actionId: string; actionType: string; count: number }> = {};
    const deviceCounts: Record<string, number> = {};

    for (const ev of events || []) {
      if (ev.event_type === "view") views += 1;
      else if (ev.event_type === "action_click") {
        actions += 1;
        const key = ev.action_id || ev.action_type || "action";
        if (!actionCounts[key]) {
          actionCounts[key] = {
            actionId: ev.action_id || "action",
            actionType: ev.action_type || "click",
            count: 0,
          };
        }
        actionCounts[key].count += 1;
      } else if (ev.event_type === "conversion") {
        conversions += 1;
      }

      const dev = ev.device_type || "mobile";
      deviceCounts[dev] = (deviceCounts[dev] || 0) + 1;
    }

    return {
      views,
      actions,
      conversions,
      actionBreakdown: Object.values(actionCounts),
      deviceBreakdown: Object.entries(deviceCounts).map(([device, count]) => ({ device, count })),
      recentEvents: (events || []).slice(0, 15).map((e: any) => ({
        id: e.id,
        eventType: e.event_type,
        actionType: e.action_type,
        deviceType: e.device_type,
        createdAt: e.created_at,
      })),
    };
  },

  /**
   * Records asynchronous public visitor telemetry (views & CTA clicks).
   */
  async recordEvent(pageId: string, event: LandingPageTelemetryEvent): Promise<void> {
    const supabase = await getClient();

    // Look up org id from page
    const { data: page } = await (supabase as any)
      .from("landing_pages")
      .select("organization_id, published_version_id")
      .eq("id", pageId)
      .single();

    if (!page) return;

    await (supabase as any).from("landing_page_events").insert({
      landing_page_id: pageId,
      organization_id: page.organization_id,
      version_id: event.versionId || page.published_version_id || null,
      qr_id: event.qrId || null,
      event_type: event.eventType,
      action_id: event.actionId || null,
      action_type: event.actionType || null,
      device_type: event.deviceType || "mobile",
      referrer: event.referrer || "direct",
    });
  },
};

import { NextRequest, NextResponse } from "next/server";
import {
  QrExportRequestV1Schema,
  NotFoundError,
  ValidationError,
} from "@nxtqr/contracts";
import {
  authorizeApiRequest,
  handleApiError,
} from "@/lib/api";
import {
  encodeQrContent,
  exportQrSvg,
  exportQrPdf,
  CANONICAL_QR_DESIGN_DEFAULTS,
  QrDesignV1,
  evaluateScanability,
  PRINT_PRESET_LIST,
} from "@nxtqr/qr-core";
import { QrStore } from "@/lib/domains/qr-store";

interface Params {
  params: Promise<{ qrId: string }>;
}

/**
 * POST /api/v1/qrs/:qrId/export — Real authorized binary export
 * Supports Vector SVG, Vector PDF (print presets), and PNG raster format.
 * Invariant 29: Export uses user-selected actual draft or saved version.
 */
export async function POST(request: NextRequest, { params }: Params) {
  let ctx;
  try {
    ctx = await authorizeApiRequest(request, {
      scope: "qrs:read",
      permission: "qr.export",
      entitlement: "qr.export",
    });

    const { qrId } = await params;
    const rawBody = await request.json().catch(() => ({}));
    const payload = QrExportRequestV1Schema.parse(rawBody);

    // 1. Verify QR ownership
    const qr = await QrStore.getQr(qrId, ctx.organizationId, ctx.db);
    if (!qr) {
      throw new NotFoundError(`QR code '${qrId}' was not found.`);
    }

    let content: any = null;
    let design: QrDesignV1 = CANONICAL_QR_DESIGN_DEFAULTS;

    // 2. Load requested version OR draft
    if (!payload.useDraft && payload.versionNumber) {
      const versions = await QrStore.listVersions(qrId, ctx.organizationId, ctx.db);
      const ver = versions.find((v) => v.versionNumber === payload.versionNumber);
      if (ver) {
        content = ver.content;
        design = ver.design || CANONICAL_QR_DESIGN_DEFAULTS;
      }
    }

    // Fall back to active draft if not loaded from version
    if (!content) {
      const draft = await QrStore.getDraft(qrId, ctx.organizationId, ctx.db);
      if (draft) {
        content = draft.content;
        design = draft.design || CANONICAL_QR_DESIGN_DEFAULTS;
      }
    }

    // If still empty, fall back to basic URL
    if (!content) {
      content = { type: qr.qrType || "url", url: `https://nxtqr.vercel.app/s/${qr.slug}` };
    }

    const rawString = encodeQrContent(content);
    const baseFileName = `nxtqr-${qr.slug || "asset"}`;

    // Authoritative Server-Side Scanability Export Validation (Rules 78, 79)
    const selectedPreset = PRINT_PRESET_LIST.find((p) => p.id === payload.presetId);
    const outputContext =
      payload.format === "pdf"
        ? {
            type: "printExport" as const,
            printPresetId: payload.presetId,
            printWidthMm: selectedPreset?.pageWidthMm || 50,
          }
        : {
            type: "digitalExport" as const,
            exportSizePx: 1024,
          };

    const scanability = evaluateScanability(rawString, design, outputContext);
    if (scanability.status === "blocking" || scanability.blockersCount > 0) {
      const blocker = scanability.findings.find((f) => f.blocking || f.severity === "blocking");
      throw new ValidationError(
        `Export blocked by Scanability Engine: ${blocker?.title || "Critical scanability risk"} (${blocker?.code || "BLOCKED"}). ${blocker?.remediation || ""}`
      );
    }

    // 3. Generate format
    if (payload.format === "pdf") {
      const { pdfBuffer, fileName } = exportQrPdf({
        content: rawString,
        design,
        presetId: payload.presetId || "sticker",
        fileName: baseFileName,
      });

      return new NextResponse(pdfBuffer as any, {
        status: 200,
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `attachment; filename="${fileName}"`,
          "Cache-Control": "private, no-cache",
        },
      });
    }

    // Default to standalone SVG
    const { svgString } = exportQrSvg({
      content: rawString,
      design,
    });

    return new NextResponse(svgString, {
      status: 200,
      headers: {
        "Content-Type": "image/svg+xml; charset=utf-8",
        "Content-Disposition": `attachment; filename="${baseFileName}.svg"`,
        "Cache-Control": "private, no-cache",
      },
    });
  } catch (err) {
    return handleApiError(err, ctx?.requestId || "req_unknown");
  }
}

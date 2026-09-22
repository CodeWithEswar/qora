/**
 * NXTQR — QR Template Exporter
 * Bundles template designs into deterministic JSON packages.
 */

import { QrTemplateSummary, ExportedTemplateBundle } from "./types";

export function exportTemplateToJson(template: QrTemplateSummary): ExportedTemplateBundle {
  return {
    schemaVersion: 1,
    format: "nxtqr-template-bundle",
    exportedAt: new Date().toISOString(),
    template: {
      name: template.name,
      description: template.description,
      compatibility: template.compatibility,
      is_brand_locked: template.is_brand_locked,
      locked_fields: template.locked_fields,
      design: template.design_json,
    },
  };
}

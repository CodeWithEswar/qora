import { QrDesignV1 } from "../design/schema";
import { renderQrSvg } from "../renderer/svg";

export interface SvgExportOptions {
  content: string;
  design: QrDesignV1;
  moduleSize?: number; // default 16 for high-resolution vector export
  fileName?: string;
}

export function exportQrSvg(options: SvgExportOptions): {
  svgString: string;
  mimeType: string;
  fileName: string;
} {
  const moduleSize = options.moduleSize || 16;
  const rawSvg = renderQrSvg({
    content: options.content,
    design: options.design,
    moduleSize,
  });

  const cleanName = (options.fileName || "nxtqr-code")
    .toLowerCase()
    .replace(/[^a-z0-9-_]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 50);

  return {
    svgString: rawSvg,
    mimeType: "image/svg+xml",
    fileName: `${cleanName || "nxtqr-code"}.svg`,
  };
}

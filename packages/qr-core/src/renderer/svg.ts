import { QrDesignV1 } from "../design/schema";
import { encodeQrMatrix, getFinderPatternInfo } from "../encoder/matrix";

export interface RenderSvgOptions {
  content: string;
  design: QrDesignV1;
  moduleSize?: number; // Pixels per module, default 10
}

/**
 * Deterministic Vector SVG Generator
 * Produces crisp, resolution-independent SVG vector markup from content and design parameters.
 */
export function renderQrSvg(options: RenderSvgOptions): string {
  const { content, design } = options;
  const moduleSize = options.moduleSize || 10;
  const quietZone = Math.max(1, design.quietZone || 4);

  // 1. Encode into matrix
  const qr = encodeQrMatrix(content || " ", design.errorCorrection);
  const matrixSize = qr.size;
  const totalModuleWidth = matrixSize + quietZone * 2;
  const qrPixelWidth = totalModuleWidth * moduleSize;

  // 2. Determine frame layout if frame is active
  const hasFrame = design.frame && design.frame.style !== "none";
  const frameStyle = design.frame?.style || "none";
  const frameText = design.frame?.text || "SCAN ME";
  const frameBg = design.frame?.bgColor || design.fgColor;
  const frameTextColor = design.frame?.textColor || design.bgColor;

  let frameTopHeight = 0;
  let frameBottomHeight = 0;

  if (hasFrame) {
    if (frameStyle === "badge") {
      frameTopHeight = 44;
    } else if (frameStyle === "simple" || frameStyle === "signal_bar") {
      frameBottomHeight = 44;
    } else if (frameStyle === "card") {
      frameTopHeight = 36;
      frameBottomHeight = 44;
    } else if (frameStyle === "corners" || frameStyle === "outline") {
      frameBottomHeight = 38;
    }
  }

  const svgWidth = qrPixelWidth;
  const svgHeight = qrPixelWidth + frameTopHeight + frameBottomHeight;

  // 3. Logo bounding box in matrix coordinates (if logo configured)
  let logoStartCol = -1;
  let logoEndCol = -1;
  let logoStartRow = -1;
  let logoEndRow = -1;

  if (design.logo && (design.logo.assetId || design.logo.url)) {
    const logoScale = Math.max(0.12, Math.min(0.32, design.logo.scale || 0.24));
    const logoModuleCount = Math.ceil(matrixSize * logoScale);
    const center = Math.floor(matrixSize / 2);
    const half = Math.floor(logoModuleCount / 2);
    logoStartCol = center - half;
    logoEndCol = center + half;
    logoStartRow = center - half;
    logoEndRow = center + half;
  }

  // 4. Subtle rounded corner radius and clipping for the QR card & frame container
  const cardRadius = Math.max(6, Math.round(moduleSize * 1.4));
  const clipId = `nxtqr-clip-${moduleSize}-${Math.round(svgWidth)}x${Math.round(svgHeight)}-${Math.abs(hashString(content + design.fgColor + design.bgColor + (design.frame?.style || ""))) || 1}`;

  const defsContent: string[] = [
    `<clipPath id="${clipId}">
      <rect x="0" y="0" width="${svgWidth}" height="${svgHeight}" rx="${cardRadius}" ry="${cardRadius}" />
    </clipPath>`,
  ];

  const gradId = `nxtqr-grad-${moduleSize}-${Math.abs(hashString(design.fgColor + (design.gradient?.endColor || "")))}`;
  if (design.gradient) {
    const angle = design.gradient.angle || 45;
    const rad = (angle * Math.PI) / 180;
    const x1 = Math.round(50 - Math.cos(rad) * 50);
    const y1 = Math.round(50 - Math.sin(rad) * 50);
    const x2 = Math.round(50 + Math.cos(rad) * 50);
    const y2 = Math.round(50 + Math.sin(rad) * 50);

    defsContent.push(`
      <linearGradient id="${gradId}" x1="${x1}%" y1="${y1}%" x2="${x2}%" y2="${y2}%">
        <stop offset="0%" stop-color="${design.gradient.startColor}" />
        <stop offset="100%" stop-color="${design.gradient.endColor}" />
      </linearGradient>`);
  }

  const defsSvg = `
    <defs>
      ${defsContent.join("\n      ")}
    </defs>`;

  const fillTarget = design.gradient ? `url(#${gradId})` : design.fgColor;
  const eyeOuterFill = design.eyeColor || fillTarget;
  const eyeInnerFill = design.eyeInnerColor || design.eyeColor || fillTarget;

  // 5. Build SVG Paths
  const modulesSvg: string[] = [];

  // Dedicated Finder Eye Renderers
  const drawFinder = (originRow: number, originCol: number) => {
    const x = (originCol + quietZone) * moduleSize;
    const y = (originRow + quietZone) * moduleSize + frameTopHeight;
    const outerSize = 7 * moduleSize;
    const innerSize = 3 * moduleSize;
    const innerOffset = 2 * moduleSize;

    // Outer frame (7x7 box with 5x5 cutout)
    const outerStyle = design.eyeOuterStyle;
    let outerPath = "";

    if (outerStyle === "circle") {
      const cx = x + outerSize / 2;
      const cy = y + outerSize / 2;
      outerPath = `
        <circle cx="${cx}" cy="${cy}" r="${outerSize / 2}" fill="${eyeOuterFill}" />
        <circle cx="${cx}" cy="${cy}" r="${(5 * moduleSize) / 2}" fill="${design.bgColor}" />
      `;
    } else if (outerStyle === "rounded") {
      const r = moduleSize * 1.8;
      outerPath = `
        <rect x="${x}" y="${y}" width="${outerSize}" height="${outerSize}" rx="${r}" fill="${eyeOuterFill}" />
        <rect x="${x + moduleSize}" y="${y + moduleSize}" width="${5 * moduleSize}" height="${5 * moduleSize}" rx="${r * 0.7}" fill="${design.bgColor}" />
      `;
    } else if (outerStyle === "leaf") {
      const r = moduleSize * 2.2;
      outerPath = `
        <rect x="${x}" y="${y}" width="${outerSize}" height="${outerSize}" rx="${r}" fill="${eyeOuterFill}" />
        <rect x="${x + moduleSize}" y="${y + moduleSize}" width="${5 * moduleSize}" height="${5 * moduleSize}" rx="${r * 0.6}" fill="${design.bgColor}" />
      `;
    } else {
      // Classic square with slightly rounded corners (subtle softening)
      const r = Math.max(1.5, Math.round(moduleSize * 0.35));
      const cutoutR = Math.max(1, Math.round(r * 0.7));
      outerPath = `
        <rect x="${x}" y="${y}" width="${outerSize}" height="${outerSize}" rx="${r}" ry="${r}" fill="${eyeOuterFill}" />
        <rect x="${x + moduleSize}" y="${y + moduleSize}" width="${5 * moduleSize}" height="${5 * moduleSize}" rx="${cutoutR}" ry="${cutoutR}" fill="${design.bgColor}" />
      `;
    }

    // Inner eye (3x3 core)
    const innerX = x + innerOffset;
    const innerY = y + innerOffset;
    const innerStyle = design.eyeInnerStyle;
    let innerPath = "";

    if (innerStyle === "dot") {
      const cx = innerX + innerSize / 2;
      const cy = innerY + innerSize / 2;
      const radius = innerSize / 2;
      innerPath = `<circle cx="${cx}" cy="${cy}" r="${radius}" fill="${eyeInnerFill}" />`;
    } else if (innerStyle === "diamond") {
      const cx = innerX + innerSize / 2;
      const cy = innerY + innerSize / 2;
      const d = innerSize / 2;
      innerPath = `<polygon points="${cx},${cy - d} ${cx + d},${cy} ${cx},${cy + d} ${cx - d},${cy}" fill="${eyeInnerFill}" />`;
    } else if (innerStyle === "rounded") {
      const r = moduleSize * 0.8;
      innerPath = `<rect x="${innerX}" y="${innerY}" width="${innerSize}" height="${innerSize}" rx="${r}" fill="${eyeInnerFill}" />`;
    } else {
      // Classic square with slightly rounded corners (subtle softening)
      const r = Math.max(1.2, Math.round(moduleSize * 0.25));
      innerPath = `<rect x="${innerX}" y="${innerY}" width="${innerSize}" height="${innerSize}" rx="${r}" ry="${r}" fill="${eyeInnerFill}" />`;
    }

    return `${outerPath}\n${innerPath}`;
  };

  // Add the 3 finders
  modulesSvg.push(drawFinder(0, 0));
  modulesSvg.push(drawFinder(0, matrixSize - 7));
  modulesSvg.push(drawFinder(matrixSize - 7, 0));

  // Render Data Modules
  for (let r = 0; r < matrixSize; r++) {
    for (let c = 0; c < matrixSize; c++) {
      // Skip if inside any of the 3 finder eyes
      const finderInfo = getFinderPatternInfo(r, c, matrixSize);
      if (finderInfo.isFinder) continue;

      // Skip if under logo plate
      if (
        logoStartCol !== -1 &&
        r >= logoStartRow &&
        r <= logoEndRow &&
        c >= logoStartCol &&
        c <= logoEndCol
      ) {
        continue;
      }

      if (qr.matrix[r][c]) {
        const mx = (c + quietZone) * moduleSize;
        const my = (r + quietZone) * moduleSize + frameTopHeight;

        if (design.moduleStyle === "dots") {
          const cx = mx + moduleSize / 2;
          const cy = my + moduleSize / 2;
          const rad = moduleSize * 0.44;
          modulesSvg.push(`<circle cx="${cx}" cy="${cy}" r="${rad}" fill="${fillTarget}" />`);
        } else if (design.moduleStyle === "rounded") {
          const rx = moduleSize * 0.28;
          modulesSvg.push(
            `<rect x="${mx}" y="${my}" width="${moduleSize}" height="${moduleSize}" rx="${rx}" fill="${fillTarget}" />`
          );
        } else if (design.moduleStyle === "soft") {
          const rx = moduleSize * 0.16;
          modulesSvg.push(
            `<rect x="${mx}" y="${my}" width="${moduleSize}" height="${moduleSize}" rx="${rx}" fill="${fillTarget}" />`
          );
        } else if (design.moduleStyle === "extra_rounded") {
          const rx = moduleSize * 0.45;
          modulesSvg.push(
            `<rect x="${mx}" y="${my}" width="${moduleSize}" height="${moduleSize}" rx="${rx}" fill="${fillTarget}" />`
          );
        } else if (design.moduleStyle === "diamond") {
          const cx = mx + moduleSize / 2;
          const cy = my + moduleSize / 2;
          const d = moduleSize * 0.48;
          modulesSvg.push(
            `<polygon points="${cx},${cy - d} ${cx + d},${cy} ${cx},${cy + d} ${cx - d},${cy}" fill="${fillTarget}" />`
          );
        } else {
          // Classic square
          modulesSvg.push(
            `<rect x="${mx}" y="${my}" width="${moduleSize}" height="${moduleSize}" fill="${fillTarget}" />`
          );
        }
      }
    }
  }

  // 6. Render Logo Plate & Image if present
  let logoSvg = "";
  if (logoStartCol !== -1) {
    const lx = (logoStartCol + quietZone) * moduleSize;
    const ly = (logoStartRow + quietZone) * moduleSize + frameTopHeight;
    const lw = (logoEndCol - logoStartCol + 1) * moduleSize;
    const lh = (logoEndRow - logoStartRow + 1) * moduleSize;
    const pad = design.logo?.padding || 4;
    const shape = design.logo?.shape || "square";

    if (shape === "circle") {
      const cx = lx + lw / 2;
      const cy = ly + lh / 2;
      const r = lw / 2;
      logoSvg += `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${design.bgColor}" stroke="${design.bgColor}" stroke-width="2" />`;
    } else {
      const rx = moduleSize * 0.6;
      logoSvg += `<rect x="${lx}" y="${ly}" width="${lw}" height="${lh}" rx="${rx}" fill="${design.bgColor}" />`;
    }

    if (design.logo?.url) {
      const imgX = lx + pad;
      const imgY = ly + pad;
      const imgW = Math.max(8, lw - pad * 2);
      const imgH = Math.max(8, lh - pad * 2);
      logoSvg += `<image href="${escapeXml(design.logo.url)}" x="${imgX}" y="${imgY}" width="${imgW}" height="${imgH}" preserveAspectRatio="xMidYMid meet" />`;
    }
  }

  // 7. Render Frame
  let frameSvg = "";
  if (hasFrame) {
    if (frameStyle === "badge") {
      frameSvg = `
        <rect x="0" y="0" width="${svgWidth}" height="${frameTopHeight}" fill="${frameBg}" />
        <text x="${svgWidth / 2}" y="${frameTopHeight / 2 + 5}" fill="${frameTextColor}" font-family="system-ui, -apple-system, sans-serif" font-size="13" font-weight="700" letter-spacing="1.5" text-anchor="middle" text-transform="uppercase">${escapeXml(frameText)}</text>
      `;
    } else if (frameStyle === "simple") {
      const fy = svgHeight - frameBottomHeight;
      frameSvg = `
        <rect x="0" y="${fy}" width="${svgWidth}" height="${frameBottomHeight}" fill="${frameBg}" />
        <text x="${svgWidth / 2}" y="${fy + frameBottomHeight / 2 + 5}" fill="${frameTextColor}" font-family="system-ui, -apple-system, sans-serif" font-size="13" font-weight="700" letter-spacing="1.5" text-anchor="middle" text-transform="uppercase">${escapeXml(frameText)}</text>
      `;
    } else if (frameStyle === "signal_bar") {
      const fy = svgHeight - frameBottomHeight;
      frameSvg = `
        <rect x="0" y="${fy}" width="${svgWidth}" height="${frameBottomHeight}" fill="${frameBg}" />
        <circle cx="20" cy="${fy + frameBottomHeight / 2}" r="3.5" fill="#FA520F" />
        <text x="${svgWidth / 2}" y="${fy + frameBottomHeight / 2 + 4.5}" fill="${frameTextColor}" font-family="system-ui, -apple-system, sans-serif" font-size="12" font-weight="700" letter-spacing="2" text-anchor="middle" text-transform="uppercase">${escapeXml(frameText)}</text>
      `;
    } else if (frameStyle === "card") {
      frameSvg = `
        <rect x="0" y="0" width="${svgWidth}" height="${frameTopHeight}" fill="${frameBg}" />
        <text x="${svgWidth / 2}" y="${frameTopHeight / 2 + 5}" fill="${frameTextColor}" font-family="system-ui, -apple-system, sans-serif" font-size="12" font-weight="700" letter-spacing="1.5" text-anchor="middle" text-transform="uppercase">NXTQR</text>
        <rect x="0" y="${svgHeight - frameBottomHeight}" width="${svgWidth}" height="${frameBottomHeight}" fill="${frameBg}" />
        <text x="${svgWidth / 2}" y="${svgHeight - frameBottomHeight + frameBottomHeight / 2 + 5}" fill="${frameTextColor}" font-family="system-ui, -apple-system, sans-serif" font-size="13" font-weight="700" letter-spacing="1.5" text-anchor="middle" text-transform="uppercase">${escapeXml(frameText)}</text>
      `;
    } else if (frameStyle === "corners") {
      const fy = svgHeight - frameBottomHeight;
      const t = 12;
      frameSvg = `
        <!-- Corner Brackets -->
        <path d="M 6 ${t + 6} L 6 6 L ${t + 6} 6" fill="none" stroke="${frameBg}" stroke-width="3" />
        <path d="M ${svgWidth - 6} ${t + 6} L ${svgWidth - 6} 6 L ${svgWidth - t - 6} 6" fill="none" stroke="${frameBg}" stroke-width="3" />
        <path d="M 6 ${fy - t} L 6 ${fy} L ${t + 6} ${fy}" fill="none" stroke="${frameBg}" stroke-width="3" />
        <path d="M ${svgWidth - 6} ${fy - t} L ${svgWidth - 6} ${fy} L ${svgWidth - t - 6} ${fy}" fill="none" stroke="${frameBg}" stroke-width="3" />
        <!-- Bottom Label -->
        <rect x="${svgWidth * 0.15}" y="${fy + 4}" width="${svgWidth * 0.7}" height="${frameBottomHeight - 8}" rx="4" fill="${frameBg}" />
        <text x="${svgWidth / 2}" y="${fy + frameBottomHeight / 2 + 4}" fill="${frameTextColor}" font-family="system-ui, -apple-system, sans-serif" font-size="11" font-weight="700" letter-spacing="1.5" text-anchor="middle" text-transform="uppercase">${escapeXml(frameText)}</text>
      `;
    } else if (frameStyle === "outline") {
      const fy = svgHeight - frameBottomHeight;
      frameSvg = `
        <rect x="3" y="3" width="${svgWidth - 6}" height="${svgHeight - 6}" rx="8" fill="none" stroke="${frameBg}" stroke-width="2.5" />
        <rect x="${svgWidth * 0.2}" y="${fy + 4}" width="${svgWidth * 0.6}" height="${frameBottomHeight - 8}" rx="4" fill="${frameBg}" />
        <text x="${svgWidth / 2}" y="${fy + frameBottomHeight / 2 + 4}" fill="${frameTextColor}" font-family="system-ui, -apple-system, sans-serif" font-size="11" font-weight="700" letter-spacing="1.5" text-anchor="middle" text-transform="uppercase">${escapeXml(frameText)}</text>
      `;
    }
  }

  // Assemble full SVG document
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 ${svgWidth} ${svgHeight}" width="${svgWidth}" height="${svgHeight}" preserveAspectRatio="xMidYMid meet" shape-rendering="geometricPrecision">
  ${defsSvg}
  <!-- Card Container (clipped with slightly rounded corners) -->
  <g clip-path="url(#${clipId})">
    <!-- Background -->
    <rect width="${svgWidth}" height="${svgHeight}" rx="${cardRadius}" ry="${cardRadius}" fill="${design.bgColor}" />
    ${frameSvg}
    <!-- QR Modules -->
    <g id="qr-matrix">
      ${modulesSvg.join("\n      ")}
    </g>
    <!-- Center Logo Plate -->
    ${logoSvg}
  </g>
</svg>`;
}

/**
 * Deterministic Real Mini Thumbnail SVG Generator
 * Generates lightweight, real vector QR preview thumbnails for style and frame selectors.
 * Zero screenshots, zero fake assets.
 */
export function renderMiniThumbnailSvg(designPartial: Partial<QrDesignV1>): string {
  const fullDesign: QrDesignV1 = {
    schemaVersion: 1,
    moduleStyle: designPartial.moduleStyle || "squares",
    eyeOuterStyle: designPartial.eyeOuterStyle || "square",
    eyeInnerStyle: designPartial.eyeInnerStyle || "square",
    fgColor: designPartial.fgColor || "#1F1F1F",
    bgColor: designPartial.bgColor || "#FFFFFF",
    frame: designPartial.frame || {
      style: "none",
      text: "SCAN",
      bgColor: "#1F1F1F",
      textColor: "#FFFFFF",
    },
    quietZone: 2,
    errorCorrection: "M",
  };

  return renderQrSvg({
    content: "NXTQR",
    design: fullDesign,
    moduleSize: 3,
  });
}

function escapeXml(unsafe: string): string {
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case "<": return "&lt;";
      case ">": return "&gt;";
      case "&": return "&amp;";
      case "'": return "&apos;";
      case '"': return "&quot;";
      default: return c;
    }
  });
}

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return hash;
}

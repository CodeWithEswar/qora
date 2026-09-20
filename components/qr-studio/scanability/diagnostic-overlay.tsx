import * as React from "react";
import {
  QrDesignV1,
  ScanabilityChannelId,
  ScanabilityGeometry,
  ScanabilityResultV1,
} from "@nxtqr/qr-core";

interface DiagnosticOverlayProps {
  geometry?: ScanabilityGeometry;
  design?: QrDesignV1;
  svgMarkup?: string;
  scanability?: ScanabilityResultV1;
  activeChannel?: ScanabilityChannelId | null;
  hoveredFindingChannel?: ScanabilityChannelId | null;
  showFinderAnchors?: boolean;
}

/**
 * DiagnosticOverlay
 *
 * Ultra-precise, aerospace-grade vector diagnostic HUD overlay.
 * Renders 1:1 subpixel-aligned calibration geometry, optical sampling reticles,
 * measurement calipers, and occlusion bounds directly over the authoritative QR SVG.
 */
export function DiagnosticOverlay({
  geometry,
  design,
  svgMarkup,
  scanability,
  activeChannel,
  hoveredFindingChannel,
  showFinderAnchors = true,
}: DiagnosticOverlayProps) {
  if (!geometry) return null;

  // 1. Extract exact viewBox dimensions from svgMarkup
  const viewBoxMatch = svgMarkup?.match(/viewBox=["']0\s+0\s+(\d+(?:\.\d+)?)\s+(\d+(?:\.\d+)?)["']/);
  const matrixSize = geometry.matrixSize;
  const quietZone = Math.max(1, design?.quietZone ?? geometry.quietZoneModules ?? 4);

  // 2. Derive authoritative frame layout from design
  const hasFrame = Boolean(design?.frame && design.frame.style !== "none");
  const frameStyle = design?.frame?.style || "none";
  let nominalFrameTop = 0;
  let nominalFrameBottom = 0;
  if (hasFrame) {
    if (frameStyle === "badge") {
      nominalFrameTop = 44;
    } else if (frameStyle === "simple" || frameStyle === "signal_bar") {
      nominalFrameBottom = 44;
    } else if (frameStyle === "card") {
      nominalFrameTop = 36;
      nominalFrameBottom = 44;
    } else if (frameStyle === "corners" || frameStyle === "outline") {
      nominalFrameBottom = 38;
    }
  }

  let svgWidth = viewBoxMatch ? parseFloat(viewBoxMatch[1]) : 0;
  let svgHeight = viewBoxMatch ? parseFloat(viewBoxMatch[2]) : 0;

  const totalModuleWidth = matrixSize + quietZone * 2;
  const moduleSize = svgWidth > 0 ? svgWidth / totalModuleWidth : 10;
  const qrPixelWidth = totalModuleWidth * moduleSize;

  if (!svgWidth) {
    svgWidth = qrPixelWidth;
  }

  let frameTopHeight = nominalFrameTop;
  let frameBottomHeight = nominalFrameBottom;

  if (svgHeight > 0) {
    const extraHeight = Math.max(0, svgHeight - qrPixelWidth);
    if (nominalFrameTop > 0 && nominalFrameBottom > 0) {
      const ratio = nominalFrameTop / (nominalFrameTop + nominalFrameBottom);
      frameTopHeight = extraHeight * ratio;
      frameBottomHeight = extraHeight * (1 - ratio);
    } else if (nominalFrameTop > 0) {
      frameTopHeight = extraHeight;
      frameBottomHeight = 0;
    } else {
      frameTopHeight = 0;
      frameBottomHeight = extraHeight;
    }
  } else {
    svgHeight = qrPixelWidth + frameTopHeight + frameBottomHeight;
  }

  const viewBox = `0 0 ${svgWidth} ${svgHeight}`;
  const matrixX = quietZone * moduleSize;
  const matrixY = frameTopHeight + quietZone * moduleSize;
  const matrixPixelSize = matrixSize * moduleSize;
  const finderSize = 7 * moduleSize;

  // Center logo box in pixel coordinates
  const { centerBox } = geometry;
  const logoBoxX = matrixX + centerBox.xStart * moduleSize;
  const logoBoxY = matrixY + centerBox.yStart * moduleSize;
  const logoBoxSize = centerBox.size * moduleSize;

  // Priority to hovered finding channel, then active inspected channel
  const effectiveChannel = hoveredFindingChannel || activeChannel;

  // Scaled strokes and dimensions
  const strokeLight = Math.max(1, moduleSize * 0.12);
  const strokeMedium = Math.max(1.5, moduleSize * 0.18);
  const strokeHeavy = Math.max(2, moduleSize * 0.26);
  const cornerBracketSize = Math.max(4, moduleSize * 1.5);

  // Retrieve channel checks from scanability result
  const contrastCheck = scanability?.checks.find((c) => c.channel === "contrast");
  const quietCheck = scanability?.checks.find((c) => c.channel === "quiet_zone");
  const logoCheck = scanability?.checks.find((c) => c.channel === "logo_area");
  const moduleCheck = scanability?.checks.find((c) => c.channel === "module_size");
  const recoveryCheck = scanability?.checks.find((c) => c.channel === "recovery");

  return (
    <svg
      viewBox={viewBox}
      className="absolute inset-0 w-full h-full pointer-events-none z-10 select-none overflow-visible"
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        {/* Luminous HUD Glow Filters */}
        <filter id="hud-glow-orange" x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="0" dy="0" stdDeviation={moduleSize * 0.25} floodColor="#FA520F" floodOpacity="0.5" />
        </filter>
        <filter id="hud-glow-blue" x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="0" dy="0" stdDeviation={moduleSize * 0.25} floodColor="#0284C7" floodOpacity="0.5" />
        </filter>
        <filter id="hud-glow-emerald" x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="0" dy="0" stdDeviation={moduleSize * 0.25} floodColor="#10B981" floodOpacity="0.5" />
        </filter>
      </defs>

      {/* 1. Finder Pattern Protection Anchors (Corners: FP-1, FP-2, FP-3) */}
      {showFinderAnchors && (
        <g className="transition-opacity duration-300">
          {[
            { id: "tl", x: matrixX, y: matrixY, label: "FP-1" },
            { id: "tr", x: matrixX + (matrixSize - 7) * moduleSize, y: matrixY, label: "FP-2" },
            { id: "bl", x: matrixX, y: matrixY + (matrixSize - 7) * moduleSize, label: "FP-3" },
          ].map((anchor) => (
            <g key={anchor.id}>
              {/* Outer Dashed Inspection Box with Dark Contrast Halo */}
              <rect
                x={anchor.x}
                y={anchor.y}
                width={finderSize}
                height={finderSize}
                fill="none"
                stroke="rgba(0, 0, 0, 0.45)"
                strokeWidth={strokeLight + 1.2}
                strokeDasharray={`${moduleSize * 0.7} ${moduleSize * 0.4}`}
              />
              <rect
                x={anchor.x}
                y={anchor.y}
                width={finderSize}
                height={finderSize}
                fill="none"
                stroke="#FA520F"
                strokeWidth={strokeLight}
                strokeDasharray={`${moduleSize * 0.7} ${moduleSize * 0.4}`}
                opacity="0.9"
              />

              {/* Corner Precision L-Brackets */}
              {/* Top-Left */}
              <path
                d={`M ${anchor.x} ${anchor.y + cornerBracketSize} L ${anchor.x} ${anchor.y} L ${anchor.x + cornerBracketSize} ${anchor.y}`}
                fill="none"
                stroke="rgba(0, 0, 0, 0.4)"
                strokeWidth={strokeMedium + 1}
              />
              <path
                d={`M ${anchor.x} ${anchor.y + cornerBracketSize} L ${anchor.x} ${anchor.y} L ${anchor.x + cornerBracketSize} ${anchor.y}`}
                fill="none"
                stroke="#FA520F"
                strokeWidth={strokeMedium}
              />
              {/* Top-Right */}
              <path
                d={`M ${anchor.x + finderSize - cornerBracketSize} ${anchor.y} L ${anchor.x + finderSize} ${anchor.y} L ${anchor.x + finderSize} ${anchor.y + cornerBracketSize}`}
                fill="none"
                stroke="rgba(0, 0, 0, 0.4)"
                strokeWidth={strokeMedium + 1}
              />
              <path
                d={`M ${anchor.x + finderSize - cornerBracketSize} ${anchor.y} L ${anchor.x + finderSize} ${anchor.y} L ${anchor.x + finderSize} ${anchor.y + cornerBracketSize}`}
                fill="none"
                stroke="#FA520F"
                strokeWidth={strokeMedium}
              />
              {/* Bottom-Left */}
              <path
                d={`M ${anchor.x} ${anchor.y + finderSize - cornerBracketSize} L ${anchor.x} ${anchor.y + finderSize} L ${anchor.x + cornerBracketSize} ${anchor.y + finderSize}`}
                fill="none"
                stroke="rgba(0, 0, 0, 0.4)"
                strokeWidth={strokeMedium + 1}
              />
              <path
                d={`M ${anchor.x} ${anchor.y + finderSize - cornerBracketSize} L ${anchor.x} ${anchor.y + finderSize} L ${anchor.x + cornerBracketSize} ${anchor.y + finderSize}`}
                fill="none"
                stroke="#FA520F"
                strokeWidth={strokeMedium}
              />
              {/* Bottom-Right */}
              <path
                d={`M ${anchor.x + finderSize - cornerBracketSize} ${anchor.y + finderSize} L ${anchor.x + finderSize} ${anchor.y + finderSize} L ${anchor.x + finderSize} ${anchor.y + finderSize - cornerBracketSize}`}
                fill="none"
                stroke="rgba(0, 0, 0, 0.4)"
                strokeWidth={strokeMedium + 1}
              />
              <path
                d={`M ${anchor.x + finderSize - cornerBracketSize} ${anchor.y + finderSize} L ${anchor.x + finderSize} ${anchor.y + finderSize} L ${anchor.x + finderSize} ${anchor.y + finderSize - cornerBracketSize}`}
                fill="none"
                stroke="#FA520F"
                strokeWidth={strokeMedium}
              />

              {/* Minimal Anchor HUD Label Tag */}
              <rect
                x={anchor.x + moduleSize * 0.3}
                y={anchor.y + moduleSize * 0.3}
                width={moduleSize * 1.8}
                height={moduleSize * 0.8}
                rx={moduleSize * 0.15}
                fill="#0F172A"
                fillOpacity="0.85"
                stroke="#FA520F"
                strokeWidth={strokeLight * 0.7}
              />
              <text
                x={anchor.x + moduleSize * 1.2}
                y={anchor.y + moduleSize * 0.7}
                fill="#FFFFFF"
                fontSize={moduleSize * 0.45}
                fontFamily="monospace"
                fontWeight="bold"
                textAnchor="middle"
                dominantBaseline="central"
              >
                {anchor.label}
              </text>
            </g>
          ))}
        </g>
      )}

      {/* 2. Channel 01: Contrast Sampling Reticles & Differential HUD */}
      {effectiveChannel === "contrast" && (() => {
        const fgX = matrixX + 3.5 * moduleSize;
        const fgY = matrixY + 3.5 * moduleSize;

        // Ensure background reticle stays strictly inside bounds with clearance
        const reticleRadius = Math.min(moduleSize * 1.25, Math.max(8, quietZone * moduleSize * 0.4));
        const bgX = Math.max(reticleRadius + 4, matrixX - (quietZone * 0.5) * moduleSize);
        const bgY = matrixY + 3.5 * moduleSize;

        const ratioVal = contrastCheck?.measurements.ratio !== undefined
          ? String(contrastCheck.measurements.ratio)
          : "3.9:1";
        const isPass = contrastCheck?.status === "pass";

        const badgeW = moduleSize * 4.4;
        const badgeH = moduleSize * 1.1;
        const badgeX = (bgX + fgX) / 2 - badgeW / 2;
        const badgeY = bgY - moduleSize * 1.6;

        return (
          <g className="transition-all duration-300 animate-in fade-in">
            {/* Connecting Baseline showing contrast delta */}
            <line
              x1={bgX + reticleRadius}
              y1={bgY}
              x2={fgX - reticleRadius}
              y2={fgY}
              stroke="rgba(0, 0, 0, 0.4)"
              strokeWidth={strokeMedium + 0.8}
            />
            <line
              x1={bgX + reticleRadius}
              y1={bgY}
              x2={fgX - reticleRadius}
              y2={fgY}
              stroke="#FFA110"
              strokeWidth={strokeMedium}
              strokeDasharray={`${moduleSize * 0.4} ${moduleSize * 0.3}`}
            />

            {/* Floating Measurement Delta Badge */}
            <g>
              <rect
                x={badgeX}
                y={badgeY}
                width={badgeW}
                height={badgeH}
                rx={moduleSize * 0.25}
                fill="#0F172A"
                fillOpacity="0.9"
                stroke={isPass ? "#10B981" : "#FA520F"}
                strokeWidth={strokeLight}
              />
              <text
                x={badgeX + badgeW / 2}
                y={badgeY + badgeH / 2}
                fill="#F8FAFC"
                fontSize={moduleSize * 0.5}
                fontFamily="monospace"
                fontWeight="700"
                textAnchor="middle"
                dominantBaseline="central"
                letterSpacing="0.05em"
              >
                {ratioVal} {isPass ? "PASS" : "WARN"}
              </text>
            </g>

            {/* Background Sampling Reticle (Quiet Zone Margin) */}
            <g filter="url(#hud-glow-blue)">
              {/* Outer Glow Halo */}
              <circle
                cx={bgX}
                cy={bgY}
                r={reticleRadius}
                fill="rgba(2, 132, 199, 0.12)"
                stroke="rgba(0, 0, 0, 0.4)"
                strokeWidth={strokeMedium + 1}
              />
              <circle
                cx={bgX}
                cy={bgY}
                r={reticleRadius}
                fill="none"
                stroke="#0284C7"
                strokeWidth={strokeMedium}
              />
              <circle cx={bgX} cy={bgY} r={moduleSize * 0.32} fill="#0284C7" />
              {/* Reticle Crosshairs */}
              <line
                x1={bgX - reticleRadius - moduleSize * 0.25}
                y1={bgY}
                x2={bgX + reticleRadius + moduleSize * 0.25}
                y2={bgY}
                stroke="#0284C7"
                strokeWidth={strokeLight}
              />
              <line
                x1={bgX}
                y1={bgY - reticleRadius - moduleSize * 0.25}
                x2={bgX}
                y2={bgY + reticleRadius + moduleSize * 0.25}
                stroke="#0284C7"
                strokeWidth={strokeLight}
              />
              {/* Clamped Label Tag */}
              <rect
                x={Math.max(2, bgX - moduleSize * 1.1)}
                y={bgY - reticleRadius - moduleSize * 1.1}
                width={moduleSize * 2.2}
                height={moduleSize * 0.85}
                rx={moduleSize * 0.18}
                fill="#0284C7"
              />
              <text
                x={Math.max(2 + moduleSize * 1.1, bgX)}
                y={bgY - reticleRadius - moduleSize * 0.65}
                fill="#FFFFFF"
                fontSize={moduleSize * 0.52}
                fontFamily="monospace"
                fontWeight="bold"
                textAnchor="middle"
                dominantBaseline="central"
              >
                BG
              </text>
            </g>

            {/* Foreground Sampling Reticle (Center of Top-Left Finder Core) */}
            <g filter="url(#hud-glow-orange)">
              {/* Dual-layer high-contrast target ring */}
              <circle
                cx={fgX}
                cy={fgY}
                r={reticleRadius}
                fill="rgba(250, 82, 15, 0.15)"
                stroke="rgba(0, 0, 0, 0.5)"
                strokeWidth={strokeMedium + 1.2}
              />
              <circle
                cx={fgX}
                cy={fgY}
                r={reticleRadius}
                fill="none"
                stroke="#FA520F"
                strokeWidth={strokeMedium}
              />
              <circle cx={fgX} cy={fgY} r={moduleSize * 0.32} fill="#FA520F" />
              {/* Reticle Crosshairs */}
              <line
                x1={fgX - reticleRadius - moduleSize * 0.25}
                y1={fgY}
                x2={fgX + reticleRadius + moduleSize * 0.25}
                y2={fgY}
                stroke="#FA520F"
                strokeWidth={strokeLight}
              />
              <line
                x1={fgX}
                y1={fgY - reticleRadius - moduleSize * 0.25}
                x2={fgX}
                y2={fgY + reticleRadius + moduleSize * 0.25}
                stroke="#FA520F"
                strokeWidth={strokeLight}
              />
              {/* Label Tag */}
              <rect
                x={fgX - moduleSize * 1.1}
                y={fgY - reticleRadius - moduleSize * 1.1}
                width={moduleSize * 2.2}
                height={moduleSize * 0.85}
                rx={moduleSize * 0.18}
                fill="#FA520F"
              />
              <text
                x={fgX}
                y={fgY - reticleRadius - moduleSize * 0.65}
                fill="#FFFFFF"
                fontSize={moduleSize * 0.52}
                fontFamily="monospace"
                fontWeight="bold"
                textAnchor="middle"
                dominantBaseline="central"
              >
                FG
              </text>
            </g>
          </g>
        );
      })()}

      {/* 3. Channel 02: Quiet Zone Channel Overlay */}
      {effectiveChannel === "quiet_zone" && (() => {
        const quietWidth = quietZone * moduleSize;
        const caliperY = frameTopHeight + quietWidth / 2;
        const caliperX = quietWidth / 2;

        return (
          <g className="transition-all duration-300 animate-in fade-in" filter="url(#hud-glow-blue)">
            {/* Luminous Quiet Zone Shroud */}
            <path
              d={`M 0 ${frameTopHeight} L ${qrPixelWidth} ${frameTopHeight} L ${qrPixelWidth} ${frameTopHeight + qrPixelWidth} L 0 ${frameTopHeight + qrPixelWidth} Z M ${matrixX} ${matrixY} L ${matrixX} ${matrixY + matrixPixelSize} L ${matrixX + matrixPixelSize} ${matrixY + matrixPixelSize} L ${matrixX + matrixPixelSize} ${matrixY} Z`}
              fill="rgba(2, 132, 199, 0.08)"
              fillRule="evenodd"
            />

            {/* Outer Perimeter Frame (Quiet Zone Limit) */}
            <rect
              x={1}
              y={frameTopHeight + 1}
              width={qrPixelWidth - 2}
              height={qrPixelWidth - 2}
              fill="none"
              stroke="#0284C7"
              strokeWidth={strokeMedium}
              strokeDasharray={`${moduleSize * 0.8} ${moduleSize * 0.4}`}
            />

            {/* Inner Matrix Boundary */}
            <rect
              x={matrixX}
              y={matrixY}
              width={matrixPixelSize}
              height={matrixPixelSize}
              fill="none"
              stroke="#0284C7"
              strokeWidth={strokeHeavy}
            />

            {/* Top Margin Caliper Bracket */}
            <g>
              <line
                x1={matrixX + moduleSize * 8}
                y1={frameTopHeight}
                x2={matrixX + moduleSize * 8}
                y2={matrixY}
                stroke="#0284C7"
                strokeWidth={strokeMedium}
              />
              <line
                x1={matrixX + moduleSize * 7.4}
                y1={frameTopHeight}
                x2={matrixX + moduleSize * 8.6}
                y2={frameTopHeight}
                stroke="#0284C7"
                strokeWidth={strokeMedium}
              />
              <line
                x1={matrixX + moduleSize * 7.4}
                y1={matrixY}
                x2={matrixX + moduleSize * 8.6}
                y2={matrixY}
                stroke="#0284C7"
                strokeWidth={strokeMedium}
              />
            </g>

            {/* Floating Quiet Zone Status Badge */}
            <g>
              {(() => {
                const badgeW = moduleSize * 6.8;
                const badgeH = moduleSize * 1.1;
                const badgeX = svgWidth / 2 - badgeW / 2;
                const badgeY = Math.max(2, matrixY - moduleSize * 1.8);
                const isOptimal = quietZone >= 4;

                return (
                  <>
                    <rect
                      x={badgeX}
                      y={badgeY}
                      width={badgeW}
                      height={badgeH}
                      rx={moduleSize * 0.25}
                      fill="#0F172A"
                      fillOpacity="0.9"
                      stroke="#0284C7"
                      strokeWidth={strokeLight}
                    />
                    <text
                      x={badgeX + badgeW / 2}
                      y={badgeY + badgeH / 2}
                      fill="#F8FAFC"
                      fontSize={moduleSize * 0.48}
                      fontFamily="monospace"
                      fontWeight="700"
                      textAnchor="middle"
                      dominantBaseline="central"
                    >
                      {quietZone}M MARGIN • {isOptimal ? "OPTIMAL (≥4M)" : "COMPACT (≥1M)"}
                    </text>
                  </>
                );
              })()}
            </g>
          </g>
        );
      })()}

      {/* 4. Channel 03: Logo Area Channel Overlay */}
      {effectiveChannel === "logo_area" && (() => {
        const coverage = geometry.logoCoveragePercent;
        const isSafe = coverage <= 25;
        const badgeW = moduleSize * 7.2;
        const badgeH = moduleSize * 1.1;
        const badgeX = svgWidth / 2 - badgeW / 2;
        const badgeY = Math.max(matrixY + moduleSize * 0.5, logoBoxY - moduleSize * 1.7);

        return (
          <g className="transition-all duration-300 animate-in fade-in" filter="url(#hud-glow-orange)">
            {/* Scrim over matrix to illuminate center occlusion zone */}
            <rect
              x={matrixX}
              y={matrixY}
              width={matrixPixelSize}
              height={matrixPixelSize}
              fill="rgba(0, 0, 0, 0.2)"
            />

            {/* Center Logo Occlusion Zone with Corner Accents */}
            <rect
              x={logoBoxX}
              y={logoBoxY}
              width={logoBoxSize}
              height={logoBoxSize}
              fill="rgba(250, 82, 15, 0.12)"
              stroke="#FA520F"
              strokeWidth={strokeHeavy}
              strokeDasharray={`${moduleSize * 0.6} ${moduleSize * 0.3}`}
            />

            {/* Corner L-Brackets on Logo Box */}
            <path
              d={`M ${logoBoxX} ${logoBoxY + cornerBracketSize} L ${logoBoxX} ${logoBoxY} L ${logoBoxX + cornerBracketSize} ${logoBoxY}`}
              fill="none"
              stroke="#FA520F"
              strokeWidth={strokeHeavy}
            />
            <path
              d={`M ${logoBoxX + logoBoxSize - cornerBracketSize} ${logoBoxY} L ${logoBoxX + logoBoxSize} ${logoBoxY} L ${logoBoxX + logoBoxSize} ${logoBoxY + cornerBracketSize}`}
              fill="none"
              stroke="#FA520F"
              strokeWidth={strokeHeavy}
            />
            <path
              d={`M ${logoBoxX} ${logoBoxY + logoBoxSize - cornerBracketSize} L ${logoBoxX} ${logoBoxY + logoBoxSize} L ${logoBoxX + cornerBracketSize} ${logoBoxY + logoBoxSize}`}
              fill="none"
              stroke="#FA520F"
              strokeWidth={strokeHeavy}
            />
            <path
              d={`M ${logoBoxX + logoBoxSize - cornerBracketSize} ${logoBoxY + logoBoxSize} L ${logoBoxX + logoBoxSize} ${logoBoxY + logoBoxSize} L ${logoBoxX + logoBoxSize} ${logoBoxY + logoBoxSize - cornerBracketSize}`}
              fill="none"
              stroke="#FA520F"
              strokeWidth={strokeHeavy}
            />

            {/* Center Reticle Crosshairs */}
            <line
              x1={logoBoxX - moduleSize * 1.2}
              y1={logoBoxY + logoBoxSize / 2}
              x2={logoBoxX + logoBoxSize + moduleSize * 1.2}
              y2={logoBoxY + logoBoxSize / 2}
              stroke="#FA520F"
              strokeWidth={strokeLight}
              strokeDasharray={`${moduleSize * 0.4} ${moduleSize * 0.4}`}
            />
            <line
              x1={logoBoxX + logoBoxSize / 2}
              y1={logoBoxY - moduleSize * 1.2}
              x2={logoBoxX + logoBoxSize / 2}
              y2={logoBoxY + logoBoxSize + moduleSize * 1.2}
              stroke="#FA520F"
              strokeWidth={strokeLight}
              strokeDasharray={`${moduleSize * 0.4} ${moduleSize * 0.4}`}
            />

            {/* Floating Logo Occlusion Badge */}
            <g>
              <rect
                x={badgeX}
                y={badgeY}
                width={badgeW}
                height={badgeH}
                rx={moduleSize * 0.25}
                fill="#0F172A"
                fillOpacity="0.92"
                stroke={isSafe ? "#10B981" : "#FA520F"}
                strokeWidth={strokeLight}
              />
              <text
                x={badgeX + badgeW / 2}
                y={badgeY + badgeH / 2}
                fill="#F8FAFC"
                fontSize={moduleSize * 0.46}
                fontFamily="monospace"
                fontWeight="700"
                textAnchor="middle"
                dominantBaseline="central"
              >
                OCCLUSION: {coverage}% • {isSafe ? "SAFE (<25%)" : "HIGH (>25%)"}
              </text>
            </g>
          </g>
        );
      })()}

      {/* 5. Channel 04: Module Size Channel Overlay & Timing Caliper */}
      {effectiveChannel === "module_size" && (() => {
        // Highlight horizontal timing row (row 6) between finder patterns
        const timingY = matrixY + 6 * moduleSize;
        const timingStartX = matrixX + 7 * moduleSize;
        const timingWidth = (matrixSize - 14) * moduleSize;

        const badgeW = moduleSize * 7.6;
        const badgeH = moduleSize * 1.1;
        const badgeX = svgWidth / 2 - badgeW / 2;
        const badgeY = Math.max(2, matrixY - moduleSize * 1.8);

        return (
          <g className="transition-all duration-300 animate-in fade-in" filter="url(#hud-glow-orange)">
            {/* Horizontal Timing Pattern Inspection Strip */}
            <rect
              x={timingStartX}
              y={timingY}
              width={timingWidth}
              height={moduleSize}
              fill="rgba(250, 82, 15, 0.2)"
              stroke="#FA520F"
              strokeWidth={strokeMedium}
              strokeDasharray={`${moduleSize} ${moduleSize}`}
            />

            {/* Caliper Bracket above Timing Pattern */}
            <line
              x1={timingStartX}
              y1={timingY - moduleSize * 0.6}
              x2={timingStartX + timingWidth}
              y2={timingY - moduleSize * 0.6}
              stroke="#FA520F"
              strokeWidth={strokeMedium}
            />
            <line
              x1={timingStartX}
              y1={timingY - moduleSize * 1.0}
              x2={timingStartX}
              y2={timingY - moduleSize * 0.2}
              stroke="#FA520F"
              strokeWidth={strokeMedium}
            />
            <line
              x1={timingStartX + timingWidth}
              y1={timingY - moduleSize * 1.0}
              x2={timingStartX + timingWidth}
              y2={timingY - moduleSize * 0.2}
              stroke="#FA520F"
              strokeWidth={strokeMedium}
            />

            {/* Outer Matrix Dimension Envelope */}
            <rect
              x={matrixX}
              y={matrixY}
              width={matrixPixelSize}
              height={matrixPixelSize}
              fill="none"
              stroke="#FA520F"
              strokeWidth={strokeLight}
              strokeDasharray={`${moduleSize * 0.5} ${moduleSize * 0.5}`}
              opacity="0.8"
            />

            {/* Floating Module Dimension Badge */}
            <g>
              <rect
                x={badgeX}
                y={badgeY}
                width={badgeW}
                height={badgeH}
                rx={moduleSize * 0.25}
                fill="#0F172A"
                fillOpacity="0.92"
                stroke="#FA520F"
                strokeWidth={strokeLight}
              />
              <text
                x={badgeX + badgeW / 2}
                y={badgeY + badgeH / 2}
                fill="#F8FAFC"
                fontSize={moduleSize * 0.46}
                fontFamily="monospace"
                fontWeight="700"
                textAnchor="middle"
                dominantBaseline="central"
              >
                GRID: {matrixSize}×{matrixSize}M • 1M = {moduleSize.toFixed(1)}px
              </text>
            </g>
          </g>
        );
      })()}

      {/* 6. Channel 05: Recovery (Error Correction) Channel Overlay */}
      {effectiveChannel === "recovery" && (() => {
        const ecLevel = (recoveryCheck?.measurements.level as string) || design?.errorCorrection || "M";
        const ecCapacityMap: Record<string, string> = {
          L: "7%",
          M: "15%",
          Q: "25%",
          H: "30%",
        };
        const capacityStr = ecCapacityMap[ecLevel] || "15%";

        const badgeW = moduleSize * 7.4;
        const badgeH = moduleSize * 1.1;
        const badgeX = svgWidth / 2 - badgeW / 2;
        const badgeY = Math.max(2, matrixY - moduleSize * 1.8);

        return (
          <g className="transition-all duration-300 animate-in fade-in" filter="url(#hud-glow-emerald)">
            {/* Parity & Data matrix payload active inspection region */}
            <rect
              x={matrixX}
              y={matrixY}
              width={matrixPixelSize}
              height={matrixPixelSize}
              fill="rgba(16, 185, 129, 0.08)"
              stroke="#10B981"
              strokeWidth={strokeMedium}
              strokeDasharray={`${moduleSize * 0.8} ${moduleSize * 0.5}`}
            />

            {/* Corner L-Brackets on Full Payload Matrix */}
            <path
              d={`M ${matrixX} ${matrixY + cornerBracketSize * 1.5} L ${matrixX} ${matrixY} L ${matrixX + cornerBracketSize * 1.5} ${matrixY}`}
              fill="none"
              stroke="#10B981"
              strokeWidth={strokeHeavy}
            />
            <path
              d={`M ${matrixX + matrixPixelSize - cornerBracketSize * 1.5} ${matrixY} L ${matrixX + matrixPixelSize} ${matrixY} L ${matrixX + matrixPixelSize} ${matrixY + cornerBracketSize * 1.5}`}
              fill="none"
              stroke="#10B981"
              strokeWidth={strokeHeavy}
            />
            <path
              d={`M ${matrixX} ${matrixY + matrixPixelSize - cornerBracketSize * 1.5} L ${matrixX} ${matrixY + matrixPixelSize} L ${matrixX + cornerBracketSize * 1.5} ${matrixY + matrixPixelSize}`}
              fill="none"
              stroke="#10B981"
              strokeWidth={strokeHeavy}
            />
            <path
              d={`M ${matrixX + matrixPixelSize - cornerBracketSize * 1.5} ${matrixY + matrixPixelSize} L ${matrixX + matrixPixelSize} ${matrixY + matrixPixelSize} L ${matrixX + matrixPixelSize} ${matrixY + matrixPixelSize - cornerBracketSize * 1.5}`}
              fill="none"
              stroke="#10B981"
              strokeWidth={strokeHeavy}
            />

            {/* Floating Parity Capacity Badge */}
            <g>
              <rect
                x={badgeX}
                y={badgeY}
                width={badgeW}
                height={badgeH}
                rx={moduleSize * 0.25}
                fill="#0F172A"
                fillOpacity="0.92"
                stroke="#10B981"
                strokeWidth={strokeLight}
              />
              <text
                x={badgeX + badgeW / 2}
                y={badgeY + badgeH / 2}
                fill="#F8FAFC"
                fontSize={moduleSize * 0.46}
                fontFamily="monospace"
                fontWeight="700"
                textAnchor="middle"
                dominantBaseline="central"
              >
                LEVEL {ecLevel} • ~{capacityStr} REED-SOLOMON PARITY
              </text>
            </g>
          </g>
        );
      })()}
    </svg>
  );
}

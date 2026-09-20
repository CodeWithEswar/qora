"use client";

import React from "react";
import type { FileDownloadBlockProps, LandingPageThemeV1 } from "@nxtqr/contracts";
import { NxtqrIcon } from "@/components/icons/nxtqr-icon";
import { cn } from "@/lib/utils";

interface FileDownloadBlockComponentProps {
  props: FileDownloadBlockProps;
  theme: LandingPageThemeV1;
  onActionClick?: (actionId: string, actionType: string) => void;
}

export function FileDownloadBlock({ props, theme, onActionClick }: FileDownloadBlockComponentProps) {
  const { fileName = "Download Attachment", fileSize, mimeType, downloadUrl = "#" } = props;

  const buttonRadiusClass =
    theme.buttonStyle === "pill"
      ? "rounded-2xl"
      : theme.buttonStyle === "sharp"
      ? "rounded-none"
      : "rounded-xl";

  const isPdf = mimeType?.includes("pdf") || fileName.endsWith(".pdf");
  const isDoc = mimeType?.includes("word") || fileName.endsWith(".doc") || fileName.endsWith(".docx");
  const isSheet = mimeType?.includes("sheet") || mimeType?.includes("csv") || fileName.endsWith(".xlsx");
  const fileIcon = isPdf
    ? "solar:document-text-bold"
    : isDoc
    ? "solar:file-text-bold"
    : isSheet
    ? "solar:table-bold"
    : "solar:file-download-bold";

  return (
    <div className="w-full px-4 py-2">
      <a
        href={downloadUrl}
        target="_blank"
        rel="noopener noreferrer"
        download={fileName}
        onClick={() => onActionClick?.("file_download", "download")}
        className={cn(
          "w-full max-w-xl mx-auto p-4 sm:p-5 flex items-center justify-between border border-black/5 dark:border-white/10 shadow-xs transition-all hover:-translate-y-0.5 hover:shadow-sm active:translate-y-0 active:scale-[0.99]",
          buttonRadiusClass
        )}
        style={{
          backgroundColor: theme.surfaceColor,
          color: theme.foregroundColor,
        }}
      >
        <div className="flex items-center gap-3.5 min-w-0 pr-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
            style={{
              backgroundColor: `${theme.accentColor}18`,
              color: theme.accentColor,
            }}
          >
            <NxtqrIcon icon={fileIcon} size={20} />
          </div>
          <div className="flex flex-col min-w-0 text-left">
            <span className="text-sm font-semibold truncate">{fileName}</span>
            <span className="text-xs opacity-65 truncate mt-0.5">
              {fileSize ? fileSize : "Document"}
              {mimeType && ` · ${mimeType.split("/")[1]?.toUpperCase() || mimeType}`}
            </span>
          </div>
        </div>

        <div
          className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-xs"
          style={{
            backgroundColor: theme.accentColor,
            color: "#FFFFFF",
          }}
        >
          <NxtqrIcon icon="solar:download-minimalistic-bold" size={16} />
        </div>
      </a>
    </div>
  );
}

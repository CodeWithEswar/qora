import * as React from "react";

interface ScanPassProps {
  triggerKey: string | number;
}

export function ScanPass({ triggerKey }: ScanPassProps) {
  return (
    <div
      key={String(triggerKey)}
      aria-hidden="true"
      className="absolute inset-0 pointer-events-none overflow-hidden rounded-xl"
    >
      <div
        className="w-full h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent opacity-80 shadow-[0_0_8px_rgba(250,82,15,0.6)] motion-safe:animate-[scanpass_380ms_cubic-bezier(0.16,1,0.3,1)_forwards] motion-reduce:hidden"
        style={{
          animation: "scanpass 380ms cubic-bezier(0.16, 1, 0.3, 1) forwards",
        }}
      />
      <style
        dangerouslySetInnerHTML={{
          __html: `
            @keyframes scanpass {
              0% {
                transform: translateY(-10%);
                opacity: 0;
              }
              20% {
                opacity: 1;
              }
              85% {
                opacity: 0.9;
              }
              100% {
                transform: translateY(420px);
                opacity: 0;
              }
            }
          `,
        }}
      />
    </div>
  );
}

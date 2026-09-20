import * as React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/empty-state";

export interface LocationData {
  country: string;
  code: string;
  scans: number;
  percentage: number;
}

export interface TopLocationsProps {
  locations?: LocationData[];
}

export function TopLocations({ locations: externalLocations }: TopLocationsProps = {}) {
  const items = externalLocations !== undefined ? externalLocations : [];

  return (
    <Card className="col-span-full md:col-span-6 xl:col-span-4">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold">Top Scan Locations</CardTitle>
        <CardDescription>Geographic density across global scan points</CardDescription>
      </CardHeader>

      <CardContent className="space-y-3.5 pt-1">
        {items.length === 0 ? (
          <EmptyState
            preset="locations"
            variant="card"
            className="border-none bg-transparent p-4"
          />
        ) : (
          items.map((loc) => (
            <div key={loc.code} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-muted text-muted-foreground border border-border">
                    {loc.code}
                  </span>
                  <span className="font-medium text-foreground">{loc.country}</span>
                </div>
                <div className="flex items-center gap-2 tabular-nums">
                  <span className="text-muted-foreground">{loc.scans.toLocaleString()}</span>
                  <span className="font-semibold text-foreground">{loc.percentage}%</span>
                </div>
              </div>

              <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full bg-primary/80 transition-all"
                  style={{ width: `${loc.percentage}%` }}
                />
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}

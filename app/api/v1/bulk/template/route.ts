import { NextResponse } from "next/server";
import { generateCanonicalBulkTemplate } from "@/lib/domains/bulk-qr";

/**
 * GET /api/v1/bulk/template
 * Downloads the official NXTQR bulk QR creation CSV template.
 */
export async function GET() {
  const csvContent = generateCanonicalBulkTemplate();

  return new NextResponse(csvContent, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="nxtqr-bulk-template.csv"',
      "Cache-Control": "public, max-age=86400, s-maxage=86400",
    },
  });
}

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Solutions",
  description:
    "Tailored QR infrastructure solutions for enterprise retail, smart packaging, event management, and global supply chain logistics.",
};

export default function SolutionsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

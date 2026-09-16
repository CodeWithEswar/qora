# Qora — Smart QR Platform & Intelligence

Qora is a premium QR infrastructure and campaign-management SaaS platform built for creators, agencies, developers, and enterprise teams.

## Features Built in Phase 1

- **Mistral AI Design System**: Saturated Mistral Orange (`#fa520f`), warm cream surfaces (`#fff8e0`), hairline borders, and signature Sunset Stripe band.
- **Editorial Typography**: `Cormorant Garamond` serif displays paired with `Inter` UI and `JetBrains Mono` code blocks.
- **Responsive Application Shell**: Sticky topbar, dynamic breadcrumbs, collapsible sidebar (240px $\leftrightarrow$ 68px icon mode with tooltips), and mobile drawer.
- **Global Command Palette (`⌘K` / `Ctrl+K`)**: Fast search across QR codes, campaigns, actions, and settings with keyboard navigation.
- **Overview Dashboard**: High-fidelity KPI metric cards with sparklines, interactive Scan Activity area chart (7D/30D/90D), device breakdown donut chart, top performing QR codes table with row actions, geographic distribution, and Qora Guardian link health overview.
- **Routing Infrastructure**: App Router architecture with multi-tenant workspace parameter `/[orgSlug]` and complete navigation route stubs.

## Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router + Turbopack)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4 + Semantic Design Tokens
- **Themes**: `next-themes` (Light, Dark, and System modes)
- **Charts**: Recharts
- **Icons**: Lucide React & `@hugeicons/react`
- **Headless Primitives**: Radix UI (`@radix-ui/react-dialog`, `@radix-ui/react-dropdown-menu`, `@radix-ui/react-tooltip`, `@radix-ui/react-tabs`, etc.)

## Getting Started

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) (or port 3001) in your browser.

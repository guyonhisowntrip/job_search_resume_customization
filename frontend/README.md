# Frontend (Next.js App Router)

Production-grade frontend for the resume-to-portfolio SaaS flow.

## Features
- Step-based wizard: `Upload -> Edit -> Template -> Preview -> Deploy`
- Autosave for resume editing (local persistence)
- Low-confidence extraction highlights
- Split-screen live preview using the same portfolio renderer as public pages
- Dynamic public route: `/<username>` (SSR)
- Loading skeletons and route-level error boundaries

## Tech Stack
- Next.js (App Router)
- Tailwind CSS
- Framer Motion
- Lucide icons
- React hooks + Context (no Redux)

## Requirements
- Node.js 18+

## Setup
```bash
cd frontend
npm install
```

## Environment
Create `frontend/.env.local`:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

## Run
```bash
npm run dev
```

## Build
```bash
npm run build
npm start
```

## Project Structure
```txt
src/
  app/
    page.tsx
    upload/page.tsx
    edit/page.tsx
    templates/page.tsx
    preview/page.tsx
    deploy/page.tsx
    deploy/success/page.tsx
    [username]/page.tsx
  components/
    layout/
    editor/
    portfolio/
    providers/
    ui/
  context/
    wizard-context.tsx
  lib/
    api.ts
    confidence.ts
    validation.ts
    storage.ts
    templates.ts
    wizard-steps.ts
```

## Notes
- Public portfolio rendering is centralized in `src/components/portfolio/portfolio-renderer.tsx`.
- API communication is centralized in `src/lib/api.ts`.
- Template extensibility starts from `src/lib/templates.ts`.

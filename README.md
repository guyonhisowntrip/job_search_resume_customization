# Resume Portfolio App (Next.js App Router)

Production-grade resume-to-portfolio app.

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
npm install
```

## Environment
Create `.env.local`:

```env
LLM_API_KEY=
LLM_API_URL=https://generativelanguage.googleapis.com/v1beta/models
LLM_MODEL=gemini-1.5-flash
PUBLIC_BASE_URL=http://localhost:3000
UPLOAD_TOKEN_SECRET=
# Optional. Leave empty for same-origin API calls.
NEXT_PUBLIC_API_BASE_URL=
# Optional server-side override for API base URL.
API_BASE_URL=
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
    api/
      resume/upload/route.ts
      resume/parse/route.ts
      portfolio/deploy/route.ts
      portfolio/[username]/route.ts
      job-match/evaluate/route.ts
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
  templates/
    portfolio-v1/
  lib/
    api.ts
    server/
      config.ts
      job-match.ts
      llm.ts
      pdf.ts
      store.ts
      upload-token.ts
    confidence.ts
    validation.ts
    storage.ts
    templates.ts
    wizard-steps.ts
```

## Notes
- Public portfolio rendering is centralized in `src/components/portfolio/portfolio-renderer.tsx`.
- API communication is centralized in `src/lib/api.ts`.
- Backend APIs are implemented as Next.js route handlers under `src/app/api`.
- Template extensibility starts from `src/lib/templates.ts`.
- Template source files live in `src/templates/`.

# n8n Import Guide (Job Match + Resume Enhancement)

## Import Workflow
1. Open n8n.
2. Go to `Workflows` -> `Import from File`.
3. Select `docs/n8n/job-match-enhancement-workflow.json`.
4. Save and activate the workflow.

## Webhook URL
- Path configured in workflow: `job-match-enhancement`
- Use the production webhook URL in app `.env.local`:

```env
N8N_JOB_MATCH_WEBHOOK_URL=https://<your-n8n-host>/webhook/job-match-enhancement
```

## Required n8n Environment Variables
Configure these on your n8n instance:

```env
LLM_API_KEY=<gemini-api-key>
LLM_MODEL=gemini-1.5-flash
LLM_API_URL=https://generativelanguage.googleapis.com/v1beta/models
N8N_WEBHOOK_SECRET=<optional-shared-secret>
```

If `N8N_WEBHOOK_SECRET` is set, set the same value in app `.env.local` as `N8N_WEBHOOK_SECRET`.

## Request/Response Contract
Incoming request body:
- `resumeData` object
- `jobDescription` string

Outgoing response body (must remain this shape):
- `originalScore` number
- `improvedScore` number
- `improvedResume` object
- `analysis` string

If n8n fails or returns invalid output, app falls back to built-in LangChain logic automatically.

# EveryGyan article automation

This package generates one inactive n8n workflow for every active EveryGyan category. Each workflow:

1. reads recent stories from free RSS sources and keeps the best ten candidates;
2. asks an analyst model to identify one well-supported angle;
3. creates an eight-section JSON outline;
4. loops over the outline and writes one section at a time;
5. aggregates and polishes the sections into an original article of no more than 2,500 words;
6. generates a 16:9 featured image and stores it in Supabase Storage;
7. creates a draft article, category link and tags in Supabase.

The workflows never publish articles. Source URLs are retained in the article metadata, and factual claims are required to carry inline source links for editorial review.

## Required secrets

Copy `.env.n8n.example` to a private file outside Git, fill in the values, and add them to the n8n container environment. The existing OpenRouter key works; a dedicated key named `EveryGyan n8n` is recommended so it can be revoked independently. Do not use an OpenRouter management key. The Supabase value must be the existing service-role key, never the publishable browser key.

The workflows use `$env` expressions. If the n8n container blocks environment access in nodes, set `N8N_BLOCK_ENV_ACCESS_IN_NODE=false` for this trusted local instance. Restarting or recreating the container is required when its environment changes; the `n8n_data` Docker volume preserves workflows and credentials.

## Model routing

- Business: `inclusionai/ling-3.0-flash-fin:free`
- Nutrition, Fitness and Wellbeing: `inclusionai/ling-3.0-flash-sante:free`
- Other categories: `nvidia/nemotron-3-ultra-550b-a55b:free`
- Polish fallback: `google/gemma-4-31b-it:free`
- Final availability fallback: `openrouter/free`
- Image: `bytedance-seed/seedream-5-0-lite` (currently zero-priced; verify before activation)

Free model availability and limits change. The workflows are inactive on import and scheduled so no more than three categories run on a day. Review OpenRouter pricing before activation.

## Generate and import

Run `node scripts/generate-n8n-workflows.mjs` from the website repository. The resulting JSON files are written to `automation/n8n/workflows/` and can be imported through n8n's **Import from File** action or the n8n CLI. Configure the environment values before activating any workflow.

For this local Docker instance, copy `.env.n8n.example` to `.env.n8n.local` and fill in the real values. The local file is ignored by Git. Recreate the container with the same named volume so all existing n8n data is preserved:

```powershell
docker stop n8n
docker rm n8n
docker run -d --name n8n --restart unless-stopped -p 5678:5678 --env-file automation/n8n/.env.n8n.local -e N8N_BLOCK_ENV_ACCESS_IN_NODE=false -e TZ=Europe/Berlin -v n8n_data:/home/node/.n8n n8nio/n8n
```

Open `http://localhost:5678`, manually run one low-risk category, verify that its draft appears in the EveryGyan dashboard, and only then activate schedules. Never activate all workflows at once on a new key.


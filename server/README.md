# INVISDOM movie AI — Cloudflare Free

The AI backend now uses **Cloudflare Workers AI** through the account's `AI` binding. It uses `@cf/meta/llama-3.1-8b-instruct-fp8`; no OpenAI account or paid OpenAI API key is needed.

**Status:** the GitHub page remains a clearly labelled sample-poster preview until this Worker is deployed and its actual HTTPS URL is configured in `movie/config.js`. Updating this source alone does not activate AI.

## Stay on the free plan

Use **Workers Free**. Cloudflare currently includes 10,000 AI Neurons per UTC day; the number of movie generations depends on token usage and other AI usage in the account. When the free allocation runs out, requests fail until the allowance resets. Do not upgrade to Workers Paid or enable a paid fallback to keep this app free. On an already-paid account, additional usage may be billable; verify the account plan before deployment.

## Activate

1. Sign into your own Cloudflare account and confirm the Workers plan is **Free**. Account creation or new model licence acceptance must be completed by the account owner.
2. Deploy `server/worker.mjs` with the official Wrangler CLI, using `server/wrangler.jsonc`. It declares both the Workers AI binding and the SQLite-backed `MovieQuota` Durable Object. Run the deployment from `server/` so the relative module import resolves to `movie/core.mjs` in this repository.
3. Add a long random `RATE_LIMIT_SALT` as a Worker **secret**, using interactive secret entry or the Cloudflare dashboard. This protects the daily IP hashes. Do not put real secrets in GitHub, `config.js`, command arguments, or chat. No provider API key is used.
4. Use the actual provider-assigned URL ending in `/api/movie` as `apiUrl` in `movie/config.js`. The URL is public configuration; credentials are never added to frontend code.
5. Test real generation, bad input, limits, failures and mobile sharing. Confirm the page says **AI MOVIE STUDIO** and a new result says **YOUR AI MOVIE**. Until that is verified, describe the site as a sample preview.

## Behaviour and privacy

- The Worker accepts only POST and OPTIONS at `/api/movie` from the configured browser origin, `https://ashif-6644.github.io`.
- Maximum request body: 4 KiB. First name: 40 characters. Scene: 8–360 characters. Six allowed moods.
- One atomic singleton limits AI attempts to 100 per UTC day globally and 5 per salted daily IP hash by default. Failed generation attempts also count. Request quota failures stop generation.
- Browser inputs are sent to Cloudflare Workers AI. This app does not store or log names, scenes or movie text. It stores only daily counters and salted daily IP hashes. Cloudflare's applicable service data policies and infrastructure metadata handling still apply.
- AI JSON is validated before it is returned. There is one model call per accepted attempt; there are no automatic retries or paid-provider fallbacks. Provider details and private values are not returned to visitors. Responses are not cached.
- Origin checks protect browsers; non-browser clients can spoof Origin. The global cap also limits abuse, though deliberate misuse can exhaust the shared allowance. Cloudflare's account-level daily free allocation applies independently.
- GitHub Pages hosts only static files and never runs this Worker.

## Checks

Run `node --test tests/movie.test.mjs` from the repository root. Tests stub Workers AI and storage and cover successful output, invalid output, request quotas, daily free-limit errors, and provider failures. They do not call a real model. Verify bindings, transactional storage and account limits in Cloudflare before activation.

Official references: [Workers AI pricing](https://developers.cloudflare.com/workers-ai/platform/pricing/), [AI binding](https://developers.cloudflare.com/workers-ai/configuration/bindings/), [Llama model](https://developers.cloudflare.com/workers-ai/models/llama-3.1-8b-instruct-fp8/), [JSON mode](https://developers.cloudflare.com/workers-ai/features/json-mode/).

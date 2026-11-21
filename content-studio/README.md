# Content Studio: direct AI generation

This upgrade replaces displayed writing prompts with draft content returned by a real Cloudflare Workers AI model. Captions, carousels, reel scripts and WhatsApp use different deliverables. The browser renders returned text in a readonly textarea, never as HTML. Prompt echoes, empty output, oversized output, English WhatsApp drafts over 80 words and WhatsApp hashtags are rejected. These checks do not prove factual accuracy or writing quality; review real generations before launch.

## Activation required

This source is **not activated**. The default `config.js` has an empty endpoint. Generate is disabled until a real endpoint is configured; no templates are silently substituted for AI output.

1. Deploy `server/worker.mjs` from `server/` using the existing `wrangler.jsonc`, with its Workers AI binding and MovieQuota Durable Object. The worker supports both `/api/movie` and `/api/content`.
2. Configure the `RATE_LIMIT_SALT` Worker secret through Cloudflare. Never put secrets in the repository, browser, or chat. Keep ALLOWED_ORIGINS set to the actual website origin.
3. Set `apiUrl` in `content-studio/config.js` to the provider-assigned HTTPS URL ending in `/api/content`. This URL is public configuration, not a credential.
4. Test real English and Arabic generations for each format, failures, quota responses, copying, regeneration, editing during requests and mobile layout before releasing the branch.

Both API routes share the existing global atomic quota: 100 attempts per UTC day and 5 per daily salted IP hash by default, including failed calls. No briefs or generated text are stored by the app. Daily counters and salted IP hashes are stored; Cloudflare service policies still apply. Origin checks are not authentication and non-browser clients can spoof them. Check the account plan and provider usage before deployment; this change does not authorize a paid upgrade.

## Checks

`node --test content-studio/core.test.mjs tests/content.test.mjs tests/movie.test.mjs`

All provider tests use a stub. They verify routing, input validation, format instructions, output handling, quotas and movie regression behaviour. They do not verify a deployed model or its writing quality.

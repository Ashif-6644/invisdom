# INVISDOM Content Studio

A responsive, dependency-free AI prompt builder for social media briefs. Supports captions, six-slide carousels, 30-second reel scripts and WhatsApp messages in English, Arabic or both.

Open `content-studio/` on the existing GitHub Pages website. For local use, serve the repository with `python3 -m http.server 8000`, then visit `http://localhost:8000/content-studio/` (JavaScript modules need HTTP).

Fill out the brief, build the prompt, then copy it into ChatGPT. Prompts can also be downloaded as text. This is a local prompt builder, not an AI model or automatic generation endpoint. No API key, backend, analytics or browser storage is used. Opening ChatGPT is a separate user action; pasting and submitting there shares the prompt with that service. Review all generated claims and translations before publication.

Run `node --test content-studio/core.test.mjs` for prompt validation checks. No live AI service is called.

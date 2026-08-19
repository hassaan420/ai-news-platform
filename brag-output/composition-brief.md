# Hyperframes Composition Brief: Clarion AI

## Objective
Create a short launch-style brag video for Clarion AI.

## Output
- Composition directory: `brag-output/composition/`
- Rendered video: `brag-output/brag.mp4`
- Format: landscape — 1920x1080
- Duration: 20 seconds

## Source Material
- Project root: `c:\Users\hp\ai-news-platform`
- Primary files read: `frontend/index.html`, `frontend/src/pages/Home.tsx`, `frontend/src/index.css`
- Product name: Clarion AI
- Tagline / strongest claim: Intelligent, objective, and calm. AI-curated news for the discerning reader.
- Key UI or visual moment to recreate: The dark-mode article cards showing AI Sentiment (e.g. "Sentiment: Positive") and the AI Summary bullets.
- Copy that must appear verbatim:
  - Clarion AI
  - Intelligent, objective, and calm.
  - AI-curated news for the discerning reader.

## Creative Direction
- Tone preset: polished
- Creative direction: Quiet premium product film
- Interpretation: Pacing is deliberate with longer holds on text. The visual energy is restrained, elegant, and confident. No flashy animations—just smooth fades and clean slides.
- Angle: A premium, sophisticated news service that cuts through the noise. It feels less like a loud startup and more like an established, intelligent concierge curating the world's most important information just for you.
- Hook: The screen is dark (hsl(228 15% 7%)). Soft, slow-typing typography appears in stark white: "Clarion AI." The tagline fades in gently beneath it: "Intelligent, objective, and calm."
- Outro / punchline: "AI-curated news for the discerning reader."
- Avoid:
  - Generic SaaS language
  - Abstract filler visuals
  - Unrelated visual redesign

## Visual Identity
- Background: hsl(228 15% 7%)
- Text: hsl(220 14% 92%)
- Accent: hsl(243 80% 72%)
- Display font: Inter
- Body font: Hanken Grotesk
- Visual references from the project: Dark mode UI (`.dark`), subtle shadow elevation (`shadow-premium`), muted borders (`border-border`), and the sentiment badge (using accent color).

## Storyboard
Use the storyboard in `brag-output/brag-plan.md` as the creative contract.

Scene summary:
1. The Hook — 4s — "Clarion AI" typing in, tagline fades beneath it.
2. The Signal — 6s — Article card expands showing AI Summary bullets and Sentiment badge.
3. The Concierge — 6s — "For You" personalized feed with 3 cards sliding in.
4. The Outro — 4s — "AI-curated news for the discerning reader." fading out to just the logo.

## Audio
- Audio role: cinematic support
- Audio arc: A low, slow-building cinematic bed punctuated by sparse, professional UI accents and typing ticks.
- Music: cinematic (choose a fitting track from assets or leave blank if none available)
- Music treatment: Low music bed, gentle fade-in, fading out under the final logo.
- Music cue guidance: detect at composition via analyze_music_cues.py / hyperframes beats. Target 1-2 strong cues for the main scene transitions.
- Audio-reactive treatment: subtle; background warmth and slight depth on the article cards responding to RMS.
- Audio-coupled moments:
  - Scene 1 — typing the hook line with soft key ticks
  - Scene 2 — soft clicks as the sentiment badge and keywords pop in sequentially
  - Scene 3 — muted card-slide whoosh for 3 cards sliding in
- SFX selection guidance: sparse professional accents; soft ticks for typing text, clean wooshes for card slides.
- SFX analysis guidance: use lower high-frequency-risk sounds for repeated or polished moments.
- Exact SFX choice: Hyperframes should choose filenames, timestamps, density, and volume based on the implemented animation.
- Audio files: copy the chosen music and any Hyperframes-selected SFX into `brag-output/composition/assets/`

## Hyperframes Instructions
Load the composition-building Hyperframes domain skills — `hyperframes-core` (composition contract + `data-*` timing), `hyperframes-animation` (motion), `hyperframes-creative` (design spec, beats, audio-reactive), `hyperframes-keyframes` (seek-safe keyframes), and `hyperframes-cli` (lint/check/render). /brag is its own workflow: do not enter the `hyperframes` entry-point intent interview and do not route into its generic promo / launch-video workflow. Prefer native Hyperframes conventions over anything in `/brag`.

Requirements:
- Show at least one real UI, copy, or visual element from the source project.
- Keep all text readable in the final render.
- Keep the video within 15-25 seconds.
- Include the planned music/SFX layer unless audio was explicitly disabled or documented as intentionally silent.
- Treat `/brag` audio notes as guidance, not a fixed cue sheet. Choose SFX after the visual animation exists.
- Treat music cue metadata as optional timing hints. Hyperframes decides exact animation timing and should ignore cues that hurt readability, scene pacing, or the product story.
- Major reveals may move toward nearby strong cues within about 0.15s. Smaller entrances may align to nearby beat points within about 0.10s. Use only 1-3 strong cue locks in a 15-25s video unless the edit clearly benefits from more.
- Use SFX to support motion and interaction: card sounds for card-like reveals, short announcement cues for major payoffs, key/click sounds for text or user actions, and restraint when the edit is already busy.
- Honor planned music treatment such as fade-outs, ducking, beat-aligned reveals, or letting a final SFX ring over the music, using the best Hyperframes-supported implementation.
- When music is present and the treatment is not `none`, consider Hyperframes audio-reactive workflow: extract audio data and use RMS/frequency bands for subtle, brand-specific motion. Good targets are glow, depth, background warmth, card presence, title emphasis, or other existing visual elements. Avoid waveform/equalizer visuals, musical-note graphics, generic particle systems, strobing, or heavy pulsing.
- Use local assets for audio and any required runtime/media dependencies when possible.
- Run `hyperframes check` before render — it is brag's single gate.

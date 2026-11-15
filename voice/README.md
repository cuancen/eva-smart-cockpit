# EVA Voice Generation Pack

This folder is the handoff boundary for recorded EVA voice assets.

## Current production pack

The current in-demo EVA language is English. The reviewed production handoff lives in [`en-US/`](en-US/README.md): 21 formal-demo lines, 9 standalone OMS lines, fixed runtime/UI speech, checksums, and per-file QA. Its 69 MP3 assets are integrated under `public/audio/eva/en-US/`.

The Simplified Chinese manifests in this directory are retained as an archived localization alternative. They are no longer the default application copy or audio source.

The application integration uses `voice_id`, not visible text. For any replacement pack, keep the exact `file_name` and make `spoken_text` identical to the in-demo subtitle source. Playback completion remains the timing authority, so do not trim final words or append long silence.

## Manifest fields

- `voice_id`: stable application key.
- `scene`: owning experience.
- `spoken_text`: approved script in the manifest language.
- `audience`: `driver`, `rear-right`, or the whole `cabin`.
- `tone`: performance state used by the EVA expression and voice direction.
- `target_duration_sec`: recording must finish within this time without clipped final words.
- `file_name`: exact integration filename.
- `performance_direction`: line-specific acting note.
- `status`: `priority`, `secondary`, `generate`, or `template`.

For the current delivery, start with `en-US/README.md`, `en-US/EVA_VOICE_QA_en-US.csv`, and `en-US/SHA256SUMS.txt`. The Chinese review and generation guide remain useful only when producing a future Chinese localization. Do not add music, cabin ambience, sound effects, vocoder effects, or a second speaker.

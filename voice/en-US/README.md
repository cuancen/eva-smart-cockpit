# EVA English Voice Generation Pack (en-US)

Delivery date: 2026-08-23

Voice: in-car EVA reference, neutral American English

Scope: voice assets only; no lip-sync or digital-human video

## Contents

- `audio/`: 69 fixed MP3 voice assets.
- `eva_full_demo_voice_en-US.csv`: 21 full-demo lines.
- `eva_oms_standalone_voice_en-US.csv`: 9 OMS standalone lines.
- `eva_runtime_voice_en-US.csv`: 49 runtime rows, including 39 fixed lines and 10 dynamic templates.
- `EVA_VOICE_QA_en-US.csv`: per-file duration, loudness, peak, Whisper transcript, and acceptance result.
- `SHA256SUMS.txt`: SHA-256 checksums for every payload file except the checksum file itself.

## Audio specification

- MP3, 128 kbps CBR, 48 kHz, mono.
- Integrated loudness centered near -18 LUFS; true peak no higher than -1.5 dBTP.
- Approximately 80 ms of head silence and 180 ms of tail silence.
- No music, ambience, reverb, prompt tone, spatial processing, or second speaker.
- All fixed assets end within their corresponding `target_duration_sec` values.

## Dynamic templates

The 10 rows below intentionally have no audio files. Their variable names are preserved exactly and only the fixed wording is translated:

- `rt08_commute_eta` — variables: {minutes}
- `rt13_temperature_down` — variables: {temperature}
- `rt14_temperature_up` — variables: {temperature}
- `rt16_music_switch` — variables: {music_mode}
- `rt17_massage` — variables: {on_or_off}
- `rt18_navigation_eta` — variables: {distance}, {minutes}
- `rt26_rest_hold` — variables: {minutes}
- `rt27_memory_location` — variables: {item}, {location}
- `rt29_exit_reminder` — variables: {important_items}
- `rt39_fatigue_care` — variables: {perclos_value}

At runtime, substitute the variables first and synthesize the completed sentence. Do not treat missing template audio as a packaging error.

## Performance direction

The pack uses one EVA reference voice and fixed main seed `20260823`. Warm and caring lines remain personal and restrained; cautious lines are alert but controlled; urgent lines are firm and faster without shouting. Safety instructions and driver-responsibility wording are retained in full.

#!/usr/bin/env python3
"""Burn storytelling captions into the existing portrait story video."""
import subprocess, os

INPUT  = "/home/user/data-connect-flow/saros_story.mp4"
OUTPUT = "/home/user/data-connect-flow/saros_story_captioned.mp4"
FONT   = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"

# (start_s, end_s, caption_text)
# Timeline anchored to what's visible in each clip:
#   Clip 0:  0:00 – 0:29.7   opening cinematic — desert, sun, medallion, couple
#   Clip 1:  0:29.7 – 0:36.4  spiral eclipse vortex (apocalypse begins)
#   Clip 2:  0:36.4 – 1:15.3  chaos — monster, hero, combat
#   Clip 3:  1:15.3 – 1:25.0  biomech creature in corridor
#   Clip 4:  1:25.0 – 1:36.6  couple returns to face the storm
captions = [
    (3,   8,  "A world lived in cycles."),
    (9,   14, "Every 18 years, the sun would hide."),
    (15,  20, "They called it Saros."),
    (22,  28, "Two people. One last quiet eclipse."),
    (30,  36, "Until the cycle broke."),
    (38,  45, "Something ancient tore through the sky."),
    (47,  55, "I was sent to face it."),
    (57,  65, "Outgunned. On the ground. Still fighting."),
    (76,  84, "The answers weren't in the fire."),
    (85,  91, "They were waiting for me."),
    (92,  96, "We came back. Together."),
]

# Build a chain of drawtext filters
dt_chain = []
for start, end, text in captions:
    # escape single quotes for ffmpeg
    safe = text.replace("'", "\\'").replace(":", "\\:")
    dt_chain.append(
        f"drawtext=text='{safe}'"
        f":fontfile={FONT}"
        f":fontsize=58"
        f":fontcolor=white"
        f":x=(w-text_w)/2"
        f":y=h*0.82"
        f":box=1:boxcolor=black@0.55:boxborderw=18"
        f":shadowx=2:shadowy=2:shadowcolor=black@0.8"
        f":enable='between(t\\,{start}\\,{end})'"
    )

vf = ",".join(dt_chain)

cmd = [
    "ffmpeg", "-y",
    "-i", INPUT,
    "-vf", vf,
    "-c:v", "libx264", "-preset", "fast", "-crf", "22",
    "-c:a", "copy",
    "-pix_fmt", "yuv420p",
    "-movflags", "+faststart",
    OUTPUT,
]

print("Adding storytelling captions…")
result = subprocess.run(cmd)
if result.returncode == 0:
    size_mb = os.path.getsize(OUTPUT) / 1_048_576
    print(f"\nDone! {OUTPUT}  ({size_mb:.1f} MB)")
else:
    print("FFmpeg failed.")

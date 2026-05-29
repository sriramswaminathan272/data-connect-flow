#!/usr/bin/env python3
"""Combine 5 Saros gameplay clips into a 1080x1920 Instagram Story."""
import subprocess, os

UPLOAD_DIR = "/root/.claude/uploads/cfa2c331-45db-4c0d-ae84-3da8458d7e67"
OUTPUT = "/home/user/data-connect-flow/saros_story.mp4"
FONT = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"

# Chronological order by hex timestamp embedded in filename
videos = [
    f"{UPLOAD_DIR}/43bdebc3-19e509214c645master_playlist.mp4",   # 29.7s
    f"{UPLOAD_DIR}/d95016ac-19e5092a3923master_playlist.mp4",    #  6.8s
    f"{UPLOAD_DIR}/28fb5405-19e5092dc2245master_playlist.mp4",   # 38.9s
    f"{UPLOAD_DIR}/bec85b42-19e5093656063master_playlist.mp4",   #  9.6s
    f"{UPLOAD_DIR}/f8ebc32c-19e5093b77376master_playlist.mp4",   # 11.6s
]
n = len(videos)

# --- build filtergraph ---
# Each landscape clip → blur background (fill frame) + original centred on top
parts = []
for i in range(n):
    # background: scale up to cover 1080×1920 portrait, then blur
    parts.append(
        f"[{i}:v]scale=-1:1920,crop=1080:1920,boxblur=15:15[bg{i}]"
    )
    # foreground: fit to 1080 wide, keep aspect ratio (→ 1080×607)
    parts.append(
        f"[{i}:v]scale=1080:-2[fg{i}]"
    )
    # overlay foreground centred on background
    parts.append(
        f"[bg{i}][fg{i}]overlay=(W-w)/2:(H-h)/2[v{i}]"
    )

# concatenate all clips
av_pairs = "".join(f"[v{i}][{i}:a]" for i in range(n))
parts.append(f"{av_pairs}concat=n={n}:v=1:a=1[cv][ca]")

# title overlay: "SAROS" centred, visible for first 3 s
title_text = "SAROS"
parts.append(
    f"[cv]drawtext=text='{title_text}'"
    f":fontfile={FONT}:fontsize=130:fontcolor=white"
    f":x=(w-text_w)/2:y=(h-text_h)/2"
    f":shadowx=4:shadowy=4:shadowcolor=black@0.9"
    f":enable='between(t,0,3)'[outv]"
)

filter_complex = "; ".join(parts)

cmd = ["ffmpeg", "-y"]
for v in videos:
    cmd += ["-i", v]
cmd += [
    "-filter_complex", filter_complex,
    "-map", "[outv]",
    "-map", "[ca]",
    "-c:v", "libx264", "-preset", "fast", "-crf", "22",
    "-c:a", "aac", "-b:a", "128k",
    "-pix_fmt", "yuv420p",
    "-movflags", "+faststart",
    OUTPUT,
]

print("Building Instagram Story (1080×1920, ~96 s) …")
print(f"Output → {OUTPUT}\n")
result = subprocess.run(cmd, capture_output=False)
if result.returncode == 0:
    size_mb = os.path.getsize(OUTPUT) / 1_048_576
    print(f"\nDone!  {OUTPUT}  ({size_mb:.1f} MB)")
else:
    print("\nFFmpeg failed.")

---
# ============================================================================
# NEW POST TEMPLATE — this folder is never published (it starts with "_").
#
#   1. Copy this whole folder and rename the copy, e.g. "spring-launch-reel"
#      (lowercase, dashes, no spaces). The name is only for you.
#   2. Drop the post's files into the copy:
#        carousel / single image → 1.jpg, 2.jpg, 3.jpg …  (jpg, png or webp)
#        Reel / TikTok           → video.mp4 and a cover image, cover.jpg
#   3. Fill in the lines below. Keep the ones for your post type, delete the
#      other block. Lines starting with # are notes and can stay or go.
#
# Alt text (the `alt:` lines) describes what the image or video shows, for
# people who can't see it. Leave "TODO" and Claude can write it for you.
# ============================================================================

# instagram-post  = feed post or carousel
# instagram-reel  = Reel
# tiktok-video    = TikTok
type: instagram-post

# A short internal name. Not shown on the card.
title: "Spring launch carousel"

# The real caption, exactly as posted (hashtags included).
caption: "Your caption here. #hashtag"

# Optional — delete any you don't have.
date: 2026-09-25     # when it was posted
order: 30            # lower shows first
# category: reel     # reel, post or carousel. Leave it out and it's worked
#                    # out for you: one image/video = post, several = carousel

# ---- CAROUSEL / IMAGE POST (type: instagram-post) ---------------------------
ratio: "4x5"           # 4x5 (portrait, usual), 1x1 (square), 3x4, 16x9 or 191x100 (landscape)
slides:
  - image: "./1.jpg"
    alt: "TODO"
  - image: "./2.jpg"
    alt: "TODO"
# A video can be a slide too (a 4:5 or landscape video shows as a post):
#  - video: "./video.mp4"
#    poster: "./cover.jpg"
#    alt: "TODO"

# ---- "HOW I MADE IT" PAGE (optional) ---------------------------------------
# Fill any of these and the card gets a "How I made it" link to its own page.
# tools: ["Premiere Pro", "After Effects", "Photoshop"]
# screens:                     # workspace screenshots, dropped in this folder
#   - image: "./premiere-1.png"
#     alt: "TODO"
#     note: "One line about what the screenshot shows"
# The write-up goes BELOW the closing --- line, as normal text.

# ---- REEL / TIKTOK (type: instagram-reel or tiktok-video) ------------------
# audio: "Original audio"
# video:
#   src: "./video.mp4"
#   poster: "./cover.jpg"
#   alt: "TODO"
---

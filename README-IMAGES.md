# Working with images on this site

## Rule of thumb
Every image in `projects/` should be **WebP**, not PNG. The switch cut this
site's image weight from 2.4 MB to 173 KB with no visible quality loss.

- Card thumbnails (`image`): max **900px** on the long edge
- Full/modal images (`imageFull`, `gallery`): max **1800px**
- Target: under 200 KB for thumbnails, under 500 KB for full images

## Converting
Any of these work. Quality 82 is the sweet spot.

**Squoosh** (easiest, no install) — https://squoosh.app → drop the file,
choose WebP, quality 82, resize to the max above, download.

**ImageMagick** (batch):
```bash
convert input.png -resize "1800x1800>" -quality 82 output.webp
```

**Photoshop**: File → Export As → WebP.

## Social media creatives
Export at the platform's real dimensions, then set the matching `ratio`
in `js/projects.js` so the card isn't cropped oddly:

| Format | Export at | `ratio` |
|---|---|---|
| Instagram / Facebook square | 1080 × 1080 | `"1x1"` |
| Instagram portrait post | 1080 × 1350 | `"4x5"` |
| Story / Reel cover / TikTok | 1080 × 1920 | `"9x16"` |
| Facebook / LinkedIn landscape | 1200 × 675 | `"16x9"` |

For a **carousel**, name the files in order and list them in `gallery`:
`social-<name>-cover.webp`, `social-<name>-1.webp`, `social-<name>-2.webp` …

## After adding any image
```bash
node build.js
```
This regenerates the `/work/` pages and `sitemap.xml`. If you skip it, the
homepage updates but Google never sees the new project.

## The link preview image
`images/og-preview.jpg` (1200 × 630) is what LinkedIn, Facebook and Slack
show when someone shares the site. Regenerate it if the tagline changes.

---

# Video (Reels, animated posts)

## Format: MP4 only
**H.264 video + AAC audio, `yuv420p`, `+faststart`.** This is the only format
that plays everywhere, iOS Safari included.

- **Don't ship WebM.** ~30% smaller, but Safari support is patchy enough that
  you'd have to ship both files. Not worth it for a handful of videos.
- **Never use GIF.** A 10-second clip is 20-40 MB as a GIF versus 2-3 MB as
  MP4, with worse colour and no audio.

## Converting
```bash
ffmpeg -i reel.mov -c:v libx264 -profile:v main -pix_fmt yuv420p \
  -crf 23 -preset slow -vf "scale=1080:-2" \
  -c:a aac -b:a 128k -movflags +faststart social-myreel.mp4
```
Three flags matter:
- `+faststart` moves the index to the front so playback starts before the
  whole file downloads. Everyone forgets this one.
- `yuv420p` is what makes it play on Safari at all.
- `-crf 23` is the quality dial. Lower = better and bigger. 20-26 is sane.

No ffmpeg? **HandBrake** (free, GUI) — preset "Web > Gmail Large 3 Minutes
1080p30" gets you close; tick *Web Optimized* for faststart.

**Always export a poster too.** Without one the player is a black rectangle
until the video loads, and link previews have nothing to show:
```bash
ffmpeg -i social-myreel.mp4 -ss 00:00:03 -frames:v 1 social-myreel-poster.webp
```

## Size budget — this one is important
You are on GitHub Pages, and **git keeps every version of a file forever**.
Re-exporting an 8 MB Reel three times adds 24 MB to the repo permanently.
Your `.git` is already ~86 MB against a 22 MB working tree.

- Keep each video **under ~10 MB**. CRF 23 at 1080 wide puts a 15-second
  Reel around 3-5 MB.
- GitHub's hard limit is **100 MB per file**; they email you past **1 GB**.
- **Get the export right before you commit it.** Removing a committed video
  later means rewriting history.
- Past roughly a dozen videos, move them to Cloudflare Stream or Bunny and
  put the URL in `link` instead of hosting them here.

## Adding one
```js
video:         "projects/social-myreel.mp4",
videoPoster:   "projects/social-myreel-poster.webp",
videoRatio:    "9x16",          // Reel/Story. Also "1x1" | "4x5" | "16x9"
videoDuration: "PT15S",         // ISO 8601 — feeds the VideoObject schema
videoCaption:  "One line about the cut.",
// videoLoop: false,            // set for a video with a real ending
```
Then `node build.js`. A "Motion" section appears on the project page, and the
**gallery card plays the video itself** — muted, looping, and only once the
card scrolls into view (nothing is downloaded before that). Set `ratio` to
match the video's shape, or the card will crop it: a 9:16 Reel in a 4:5 card
loses about a third of the frame.

The player does **not** autoplay, deliberately: autoplaying video steals
bandwidth, fights screen readers, and competes with the work above it.
`preload="metadata"` fetches a few KB of header rather than the whole file.

## Don't embed Instagram's iframe
It looks like Instagram rather than your portfolio, loads third-party
tracking, breaks if the post goes private, and can't be styled. Self-host the
MP4 and link to the post separately if you want the engagement.

---
title: "devsign8.com"
shortTitle: "devsign8.com"
summary: "The live website for Devsign8, my design and digital marketing studio. I built it, I get it found, and I measure it."
seoTitle: "devsign8.com: Web Design and SEO"
description: "How devsign8.com was built: a fast, accessible agency website in light and dark, set up to be found on Google and in AI tools, and measured monthly."
category: "My studio's website"
cats:
  - "web"
tags:
  - "Web Design"
  - "SEO"
  - "Accessibility"
  - "Analytics"
cover: "../../assets/stages/devsign8-site-desktop.webp"
coverAlt: "The devsign8.com homepage in dark mode on a desktop screen: \"Branding, websites, and SEO that help your business get found online.\" with a \"Get a free audit\" button."
# The Work and Web Design cards draw the site as the home page does: desktop
# + phone, in the theme opposite the page (his call 2026-09-30). `cover`
# above stays for the share image.
coverSite: devsign8
role: "Founder: design, build, search and analytics"
year: "2026"
tools:
  - "HTML, CSS, JavaScript"
  - "Google Tag Manager"
  - "Google Analytics 4"
  - "Search Console"
  - "Bing Webmaster Tools"
externalUrl: "https://www.devsign8.com"
showcase: 1
featured: false
order: 5
# 2026-09-28, his call: devsign8.com is his company's REAL, live site, not a
# case study, and the portfolio is timeless (no visible dates). So the page
# leads with "Visit devsign8.com" (UTM-tagged, src/lib/utm.ts) and tells how
# the site works, stage by stage: #build, #be-found, #measure.
# Provenance (dates stay here, never on the page):
# - PageSpeed Insights, live site, mobile, 2026-09-28 7:42 pm EDT:
#   Performance 98, Accessibility 98, Best Practices 100, SEO 100,
#   LCP 1.5 s, CLS 0.005. Re-run 2026-09-29 after his site update:
#   Performance 90 (LCP 2.9 s, render-blocking Google Fonts). Fixed the same
#   night with Cloudflare Fonts; re-run twice: 96 and 97, LCP 2.0 s. The
#   chart uses 96 (the lower run). The 90 -> 96 fix is told in the Measure
#   chapter as the measure-then-improve example.
# - Search Console 2026-09-29 (16 months): 13 clicks / 57 impressions,
#   CTR 22.8%, average position 8.7.
# - Microsoft Clarity is NOT installed (not in the page, not in GTM), so it
#   is not claimed. Add it back when its GTM tag is live.
# - Search features checked live 2026-09-28: FAQPage (4 answers),
#   Organization + ProfessionalService schema, llms.txt, sitemap, meta
#   descriptions. launched = v3 deploy package date (2026-07-24), unconfirmed.
story:
  lede: "The live website for Devsign8, my design and digital marketing studio. I built it, I get it found, and I measure it."
  launched: 2026-07-24
  channel: "www.devsign8.com"
  channelLabel: "Live at"
  disclaimer: "Scores are PageSpeed Insights lab results on mobile. Real-visitor data joins them as traffic grows."
  chapters:
    - stage: build
      heading: "Built for every screen, in light and dark"
      body:
        - "Plain HTML, CSS and JavaScript, no framework. The site stays fast, secure and cheap to host."
        - "It follows each visitor's device into light or dark mode, and every page works from a small phone up to a wide desktop."
        - "Accessibility is built in from the start. AODA asks Ontario sites for WCAG 2.0 AA, and PageSpeed Insights scores devsign8.com 100 for accessibility on mobile."
      # Desktop + phone as on the home page's Build stage, the desktop in the
      # theme opposite the page and the phone in the other one, so the chapter
      # shows both light and dark (his call 2026-09-30). Shots in
      # config/site-shots.ts.
      visual:
        kind: site
        shots: devsign8
        mixed: true
    - stage: be-found
      heading: "Built to be found by people, Google and AI"
      body:
        - "People still Google a business, but more of them now ask ChatGPT, Copilot or Perplexity. The site is set up for all three."
        - "Every item below is live on devsign8.com, and every one of them is something your business can have too."
      visual:
        kind: table
        caption: "How devsign8.com gets found"
        columns: ["Search", "The goal", "On devsign8.com"]
        rows:
          - ["SEO", "Rank on Google and Bing", "A page for every service, a title and description written for real searches, and a sitemap. Google's SEO check: 100/100"]
          - ["AEO", "Be the answer", "Common questions answered in plain words, marked up as an FAQ so search engines can show them"]
          - ["GEO", "Get cited by AI tools", "The business described in structured data, an llms.txt guide for AI tools, and Bing Webmaster Tools, which feeds Copilot"]
    - stage: measure
      heading: "Measured, then improved, every month"
      body:
        - "Tracking runs through one Google Tag Manager container: GA4 for visits and every Book a call click. Search Console and Bing Webmaster Tools cover search."
        - "Of the people who see devsign8.com in Google results, 23% click through, and it ranks on page one on average. It is a small sample so far, so it is the trend I watch, not a trophy."
        - "Each month I read which searches bring people in and which pages keep them, then change one thing and check it the next month. One read found a font file holding up the first paint. Serving the fonts from the site's own domain took mobile speed from 90 to 96."
      visual:
        kind: chart
        groups:
          - metric: "PageSpeed Insights, mobile"
            unit: "/100"
            bars:
              - label: "Performance"
                value: 96
              - label: "Accessibility"
                value: 100
              - label: "Best practices"
                value: 100
              - label: "SEO"
                value: 100
        source: "PageSpeed Insights, www.devsign8.com, mobile"
  sources:
    - label: "PageSpeed Insights, www.devsign8.com (mobile)"
      url: "https://pagespeed.web.dev/analysis?url=https%3A%2F%2Fwww.devsign8.com%2F&form_factor=mobile"
    - label: "AODA: Integrated Accessibility Standards (websites and WCAG 2.0)"
      url: "https://www.ontario.ca/laws/regulation/110191"
---

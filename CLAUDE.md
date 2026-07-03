# varunzxzx.github.io

Personal portfolio + blog for Varun M. Rewritten July 2026 from Gatsby to plain Jekyll (v2).

## Stack & deployment
- Jekyll, built automatically by GitHub Pages. No Node, no build step, no CI config.
- Served from the `master` branch, root folder (Settings → Pages).
- Old Gatsby source is preserved on the `staging` branch. Never build from it; it's history only.
- Pushing to `master` deploys. Build status: repo Actions tab → "pages build and deployment".

## Structure
- `index.html` — homepage (hero, about, experience, writing list, contact)
- `_layouts/default.html` — shared head/nav/footer
- `_layouts/post.html` — blog article template
- `_posts/YYYY-MM-DD-slug.md` — blog posts; slug becomes URL `/blog/<slug>/`
- `blog/index.html` — post listing at /blog/
- `assets/css/main.css` — all styles
- `assets/img/` — post images + favicons + og.png (social card)
- `404.html`, `robots.txt`, `sitemap.xml`, `feed.xml` — hygiene pages; sitemap
  and feed are hand-rolled Liquid templates, no plugins
- `sw.js` — kill-switch service worker that evicts the old Gatsby PWA worker from
  returning visitors' browsers. KEEP THIS FILE FOREVER. Do not register any new
  service worker.

## Design system (do not drift from this)
- Warm charcoal + amber phosphor terminal aesthetic.
- CSS variables in `:root`: --bg #141210, --surface #1c1915, --line #2b2620,
  --ink #e9e2d3, --muted #968c78, --amber #f0a44a, --amber-dim #a9752f, --ok #8fae6e.
- Fonts: Archivo (display, weight 900 stretched 125%, uppercase) + IBM Plex Mono
  (labels, nav, metadata). Loaded from Google Fonts in the default layout.
- Section labels are shell commands ("$ cat about.md", "$ pstree varun").
- Experience is rendered as a process tree.
- Style rules: no em dashes anywhere in copy; minimal animation; respect
  prefers-reduced-motion; single accent color (amber).

## Content rules
- Owner: Varun M, self-taught engineer, Bengaluru. Currently at RapidClaims.ai
  (AI for healthcare revenue cycle). Previously SAP. Do not mention "New Delhi"
  in the about section.
- Keep RapidClaims bullets high-level; no client names or confidential details.
- Contact: varun995862@gmail.com; socials: github/linkedin/twitter @varunzxzx.

## Permalinks (do not break)
- `permalink: /blog/:title/` in _config.yml preserves old Gatsby URLs.
- Existing post slugs that must never change:
  - /blog/nodejs-not-so-single-threaded/
  - /blog/writing-babel-plugin/

## Open TODOs
(none — post migration, images, resume, favicons, OG image, sitemap, feed,
robots.txt and 404 page all done July 2026. Note: the resume at /resume-v2.pdf
is `varun-resume.pdf` from staging; there was never a file named resume-v2.pdf
on staging.)

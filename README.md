# varunzxzx.github.io — v2

Static site built with Jekyll (built automatically by GitHub Pages — no Node, no build step).

## Structure

```
_config.yml          Site config. Permalink /blog/:title/ preserves old Gatsby URLs.
_layouts/default.html  Shared chrome: head, nav, footer.
_layouts/post.html     Blog post template.
_posts/                Blog posts as markdown: YYYY-MM-DD-slug.md
assets/css/main.css    All styles.
blog/index.html        Blog listing page (/blog/).
index.html             Homepage.
```

## Writing a new post

Create `_posts/2026-07-15-my-new-post.md`:

```markdown
---
title: "My New Post"
date: 2026-07-15
tags: [ai, agents]
description: "One-line summary for SEO and social previews."
---

Your markdown here. Code blocks, images, headings are styled automatically.
```

The filename's slug becomes the URL: `/blog/my-new-post/`. The homepage and
/blog/ listing update automatically.

Images go in `assets/img/` and are referenced as `![alt](/assets/img/file.png)`.

## Running locally (optional)

```bash
gem install bundler jekyll
jekyll serve
# open http://localhost:4000
```

Not required — pushing to GitHub is enough.

# Coda for the Psion netBook: the website

A single static page: `index.html`, `styles.css`, `main.js`, `favicon.svg` and `img/`. No build step, no frameworks, no external requests.

Every image in `img/` is a real screenshot from the PsiCoda diary (github.com/danieledge/PsiCoda), or from the public PsiLinux repo for the Linux section, saved as lossless palette PNGs. Screenshots shown larger than their own size are switched to `image-rendering: pixelated` by `main.js`, so they stay crisp.

## Preview locally

Open `index.html` in a browser. That's all.

## Deploy to Cloudflare Pages

1. Push this folder to a GitHub repository.
2. Cloudflare dashboard, Workers and Pages, Create, Pages, Connect to Git, and pick the repository.
3. Framework preset: None. Build command: leave empty. Build output directory: `/`.
4. Deploy. The `_headers` file sets caching (images cached for 30 days, the page always revalidated) and a strict Content Security Policy.

Or without Git: `npx wrangler pages deploy . --project-name coda` from this folder.

If you change the one line inline script in `index.html`, update its `sha256` hash in the `Content-Security-Policy` line of `_headers`:

```
printf '%s' 'document.documentElement.classList.add("js")' | openssl dgst -sha256 -binary | base64
```

## Deploy to GitHub Pages

1. Push this folder to a GitHub repository.
2. Settings, Pages, Source: Deploy from a branch. Branch: `main`, folder `/ (root)`.
3. The site appears at `https://<user>.github.io/<repo>/`. All paths are relative, so it works from a subfolder.

GitHub Pages ignores `_headers`; it sets its own caching. Add an empty `.nojekyll` file if you ever add files or folders starting with an underscore that need serving.

## Custom domain

Either host lets you add one in its settings. Once the final address is known, change the `og:image` meta tag in `index.html` to the full URL (for example `https://example.com/img/system-coda.png`) so link previews show the picture.

## Adding the Office formats screenshots

The Office formats section in `index.html` sits between `<!-- OFFICE FORMATS` and `<!-- /OFFICE FORMATS -->`. It is typographic for now. Put the screenshots in `img/`, then uncomment the `.office-shots` figure at the end of that block and set its `src`, `width`, `height` and `alt`.

## Copy rules

British English, short plain sentences, no em or en dashes. Describe only what is finished.

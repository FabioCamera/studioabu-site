# studioabu.nz

Static website for STUDIOABU. (Fabio Camera). Plain HTML and CSS, no build step, hosted on Cloudflare Pages from this GitHub repo.

## Pages

| File | Page |
|---|---|
| index.html | Home: six project chapters |
| stx.html, taf.html, snag-co.html, elis.html, kids-unplugged.html, light-rio.html | Case studies |
| archive.html | Photo archive with filters |
| about.html | About + services (`about.html#services`) |
| contact.html | Project form |
| 404.html | Not found page |

Shared files live in `assets/` (style.css, main.js, favicon, posters, a few images).
Most images and the TAF videos load from the `FabioCamera/studioabu-media-vault` repo.

## Deploy on Cloudflare Pages

1. Push this folder to a new GitHub repo (e.g. `studioabu-site`).
2. Cloudflare dashboard → Workers & Pages → Create → Pages → Connect to Git → pick the repo.
3. Framework preset: **None**. Build command: *(empty)*. Output directory: `/`.
4. Deploy. You get a `*.pages.dev` address to check everything.
5. Pages project → Custom domains → add `studioabu.nz` and `www.studioabu.nz`.

Every push to `main` redeploys automatically. Cloudflare serves `/stx` for `stx.html`.

## Contact form (do this once)

1. Go to web3forms.com, enter `hello@studioabu.nz`, and copy the access key they email you.
2. In `contact.html`, replace `YOUR_WEB3FORMS_ACCESS_KEY` with that key.
3. Push. Messages arrive at hello@studioabu.nz.

## Before cancelling Base44

* Check the email records (MX, SPF, DKIM) are copied into Cloudflare DNS before switching nameservers.
* Set up redirects for old Base44 URLs in a `_redirects` file if any are shared or indexed, e.g. `/old-path /stx 301`.

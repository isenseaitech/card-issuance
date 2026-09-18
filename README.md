# Card Issuance

Dashboards for UBL Bank's Card Issuance & Operations. Everything here is static HTML/CSS/JS —
no build step, no backend; data is mocked client-side.

## Repository layout

```
card-issuance/
  dashboard/          Card Issuance & Operations executive dashboard (the live, modular app)
  vendor-dashboard/   Vendor Card Print dashboard — small React/JSX app compiled in-browser by Babel
```

Earlier single-file iterations of the executive dashboard (`design19/20/22.html`) are not kept in
the tree; they live in git history under the initial commit if ever needed.

## Running

Both dashboards are static and need no build step. Serve the folder you want:

```
cd dashboard          # or vendor-dashboard
npx serve .
```

`dashboard/` also works when `index.html` is opened directly from disk; `vendor-dashboard/`
does **not** (its JSX files are fetched with XHR, which browsers block from `file://`).

Each folder has its own README with a file-by-file breakdown and the script load-order rules:
[dashboard/README.md](dashboard/README.md), [vendor-dashboard/README.md](vendor-dashboard/README.md).

# Card Issuance

Dashboards for UBL Bank's Card Issuance & Operations. Everything here is static HTML/CSS/JS —
no build step, no backend; data is mocked client-side.

## Repository layout

```
card-issuance/
  dashboard/          Card Issuance & Operations executive dashboard (the live, modular app)
  vendor-dashboard/   Vendor Card Print dashboard — a self-contained single-file page
  archive/            Historical single-file versions of the executive dashboard, kept for reference
    design19.html
    design20.html
    design22.html     The monolith that dashboard/ was extracted from
```

## Running

Each dashboard is a static page. Open its `index.html` directly, or serve the folder:

```
cd dashboard          # or vendor-dashboard
npx serve .
```

See [dashboard/README.md](dashboard/README.md) for the file-by-file breakdown of the main app
and the script load-order constraint.

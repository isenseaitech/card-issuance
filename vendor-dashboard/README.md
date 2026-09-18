# UBL Vendor Card Print Dashboard

Vendor-side view of card print requests: filter and triage requests, update print status
(single or bulk), inspect a request in a side drawer with its comment/audit feed, initiate
reprints and export to CSV. Data is mocked client-side with a seeded generator.

It is a small React 18 app written in JSX and **compiled in the browser by Babel standalone**,
styled with the Tailwind Play CDN. There is no build step, no bundler and no module system:
every file under `js/` is a classic script sharing one global scope.

## Folder layout

```
vendor-dashboard/
  index.html               Page shell: CDN tags (Tailwind, React, ReactDOM, Babel) and the
                           local css/js references
  css/
    base.css               Page-level styles (root sizing, body, scrollbars)
  js/
    tailwind.config.js     Tailwind theme extension (navy palette) — plain script, must run
                           right after the Tailwind CDN tag
    error-overlay.js       Shows a plain-text error in #root if the app fails to boot

    -- compiled by Babel, in this order --
    globals.js             React hook aliases (useState, useMemo, …) declared once for all files
    icons.jsx              Inline SVG icon components (ICONS)
    constants.js           Business vocabulary (statuses, categories, functionalities, issuance
                           types, frequencies, HR statuses/reasons) and VENDOR_AUTHOR
    mock-data.js           Demo fixtures (names, UBL authors), seeded RNG, mock request + comment
                           generation, MOCK_DATA
    badges.jsx             Status/category/functionality/HR badge styles and <Badge>
    filter-bar.jsx         <SelectField>, <FilterBar>
    metric-cards.jsx       <MetricCard>, <MetricRow> (clickable KPI tiles)
    toolbar.jsx            <Toolbar> — bulk status update for selected rows
    table.jsx              <StatusActions>, <ReqIdColumnFilter>, <HrColumnFilter>, <RequestsTable>
    side-panel.jsx         <SidePanel> — request drawer with comment/audit feed and reprint action
    csv-export.js          exportCsv()
    app.jsx                DEFAULT_FILTERS, METRIC_PREDICATES, <VendorDashboard>, and the
                           ReactDOM.createRoot(...) mount
```

`.jsx` files contain JSX; `.js` files are plain JavaScript. Both are loaded the same way
(`<script type="text/babel" src="…">`) so there is a single loading mechanism to reason about.

## Load order matters

Babel standalone fetches each `text/babel` script and executes them in document order. Because
they are classic scripts, top-level `const`/`function` declarations land in one shared global
scope — that is how `table.jsx` can use `<Badge>` from `badges.jsx` without imports. Keep the
order in `index.html` as listed above when adding files, and declare each global exactly once
(a second `const useState` in another file throws *Identifier has already been declared*).

## Running it

**This page must be served over HTTP** — Babel loads the `js/` files with XHR, which browsers
block from `file://`. Opening `index.html` directly from disk shows a blank page.

```
npx serve .
```

then open the printed local URL. Any static server works (`python -m http.server`, etc.).

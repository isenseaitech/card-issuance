# UBL Card Issuance Dashboard

Executive dashboard for UBL Bank's Card Issuance & Operations. Restructured from the original
single-file `design22.html` (kept for reference in [`../archive/`](../archive/)) into a plain,
buildless static project — vanilla HTML/CSS/JS loaded via `<link>`/`<script>` tags in global
scope, no bundler and no module system.

## Folder layout

```
dashboard/
  index.html                                 Page markup, CDN tags (Chart.js, chartjs-plugin-datalabels,
                                             Font Awesome, SheetJS/xlsx) and the local css/js references
  assets/
    ulogojpg.jpg                             Header brand logo
    ubl.png                                  UBL logo used in the Card ID preview modal
  css/
    base.css                                 Palette variables (:root), resets, global base styles
    layout-header.css                        Header bar and title
    layout-kpi-charts.css                    Grid viewport, KPI tiles and chart-card layout
    components-buttons-filterbar.css         Buttons and the top filter bar
    filters-dropdowns-charts-controls.css    Multi-select dropdowns and chart view/type/colour controls
    table.css                                Excel-style applicants table
    doc-review-gallery.css                   Document Review module (summary cards, gallery, mini tables)
    modal-create-request.css                 Create Request modal
    modal-history-drawer.css                 History drawer, timeline and "View Image" row action
    modal-image-preview.css                  Shared image preview modal
  js/                                        (listed in load order — see below)
    state-and-request-modal.js               Global state (theme, filtered rows, selection); Create Request
                                             modal; row selection and bulk vendor assignment
    filters-multiselect.js                   Multi-select dropdown widgets and Excel-style column filter popups
    theme-and-chart-controls.js              Dark/light theme, chart colour palettes and chart view/type switching
    mock-data.js                             Department master data and mock applicant/document generation
    table-render-export.js                   Date-range controls, dashboard refresh, table rendering, XLSX export
    comments-and-timeline.js                 History drawer: comment feed, timeline stages, timeline modal
    doc-review-gallery.js                    Document Review module: filters, summary cards, gallery, pagination
    column-visibility.js                     Column show/hide panel, column drag-reorder and resize
    filters-apply-and-kpis.js                applyFilters(), KPI computation and the quick-filter card actions
    charts-init.js                           Chart.js plugin registration, chart build/refresh, chart click filters
```

### Script load order matters

All JS runs in global scope and the files share state through top-level `let`/`const`
declarations and plain functions. `index.html` loads them in the order shown above; keep
that order when adding or renaming files. `charts-init.js` must stay last because it
registers plugins and draws the initial charts using everything defined before it.

## Running it

No build step is required. Either:

- Open `index.html` directly in a browser, or
- Serve the folder locally (recommended, avoids any `file://` restrictions on some browsers):

  ```
  npx serve .
  ```

  then open the printed local URL.

# UBL Card Issuance Dashboard

Executive dashboard for UBL Bank's Card Issuance & Operations. Restructured from an original
single-file `design22.html` (retired; available in git history) into a plain,
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
  js/                                        (listed in load order - see below)
    state.js                                 Shared state: currentFilteredApplicants (the one thing every
                                             feature reads). Feature-specific state lives with its feature.
    mock-data.js                             Master lists, generated applicants (mockApplicants), Document
                                             Review records. No DOM access.
    filters-multiselect.js                   Multi-select dropdowns, Excel-style column filter popups,
                                             filter-count badge, filter bar toggle
    header-controls.js                       Header toolbar: theme toggle, refresh / auto-refresh, fullscreen
    chart-controls.js                        Chart view switching, chart type / colour palette rebuilds,
                                             theme-aware chart colours, chart title
    table-render-export.js                   Applicants table: filtering into currentFilteredApplicants,
                                             sorting, row selection + bulk vendor assignment, XLSX/CSV
                                             export, row actions
    request-modal.js                         Create Request modal: open/close, tabs, validation, attachments
    comments-and-timeline.js                 History drawer: comment feed, timeline stages, timeline modal
    doc-review-gallery.js                    Document Review module: filters, summary cards, gallery,
                                             image preview, row action menu
    column-visibility.js                     Column show/hide panel, column drag-reorder and resize
    filters-apply-and-kpis.js                Date-range controls, applyFilters(), reset, KPI cards and
                                             approval-performance panel, all quick filters
    charts-init.js                           Chart.js plugin registration, the ten charts, click-to-filter
                                             selection state, updateAllCharts()
    app.js                                   Startup: global Escape handling and the init sequence. Loaded last.
```

### Script load order matters

All JS runs in global scope: the files share state through top-level `let`/`const`
declarations and call each other's plain functions, and the HTML's inline `onclick`
handlers rely on those functions being globals. `index.html` loads the files in the
order shown above; keep that order when adding or renaming files. The rules that make
it work:

- **Declare each global exactly once**, in the file that owns it. A second top-level
  `let`/`const` with the same name in another file throws *Identifier has already been
  declared* at load time.
- **Only function bodies may reference other files' globals.** Anything that runs at load
  time (top-level statements, chart construction in `charts-init.js`, the init calls in
  `app.js`) may only use what an earlier script already defined.
- **`app.js` stays last** and is the only place startup work happens; `charts-init.js`
  stays just before it because it builds the charts everything else updates.
- Keep feature-specific state in the feature's file; put state in `state.js` only when
  several features genuinely share it.

Formatting: 4-space indentation from column 0, LF line endings, no trailing whitespace.

## Running it

No build step is required. Either:

- Open `index.html` directly in a browser, or
- Serve the folder locally (recommended, avoids any `file://` restrictions on some browsers):

  ```
  npx serve .
  ```

  then open the printed local URL.

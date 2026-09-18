# UBL Card Issuance Dashboard

Executive dashboard for UBL Bank's Card Issuance & Operations, restructured from the original
single-file `design22.html` into a plain, buildless static project (no bundler, no module
system — vanilla HTML/CSS/JS loaded via `<script>` tags in global scope).

## Folder layout

```
ubl-card-issuance-dashboard/
  index.html        Page markup + CDN <link>/<script> tags (Chart.js, chartjs-plugin-datalabels,
                     Font Awesome, SheetJS/xlsx) + local css/js references
  css/
    styles.css       All dashboard styles (extracted from the original inline <style> block)
  js/
    main.js          All dashboard logic (extracted from the original inline <script> block)
  assets/
    ulogojpg.jpg      Header brand logo
    ubl.png           UBL logo used in the Card ID preview modal
```

The JS was kept as a single `main.js` rather than split into multiple files: the original
script had only two section-divider comments (not the several clearly-bounded sections needed
for a low-risk split), and its functions/state are heavily interleaved in global scope, so
splitting further would risk breaking load-order dependencies.

## Running it

No build step is required. Either:

- Open `index.html` directly in a browser, or
- Serve the folder locally (recommended, avoids any `file://` restrictions on some browsers):

  ```
  npx serve .
  ```

  then open the printed local URL.

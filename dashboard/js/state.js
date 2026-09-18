// Shared dashboard state.
//
// Only state that several features read or write lives here. Feature-specific
// state stays in the feature's own file (selectedRowIds and the sort state in
// table-render-export.js, chartSelections in charts-init.js, and so on).

// The applicants currently shown in the table once every filter has been
// applied. Written by updateApplicantTable(); read by the KPI cards, charts,
// exports, row selection and the Document Review module.
let currentFilteredApplicants = [];

// Executive dashboard startup. Loaded last, after every feature script, so
// everything it calls is already defined. Nothing else calls into this file.

// Escape closes whichever overlay is open. (The Create Request modal adds its
// own Escape handler while it is open - see request-modal.js.)

document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    if (document.getElementById('cardPreviewBackdrop').classList.contains('open')) closeCardPreviewModal();
    if (document.getElementById('imageViewBackdrop').classList.contains('open')) closeImageViewModal();
    if (document.getElementById('historyDrawerBackdrop').classList.contains('open')) closeHistoryDrawer();
});

autoDetectTheme();
initColumnDragAndResize();
initCrDropzone();
resetAllFilters();
syncChartControlStates();
stampLastUpdated();
document.body.classList.toggle('filters-open', !document.getElementById('filterBarWrapper').classList.contains('collapsed'));

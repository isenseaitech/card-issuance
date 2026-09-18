// ===================================================================
// Document Review: Gallery module
// ===================================================================
function openDocReviewModule() {
    document.getElementById('docReviewBackdrop').classList.add('open');
    document.body.style.overflow = 'hidden';
    applyDocReviewFilters();
}

function closeDocReviewModule() {
    document.getElementById('docReviewBackdrop').classList.remove('open');
    document.body.style.overflow = '';
}

// Card Functionality filter - a two-state toggle (RF / HF / neither active),
// driven by the split pill in the filter bar rather than a dropdown.
let drCardTypeFilter = null;

function toggleDrCardTypeFilter(type) {
    drCardTypeFilter = drCardTypeFilter === type ? null : type;
    document.getElementById('drCardTypeHalfRF').classList.toggle('active', drCardTypeFilter === 'RF');
    document.getElementById('drCardTypeHalfHF').classList.toggle('active', drCardTypeFilter === 'HF');
    applyDocReviewFilters();
}

// Card Type filter (Conventional / Islamic) - same two-state toggle pattern.
let drCardCategoryFilter = null;

function toggleDrCardCategoryFilter(type) {
    drCardCategoryFilter = drCardCategoryFilter === type ? null : type;
    document.getElementById('drCardCategoryHalfConventional').classList.toggle('active', drCardCategoryFilter === 'Conventional');
    document.getElementById('drCardCategoryHalfIslamic').classList.toggle('active', drCardCategoryFilter === 'Islamic');
    applyDocReviewFilters();
}

// Every filter except Status, so the summary cards (which each imply
// a different status) can show meaningful counts simultaneously -
// e.g. selecting HF recomputes all four cards for "HF only", rather
// than the previously-selected status silently zeroing the others.
function computeDocReviewBaseFiltered() {
    const dept = document.getElementById('drDeptFilter').value;
    const loc = document.getElementById('drLocationFilter').value;
    const from = document.getElementById('drDateFrom').value;
    const to = document.getElementById('drDateTo').value;
    const name = document.getElementById('drNameFilter').value.trim().toLowerCase();
    const reqId = document.getElementById('drReqIdFilter').value.trim().toLowerCase();
    const term = document.getElementById('drSearchInput').value.trim().toLowerCase();

    return documentReviewRecords.filter(r => {
        if (dept !== 'all' && r.department !== dept) return false;
        if (loc !== 'all' && r.location !== loc) return false;
        if (from && r.uploadDate < from) return false;
        if (to && r.uploadDate > to) return false;
        if (name && !r.employeeName.toLowerCase().includes(name)) return false;
        if (reqId && !r.id.toLowerCase().includes(reqId)) return false;
        if (drCardTypeFilter && r.cardType !== drCardTypeFilter) return false;
        if (drCardCategoryFilter && r.cardCategory !== drCardCategoryFilter) return false;
        if (term && !(r.id.toLowerCase().includes(term) || r.employeeName.toLowerCase().includes(term) || r.department.toLowerCase().includes(term))) return false;
        return true;
    });
}

function applyDocReviewFilters() {
    const status = document.getElementById('drStatusFilter').value;
    const base = computeDocReviewBaseFiltered();
    currentDocReviewFiltered = status === 'all' ? base : base.filter(r => r.status === status);
    docReviewPage = 1;
    renderDocGallery();
}

function toggleDocSummaryFilter(status) {
    const sel = document.getElementById('drStatusFilter');
    sel.value = (status === 'all') ? 'all' : (sel.value === status ? 'all' : status);
    applyDocReviewFilters();
}

function resetDocReviewFilters() {
    ['drStatusFilter', 'drDeptFilter', 'drLocationFilter'].forEach(id => { document.getElementById(id).value = 'all'; });
    ['drDateFrom', 'drDateTo', 'drNameFilter', 'drReqIdFilter', 'drSearchInput'].forEach(id => { document.getElementById(id).value = ''; });
    drCardTypeFilter = null;
    document.getElementById('drCardTypeHalfRF').classList.remove('active');
    document.getElementById('drCardTypeHalfHF').classList.remove('active');
    drCardCategoryFilter = null;
    document.getElementById('drCardCategoryHalfConventional').classList.remove('active');
    document.getElementById('drCardCategoryHalfIslamic').classList.remove('active');
    applyDocReviewFilters();
}

function renderDocSummaryCards() {
    const base = computeDocReviewBaseFiltered();
    document.getElementById('drTotalCount').textContent = base.length;
    document.getElementById('drPendingCount').textContent = base.filter(r => r.status === 'pending').length;
    document.getElementById('drApprovedCount').textContent = base.filter(r => r.status === 'approved').length;
    document.getElementById('drRejectedCount').textContent = base.filter(r => r.status === 'rejected').length;

    const activeStatus = document.getElementById('drStatusFilter').value;
    document.getElementById('drSummaryRow').classList.toggle('filtering', activeStatus !== 'all');
    document.getElementById('drSummaryCardAll').classList.toggle('active', activeStatus === 'all');
    document.getElementById('drSummaryCardPending').classList.toggle('active', activeStatus === 'pending');
    document.getElementById('drSummaryCardApproved').classList.toggle('active', activeStatus === 'approved');
    document.getElementById('drSummaryCardRejected').classList.toggle('active', activeStatus === 'rejected');
}

// Pagination: 50 images/page by default, with a "Show All" escape
// hatch for reviewers who'd rather scroll one long list.
const DOC_REVIEW_PAGE_SIZE = 50;
let docReviewPage = 1;
let docReviewShowAll = false;

function renderDocGallery() {
    renderDocSummaryCards();
    const grid = document.getElementById('drGalleryGrid');
    if (!currentDocReviewFiltered.length) {
        grid.innerHTML = `<div class="dr-empty-state"><i class="fa-regular fa-folder-open"></i><span>No documents match the current filters.</span></div>`;
        renderDocReviewPagination();
        return;
    }

    const totalPages = Math.max(1, Math.ceil(currentDocReviewFiltered.length / DOC_REVIEW_PAGE_SIZE));
    if (docReviewPage > totalPages) docReviewPage = totalPages;
    if (docReviewPage < 1) docReviewPage = 1;

    const pageItems = docReviewShowAll
        ? currentDocReviewFiltered
        : currentDocReviewFiltered.slice((docReviewPage - 1) * DOC_REVIEW_PAGE_SIZE, docReviewPage * DOC_REVIEW_PAGE_SIZE);

    grid.innerHTML = pageItems.map(r => `
        <div class="dr-card">
            <div class="dr-card-thumb">
                <img src="${r.imageUrl}" alt="${r.id}" class="dr-issue-${r.imageIssue}">
                <span class="dr-badge ${r.status}">${docStatusLabel(r.status)}</span>
            </div>
            <div class="dr-card-body">
                <div class="dr-card-id">${r.id}</div>
                <div class="dr-card-name">${r.employeeName}</div>
                <div class="dr-card-meta"><i class="fa-solid fa-building"></i> ${r.department}</div>
                <div class="dr-card-meta"><i class="fa-regular fa-calendar"></i> ${formatDateForCard(r.uploadDate)}</div>
            </div>
            <div class="dr-card-actions">
                <button class="dr-btn dr-btn-view" onclick="openGalleryPreview('${r.id}')"><i class="fa-regular fa-eye"></i> View</button>
                <button class="dr-btn dr-btn-approve" onclick="galleryApprove('${r.id}')" title="Approve"><i class="fa-solid fa-check"></i></button>
                <button class="dr-btn dr-btn-reject" onclick="galleryRejectPrompt('${r.id}')" title="Reject"><i class="fa-solid fa-xmark"></i></button>
            </div>
        </div>
    `).join('');

    renderDocReviewPagination(totalPages, pageItems.length);
}

function renderDocReviewPagination(totalPages, shownCount) {
    const total = currentDocReviewFiltered.length;
    const bar = document.getElementById('drPaginationBar');
    if (total === 0) { bar.style.display = 'none'; return; }
    bar.style.display = 'flex';

    const summary = document.getElementById('drPaginationSummary');
    if (docReviewShowAll) {
        summary.textContent = `Showing all ${total.toLocaleString()} of ${total.toLocaleString()}`;
    } else {
        const start = (docReviewPage - 1) * DOC_REVIEW_PAGE_SIZE + 1;
        const end = Math.min(docReviewPage * DOC_REVIEW_PAGE_SIZE, total);
        summary.textContent = `Showing ${start}-${end} of ${total.toLocaleString()}`;
    }

    document.getElementById('drPageLabel').textContent = docReviewShowAll ? 'All' : `${docReviewPage} / ${totalPages}`;
    document.getElementById('drPagePrevBtn').disabled = docReviewShowAll || docReviewPage <= 1;
    document.getElementById('drPageNextBtn').disabled = docReviewShowAll || docReviewPage >= totalPages;

    const showAllBtn = document.getElementById('drShowAllBtn');
    showAllBtn.textContent = docReviewShowAll ? 'Show Pages' : 'Show All';
    showAllBtn.classList.toggle('active', docReviewShowAll);
}

function docReviewPrevPage() {
    if (docReviewShowAll || docReviewPage <= 1) return;
    docReviewPage--;
    renderDocGallery();
}

function docReviewNextPage() {
    if (docReviewShowAll) return;
    docReviewPage++;
    renderDocGallery();
}

function toggleDocReviewShowAll() {
    docReviewShowAll = !docReviewShowAll;
    docReviewPage = 1;
    renderDocGallery();
}

function galleryApprove(id) {
    const r = documentReviewRecords.find(d => d.id === id);
    if (!r) return;
    r.status = 'approved';
    r.rejectionReason = null;
    r.imageUrl = buildPlaceholderPhotoDataUri(r.status);
    syncMockApplicantStatus(r);
    renderDocGallery();
}

function galleryRejectPrompt(id) {
    const r = documentReviewRecords.find(d => d.id === id);
    if (!r) return;
    openRejectReasonDialog(r);
}

function openGalleryPreview(id) {
    const index = currentDocReviewFiltered.findIndex(d => d.id === id);
    if (index === -1) return;
    openImagePreviewModal(currentDocReviewFiltered, index);
}

// ===================================================================
// Document Review: request table Preview eye icon
// ===================================================================
function openTablePreview(id) {
    const list = currentFilteredApplicants.map(item => documentReviewRecords.find(d => d.id === item.id) || getDocRecordForRequest(item));
    const index = currentFilteredApplicants.findIndex(item => item.id === id);
    if (index === -1) return;
    openImagePreviewModal(list, index);
}

// ===================================================================
// Document Review: shared Preview Modal (zoom, rotate, nav, actions)
// ===================================================================
let previewContextList = [];
let previewContextIndex = 0;
let previewZoom = 1;
let previewRotation = 0;
let pendingRejectContext = null;

function openImagePreviewModal(list, index) {
    previewContextList = list;
    previewContextIndex = index;
    previewZoom = 1;
    previewRotation = 0;
    renderPreviewModal();
    document.getElementById('imagePreviewBackdrop').classList.add('open');
    document.body.style.overflow = 'hidden';
}

function closeImagePreviewModal() {
    document.getElementById('imagePreviewBackdrop').classList.remove('open');
    document.body.style.overflow = '';
}

function renderPreviewModal() {
    const r = previewContextList[previewContextIndex];
    if (!r) return;

    document.getElementById('pvReqId').textContent = r.id;
    document.getElementById('pvReqId2').textContent = r.id;
    document.getElementById('pvEmpName').textContent = r.employeeName;
    document.getElementById('pvEmpNumber').textContent = r.employeeNumber;
    document.getElementById('pvCnic').textContent = r.cnic;
    document.getElementById('pvDept').textContent = r.department;
    document.getElementById('pvLocation').textContent = r.location;
    document.getElementById('pvStatus').innerHTML = `<span class="dr-badge ${r.status}" style="position:static;">${docStatusLabel(r.status)}</span>`;
    document.getElementById('pvUploadDate').textContent = r.uploadDate ? formatDateForCard(r.uploadDate) : '—';
    document.getElementById('pvUploadTime').textContent = r.uploadTime || '—';
    document.getElementById('pvFileName').textContent = r.fileName || '—';
    document.getElementById('pvFileSize').textContent = r.fileSize || '—';
    document.getElementById('pvDimensions').textContent = r.dimensions || '—';
    document.getElementById('pvFileType').textContent = r.fileType || '—';

    const imgWrap = document.getElementById('pvImageWrap');
    imgWrap.innerHTML = `<img id="pvImage" src="${r.imageUrl}" alt="${r.id} document" class="dr-issue-${r.imageIssue}">`;
    applyPreviewTransform();

    document.getElementById('pvCounter').textContent = `${previewContextIndex + 1} of ${previewContextList.length}`;
    document.getElementById('pvPrevBtn').disabled = previewContextIndex === 0;
    document.getElementById('pvNextBtn').disabled = previewContextIndex === previewContextList.length - 1;
}

function applyPreviewTransform() {
    const img = document.getElementById('pvImage');
    if (img) img.style.transform = `scale(${previewZoom}) rotate(${previewRotation}deg)`;
}

function previewZoomIn() { previewZoom = Math.min(3, previewZoom + 0.25); applyPreviewTransform(); }
function previewZoomOut() { previewZoom = Math.max(0.5, previewZoom - 0.25); applyPreviewTransform(); }
function previewZoomReset() { previewZoom = 1; previewRotation = 0; applyPreviewTransform(); }
function previewRotateLeft() { previewRotation -= 90; applyPreviewTransform(); }
function previewRotateRight() { previewRotation += 90; applyPreviewTransform(); }

function previewDownload() {
    const r = previewContextList[previewContextIndex];
    if (!r || !r.imageUrl) { alert('No image available to download.'); return; }
    const link = document.createElement('a');
    link.href = r.imageUrl;
    link.download = r.fileName || `${r.id}.jpg`;
    link.click();
}

function previewFullscreen() {
    const el = document.getElementById('pvImageWrap');
    if (!document.fullscreenElement) el.requestFullscreen().catch(() => {});
    else document.exitFullscreen();
}

function previewPrev() {
    if (previewContextIndex > 0) {
        previewContextIndex--;
        previewZoom = 1;
        previewRotation = 0;
        renderPreviewModal();
    }
}

function previewNext() {
    if (previewContextIndex < previewContextList.length - 1) {
        previewContextIndex++;
        previewZoom = 1;
        previewRotation = 0;
        renderPreviewModal();
    }
}

// Keeps the curated 30-record gallery in sync whenever a request
// that also exists there is approved/rejected from a table-opened
// preview (table previews synthesize their own object, so this
// mirrors the change back onto the shared gallery record by id).
function syncDocStatusEverywhere(record) {
    const match = documentReviewRecords.find(d => d.id === record.id);
    if (match && match !== record) {
        match.status = record.status;
        match.rejectionReason = record.rejectionReason;
        match.imageUrl = record.imageUrl;
    }
}

// Document Review is a view onto the SAME requests shown on the main
// dashboard, so an approve/reject decision made here must also
// update the underlying mockApplicants record and re-run
// applyFilters() - otherwise the KPI cards, Excel sheet, Performance
// Overview, and charts would silently drift out of sync with what
// was just decided in the gallery/preview modal.
function syncMockApplicantStatus(docRecord) {
    const item = mockApplicants.find(x => x.id === docRecord.id);
    if (!item) return;

    if (docRecord.status === 'approved') {
        item.status = 'Approved';
        item.rejectionReason = null;
        if (item.approvalHours == null) item.approvalHours = Math.round((2 + Math.random() * 6) * 10) / 10;
    } else if (docRecord.status === 'rejected') {
        item.status = 'Rejected';
        item.rejectionReason = docRecord.rejectionReason;
        if (item.approvalHours == null) item.approvalHours = Math.round((2 + Math.random() * 6) * 10) / 10;
    } else {
        item.status = 'Pending';
        item.rejectionReason = null;
    }

    applyFilters();
}

function previewApprove() {
    const r = previewContextList[previewContextIndex];
    if (!r) return;
    r.status = 'approved';
    r.rejectionReason = null;
    r.imageUrl = buildPlaceholderPhotoDataUri(r.status);
    syncDocStatusEverywhere(r);
    syncMockApplicantStatus(r);
    renderPreviewModal();
    renderDocGallery();
}

function previewRejectPrompt() {
    const r = previewContextList[previewContextIndex];
    if (!r) return;
    openRejectReasonDialog(r);
}

// ===================================================================
// Reject Reason dialog (shared by the gallery card buttons and the
// preview modal's Reject button; rejection is never allowed without
// a reason).
// ===================================================================
function openRejectReasonDialog(record) {
    pendingRejectContext = record;
    document.getElementById('rejectReasonSelect').value = '';
    document.getElementById('rejectCustomReason').value = '';
    document.getElementById('rejectCustomReasonField').style.display = 'none';
    document.getElementById('rejectReasonBackdrop').classList.add('open');
}

function closeRejectReasonModal() {
    document.getElementById('rejectReasonBackdrop').classList.remove('open');
    pendingRejectContext = null;
}

function onRejectReasonChange() {
    const sel = document.getElementById('rejectReasonSelect').value;
    document.getElementById('rejectCustomReasonField').style.display = sel === 'Custom reason' ? 'flex' : 'none';
}

function submitRejectReason() {
    const sel = document.getElementById('rejectReasonSelect').value;
    const custom = document.getElementById('rejectCustomReason').value.trim();
    const finalReason = sel === 'Custom reason' ? custom : sel;

    if (!finalReason) {
        alert('Please select or enter a rejection reason before submitting.');
        return;
    }

    if (pendingRejectContext) {
        pendingRejectContext.status = 'rejected';
        pendingRejectContext.rejectionReason = finalReason;
        pendingRejectContext.imageUrl = buildPlaceholderPhotoDataUri(pendingRejectContext.status);
        syncDocStatusEverywhere(pendingRejectContext);
        syncMockApplicantStatus(pendingRejectContext);
    }

    closeRejectReasonModal();
    renderPreviewModal();
    renderDocGallery();
}

// ===================================================================
// Quick Review keyboard shortcuts: Left/Right navigate, A approves,
// R opens the reject dialog, Esc closes whichever layer is open.
// ===================================================================
document.addEventListener('keydown', (e) => {
    const rejectOpen = document.getElementById('rejectReasonBackdrop').classList.contains('open');
    if (rejectOpen) {
        if (e.key === 'Escape') closeRejectReasonModal();
        return;
    }

    const previewOpen = document.getElementById('imagePreviewBackdrop').classList.contains('open');
    if (previewOpen) {
        if (e.key === 'Escape') { closeImagePreviewModal(); return; }
        if (e.key === 'ArrowLeft') { previewPrev(); return; }
        if (e.key === 'ArrowRight') { previewNext(); return; }
        if (e.key.toLowerCase() === 'a') { previewApprove(); return; }
        if (e.key.toLowerCase() === 'r') { previewRejectPrompt(); return; }
        return;
    }

    const docReviewOpen = document.getElementById('docReviewBackdrop').classList.contains('open');
    if (docReviewOpen && e.key === 'Escape') closeDocReviewModule();
});

function previewCardRecord(id) {
    const r = findRecordById(id);
    if (!r) return;
    document.getElementById('cpFrontName').textContent = r.name;
    document.getElementById('cpBackEmpId').textContent = id.replace('REQ-', '');
    document.getElementById('cpBackIssueDate').textContent = formatDateForCard(r.date);
    document.getElementById('cpBackCnic').textContent = r.cnic;
    document.getElementById('cpBackPhone').textContent = r.phone;
    document.getElementById('cardPreviewBackdrop').classList.add('open');
    document.body.style.overflow = 'hidden';
}

function closeCardPreviewModal() {
    document.getElementById('cardPreviewBackdrop').classList.remove('open');
    document.body.style.overflow = '';
}

function viewImageRecord(id) {
    const r = findRecordById(id);
    if (!r) return;
    document.getElementById('ivName').textContent = r.name;
    document.getElementById('imageViewBackdrop').classList.add('open');
    document.body.style.overflow = 'hidden';
}

function closeImageViewModal() {
    document.getElementById('imageViewBackdrop').classList.remove('open');
    document.body.style.overflow = '';
}

function positionPopupSmart(popupEl, anchorRect) {
    const margin = 6;
    const panelHeight = popupEl.offsetHeight;
    const panelWidth = popupEl.offsetWidth;

    let top = anchorRect.bottom + margin;
    if (top + panelHeight > window.innerHeight - 8) {
        top = Math.max(8, anchorRect.top - panelHeight - margin);
    }
    if (top + panelHeight > window.innerHeight - 8) {
        top = Math.max(8, window.innerHeight - panelHeight - 8);
    }

    let left = anchorRect.right - panelWidth;
    if (left < 8) left = 8;
    if (left + panelWidth > window.innerWidth - 8) left = window.innerWidth - panelWidth - 8;

    popupEl.style.top = `${top}px`;
    popupEl.style.left = `${left}px`;
}

function toggleRowActionMenu(evt, id) {
    evt.stopPropagation();
    const menu = document.getElementById('rowActionMenu');
    const wasOpenForThisRow = menu.classList.contains('open') && menu.dataset.rowId === id;
    menu.classList.remove('open');
    if (wasOpenForThisRow) return;

    menu.dataset.rowId = id;
    document.getElementById('raView').onclick = () => { viewRecord(id); closeRowActionMenu(); };
    document.getElementById('raEdit').onclick = () => { editRecord(id); closeRowActionMenu(); };
    document.getElementById('raHistory').onclick = () => { openHistoryDrawer(id); closeRowActionMenu(); };
    document.getElementById('raPreviewCard').onclick = () => { previewCardRecord(id); closeRowActionMenu(); };
    document.getElementById('raViewImage').onclick = () => { viewImageRecord(id); closeRowActionMenu(); };

    menu.classList.add('open');
    positionPopupSmart(menu, evt.currentTarget.getBoundingClientRect());
}

function closeRowActionMenu() {
    document.getElementById('rowActionMenu').classList.remove('open');
}

document.addEventListener('click', (e) => {
    const menu = document.getElementById('rowActionMenu');
    if (menu && menu.classList.contains('open') && !e.target.closest('#rowActionMenu') && !e.target.closest('.row-action-icon')) {
        closeRowActionMenu();
    }
});

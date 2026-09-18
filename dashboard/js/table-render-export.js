// Applicants table: turns the filter selections into currentFilteredApplicants,
// renders and sorts the rows, row selection and bulk vendor assignment,
// Excel/CSV export, and the per-row actions.

let selectedRowIds = new Set();

let sortColumn = null;
let sortDirection = 1;

function calculateUserFrequency(applicants) {
    const userCounts = {};
    applicants.forEach(item => {
        userCounts[item.name] = (userCounts[item.name] || 0) + 1;
    });
    return userCounts;
}

function formatIssuanceLabel(typeKey) {
    switch(typeKey) {
        case 'first_time': return 'New';
        case 'reissuance': return 'Renewal';
        case 'replacement': return 'Replace';
        case 'emergency': return 'Urgent';
        default: return typeKey;
    }
}

function updateApplicantTable(
    deptVals,
    departmentVals,
    vendorVals,
    regionVals,
    clusterVals,
    branchVals,
    catVals,
    genderVals,
    statusVals,
    issuanceVals,
    searchTerm,
    timeVal,
    selectedMonth,
    startD,
    endD
) {
    const tbody = document.getElementById('applicantTableBody');
    tbody.innerHTML = '';

    const term = (searchTerm || '').trim().toLowerCase();

    currentFilteredApplicants = mockApplicants.filter(item => {
        if (!matchesFilter(issuanceVals, item.type)) return false;
        if (!matchesFilter(deptVals, item.dept)) return false;
        if (!matchesFilter(departmentVals, item.department)) return false;
        if (!matchesVendorSelection(vendorVals, item)) return false;
        if (!matchesFilter(regionVals, item.region)) return false;
        if (!matchesFilter(clusterVals, item.cluster)) return false;
        if (!matchesFilter(branchVals, item.branch)) return false;
        if (!matchesFilter(catVals, item.category)) return false;
        if (!matchesFilter(genderVals, item.gender)) return false;
        if (!matchesFilter(statusVals, item.status)) return false;
        if (!matchesDateRange(item, timeVal, selectedMonth, startD, endD)) return false;

        if (term &&
            !item.id.toLowerCase().includes(term) &&
            !item.name.toLowerCase().includes(term) &&
            !item.cnic.toLowerCase().includes(term) &&
            !item.phone.toLowerCase().includes(term) &&
            !item.department.toLowerCase().includes(term) &&
            !item.branch.toLowerCase().includes(term) &&
            !item.vendor.toLowerCase().includes(term)) {
            return false;
        }

        if (!matchesFilter(getMsValues('reqIdSelect'), item.id)) return false;
        if (!matchesFilter(getMsValues('applicantNameSelect'), item.name)) return false;
        if (!matchesFilter(getMsValues('cnicSelect'), item.cnic)) return false;
        if (!matchesFilter(getMsValues('phoneSelect'), item.phone)) return false;
        if (!matchesFilter(getMsValues('dateSelect'), item.date)) return false;
        if (!matchesUserFreqSelection(getMsValues('userFreqSelect2'), item)) return false;
        if (!matchesFilter(getMsValues('hrActionDateSelect'), item.hrActionDate)) return false;
        if (!matchesFilter(getMsValues('cardTypeSelect'), item.cardType)) return false;
        if (!matchesFilter(getMsValues('cardCategorySelect'), item.cardCategory)) return false;
        if (!matchesFilter(getMsValues('vendorStatusSelect'), item.vendorStatus)) return false;

        if (quickFilterPredicate && !quickFilterPredicate(item)) return false;

        return true;
    });

    if (sortColumn) {
        currentFilteredApplicants.sort((a, b) => {
            let av = a[sortColumn], bv = b[sortColumn];
            if (typeof av === 'string') { av = av.toLowerCase(); bv = bv.toLowerCase(); }
            if (av < bv) return -1 * sortDirection;
            if (av > bv) return 1 * sortDirection;
            return 0;
        });
    }

    renderTableRows();
}

function buildRowHtml(row) {
    let statusClass = 'approved';
    if (row.status === 'Pending') statusClass = 'pending';
    if (row.status === 'Rejected') statusClass = 'rejected';

    return `
        <td><input type="checkbox" class="row-select-checkbox" onchange="toggleRowSelect(this, '${row.id}')" ${selectedRowIds.has(row.id) ? 'checked' : ''}></td>
        <td data-col-idx="0" style="font-weight:700; color:var(--accent-blue);">${row.id}</td>
        <td data-col-idx="1" style="font-weight:600;">${row.name}</td>
        <td data-col-idx="2"><span style="font-size:0.58rem; background:rgba(8, 145, 178, 0.15); color:var(--accent-cyan); padding:1px 4px; border-radius:3px; font-weight:600;">${formatIssuanceLabel(row.type)}</span></td>
        <td data-col-idx="3">${row.dept}</td>
        <td data-col-idx="4">${row.department}</td>
        <td data-col-idx="5">${row.sentToVendor ? row.vendor : `<span class="not-sent-badge">Not Sent</span>`}</td>
        <td data-col-idx="6">${row.region}</td>
        <td data-col-idx="7" style="text-transform:capitalize;">${row.cluster.replace('_', ' ')}</td>
        <td data-col-idx="8" style="text-transform:capitalize;">Branch ${row.branch}</td>
        <td data-col-idx="9"><span class="priority-badge ${row.category}">${row.category}</span></td>
        <td data-col-idx="10" style="text-transform:capitalize;">${row.gender}</td>
        <td data-col-idx="11"><span class="status-badge ${statusClass}">${row.status}</span></td>
        <td data-col-idx="12">${row.hrActionDate || ''}</td>
        <td data-col-idx="13">${row.cnic}</td>
        <td data-col-idx="14">${row.phone}</td>
        <td data-col-idx="15">${row.date}</td>
        <td data-col-idx="16" style="text-align:center;">${row.userFreq}</td>
        <td data-col-idx="17" style="text-align:center;"><span class="priority-badge ${row.cardType === 'RF' ? 'standard' : 'priority'}">${row.cardType}</span></td>
        <td data-col-idx="18" style="text-align:center;"><span class="priority-badge ${row.cardCategory === 'Conventional' ? 'standard' : 'priority'}">${row.cardCategory}</span></td>
        <td data-col-idx="19" style="text-align:center;">
            <i class="fa-regular fa-eye row-action-icon" title="Preview uploaded image" onclick="openTablePreview('${row.id}')"></i>
        </td>
        <td data-col-idx="20"><span class="status-badge ${VENDOR_STATUS_BADGE_CLASS[row.vendorStatus] || 'vs-received'}">${row.vendorStatus}</span></td>
        <td style="text-align:center;">
            <i class="fa-solid fa-ellipsis-vertical row-action-icon" title="Actions" onclick="toggleRowActionMenu(event, '${row.id}')"></i>
        </td>
    `;
}

function renderTableRows() {
    const tbody = document.getElementById('applicantTableBody');
    tbody.innerHTML = '';

    if (sheetBlanked) {
        updateSelectAllCheckboxState();
        return;
    }

    if (currentFilteredApplicants.length === 0) {
        tbody.innerHTML = `<tr><td colspan="23" style="text-align:center; color:var(--text-muted); padding:10px;">No matching records found.</td></tr>`;
        updateSelectAllCheckboxState();
        return;
    }

    currentFilteredApplicants.forEach(row => {
        const tr = document.createElement('tr');
        tr.innerHTML = buildRowHtml(row);
        if (columnPermutation) applyColumnOrderToRow(tr);
        tbody.appendChild(tr);
    });

    applyColumnVisibility();
    updateSelectAllCheckboxState();
}

// --- Row selection and bulk vendor assignment ---------------------------

function toggleRowSelect(checkbox, reqId) {
    if (checkbox.checked) selectedRowIds.add(reqId);
    else selectedRowIds.delete(reqId);
    updateSelectAllCheckboxState();
}

function toggleSelectAllRows(checkbox) {
    currentFilteredApplicants.forEach(item => {
        if (checkbox.checked) selectedRowIds.add(item.id);
        else selectedRowIds.delete(item.id);
    });
    document.querySelectorAll('.row-select-checkbox').forEach(cb => { cb.checked = checkbox.checked; });
}

function updateSelectAllCheckboxState() {
    const selectAll = document.getElementById('selectAllRowsCheckbox');
    if (!selectAll) return;
    const visibleIds = currentFilteredApplicants.map(item => item.id);
    const selectedVisible = visibleIds.filter(id => selectedRowIds.has(id));
    selectAll.checked = visibleIds.length > 0 && selectedVisible.length === visibleIds.length;
    selectAll.indeterminate = selectedVisible.length > 0 && selectedVisible.length < visibleIds.length;
}

function toggleBulkSentVendorPanel(evt) {
    evt.stopPropagation();
    const dropdown = document.getElementById('bulkSentVendorDropdown');
    const isOpen = dropdown.classList.contains('open');
    document.querySelectorAll('.ms-dropdown.open').forEach(d => d.classList.remove('open'));
    if (!isOpen) {
        dropdown.classList.add('open');
        const btn = dropdown.querySelector('button');
        const panel = dropdown.querySelector('.ms-panel');
        const rect = btn.getBoundingClientRect();
        panel.style.top = `${rect.bottom + 3}px`;
        panel.style.left = `${rect.left}px`;
        panel.style.minWidth = `${rect.width}px`;
    }
}

function bulkAssignVendor(vendorName) {
    document.querySelectorAll('.ms-dropdown.open').forEach(d => d.classList.remove('open'));

    if (selectedRowIds.size === 0) {
        alert('Select at least one record using the checkboxes first.');
        return;
    }

    mockApplicants.forEach(item => {
        if (selectedRowIds.has(item.id)) {
            // Only an approved request can legitimately be sent to a
            // vendor - bulk-assigning a Pending (or Rejected) row
            // also approves it, so the Pending/Approved KPI cards,
            // charts, and the Status column all stay consistent
            // with the Sent to Vendor count instead of drifting.
            if (item.status !== 'Approved') {
                item.status = 'Approved';
                item.rejectionReason = null;
                if (item.approvalHours == null) item.approvalHours = Math.round((2 + Math.random() * 6) * 10) / 10;
            }
            item.sentToVendor = true;
            item.vendor = vendorName;
            if (!item.vendorHours) item.vendorHours = Math.round((18 + Math.random() * 36) * 10) / 10;
        }
    });

    selectedRowIds.clear();
    applyFilters();
}

// --- Export ------------------------------------------------------------

const COLUMN_EXPORT_FORMATTERS = {
    id: item => item.id,
    name: item => item.name,
    type: item => formatIssuanceLabel(item.type),
    dept: item => item.dept,
    department: item => item.department,
    vendor: item => item.sentToVendor ? item.vendor : 'Not Sent',
    region: item => item.region,
    cluster: item => item.cluster.replace('_', ' ').toUpperCase(),
    branch: item => `Branch ${item.branch.toUpperCase()}`,
    category: item => item.category.toUpperCase(),
    gender: item => item.gender.toUpperCase(),
    status: item => item.status,
    hrActionDate: item => item.hrActionDate || '',
    cnic: item => item.cnic,
    phone: item => item.phone,
    date: item => item.date,
    userFreq: item => item.userFreq,
    cardType: item => item.cardType,
    cardCategory: item => item.cardCategory,
    previewCol: () => ''
};

function getVisibleColumnIndices() {
    const visible = columnDisplayOrder.filter(i => !hiddenColumns.has(i));
    // Fall back to natural column order if the header hasn't been
    // reordered/touched yet (columnDisplayOrder still matches 1:1).
    return visible.length > 0 ? visible : COLUMN_LABELS.map((_, i) => i).filter(i => !hiddenColumns.has(i));
}

// Lifecycle date/time columns are always appended to every export
// (Excel, CSV, selected-rows) in this fixed order, independent of
// the on-screen table's visible-column configuration.
const LIFECYCLE_EXPORT_COLUMNS = [
    ['Initiated Date', 'initiatedDate'], ['Initiated Time', 'initiatedTime'],
    ['Approved Date', 'approvedDate'], ['Approved Time', 'approvedTime'],
    ['Rejected Date', 'rejectedDate'], ['Rejected Time', 'rejectedTime'],
    ['Sent To Vendor Date', 'sentToVendorDate'], ['Sent To Vendor Time', 'sentToVendorTime'],
    ['Received From Vendor Date', 'receivedFromVendorDate'], ['Received From Vendor Time', 'receivedFromVendorTime']
];

// Export column set is fixed (independent of the on-screen table's
// visible/hidden-column configuration) so every export - Excel, CSV,
// or selected-rows - always produces exactly the same 9 columns:
// REQ ID, Applicant Name, Category, Functionality, Waybill No,
// UBL HR Status, Vendor Status, Latest Manual Comment and Updated
// Timestamp. "Category"/"Functionality" reuse this dashboard's
// cardCategory/cardType fields (Conventional/Islamic, HF/RF) - the
// same vocabulary vendor.html uses for those two fields. "Latest
// Manual Comment"/"Updated Timestamp" are pulled from the
// localStorage-backed comment store via fetchComments() (see the
// History drawer functions above) rather than from a static field.
function rowsToExportRows(arr) {
    return arr.map(item => {
        const comments = fetchComments(item.id);
        const latest = comments.length ? comments.reduce((a, b) => new Date(a.timestamp) > new Date(b.timestamp) ? a : b) : null;
        return {
            'REQ ID': item.id,
            'Applicant Name': item.name,
            'Category': item.cardCategory,
            'Functionality': item.cardType,
            'Waybill No': item.waybillNo || '',
            'UBL HR Status': item.status,
            'Vendor Status': item.vendorStatus,
            'Latest Manual Comment': latest ? latest.text : '',
            'Updated Timestamp': latest ? latest.timestamp : (item.hrActionDate || item.date || '')
        };
    });
}

function exportTableToExcel() {
    exportRowsToExcel(currentFilteredApplicants, "UBL_Applicant_Records.xlsx");
}

function exportRowsToExcel(arr, filename) {
    if (!arr || arr.length === 0) { alert("No records to export!"); return; }
    const rows = rowsToExportRows(arr);
    if (Object.keys(rows[0] || {}).length === 0) { alert("No columns are currently visible to export!"); return; }
    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Records");
    XLSX.writeFile(workbook, filename);
}

function exportSelectedRows() {
    const arr = mockApplicants.filter(item => selectedRowIds.has(item.id));
    if (arr.length === 0) { alert("Select at least one record using the checkboxes first."); return; }
    exportRowsToExcel(arr, "UBL_Selected_Records.xlsx");
}

function exportTableToCsv() {
    if (!currentFilteredApplicants || currentFilteredApplicants.length === 0) { alert("No records to export!"); return; }
    const rows = rowsToExportRows(currentFilteredApplicants);
    const headers = Object.keys(rows[0] || {});
    if (headers.length === 0) { alert("No columns are currently visible to export!"); return; }
    const escapeCell = v => `"${String(v).replace(/"/g, '""')}"`;
    const csv = [headers.map(escapeCell).join(',')]
        .concat(rows.map(r => headers.map(h => escapeCell(r[h])).join(',')))
        .join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'UBL_Applicant_Records.csv';
    link.click();
    URL.revokeObjectURL(link.href);
}

// --- Row actions -------------------------------------------------------

function findRecordById(id) { return mockApplicants.find(x => x.id === id); }

function viewRecord(id) {
    const r = findRecordById(id);
    if (!r) return;
    alert(
        `Request ${r.id}\n` +
        `Applicant: ${r.name}\nCNIC: ${r.cnic}\nPhone: ${r.phone}\n` +
        `Department: ${r.department}\nBranch: Branch ${r.branch.toUpperCase()}\nVendor: ${r.sentToVendor ? r.vendor : 'Not Sent'}\n` +
        `Status: ${r.status}\nPriority: ${r.category}\nDate: ${r.date}`
    );
}

function editRecord(id) {
    alert(`Edit Request ${id}\n\nEditing is not enabled in this preview build.`);
}

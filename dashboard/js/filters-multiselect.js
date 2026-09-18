// Filter bar widgets: multi-select dropdowns (msState), the Excel-style
// per-column filter popup, filter-count badge and the filter bar toggle.

const MS_IDS = ['issuanceTypeSelect', 'deptSelect', 'departmentSelect', 'vendorSelect', 'regionSelect', 'clusterSelect', 'branchSelect', 'categorySelect', 'genderSelect', 'statusSelect', 'reqIdSelect', 'applicantNameSelect', 'cnicSelect', 'phoneSelect', 'dateSelect', 'hrActionDateSelect', 'userFreqSelect2', 'cardTypeSelect', 'cardCategorySelect', 'vendorStatusSelect'];

const msState = {};
MS_IDS.forEach(id => { msState[id] = new Set(['all']); });

function getMsValues(id) {
    return Array.from(msState[id] || ['all']);
}

function positionMsPanel(dropdown) {
    const btn = dropdown.querySelector('.ms-toggle-btn');
    const panel = dropdown.querySelector('.ms-panel');
    const rect = btn.getBoundingClientRect();
    panel.style.minWidth = `${rect.width}px`;
    panel.style.left = `${rect.left}px`;

    let top = rect.bottom + 3;
    const panelHeight = panel.offsetHeight;
    if (top + panelHeight > window.innerHeight - 8) {
        top = Math.max(8, rect.top - panelHeight - 3);
    }
    panel.style.top = `${top}px`;
}

let efCurrentMsId = null;
let efCurrentField = null;
let efCurrentValues = new Set();

const USER_FREQ_LABEL_TO_TOKEN = {
    '≤ 2 Requests': '__lte2__',
    '≤ 5 Requests': '__lte5__',
    '≤ 10 Requests': '__lte10__',
    '> 10 Requests': '__gt10__'
};
const USER_FREQ_TOKEN_TO_LABEL = Object.fromEntries(
    Object.entries(USER_FREQ_LABEL_TO_TOKEN).map(([label, token]) => [token, label])
);

function matchesUserFreqSelection(vals, item) {
    if (vals.includes('all')) return true;
    return vals.some(v => {
        if (v === '__lte2__') return item.userFreq <= 2;
        if (v === '__lte5__') return item.userFreq <= 5;
        if (v === '__lte10__') return item.userFreq <= 10;
        if (v === '__gt10__') return item.userFreq > 10;
        return String(item.userFreq) === v;
    });
}

function formatFilterDisplay(field, v) {
    if (field === 'hrActionDate' && v === '') return 'Pending (No Action)';
    if (field === 'type') return formatIssuanceLabel(v);
    if (field === 'branch' && v !== 'Not Sent') return `Branch ${v}`;
    if (field === 'cluster') return v.replace('_', ' ');
    return v;
}

function openExcelColumnFilter(evt, field, msId) {
    evt.stopPropagation();
    document.querySelectorAll('.ms-dropdown.open').forEach(d => d.classList.remove('open'));

    efCurrentMsId = msId;
    efCurrentField = field;

    let uniqueVals = Array.from(new Set(mockApplicants.map(x => x[field])));
    if (field === 'userFreq') uniqueVals.sort((a, b) => a - b);
    else uniqueVals.sort();
    if (field === 'vendor') uniqueVals.push('Not Sent');
    if (field === 'userFreq') uniqueVals = ['≤ 2 Requests', '≤ 5 Requests', '≤ 10 Requests', '> 10 Requests'];

    const current = msState[msId];
    if (current.has('all')) {
        efCurrentValues = new Set(uniqueVals.map(String));
    } else {
        efCurrentValues = new Set();
        current.forEach(v => {
            if (field === 'vendor' && v === '__not_sent__') efCurrentValues.add('Not Sent');
            else if (field === 'vendor' && v === '__sent__') { /* no single-value equivalent to pre-check */ }
            else if (field === 'userFreq' && USER_FREQ_TOKEN_TO_LABEL[v]) efCurrentValues.add(USER_FREQ_TOKEN_TO_LABEL[v]);
            else efCurrentValues.add(v);
        });
    }

    renderExcelPopupOptions(uniqueVals);
    document.getElementById('efSearchInput').value = '';

    const popup = document.getElementById('excelFilterPopup');
    popup.classList.add('open');
    positionPopupSmart(popup, evt.currentTarget.getBoundingClientRect());
}

function renderExcelPopupOptions(values) {
    const list = document.getElementById('efOptionsList');
    list.innerHTML = values.map(v => `
        <label class="ms-option ef-option"><input type="checkbox" value="${v}" ${efCurrentValues.has(String(v)) ? 'checked' : ''} onchange="toggleExcelPopupValue('${v}', this.checked)"> ${formatFilterDisplay(efCurrentField, v)}</label>
    `).join('');
    document.getElementById('efSelectAll').checked = efCurrentValues.size === values.length;
}

function toggleExcelPopupValue(v, checked) {
    if (checked) efCurrentValues.add(v);
    else efCurrentValues.delete(v);
}

function toggleExcelPopupSelectAll(checked) {
    document.querySelectorAll('#efOptionsList input[type="checkbox"]').forEach(cb => {
        cb.checked = checked;
        if (checked) efCurrentValues.add(cb.value);
        else efCurrentValues.delete(cb.value);
    });
}

function filterExcelPopupOptions(term) {
    const t = term.trim().toLowerCase();
    document.querySelectorAll('#efOptionsList .ef-option').forEach(lbl => {
        lbl.style.display = lbl.textContent.toLowerCase().includes(t) ? 'flex' : 'none';
    });
}

function applyColumnSort(direction) {
    if (!efCurrentField) return;
    sortColumn = efCurrentField;
    sortDirection = direction;
    document.querySelectorAll('.sort-icon').forEach(i => {
        i.classList.remove('active', 'fa-sort-up', 'fa-sort-down');
        i.classList.add('fa-sort');
    });
    const icon = document.getElementById('sortIcon-' + efCurrentField);
    if (icon) {
        icon.classList.remove('fa-sort');
        icon.classList.add('active', direction === 1 ? 'fa-sort-up' : 'fa-sort-down');
    }
    applyFilters();
    closeExcelFilterPopup();
}

function applyExcelFilterPopup() {
    const msId = efCurrentMsId;
    const allVals = Array.from(document.querySelectorAll('#efOptionsList input[type="checkbox"]')).map(cb => cb.value);
    let finalValues = Array.from(efCurrentValues);
    if (efCurrentField === 'vendor') {
        finalValues = finalValues.map(v => v === 'Not Sent' ? '__not_sent__' : v);
    }
    if (efCurrentField === 'userFreq') {
        finalValues = finalValues.map(v => USER_FREQ_LABEL_TO_TOKEN[v] || v);
    }

    if (finalValues.length === 0 || finalValues.length === allVals.length) {
        msState[msId] = new Set(['all']);
    } else {
        msState[msId] = new Set(finalValues);
    }

    document.querySelectorAll(`#${msId} .ms-option input`).forEach(cb => {
        cb.checked = msState[msId].has('all') ? cb.value === 'all' : msState[msId].has(cb.value);
    });
    updateMsLabel(msId);
    applyFilters();
    closeExcelFilterPopup();
}

function closeExcelFilterPopup() {
    document.getElementById('excelFilterPopup').classList.remove('open');
    efCurrentMsId = null;
    efCurrentField = null;
}

document.addEventListener('click', (e) => {
    const popup = document.getElementById('excelFilterPopup');
    if (popup && popup.classList.contains('open') && !e.target.closest('#excelFilterPopup') && !e.target.closest('.th-filter-icon')) {
        closeExcelFilterPopup();
    }
});

function ensureMsPanelToolbar(id) {
    const panel = document.querySelector(`#${id} .ms-panel`);
    if (!panel || panel.dataset.toolbarReady) return;
    panel.dataset.toolbarReady = '1';

    const toolbar = document.createElement('div');
    toolbar.className = 'ms-panel-toolbar';
    toolbar.innerHTML = `
        <input type="text" class="ms-panel-search" placeholder="Search" oninput="filterMsOptions('${id}', this.value)">
        <div class="ms-panel-actions">
            <span onclick="selectAllMs('${id}')">Select All</span>
            <span onclick="clearAllMs('${id}')">Clear All</span>
        </div>
    `;
    panel.insertBefore(toolbar, panel.firstChild);
}

function filterMsOptions(id, term) {
    const t = term.trim().toLowerCase();
    document.querySelectorAll(`#${id} .ms-option`).forEach(opt => {
        opt.style.display = opt.textContent.toLowerCase().includes(t) ? 'flex' : 'none';
    });
}

function selectAllMs(id) {
    msState[id] = new Set(['all']);
    document.querySelectorAll(`#${id} .ms-option input`).forEach(cb => { cb.checked = true; });
    updateMsLabel(id);
    applyFilters();
}

function clearAllMs(id) {
    msState[id] = new Set();
    document.querySelectorAll(`#${id} .ms-option input`).forEach(cb => { cb.checked = false; });
    updateMsLabel(id);
    applyFilters();
}

function toggleMsPanel(id, evt) {
    if (evt) evt.stopPropagation();
    const dropdown = document.getElementById(id);
    const isOpen = dropdown.classList.contains('open');
    document.querySelectorAll('.ms-dropdown.open').forEach(d => d.classList.remove('open'));
    if (!isOpen) {
        ensureMsPanelToolbar(id);
        dropdown.classList.add('open');
        positionMsPanel(dropdown);
    }
}

document.addEventListener('click', (e) => {
    if (!e.target.closest('.ms-dropdown')) {
        document.querySelectorAll('.ms-dropdown.open').forEach(d => d.classList.remove('open'));
    }
});

window.addEventListener('resize', () => {
    document.querySelectorAll('.ms-dropdown.open').forEach(d => d.classList.remove('open'));
});

function onMsChange(id, value, checkbox) {
    const state = msState[id];

    if (checkbox.checked) {
        state.delete('all');
        state.add(value);
    } else {
        state.delete(value);
    }

    if (state.size === 0) {
        state.add('all');
    }

    updateMsLabel(id);
    applyFilters();
}

function updateMsLabel(id) {
    const state = msState[id];
    const labelEl = document.querySelector(`#${id} .ms-text`);

    if (labelEl) {
        if (state.has('all')) {
            labelEl.textContent = 'All';
        } else if (state.size === 1) {
            const value = Array.from(state)[0];
            const cb = Array.from(document.querySelectorAll(`#${id} .ms-option input`)).find(el => el.value === value);
            labelEl.textContent = cb ? cb.parentElement.textContent.trim() : value;
        } else {
            labelEl.textContent = `${state.size} selected`;
        }

        const toggleBtn = document.querySelector(`#${id} .ms-toggle-btn`);
        if (toggleBtn) toggleBtn.classList.toggle('filter-active', !state.has('all'));
    }

    document.querySelectorAll(`.th-filter-icon[data-ms-id="${id}"]`).forEach(icon => {
        icon.classList.toggle('filter-active', !state.has('all'));
    });
}

function setMsSingleValue(id, value) {
    msState[id] = new Set([value]);
    document.querySelectorAll(`#${id} .ms-option input`).forEach(cb => {
        cb.checked = cb.value === value;
    });
    updateMsLabel(id);
}

function resetMsToAll(id) {
    msState[id] = new Set(['all']);
    document.querySelectorAll(`#${id} .ms-option input`).forEach(cb => {
        cb.checked = cb.value === 'all';
    });
    updateMsLabel(id);
}

function matchesFilter(vals, itemVal) {
    return vals.includes('all') || vals.includes(itemVal);
}

function matchesVendorSelection(vals, item) {
    if (vals.includes('all')) return true;
    return vals.some(v => {
        if (v === '__sent__') return item.sentToVendor;
        if (v === '__not_sent__') return !item.sentToVendor;
        return item.vendor === v;
    });
}

function updateActiveFilterCount() {
    const count = MS_IDS.reduce((acc, id) => acc + (msState[id].has('all') ? 0 : 1), 0);
    const badge = document.getElementById('activeFilterCountBadge');
    if (count > 0) {
        badge.style.display = 'inline-block';
        badge.textContent = count;
    } else {
        badge.style.display = 'none';
    }
}

function toggleFilterBar() {
    const wrapper = document.getElementById('filterBarWrapper');
    const toggleBar = document.getElementById('filterToggleBar');
    const collapsed = wrapper.classList.toggle('collapsed');
    toggleBar.classList.toggle('collapsed', collapsed);
    document.body.classList.toggle('filters-open', !collapsed);
}

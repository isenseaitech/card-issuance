        let hiddenColumns = new Set([13, 14, 15]);
        let columnPermutation = null;
        let actionsColumnHidden = false;
        let sheetBlanked = false;
        const COLUMN_LABELS = ['Req ID', 'Applicant Name', 'Issuance Type', 'Group', 'Department', 'Vendor', 'Region', 'Cluster', 'Branch', 'Priority', 'Gender', 'Status', 'HR Action Date', 'CNIC', 'Phone', 'Date', 'Frequency', 'Card Functionality', 'Card Type', 'Preview', 'Vendor Status'];
        const COLUMN_FIELDS = ['id', 'name', 'type', 'dept', 'department', 'vendor', 'region', 'cluster', 'branch', 'category', 'gender', 'status', 'hrActionDate', 'cnic', 'phone', 'date', 'userFreq', 'cardType', 'cardCategory', 'previewCol', 'vendorStatus'];
        let columnDisplayOrder = COLUMN_LABELS.map((_, i) => i);

        function renderColumnVisibilityPanelContent() {
            const panel = document.getElementById('colVisibilityPanel');
            panel.innerHTML = `
                <input type="text" class="ms-panel-search" placeholder="Search" oninput="filterColumnVisibilityOptions(this.value)" onclick="event.stopPropagation()">
                <div class="ms-panel-actions">
                    <span onclick="setAllColumnsVisible(true); event.stopPropagation();">Select All</span>
                    <span onclick="setAllColumnsVisible(false); event.stopPropagation();">Clear All</span>
                </div>
                <div class="col-visibility-options">
                    ${COLUMN_LABELS.map((label, i) => `
                        <label class="col-visibility-option">
                            <input type="checkbox" ${hiddenColumns.has(i) ? '' : 'checked'} onchange="toggleColumnVisibility(${i})"> ${label}
                        </label>
                    `).join('')}
                    <label class="col-visibility-option">
                        <input type="checkbox" ${actionsColumnHidden ? '' : 'checked'} onchange="toggleActionsColumnVisibility()"> Actions
                    </label>
                </div>
            `;
        }

        function toggleColumnVisibilityPanel(evt) {
            evt.stopPropagation();
            const panel = document.getElementById('colVisibilityPanel');
            const isOpen = panel.classList.contains('open');
            if (isOpen) {
                panel.classList.remove('open');
                evt.currentTarget.classList.remove('active');
                return;
            }
            evt.currentTarget.classList.add('active');

            renderColumnVisibilityPanelContent();

            const rect = evt.currentTarget.getBoundingClientRect();
            panel.classList.add('open');
            positionPopupSmart(panel, rect);
        }

        function filterColumnVisibilityOptions(term) {
            const t = term.trim().toLowerCase();
            document.querySelectorAll('.col-visibility-option').forEach(lbl => {
                lbl.style.display = lbl.textContent.toLowerCase().includes(t) ? 'flex' : 'none';
            });
        }

        function setAllColumnsVisible(visible) {
            const allIndices = COLUMN_LABELS.map((_, i) => i);

            if (visible) {
                allIndices.forEach(i => hiddenColumns.delete(i));
                columnDisplayOrder = allIndices.slice();
            } else {
                allIndices.forEach(i => hiddenColumns.add(i));
            }
            actionsColumnHidden = !visible;
            renderColumnVisibilityPanelContent();
            reorderHeaderToMatch(columnDisplayOrder);
            setSheetBlanked(!visible);
        }

        function setSheetBlanked(blanked) {
            sheetBlanked = blanked;

            const checkboxTh = document.getElementById('checkboxColumnTh');
            if (checkboxTh) checkboxTh.classList.toggle('col-hidden', blanked);

            document.querySelectorAll('.sheet-toolbar-btn').forEach(btn => { btn.disabled = blanked; });

            if (blanked) {
                selectedRowIds.clear();
            }
            renderTableRows();
        }

        document.addEventListener('click', (e) => {
            const panel = document.getElementById('colVisibilityPanel');
            if (panel && !e.target.closest('.col-visibility-panel') && !e.target.closest('.btn-export-excel')) {
                panel.classList.remove('open');
                document.querySelectorAll('.btn-export-excel.active').forEach(b => b.classList.remove('active'));
            }
        });

        function toggleColumnVisibility(colIdx) {
            const wasBlanked = sheetBlanked;
            if (hiddenColumns.has(colIdx)) {
                hiddenColumns.delete(colIdx);
                // Newly-shown columns take the position they were checked in,
                // not their original fixed column order.
                columnDisplayOrder = columnDisplayOrder.filter(i => i !== colIdx);
                columnDisplayOrder.push(colIdx);
            } else {
                hiddenColumns.add(colIdx);
            }
            // Checking any column back on implies the user wants the sheet
            // visible again - a lone "Clear All" click shouldn't permanently
            // lock the table empty.
            if (wasBlanked) setSheetBlanked(false);
            reorderHeaderToMatch(columnDisplayOrder);
        }

        function toggleActionsColumnVisibility() {
            actionsColumnHidden = !actionsColumnHidden;
            if (sheetBlanked) setSheetBlanked(false);
            applyColumnVisibility();
        }

        function reorderHeaderToMatch(order) {
            const headerRow = document.querySelector('#applicantExcelTable thead tr');
            const checkboxTh = headerRow.children[0];
            const actionsTh = headerRow.children[headerRow.children.length - 1];
            const thByIdx = {};
            Array.from(headerRow.querySelectorAll('th[data-col-idx]')).forEach(th => { thByIdx[Number(th.dataset.colIdx)] = th; });

            headerRow.innerHTML = '';
            headerRow.appendChild(checkboxTh);
            order.forEach(idx => { if (thByIdx[idx]) headerRow.appendChild(thByIdx[idx]); });
            headerRow.appendChild(actionsTh);

            columnPermutation = order.slice();
            document.querySelectorAll('#applicantExcelTable tbody tr').forEach(tr => applyColumnOrderToRow(tr));
            applyColumnVisibility();
        }

        function applyColumnVisibility() {
            const table = document.getElementById('applicantExcelTable');
            const headerCells = Array.from(table.querySelectorAll('thead th'));
            headerCells.forEach(th => {
                if (th.dataset.colIdx !== undefined) {
                    th.classList.toggle('col-hidden', hiddenColumns.has(Number(th.dataset.colIdx)));
                }
            });
            const actionsTh = headerCells[headerCells.length - 1];
            if (actionsTh && actionsTh.dataset.colIdx === undefined) {
                actionsTh.classList.toggle('col-hidden', actionsColumnHidden);
            }

            document.querySelectorAll('#applicantExcelTable tbody tr').forEach(tr => {
                tr.querySelectorAll('td[data-col-idx]').forEach(td => {
                    td.classList.toggle('col-hidden', hiddenColumns.has(Number(td.dataset.colIdx)));
                });
                const cells = Array.from(tr.children);
                const actionsTd = cells[cells.length - 1];
                if (actionsTd) actionsTd.classList.toggle('col-hidden', actionsColumnHidden);
            });
        }

        function applyColumnOrderToRow(tr) {
            const table = document.getElementById('applicantExcelTable');
            const headerCells = Array.from(table.querySelectorAll('thead th'));
            const targetOrder = headerCells.map(th => th.dataset.colIdx !== undefined ? Number(th.dataset.colIdx) : null);
            const cells = Array.from(tr.children);
            const checkboxCell = cells[0];
            const actionsCell = cells[cells.length - 1];
            // Look cells up by their own tagged column index rather than by
            // position - positional slicing breaks the moment a row has
            // already been reordered once (its DOM order no longer matches
            // the original column order the slice assumed).
            const dataCellByIdx = {};
            tr.querySelectorAll('td[data-col-idx]').forEach(td => { dataCellByIdx[Number(td.dataset.colIdx)] = td; });

            tr.innerHTML = '';
            tr.appendChild(checkboxCell);
            targetOrder.forEach(idx => { if (idx !== null && dataCellByIdx[idx]) tr.appendChild(dataCellByIdx[idx]); });
            tr.appendChild(actionsCell);
        }

        function initColumnDragAndResize() {
            const headerCells = document.querySelectorAll('#applicantExcelTable thead th[data-col-idx]');
            let dragSrc = null;

            headerCells.forEach(th => {
                th.addEventListener('dragstart', () => { dragSrc = th; });
                th.addEventListener('dragover', e => { e.preventDefault(); th.classList.add('col-drag-over'); });
                th.addEventListener('dragleave', () => th.classList.remove('col-drag-over'));
                th.addEventListener('drop', e => {
                    e.preventDefault();
                    th.classList.remove('col-drag-over');
                    if (!dragSrc || dragSrc === th) return;
                    const headerRow = th.parentNode;
                    const cells = Array.from(headerRow.children);
                    const fromIdx = cells.indexOf(dragSrc);
                    const toIdx = cells.indexOf(th);
                    if (fromIdx < toIdx) headerRow.insertBefore(dragSrc, th.nextSibling);
                    else headerRow.insertBefore(dragSrc, th);

                    columnPermutation = Array.from(headerRow.querySelectorAll('th[data-col-idx]')).map(c => Number(c.dataset.colIdx));
                    columnDisplayOrder = columnPermutation.slice();
                    document.querySelectorAll('#applicantExcelTable tbody tr').forEach(tr => applyColumnOrderToRow(tr));
                    applyColumnVisibility();
                });
            });

            headerCells.forEach(th => {
                const handle = th.querySelector('.col-resize-handle');
                if (!handle) return;
                handle.addEventListener('mousedown', e => {
                    e.preventDefault();
                    e.stopPropagation();
                    const startX = e.clientX;
                    const startWidth = th.offsetWidth;
                    function onMove(ev) {
                        th.style.width = Math.max(40, startWidth + (ev.clientX - startX)) + 'px';
                    }
                    function onUp() {
                        document.removeEventListener('mousemove', onMove);
                        document.removeEventListener('mouseup', onUp);
                    }
                    document.addEventListener('mousemove', onMove);
                    document.addEventListener('mouseup', onUp);
                });
            });
        }


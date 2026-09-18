

        let deptBarChart, genderChart, trendChart, funnelChart, agingChart, rejectionChart, regionChart, vendorPerfChart, slaGaugeChart, cardTypeChart;

        function handleRangeChange() {
            const select = document.getElementById('timeRange');
            const customBox = document.getElementById('customDates');
            const monthBox = document.getElementById('monthSelectBox');
            const selectedValue = select.value;

            customBox.style.display = selectedValue === 'custom' ? 'flex' : 'none';
            monthBox.style.display = selectedValue === 'monthly' ? 'flex' : 'none';

            applyFilters();
        }

        function handleMonthChange() { applyFilters(); }
        function applyCustomDateRange() { applyFilters(); }

        function calculateUserFrequency(applicants) {
            const userCounts = {};
            applicants.forEach(item => {
                userCounts[item.name] = (userCounts[item.name] || 0) + 1;
            });
            return userCounts;
        }

        function computeVendorStats(applicants) {
            const stats = {};
            applicants.forEach(item => {
                if (!stats[item.vendor]) stats[item.vendor] = { total: 0, approved: 0, rejected: 0, pending: 0 };
                stats[item.vendor].total++;
                if (item.status === 'Approved') stats[item.vendor].approved++;
                else if (item.status === 'Rejected') stats[item.vendor].rejected++;
                else stats[item.vendor].pending++;
            });
            return stats;
        }

        function resetAllFilters() {
            MS_IDS.forEach(resetMsToAll);
            document.getElementById('timeRange').value = 'all';
            document.getElementById('selectedMonth').value = 'all';
            document.getElementById('globalSearchInput').value = '';
            document.getElementById('startD').value = '';
            document.getElementById('endD').value = '';
            quickFilterPredicate = null;

            sortColumn = null;
            sortDirection = 1;
            document.querySelectorAll('.sort-icon').forEach(i => {
                i.classList.remove('active', 'fa-sort-up', 'fa-sort-down');
                i.classList.add('fa-sort');
            });
            document.querySelectorAll('.mini-card-big, .mini-card-small, .metric-card').forEach(c => {
                c.classList.remove('active-quick-filter', 'dimmed-card');
            });
            document.querySelectorAll('.mini-card-split-half.active-quick-filter').forEach(c => c.classList.remove('active-quick-filter'));

            Object.keys(chartSelections).forEach(k => delete chartSelections[k]);
            document.querySelectorAll('.chart-box.chart-filtered').forEach(b => b.classList.remove('chart-filtered'));

            handleRangeChange();
        }

        let lastUpdatedTimer = null;

        function stampLastUpdated() {
            const now = new Date();
            const label = document.getElementById('lastUpdatedLabel');
            if (label) label.innerText = `Updated ${now.toLocaleTimeString()}`;
        }

        function refreshDashboard() {
            applyFilters();
            stampLastUpdated();
        }

        function toggleAutoRefresh() {
            const btn = document.getElementById('autoRefreshBtn');
            if (lastUpdatedTimer) {
                clearInterval(lastUpdatedTimer);
                lastUpdatedTimer = null;
                btn.classList.remove('auto-refresh-active');
                btn.title = 'Toggle auto-refresh (60s)';
            } else {
                lastUpdatedTimer = setInterval(refreshDashboard, 60000);
                btn.classList.add('auto-refresh-active');
                btn.title = 'Auto-refresh ON (every 60s) — click to stop';
                refreshDashboard();
            }
        }

        function toggleFullscreen() {
            if (!document.fullscreenElement) {
                document.documentElement.requestFullscreen().catch(() => {});
            } else {
                document.exitFullscreen();
            }
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

        let quickFilterPredicate = null;

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


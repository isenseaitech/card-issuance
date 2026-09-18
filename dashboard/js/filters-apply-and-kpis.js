        function applyFilters() {
            const deptVals = getMsValues('deptSelect');
            const departmentVals = getMsValues('departmentSelect');
            const vendorVals = getMsValues('vendorSelect');
            const issuanceVals = getMsValues('issuanceTypeSelect');
            const timeVal = document.getElementById('timeRange').value;
            const selectedMonth = document.getElementById('selectedMonth').value;
            const startD = document.getElementById('startD').value;
            const endD = document.getElementById('endD').value;
            const regionVals = getMsValues('regionSelect');
            const clusterVals = getMsValues('clusterSelect');
            const branchVals = getMsValues('branchSelect');
            const catVals = getMsValues('categorySelect');
            const genderVals = getMsValues('genderSelect');
            const statusVals = getMsValues('statusSelect');
            const searchTerm = document.getElementById('globalSearchInput').value;

            updateActiveFilterCount();

            updateApplicantTable(
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
            );

            updateChartTitle();

            const deptKeys = Object.keys(deptMaster);
            const deptCounts = {};
            deptKeys.forEach(k => deptCounts[k] = 0);
            currentFilteredApplicants.forEach(item => { if (deptCounts[item.dept] !== undefined) deptCounts[item.dept]++; });

            deptBarChart.data.labels = deptKeys;
            deptBarChart.data.datasets[0].data = deptKeys.map(k => deptCounts[k]);
            deptBarChart.update();

            const genderKeys = Object.keys(genderMaster);
            const genderCounts = {};
            genderKeys.forEach(g => genderCounts[g] = 0);
            currentFilteredApplicants.forEach(item => { if (genderCounts[item.gender] !== undefined) genderCounts[item.gender]++; });

            genderChart.data.datasets[0].data = genderKeys.map(g => genderCounts[g]);
            genderChart.update();

            updateKpis(currentFilteredApplicants);
            updateApprovalPerformance(currentFilteredApplicants, deptVals, computeVendorStats(currentFilteredApplicants));
            updateAllCharts(currentFilteredApplicants);
        }

        function avgOf(arr, field) {
            const vals = arr.map(x => x[field]).filter(v => v !== null && v !== undefined);
            if (vals.length === 0) return 0;
            return vals.reduce((a, b) => a + b, 0) / vals.length;
        }

        function updateKpis(arr) {
            const total = arr.length;
            const approved = arr.filter(x => x.status === 'Approved').length;
            const rejected = arr.filter(x => x.status === 'Rejected').length;
            const pending = arr.filter(x => x.status === 'Pending').length;
            const cardTypeRF = arr.filter(x => x.cardType === 'RF').length;
            const cardTypeHF = arr.filter(x => x.cardType === 'HF').length;
            const vendor = arr.filter(x => x.sentToVendor).length;
            const printed = arr.filter(x => x.printed).length;
            const delivered = arr.filter(x => x.delivered).length;
            const activated = arr.filter(x => x.activated).length;
            const activationRate = delivered > 0 ? (activated / delivered * 100) : 0;
            const overdue = arr.filter(x => x.overdue).length;

            document.getElementById('kpiTotal').innerText = total.toLocaleString();
            document.getElementById('kpiApproved').innerText = approved.toLocaleString();
            document.getElementById('kpiRejected').innerText = rejected.toLocaleString();
            document.getElementById('kpiPending').innerText = pending.toLocaleString();
            document.getElementById('kpiCardTypeRF').innerText = cardTypeRF.toLocaleString();
            document.getElementById('kpiCardTypeHF').innerText = cardTypeHF.toLocaleString();
            document.getElementById('kpiVendor').innerText = vendor.toLocaleString();
            document.getElementById('kpiPrinted').innerText = printed.toLocaleString();
            document.getElementById('kpiDelivered').innerText = delivered.toLocaleString();
            document.getElementById('kpiActivation').innerText = `${activationRate.toFixed(1)}%`;
            document.getElementById('kpiSlaRisk').innerText = overdue.toLocaleString();
        }

        function updateApprovalPerformance(arr, deptVals, vendorStats) {
            const total = arr.length;
            const approved = arr.filter(x => x.status === 'Approved').length;
            const rejected = arr.filter(x => x.status === 'Rejected').length;
            const appRate = total > 0 ? (approved / total * 100) : 0;
            const rejRate = total > 0 ? (rejected / total * 100) : 0;

            const avgApprovalTime = avgOf(arr, 'approvalHours');
            const avgVendorTime = avgOf(arr, 'vendorHours');
            const avgDeliveryTime = avgOf(arr, 'deliveryHours');

            const slaBreachCount = arr.filter(x => x.slaBreach).length;
            const slaCompliance = total > 0 ? (100 - (slaBreachCount / total * 100)) : 100;
            const overdue = arr.filter(x => x.overdue).length;
            const vendorDelayCount = arr.filter(x => x.sentToVendor && x.vendorHours > 36).length;
            const backlog = arr.filter(x => x.status === 'Pending').length;
            const throughput = arr.filter(x => x.date === TODAY_ISO && x.status !== 'Pending').length;
            const escalated = arr.filter(x => x.escalated).length;

            let bottleneckText = "Risk Clearance Stage (+18h)";
            if (!deptVals.includes('all') && deptVals.length === 1 && deptMaster[deptVals[0]]) {
                bottleneckText = deptMaster[deptVals[0]].bottleneck;
            }

            document.getElementById('perfAvgTime').innerText = `${avgApprovalTime.toFixed(1)} Hours`;
            document.getElementById('perfAppRate').innerText = `${appRate.toFixed(1)}%`;
            document.getElementById('perfRejRate').innerText = `${rejRate.toFixed(1)}%`;
            document.getElementById('perfEscalated').innerText = escalated.toLocaleString();
            document.getElementById('perfBottleneck').innerText = bottleneckText;
            document.getElementById('perfVendorTime').innerText = `${avgVendorTime.toFixed(1)} Hours`;
            document.getElementById('perfDeliveryTime').innerText = `${avgDeliveryTime.toFixed(1)} Hours`;
            document.getElementById('perfSlaCompliance').innerText = `${slaCompliance.toFixed(1)}%`;
            document.getElementById('perfOverdue').innerText = overdue.toLocaleString();
            document.getElementById('perfVendorDelay').innerText = vendorDelayCount.toLocaleString();
            document.getElementById('perfBacklog').innerText = backlog.toLocaleString();
            document.getElementById('perfThroughput').innerText = throughput.toLocaleString();

            const vendorEntries = Object.entries(vendorStats || {})
                .map(([name, s]) => ({ name, ...s }))
                .sort((a, b) => b.total - a.total);

            const vendorPerfBody = document.getElementById('vendorPerformanceTableBody');
            vendorPerfBody.innerHTML = vendorEntries.length === 0
                ? `<tr><td colspan="5" style="text-align:center; color:var(--text-muted); padding:8px;">No records.</td></tr>`
                : vendorEntries.map(v => `
                    <tr>
                        <td>${v.name}</td>
                        <td class="vendor-clickable-cell" style="font-weight:700;" onclick="filterByVendorStatus('${v.name}', 'all')">${v.total}</td>
                        <td class="vendor-clickable-cell" style="color:var(--accent-green); font-weight:700;" onclick="filterByVendorStatus('${v.name}', 'Approved')">${v.approved}</td>
                        <td class="vendor-clickable-cell" style="color:var(--accent-red); font-weight:700;" onclick="filterByVendorStatus('${v.name}', 'Rejected')">${v.rejected}</td>
                        <td class="vendor-clickable-cell" style="color:var(--accent-amber); font-weight:700;" onclick="filterByVendorStatus('${v.name}', 'Pending')">${v.pending}</td>
                    </tr>
                `).join('');
        }

        function filterByVendorStatus(vendorName, status) {
            setMsSingleValue('vendorSelect', vendorName);
            if (status === 'all') {
                resetMsToAll('statusSelect');
            } else {
                setMsSingleValue('statusSelect', status);
            }
            applyFilters();

            const excelTable = document.getElementById('applicantExcelTable');
            if (excelTable) excelTable.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }

        function setActiveCard(el) {
            document.querySelectorAll('.mini-card-big, .mini-card-small, .metric-card').forEach(c => {
                c.classList.remove('active-quick-filter', 'dimmed-card');
            });
            document.querySelectorAll('.mini-card-split-half.active-quick-filter').forEach(c => c.classList.remove('active-quick-filter'));

            const isMiniCard = el.classList.contains('mini-card-big') || el.classList.contains('mini-card-small');
            if (isMiniCard) {
                // User Metrics + Vendor Metrics dim together as one group.
                document.querySelectorAll('.mini-card-big, .mini-card-small').forEach(c => {
                    if (c !== el) c.classList.add('dimmed-card');
                });
            } else {
                const scope = el.closest('.card-subgrid') || el.parentElement;
                scope.querySelectorAll('.metric-card').forEach(c => {
                    if (c !== el) c.classList.add('dimmed-card');
                });
            }

            el.classList.add('active-quick-filter');
        }

        function clearActiveCard() {
            document.querySelectorAll('.mini-card-big, .mini-card-small, .metric-card').forEach(c => {
                c.classList.remove('active-quick-filter', 'dimmed-card');
            });
            document.querySelectorAll('.mini-card-split-half.active-quick-filter').forEach(c => c.classList.remove('active-quick-filter'));
        }

        function toggleCardFilter(el, filterFn) {
            if (el.classList.contains('active-quick-filter')) {
                clearActiveCard();
                quickFilterShowAll();
            } else {
                setActiveCard(el);
                filterFn();
            }
        }

        function revealExcelSheet() {
            const excelTable = document.getElementById('applicantExcelTable');
            if (excelTable) excelTable.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }

        function quickFilterStatus(status) {
            resetMsToAll('vendorSelect');
            quickFilterPredicate = null;
            if (status === 'all') {
                resetMsToAll('statusSelect');
            } else {
                setMsSingleValue('statusSelect', status);
            }
            applyFilters();
            revealExcelSheet();
        }

        function quickFilterVendorSent(sent) {
            resetMsToAll('statusSelect');
            quickFilterPredicate = null;
            setMsSingleValue('vendorSelect', sent ? '__sent__' : '__not_sent__');
            applyFilters();
            revealExcelSheet();
        }

        function quickFilterShowAll() {
            resetMsToAll('statusSelect');
            resetMsToAll('vendorSelect');
            quickFilterPredicate = null;
            applyFilters();
            revealExcelSheet();
        }

        function quickFilterBoolean(predicateFn) {
            resetMsToAll('statusSelect');
            resetMsToAll('vendorSelect');
            quickFilterPredicate = predicateFn;
            applyFilters();
            revealExcelSheet();
        }

        function toggleCardTypeFilter(el, type) {
            const otherId = type === 'RF' ? 'cardTypeHalfHF' : 'cardTypeHalfRF';
            if (el.classList.contains('active-quick-filter')) {
                el.classList.remove('active-quick-filter');
                clearActiveCard();
                quickFilterShowAll();
            } else {
                clearActiveCard();
                document.getElementById(otherId).classList.remove('active-quick-filter');
                el.classList.add('active-quick-filter');
                document.querySelectorAll('.mini-card-big, .mini-card-small').forEach(c => {
                    if (c !== el.closest('.mini-card-small')) c.classList.add('dimmed-card');
                });
                quickFilterBoolean(x => x.cardType === type);
            }
        }

        function quickFilterOverdue() { quickFilterBoolean(x => x.overdue); }
        function quickFilterVendorDelay() { quickFilterBoolean(x => x.sentToVendor && x.vendorHours > 36); }
        function quickFilterBacklog() { quickFilterBoolean(x => x.status === 'Pending'); }
        function quickFilterThroughput() { quickFilterBoolean(x => x.date === TODAY_ISO && x.status !== 'Pending'); }

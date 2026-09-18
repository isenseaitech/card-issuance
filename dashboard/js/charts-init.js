// Chart.js setup: plugin registration, the ten dashboard charts, the
// click-to-filter selection state and updateAllCharts().

let deptBarChart, genderChart, trendChart, funnelChart, agingChart, rejectionChart, regionChart, vendorPerfChart, slaGaugeChart, cardTypeChart;

if (window.ChartDataLabels) Chart.register(ChartDataLabels);

// Draws each donut/pie slice's percentage as "<big number><small %>"
// - the datalabels plugin can only render a whole label in one font
// size, so this manually paints the number and the % sign in two
// different sizes, centered together on the slice.
function makeMixedPercentPlugin(color) {
    return {
        id: 'mixedPercentLabels',
        afterDatasetsDraw(chart) {
            const { ctx } = chart;
            const meta = chart.getDatasetMeta(0);
            const data = chart.data.datasets[0].data;
            const total = data.reduce((a, b) => a + b, 0);
            if (total <= 0) return;

            meta.data.forEach((arc, i) => {
                const value = data[i];
                if (!value) return;
                const pct = Math.round(value / total * 100);
                if (pct <= 0) return;

                const pos = arc.getCenterPoint();
                const numText = String(pct);
                const numFont = 'bold 10px sans-serif';
                const signFont = 'bold 6px sans-serif';

                ctx.save();
                ctx.textBaseline = 'middle';
                ctx.fillStyle = color;

                ctx.font = numFont;
                const numWidth = ctx.measureText(numText).width;
                ctx.font = signFont;
                const signWidth = ctx.measureText('%').width;

                let x = pos.x - (numWidth + signWidth) / 2;
                ctx.textAlign = 'left';

                ctx.font = numFont;
                ctx.fillText(numText, x, pos.y);
                x += numWidth;

                ctx.font = signFont;
                ctx.fillText('%', x, pos.y + 1);

                ctx.restore();
            });
        }
    };
}

const ctxBar = document.getElementById('deptBarChart').getContext('2d');
deptBarChart = new Chart(ctxBar, {
    type: 'bar',
    data: {
        labels: Object.keys(deptMaster),
        datasets: [{
            label: 'Requests',
            data: [5200, 3400, 1900, 2600, 1100],
            backgroundColor: Object.values(deptMaster).map(d => d.color),
            borderRadius: 0
        }]
    },
    options: {
        indexAxis: 'x',
        responsive: true,
        maintainAspectRatio: false,
        layout: {
            padding: {
                bottom: 5,
                left: 5,
                right: 5,
                top: 20
            }
        },
        onClick: (e, elements) => {
            if (elements.length > 0) {
                const index = elements[0].index;
                const clickedDept = Object.keys(deptMaster)[index];
                toggleChartSelection('group', 'groupChartBox', clickedDept,
                    () => { setMsSingleValue('deptSelect', clickedDept); applyFilters(); },
                    () => { resetMsToAll('deptSelect'); applyFilters(); }
                );
            }
        },
        plugins: {
            legend: { display: false },
            datalabels: {
                anchor: 'end',
                align: 'end',
                clamp: true,
                color: '#374151',
                font: { size: 9, weight: 'bold' },
                formatter: value => value.toLocaleString()
            }
        },
        scales: {
            x: {
                ticks: {
                    color: '#374151',
                    font: { size: 10 },
                    maxRotation: 45,
                    minRotation: 45
                },
                grid: { display: false }
            },
            y: {
                display: false,
                ticks: { display: false },
                grid: { display: false }
            }
        }
    }
});

const ctxGender = document.getElementById('genderChart').getContext('2d');
genderChart = new Chart(ctxGender, {
    type: 'doughnut',
    data: {
        labels: Object.keys(genderMaster).map(g => g.charAt(0).toUpperCase() + g.slice(1)),
        datasets: [{
            data: Object.values(genderMaster).map(g => g.baseVal),
            backgroundColor: Object.values(genderMaster).map(g => g.color),
            borderWidth: 0
        }]
    },
    plugins: [makeMixedPercentPlugin('#ffffff')],
    options: {
        responsive: true,
        maintainAspectRatio: false,
        layout: { padding: 6 },
        onClick: (e, elements) => {
            if (elements.length > 0) {
                const index = elements[0].index;
                const clickedGender = Object.keys(genderMaster)[index];
                toggleChartSelection('gender', 'genderChartBox', clickedGender,
                    () => { setMsSingleValue('genderSelect', clickedGender); applyFilters(); },
                    () => { resetMsToAll('genderSelect'); applyFilters(); }
                );
            }
        },
        plugins: {
            legend: {
                position: 'right',
                align: 'center',
                labels: {
                    color: '#374151',
                    font: { size: 9 },
                    boxWidth: 8,
                    padding: 6
                }
            },
            datalabels: { display: false }
        },
        cutout: '62%'
    }
});

const chartSelections = {};

function markChartFiltered(boxId, active) {
    const box = document.getElementById(boxId);
    if (box) box.classList.toggle('chart-filtered', active);
}

function toggleChartSelection(key, boxId, value, applyFn, clearFn) {
    if (chartSelections[key] === value) {
        delete chartSelections[key];
        markChartFiltered(boxId, false);
        clearFn();
    } else {
        chartSelections[key] = value;
        markChartFiltered(boxId, true);
        applyFn();
    }
}

const horizBarBase = {
    indexAxis: 'y',
    responsive: true,
    maintainAspectRatio: false,
    layout: { padding: { left: 5, right: 20, top: 5, bottom: 5 } },
    plugins: {
        legend: { display: false },
        datalabels: {
            anchor: 'end', align: 'end', clamp: true,
            color: '#374151',
            font: { size: 9, weight: 'bold' },
            formatter: v => v.toLocaleString()
        }
    },
    scales: {
        x: { display: false, grid: { display: false } },
        y: { ticks: { color: '#374151', font: { size: 10 } }, grid: { display: false } }
    }
};

const ctxTrend = document.getElementById('trendChart').getContext('2d');
trendChart = new Chart(ctxTrend, {
    type: 'line',
    data: {
        labels: [],
        datasets: [
            { label: 'Total', data: [], borderColor: '#1E5AA8', backgroundColor: 'rgba(30,90,168,0.12)', tension: 0.3, fill: true },
            { label: 'Approved', data: [], borderColor: '#2E7D32', backgroundColor: 'transparent', tension: 0.3 },
            { label: 'Rejected', data: [], borderColor: '#C62828', backgroundColor: 'transparent', tension: 0.3 }
        ]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false,
        onClick: (e, elements) => {
            if (elements.length > 0) {
                const label = trendChart.data.labels[elements[0].index];
                toggleChartSelection('trend', 'trendChartBox', label,
                    () => quickFilterMonth(label),
                    () => { document.getElementById('timeRange').value = 'all'; handleRangeChange(); }
                );
            }
        },
        plugins: {
            legend: { position: 'top', labels: { color: '#374151', font: { size: 9 }, boxWidth: 8 } },
            datalabels: { display: false }
        },
        scales: {
            x: { ticks: { color: '#374151', font: { size: 10 } }, grid: { display: false } },
            y: { ticks: { color: '#374151', font: { size: 10 } }, grid: { color: 'rgba(148,163,184,0.15)' } }
        }
    }
});

const ctxFunnel = document.getElementById('funnelChart').getContext('2d');
funnelChart = new Chart(ctxFunnel, {
    type: 'bar',
    data: {
        labels: ['Submitted', 'Approved', 'Sent to Vendor', 'Printed', 'Delivered', 'Activated'],
        datasets: [{ data: [], backgroundColor: ['#1E5AA8', '#3E6C99', '#5B8AC7', '#7BA3C7', '#2E7D32', '#5AA860'], borderRadius: 0 }]
    },
    options: {
        ...horizBarBase,
        onClick: (e, elements) => {
            if (elements.length === 0) return;
            const idx = elements[0].index;
            toggleChartSelection('funnel', 'funnelChartBox', idx,
                () => {
                    if (idx === 0) quickFilterShowAll();
                    else if (idx === 1) quickFilterStatus('Approved');
                    else if (idx === 2 || idx === 3) quickFilterVendorSent(true);
                    else if (idx === 4) quickFilterBoolean(x => x.delivered);
                    else if (idx === 5) quickFilterBoolean(x => x.activated);
                },
                () => quickFilterShowAll()
            );
        }
    }
});

const ctxAging = document.getElementById('agingChart').getContext('2d');
agingChart = new Chart(ctxAging, {
    type: 'bar',
    data: {
        labels: ['0-1 Day', '2-3 Days', '4-7 Days', '7+ Days'],
        datasets: [{ data: [], backgroundColor: ['#2E7D32', '#ED6C02', '#C62828', '#8E1F1F'], borderRadius: 0 }]
    },
    options: {
        indexAxis: 'x',
        responsive: true,
        maintainAspectRatio: false,
        layout: { padding: { top: 20 } },
        onClick: (e, elements) => {
            if (elements.length === 0) return;
            const buckets = [[0, 1], [2, 3], [4, 7], [8, Infinity]];
            const idx = elements[0].index;
            const b = buckets[idx];
            toggleChartSelection('aging', 'agingChartBox', idx,
                () => quickFilterBoolean(x => {
                    if (x.status !== 'Pending') return false;
                    const age = Math.round((new Date(TODAY_ISO) - new Date(x.date)) / 86400000);
                    return age >= b[0] && age <= b[1];
                }),
                () => quickFilterShowAll()
            );
        },
        plugins: {
            legend: { display: false },
            datalabels: {
                anchor: 'end', align: 'end', clamp: true,
                color: '#374151',
                font: { size: 9, weight: 'bold' }
            }
        },
        scales: {
            x: { ticks: { color: '#374151', font: { size: 10 } }, grid: { display: false } },
            y: { display: false, grid: { display: false } }
        }
    }
});

const ctxRejection = document.getElementById('rejectionChart').getContext('2d');
rejectionChart = new Chart(ctxRejection, {
    type: 'doughnut',
    data: {
        labels: Object.keys(REJECTION_REASONS),
        datasets: [{ data: [], backgroundColor: ['#C62828', '#ED6C02', '#5B6B82', '#3E6C99', '#94a3b8'], borderWidth: 0 }]
    },
    plugins: [makeMixedPercentPlugin('#ffffff')],
    options: {
        responsive: true,
        maintainAspectRatio: false,
        layout: { padding: 4 },
        onClick: (e, elements) => {
            if (elements.length > 0) {
                const reason = Object.keys(REJECTION_REASONS)[elements[0].index];
                toggleChartSelection('rejection', 'rejectionChartBox', reason,
                    () => quickFilterRejectionReason(reason),
                    () => quickFilterShowAll()
                );
            }
        },
        plugins: {
            legend: { position: 'right', labels: { color: '#374151', font: { size: 9 }, boxWidth: 8, padding: 5 } },
            datalabels: { display: false }
        },
        cutout: '58%'
    }
});

const ctxRegion = document.getElementById('regionChart').getContext('2d');
regionChart = new Chart(ctxRegion, {
    type: 'bar',
    data: { labels: [], datasets: [{ data: [], backgroundColor: '#1E5AA8', borderRadius: 0 }] },
    options: {
        ...horizBarBase,
        onClick: (e, elements) => {
            if (elements.length > 0) {
                const label = regionChart.data.labels[elements[0].index];
                toggleChartSelection('region', 'regionChartBox', label,
                    () => { setMsSingleValue('regionSelect', label); applyFilters(); revealExcelSheet(); },
                    () => { resetMsToAll('regionSelect'); applyFilters(); }
                );
            }
        }
    }
});

const ctxVendorPerf = document.getElementById('vendorPerfChart').getContext('2d');
vendorPerfChart = new Chart(ctxVendorPerf, {
    type: 'bar',
    data: { labels: [], datasets: [{ data: [], backgroundColor: '#5B8AC7', borderRadius: 0 }] },
    options: {
        ...horizBarBase,
        onClick: (e, elements) => {
            if (elements.length > 0) {
                const label = vendorPerfChart.data.labels[elements[0].index];
                toggleChartSelection('vendor', 'vendorChartBox', label,
                    () => filterByVendorStatus(label, 'all'),
                    () => { resetMsToAll('vendorSelect'); resetMsToAll('statusSelect'); applyFilters(); }
                );
            }
        }
    }
});

const ctxSla = document.getElementById('slaGaugeChart').getContext('2d');
slaGaugeChart = new Chart(ctxSla, {
    type: 'doughnut',
    data: {
        labels: ['Compliant', 'Breached'],
        datasets: [{ data: [100, 0], backgroundColor: ['#2E7D32', '#C62828'], borderWidth: 0 }]
    },
    plugins: [makeMixedPercentPlugin('#ffffff')],
    options: {
        responsive: true,
        maintainAspectRatio: false,
        rotation: -90,
        circumference: 180,
        cutout: '60%',
        layout: { padding: 4 },
        onClick: () => {
            toggleChartSelection('sla', 'slaChartBox', true,
                () => quickFilterOverdue(),
                () => quickFilterShowAll()
            );
        },
        plugins: {
            legend: { position: 'bottom', labels: { color: '#374151', font: { size: 9 }, boxWidth: 8, padding: 5 } },
            datalabels: { display: false }
        }
    }
});

const ctxCardType = document.getElementById('cardTypeChart').getContext('2d');
cardTypeChart = new Chart(ctxCardType, {
    type: 'bar',
    data: {
        labels: ['RF', 'HF'],
        datasets: [{ data: [], backgroundColor: ['#1E5AA8', '#8B5CF6'], borderRadius: 0 }]
    },
    options: {
        indexAxis: 'x',
        responsive: true,
        maintainAspectRatio: false,
        layout: { padding: { top: 20 } },
        onClick: (e, elements) => {
            if (elements.length > 0) {
                const label = cardTypeChart.data.labels[elements[0].index];
                toggleChartSelection('cardType', 'cardTypeChartBox', label,
                    () => quickFilterBoolean(x => x.cardType === label),
                    () => quickFilterShowAll()
                );
            }
        },
        plugins: {
            legend: { display: false },
            datalabels: {
                anchor: 'end', align: 'end', clamp: true,
                color: '#374151',
                font: { size: 9, weight: 'bold' },
                formatter: v => v.toLocaleString()
            }
        },
        scales: {
            x: { ticks: { color: '#374151', font: { size: 10 } }, grid: { display: false } },
            y: { display: false, grid: { display: false } }
        }
    }
});

function updateAllCharts(arr) {
    const monthKeys = Array.from(new Set(arr.map(x => x.date.slice(0, 7)))).sort();
    const monthLabels = monthKeys.map(k => new Date(k + '-01').toLocaleString('en-US', { month: 'short' }));
    trendChart.data.labels = monthLabels;
    trendChart.data.datasets[0].data = monthKeys.map(k => arr.filter(x => x.date.slice(0, 7) === k).length);
    trendChart.data.datasets[1].data = monthKeys.map(k => arr.filter(x => x.date.slice(0, 7) === k && x.status === 'Approved').length);
    trendChart.data.datasets[2].data = monthKeys.map(k => arr.filter(x => x.date.slice(0, 7) === k && x.status === 'Rejected').length);
    trendChart.update();

    const submitted = arr.length;
    const approved = arr.filter(x => x.status === 'Approved').length;
    const vendor = arr.filter(x => x.sentToVendor).length;
    const printed = arr.filter(x => x.printed).length;
    const delivered = arr.filter(x => x.delivered).length;
    const activated = arr.filter(x => x.activated).length;
    funnelChart.data.datasets[0].data = [submitted, approved, vendor, printed, delivered, activated];
    funnelChart.update();

    const pending = arr.filter(x => x.status === 'Pending');
    const buckets = [0, 0, 0, 0];
    pending.forEach(x => {
        const age = Math.round((new Date(TODAY_ISO) - new Date(x.date)) / 86400000);
        if (age <= 1) buckets[0]++;
        else if (age <= 3) buckets[1]++;
        else if (age <= 7) buckets[2]++;
        else buckets[3]++;
    });
    agingChart.data.datasets[0].data = buckets;
    agingChart.update();

    const rejected = arr.filter(x => x.status === 'Rejected');
    rejectionChart.data.datasets[0].data = Object.keys(REJECTION_REASONS).map(r => rejected.filter(x => x.rejectionReason === r).length);
    rejectionChart.update();

    const regionCounts = {};
    arr.forEach(x => { regionCounts[x.region] = (regionCounts[x.region] || 0) + 1; });
    const regionKeys = Object.keys(regionCounts).sort((a, b) => regionCounts[b] - regionCounts[a]);
    regionChart.data.labels = regionKeys;
    regionChart.data.datasets[0].data = regionKeys.map(k => regionCounts[k]);
    regionChart.update();

    const vendorCounts = {};
    arr.forEach(x => { vendorCounts[x.vendor] = (vendorCounts[x.vendor] || 0) + 1; });
    const vendorKeys = Object.keys(vendorCounts).sort((a, b) => vendorCounts[b] - vendorCounts[a]);
    vendorPerfChart.data.labels = vendorKeys;
    vendorPerfChart.data.datasets[0].data = vendorKeys.map(k => vendorCounts[k]);
    vendorPerfChart.update();

    const slaBreachCount = arr.filter(x => x.slaBreach).length;
    const compliance = submitted > 0 ? Math.round((1 - slaBreachCount / submitted) * 1000) / 10 : 100;
    slaGaugeChart.data.datasets[0].data = [compliance, Math.round((100 - compliance) * 10) / 10];
    slaGaugeChart.update();

    const cardTypeRF = arr.filter(x => x.cardType === 'RF').length;
    const cardTypeHF = arr.filter(x => x.cardType === 'HF').length;
    cardTypeChart.data.datasets[0].data = [cardTypeRF, cardTypeHF];
    cardTypeChart.update();
}

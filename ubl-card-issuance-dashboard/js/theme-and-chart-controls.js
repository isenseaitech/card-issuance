        function toggleTheme() {
            setTheme(!isDarkMode);
        }

        function setTheme(dark) {
            isDarkMode = dark;
            const html = document.documentElement;
            const icon = document.getElementById('thumbIcon');

            if (isDarkMode) {
                html.setAttribute('data-theme', 'dark');
                icon.className = 'fa-solid fa-moon';
            } else {
                html.setAttribute('data-theme', 'light');
                icon.className = 'fa-solid fa-sun';
            }

            updateChartColors(isDarkMode);
        }

        function autoDetectTheme() {
            const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            setTheme(systemPrefersDark);
        }

        function updateChartColors(isDark) {
            const textColor = isDark ? '#cbd5e1' : '#374151';

            [deptBarChart, genderChart, trendChart, funnelChart, agingChart,
                rejectionChart, regionChart, vendorPerfChart, slaGaugeChart, cardTypeChart].forEach(c => {
                if (!c) return;
                if (c.options.scales) {
                    if (c.options.scales.x && c.options.scales.x.ticks) c.options.scales.x.ticks.color = textColor;
                    if (c.options.scales.y && c.options.scales.y.ticks) c.options.scales.y.ticks.color = textColor;
                }
                if (c.options.plugins && c.options.plugins.legend && c.options.plugins.legend.labels) {
                    c.options.plugins.legend.labels.color = textColor;
                }
                c.update();
            });
        }

        const CHART_VIEWS = {
            group: { box: 'groupChartBox', label: 'Group', title: 'Group Requests', chart: () => deptBarChart },
            gender: { box: 'genderChartBox', label: 'Gender', title: 'Gender Split', chart: () => genderChart },
            trend: { box: 'trendChartBox', label: 'Trend', title: 'Monthly Trend', chart: () => trendChart },
            funnel: { box: 'funnelChartBox', label: 'Funnel', title: 'Request Funnel', chart: () => funnelChart },
            aging: { box: 'agingChartBox', label: 'Aging', title: 'Request Aging', chart: () => agingChart },
            rejection: { box: 'rejectionChartBox', label: 'Rejections', title: 'Rejection Reasons', chart: () => rejectionChart },
            region: { box: 'regionChartBox', label: 'Region', title: 'Region Split', chart: () => regionChart },
            vendor: { box: 'vendorChartBox', label: 'Vendor', title: 'Vendor Performance', chart: () => vendorPerfChart },
            sla: { box: 'slaChartBox', label: 'SLA', title: 'SLA Compliance', chart: () => slaGaugeChart },
            cardType: { box: 'cardTypeChartBox', label: 'Card Functionality', title: 'Card Functionality Breakdown', chart: () => cardTypeChart }
        };

        let currentChartView = 'group';

        function switchChartView(view) {
            currentChartView = view;

            Object.keys(CHART_VIEWS).forEach(v => {
                const cfg = CHART_VIEWS[v];
                document.getElementById(cfg.box).style.display = v === view ? 'flex' : 'none';
            });
            document.querySelectorAll('.chart-view-option').forEach(opt => {
                opt.classList.toggle('active', opt.dataset.view === view);
            });
            document.getElementById('chartViewLabel').innerText = CHART_VIEWS[view].label;
            document.getElementById('chartViewDropdown').classList.remove('open');

            updateChartTitle();
            syncChartControlStates();
            const activeChart = CHART_VIEWS[view].chart();
            if (activeChart) activeChart.resize();
        }

        function toggleChartViewPanel(evt) {
            evt.stopPropagation();
            const dropdown = document.getElementById('chartViewDropdown');
            const isOpen = dropdown.classList.contains('open');
            document.querySelectorAll('.ms-dropdown.open').forEach(d => d.classList.remove('open'));
            if (!isOpen) {
                dropdown.classList.add('open');
                const btn = dropdown.querySelector('button');
                const panel = dropdown.querySelector('.ms-panel');
                const rect = btn.getBoundingClientRect();
                panel.style.top = `${rect.bottom + 3}px`;
                panel.style.left = 'auto';
                panel.style.right = `${window.innerWidth - rect.right}px`;
                panel.style.minWidth = `${rect.width}px`;
            }
        }

        // --- Chart Type + Color Palette controls (apply to whichever chart view is active) ---
        function toggleChartTypePanel(evt) {
            evt.stopPropagation();
            const dropdown = document.getElementById('chartTypeDropdown');
            const isOpen = dropdown.classList.contains('open');
            document.querySelectorAll('.ms-dropdown.open').forEach(d => d.classList.remove('open'));
            if (!isOpen) {
                dropdown.classList.add('open');
                const btn = dropdown.querySelector('button');
                const panel = dropdown.querySelector('.ms-panel');
                const rect = btn.getBoundingClientRect();
                panel.style.top = `${rect.bottom + 3}px`;
                panel.style.left = 'auto';
                panel.style.right = `${window.innerWidth - rect.right}px`;
                panel.style.minWidth = `${rect.width}px`;
            }
        }

        function toggleChartColorPanel(evt) {
            evt.stopPropagation();
            const dropdown = document.getElementById('chartColorDropdown');
            const isOpen = dropdown.classList.contains('open');
            document.querySelectorAll('.ms-dropdown.open').forEach(d => d.classList.remove('open'));
            if (!isOpen) {
                dropdown.classList.add('open');
                const btn = dropdown.querySelector('button');
                const panel = dropdown.querySelector('.ms-panel');
                const rect = btn.getBoundingClientRect();
                panel.style.top = `${rect.bottom + 3}px`;
                panel.style.left = 'auto';
                panel.style.right = `${window.innerWidth - rect.right}px`;
                panel.style.minWidth = `${rect.width}px`;
            }
        }

        function _hexToRgbTuple(hex) {
            const h = hex.replace('#', '');
            return [parseInt(h.substr(0, 2), 16), parseInt(h.substr(2, 2), 16), parseInt(h.substr(4, 2), 16)];
        }

        function _interpolateHex(c1, c2, t) {
            const a = _hexToRgbTuple(c1), b = _hexToRgbTuple(c2);
            const r = Math.round(a[0] + (b[0] - a[0]) * t);
            const g = Math.round(a[1] + (b[1] - a[1]) * t);
            const bch = Math.round(a[2] + (b[2] - a[2]) * t);
            return `rgb(${r}, ${g}, ${bch})`;
        }

        function generateGradientColors(startHex, endHex, count) {
            if (count <= 1) return [startHex];
            const colors = [];
            for (let i = 0; i < count; i++) colors.push(_interpolateHex(startHex, endHex, i / (count - 1)));
            return colors;
        }

        function toRgba(color, alpha) {
            if (color.startsWith('#')) {
                const [r, g, b] = _hexToRgbTuple(color);
                return `rgba(${r}, ${g}, ${b}, ${alpha})`;
            }
            const m = color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
            if (m) return `rgba(${m[1]}, ${m[2]}, ${m[3]}, ${alpha})`;
            return color;
        }

        const CHART_COLOR_PALETTES = {
            professionalBlue: { start: '#93C5FD', end: '#1D4ED8' },
            teal: { start: '#5EEAD4', end: '#134E4A' },
            purple: { start: '#C4B5FD', end: '#4C1D95' },
            green: { start: '#86EFAC', end: '#14532D' },
            monochrome: { start: '#D1D5DB', end: '#374151' },
        };

        // Each view's original hand-picked colors - reused as the "corporate" (default) palette
        // so switching chart type without touching the color menu keeps the familiar look.
        const CHART_NATIVE_COLORS = {
            aging: ['#2E7D32', '#ED6C02', '#C62828', '#8E1F1F'],
            rejection: ['#C62828', '#ED6C02', '#5B6B82', '#3E6C99', '#94a3b8'],
            region: ['#1E5AA8'],
            vendor: ['#5B8AC7'],
            funnel: ['#1E5AA8', '#3E6C99', '#5B8AC7', '#7BA3C7', '#2E7D32', '#5AA860'],
            sla: ['#2E7D32', '#C62828'],
            trend: ['#1E5AA8', '#2E7D32', '#C62828'],
            cardType: ['#1E5AA8', '#8B5CF6'],
        };

        function getNativeColors(view, count) {
            if (view === 'group') return Object.values(deptMaster).map(d => d.color).slice(0, count);
            if (view === 'gender') return Object.values(genderMaster).map(g => g.color).slice(0, count);
            const arr = CHART_NATIVE_COLORS[view] || ['#1E5AA8'];
            if (arr.length >= count) return arr.slice(0, count);
            return generateGradientColors(arr[0], arr[arr.length - 1], count);
        }

        function getPaletteColors(view, paletteKey, count) {
            if (paletteKey === 'corporate') return getNativeColors(view, count);
            const p = CHART_COLOR_PALETTES[paletteKey] || CHART_COLOR_PALETTES.professionalBlue;
            return generateGradientColors(p.start, p.end, count);
        }

        const CHART_CANVAS_ID = {
            group: 'deptBarChart', gender: 'genderChart', trend: 'trendChart', funnel: 'funnelChart',
            aging: 'agingChart', rejection: 'rejectionChart', region: 'regionChart',
            vendor: 'vendorPerfChart', sla: 'slaGaugeChart', cardType: 'cardTypeChart',
        };

        const CHART_VAR_ACCESS = {
            group: { get: () => deptBarChart, set: v => { deptBarChart = v; } },
            gender: { get: () => genderChart, set: v => { genderChart = v; } },
            trend: { get: () => trendChart, set: v => { trendChart = v; } },
            funnel: { get: () => funnelChart, set: v => { funnelChart = v; } },
            aging: { get: () => agingChart, set: v => { agingChart = v; } },
            rejection: { get: () => rejectionChart, set: v => { rejectionChart = v; } },
            region: { get: () => regionChart, set: v => { regionChart = v; } },
            vendor: { get: () => vendorPerfChart, set: v => { vendorPerfChart = v; } },
            sla: { get: () => slaGaugeChart, set: v => { slaGaugeChart = v; } },
            cardType: { get: () => cardTypeChart, set: v => { cardTypeChart = v; } },
        };

        // Views that read more naturally as horizontal bars in their native "Bar" mode.
        const CHART_NATIVE_HORIZONTAL = { funnel: true, region: true, vendor: true };
        // Views whose native/default look is a donut.
        const CHART_NATIVE_DONUT = { gender: true, rejection: true, sla: true };

        // Reuses each view's exact original drill-down click behavior, unchanged.
        const CHART_ONCLICK_BUILDERS = {
            group: () => (e, elements) => {
                if (elements.length > 0) {
                    const clickedDept = deptBarChart.data.labels[elements[0].index];
                    toggleChartSelection('group', 'groupChartBox', clickedDept,
                        () => { setMsSingleValue('deptSelect', clickedDept); applyFilters(); },
                        () => { resetMsToAll('deptSelect'); applyFilters(); }
                    );
                }
            },
            gender: () => (e, elements) => {
                if (elements.length > 0) {
                    const clickedGender = Object.keys(genderMaster)[elements[0].index];
                    toggleChartSelection('gender', 'genderChartBox', clickedGender,
                        () => { setMsSingleValue('genderSelect', clickedGender); applyFilters(); },
                        () => { resetMsToAll('genderSelect'); applyFilters(); }
                    );
                }
            },
            funnel: () => (e, elements) => {
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
            },
            aging: () => (e, elements) => {
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
            rejection: () => (e, elements) => {
                if (elements.length > 0) {
                    const reason = Object.keys(REJECTION_REASONS)[elements[0].index];
                    toggleChartSelection('rejection', 'rejectionChartBox', reason,
                        () => quickFilterRejectionReason(reason),
                        () => quickFilterShowAll()
                    );
                }
            },
            region: () => (e, elements) => {
                if (elements.length > 0) {
                    const label = regionChart.data.labels[elements[0].index];
                    toggleChartSelection('region', 'regionChartBox', label,
                        () => { setMsSingleValue('regionSelect', label); applyFilters(); revealExcelSheet(); },
                        () => { resetMsToAll('regionSelect'); applyFilters(); }
                    );
                }
            },
            vendor: () => (e, elements) => {
                if (elements.length > 0) {
                    const label = vendorPerfChart.data.labels[elements[0].index];
                    toggleChartSelection('vendor', 'vendorChartBox', label,
                        () => filterByVendorStatus(label, 'all'),
                        () => { resetMsToAll('vendorSelect'); resetMsToAll('statusSelect'); applyFilters(); }
                    );
                }
            },
            sla: () => () => {
                toggleChartSelection('sla', 'slaChartBox', true,
                    () => quickFilterOverdue(),
                    () => quickFilterShowAll()
                );
            },
            cardType: () => (e, elements) => {
                if (elements.length > 0) {
                    const label = cardTypeChart.data.labels[elements[0].index];
                    toggleChartSelection('cardType', 'cardTypeChartBox', label,
                        () => quickFilterBoolean(x => x.cardType === label),
                        () => quickFilterShowAll()
                    );
                }
            },
            trend: (isDonut) => isDonut
                ? (e, elements) => {
                    if (elements.length === 0) return;
                    const seriesLabel = trendChart.data.labels[elements[0].index];
                    toggleChartSelection('trend', 'trendChartBox', seriesLabel,
                        () => {
                            if (seriesLabel === 'Approved') quickFilterStatus('Approved');
                            else if (seriesLabel === 'Rejected') quickFilterStatus('Rejected');
                            else quickFilterShowAll();
                        },
                        () => quickFilterShowAll()
                    );
                }
                : (e, elements) => {
                    if (elements.length > 0) {
                        const label = trendChart.data.labels[elements[0].index];
                        toggleChartSelection('trend', 'trendChartBox', label,
                            () => quickFilterMonth(label),
                            () => { document.getElementById('timeRange').value = 'all'; handleRangeChange(); }
                        );
                    }
                },
        };

        let chartViewState = {};
        Object.keys(CHART_VIEWS).forEach(v => {
            chartViewState[v] = { type: CHART_NATIVE_DONUT[v] ? 'donut' : (v === 'trend' ? 'line' : 'bar'), palette: 'corporate' };
        });

        function syncChartControlStates() {
            const state = chartViewState[currentChartView];
            if (!state) return;
            document.querySelectorAll('.chart-type-option').forEach(opt => opt.classList.toggle('active', opt.dataset.type === state.type));
            document.querySelectorAll('.chart-color-option').forEach(opt => opt.classList.toggle('active', opt.dataset.palette === state.palette));
        }

        function rebuildActiveChart(type, paletteKey) {
            const view = currentChartView;
            chartViewState[view] = { type, palette: paletteKey };

            const access = CHART_VAR_ACCESS[view];
            const chart = access.get();
            const canvasId = CHART_CANVAS_ID[view];
            const isDonut = type === 'donut';
            const isArea = type === 'area';
            const isLineLike = type === 'line' || isArea;
            const chartType = isDonut ? 'doughnut' : (isArea ? 'line' : type);
            const horizontal = !!CHART_NATIVE_HORIZONTAL[view] && type === 'bar';

            let newData, onClick;

            if (view === 'trend') {
                const labels = chart.data.labels.slice();
                const seriesList = chart.data.datasets.map(ds => ({ label: ds.label, data: ds.data.slice() }));
                const seriesColors = getPaletteColors(view, paletteKey, seriesList.length);

                if (isDonut) {
                    newData = {
                        labels: seriesList.map(s => s.label),
                        datasets: [{
                            data: seriesList.map(s => s.data.reduce((a, b) => a + b, 0)),
                            backgroundColor: seriesColors,
                            borderWidth: 0,
                            hoverOffset: 8,
                        }],
                    };
                } else {
                    newData = {
                        labels,
                        datasets: seriesList.map((s, i) => ({
                            label: s.label,
                            data: s.data,
                            backgroundColor: isArea ? toRgba(seriesColors[i], 0.22) : seriesColors[i],
                            borderColor: seriesColors[i],
                            borderWidth: isLineLike ? 2 : 0,
                            borderRadius: !isLineLike ? 2 : undefined,
                            fill: isArea,
                            tension: isLineLike ? 0.35 : 0,
                            pointRadius: isLineLike ? 3 : undefined,
                            pointBackgroundColor: isLineLike ? seriesColors[i] : undefined,
                        })),
                    };
                }
                onClick = CHART_ONCLICK_BUILDERS.trend(isDonut);
            } else {
                const labels = chart.data.labels.slice();
                const values = chart.data.datasets[0].data.slice();
                const baseColors = getPaletteColors(view, paletteKey, labels.length);
                const seriesColor = baseColors[baseColors.length - 1];

                newData = {
                    labels,
                    datasets: [{
                        label: chart.data.datasets[0].label || 'Requests',
                        data: values,
                        backgroundColor: isLineLike ? toRgba(seriesColor, isArea ? 0.28 : 0) : baseColors,
                        borderColor: isLineLike ? seriesColor : undefined,
                        borderWidth: isLineLike ? 2 : 0,
                        borderRadius: (!isDonut && !isLineLike) ? 0 : undefined,
                        fill: isArea,
                        tension: isLineLike ? 0.35 : 0,
                        pointRadius: isLineLike ? 3 : undefined,
                        pointBackgroundColor: isLineLike ? seriesColor : undefined,
                        hoverOffset: isDonut ? 8 : undefined,
                    }],
                };
                onClick = CHART_ONCLICK_BUILDERS[view]();
            }

            chart.destroy();

            const options = {
                responsive: true,
                maintainAspectRatio: false,
                layout: horizontal
                    ? { padding: { left: 5, right: 20, top: 5, bottom: 5 } }
                    : { padding: { bottom: 5, left: 5, right: 5, top: 20 } },
                indexAxis: horizontal ? 'y' : 'x',
                onClick,
                plugins: {
                    legend: (isDonut || view === 'trend')
                        ? { position: isDonut ? 'right' : 'top', labels: { color: '#374151', font: { size: 8 }, boxWidth: 8, padding: 4 } }
                        : { display: false },
                    datalabels: isDonut ? { display: false } : {
                        anchor: 'end',
                        align: 'end',
                        clamp: true,
                        color: '#374151',
                        font: { size: 9, weight: 'bold' },
                        formatter: value => value.toLocaleString(),
                    },
                    tooltip: isDonut ? {
                        callbacks: {
                            label: (ctx) => {
                                const data = ctx.chart.data.datasets[0].data;
                                const total = data.reduce((a, b) => a + b, 0);
                                const pct = total > 0 ? Math.round(ctx.parsed / total * 100) : 0;
                                return `${ctx.label}: ${ctx.parsed.toLocaleString()} (${pct}%)`;
                            },
                        },
                    } : undefined,
                },
            };

            if (isDonut) {
                options.cutout = '55%';
            } else if (horizontal) {
                options.scales = {
                    x: { display: false, grid: { display: false } },
                    y: { ticks: { color: '#374151', font: { size: 10 } }, grid: { display: false } },
                };
            } else {
                options.scales = {
                    x: { ticks: { color: '#374151', font: { size: 10 }, maxRotation: 45, minRotation: 45 }, grid: { display: false } },
                    y: isLineLike
                        ? { ticks: { color: '#374151', font: { size: 10 } }, grid: { color: 'rgba(148,163,184,0.15)' } }
                        : { display: false, ticks: { display: false }, grid: { display: false } },
                };
            }

            const ctx = document.getElementById(canvasId).getContext('2d');
            const plugins = isDonut ? [makeMixedPercentPlugin('#ffffff')] : [];
            const newChart = new Chart(ctx, { type: chartType, data: newData, options, plugins });
            access.set(newChart);

            if (currentChartView === view) newChart.resize();
        }

        function setActiveChartType(type) {
            rebuildActiveChart(type, chartViewState[currentChartView].palette);
            syncChartControlStates();
            document.getElementById('chartTypeDropdown').classList.remove('open');
        }

        function setActiveChartPalette(key) {
            rebuildActiveChart(chartViewState[currentChartView].type, key);
            syncChartControlStates();
            document.getElementById('chartColorDropdown').classList.remove('open');
        }


        function updateChartTitle() {
            const timeVal = document.getElementById('timeRange').value;
            const selectedMonth = document.getElementById('selectedMonth').value;
            let suffix;
            if (timeVal === 'all') suffix = '';
            else if (timeVal === 'monthly') suffix = selectedMonth === 'all' ? ' - All Months' : ` - ${selectedMonth}`;
            else suffix = ` (${timeVal.toUpperCase()})`;

            const base = CHART_VIEWS[currentChartView].title;
            document.getElementById('trendChartTitle').innerText = base + suffix;
        }

        let currentApprovalTab = 'perf';

        function switchApprovalTab(tab) {
            currentApprovalTab = tab;

            ['perf', 'vendor'].forEach(t => {
                const suffix = t.charAt(0).toUpperCase() + t.slice(1);
                document.getElementById(`apTab${suffix}`).classList.toggle('active', t === tab);
                document.getElementById(`apContent${suffix}`).classList.toggle('active', t === tab);
            });
        }


// ---------------------------------------------------------------------------
// App
// ---------------------------------------------------------------------------
const DEFAULT_FILTERS = {
  reqId: '',
  fromDate: '',
  toDate: '',
  frequency: 'All',
  status: 'All',
  category: 'All',
  functionality: 'All',
  issuance: 'All',
};

const METRIC_PREDICATES = {
  received: () => true,
  inProcess: (r) => r.status === 'In Process' || r.status === 'Ready for Dispatch',
  delivered: (r) => r.status === 'Delivered',
  pending: (r) => r.status === 'Pending' || r.status === 'Rejected',
  hrDeclined: (r) => r.hrStatus === 'Declined',
};

function VendorDashboard({ icons }) {
  const { ShieldCheck } = icons;
  const [data, setData] = useState(MOCK_DATA);
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [selected, setSelected] = useState(new Set());
  const [activeMetric, setActiveMetric] = useState(null);
  const [hrColumnFilter, setHrColumnFilter] = useState(new Set(HR_STATUSES));
  const [reqIdColumnFilter, setReqIdColumnFilter] = useState(() => new Set(MOCK_DATA.map((r) => r.reqId)));
  const [selectedReqId, setSelectedReqId] = useState(null);
  const [panelOpen, setPanelOpen] = useState(false);

  const allReqIds = useMemo(() => data.map((r) => r.reqId), [data]);

  const selectedRow = useMemo(
    () => data.find((r) => r.reqId === selectedReqId) || null,
    [data, selectedReqId]
  );

  const filteredRows = useMemo(() => {
    return data.filter((r) => {
      if (filters.reqId && !r.reqId.toLowerCase().includes(filters.reqId.toLowerCase())) return false;
      if (filters.fromDate && r.receivedDate < filters.fromDate) return false;
      if (filters.toDate && r.receivedDate > filters.toDate) return false;
      if (filters.frequency !== 'All' && r.frequency !== filters.frequency) return false;
      if (filters.status !== 'All' && r.status !== filters.status) return false;
      if (filters.category !== 'All' && r.category !== filters.category) return false;
      if (filters.functionality !== 'All' && r.functionality !== filters.functionality) return false;
      if (filters.issuance !== 'All' && r.issuance !== filters.issuance) return false;
      if (!hrColumnFilter.has(r.hrStatus)) return false;
      if (!reqIdColumnFilter.has(r.reqId)) return false;
      return true;
    });
  }, [data, filters, hrColumnFilter, reqIdColumnFilter]);

  const visibleRows = useMemo(() => {
    if (!activeMetric) return filteredRows;
    return filteredRows.filter(METRIC_PREDICATES[activeMetric]);
  }, [filteredRows, activeMetric]);

  const handleToggleMetric = useCallback((key) => {
    setActiveMetric((prev) => (prev === key ? null : key));
  }, []);

  const handleReset = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
    setActiveMetric(null);
    setHrColumnFilter(new Set(HR_STATUSES));
    setReqIdColumnFilter(new Set(MOCK_DATA.map((r) => r.reqId)));
  }, []);

  const handleToggleRow = useCallback((reqId) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(reqId) ? next.delete(reqId) : next.add(reqId);
      return next;
    });
  }, []);

  const handleToggleAll = useCallback((checked) => {
    setSelected(checked ? new Set(visibleRows.map((r) => r.reqId)) : new Set());
  }, [visibleRows]);

  const handleTrackingIdChange = useCallback((reqId, value) => {
    setData((prev) => prev.map((r) => (r.reqId === reqId ? { ...r, trackingId: value } : r)));
  }, []);

  const handleChangeStatus = useCallback((reqId, status) => {
    setData((prev) => prev.map((r) => (r.reqId === reqId ? { ...r, status } : r)));
  }, []);

  const handleBulkUpdate = useCallback((status) => {
    setData((prev) => prev.map((r) => (selected.has(r.reqId) ? { ...r, status } : r)));
    setSelected(new Set());
  }, [selected]);

  const handleRowClick = useCallback((row) => {
    setSelectedReqId(row.reqId);
    setPanelOpen(true);
  }, []);

  const handleClosePanel = useCallback(() => setPanelOpen(false), []);

  const handlePostComment = useCallback((reqId, text) => {
    setData((prev) => prev.map((r) => (r.reqId === reqId ? {
      ...r,
      comments: [...r.comments, {
        id: `c-${Date.now()}`,
        author: VENDOR_AUTHOR,
        role: 'Vendor Dashboard',
        timestamp: new Date().toISOString(),
        text,
      }],
    } : r)));
  }, []);

  const handleInitiateReprint = useCallback((reqId) => {
    setData((prev) => prev.map((r) => (r.reqId === reqId ? {
      ...r,
      status: 'In Process',
      hrStatus: 'Pending HR',
      comments: [...r.comments, {
        id: `c-${Date.now()}`,
        author: VENDOR_AUTHOR,
        role: 'Vendor Dashboard',
        timestamp: new Date().toISOString(),
        text: 'Reprint request initiated by vendor.',
      }],
    } : r)));
  }, []);

  return (
    <div className="h-screen w-screen flex flex-col bg-[#F5F7FA] overflow-hidden">
      <header className="h-11 bg-navy-700 flex items-center justify-between px-4 shrink-0 shadow-sm">
        <div className="flex items-center gap-2 text-white font-bold text-sm">
          <ShieldCheck size={18} />
          UBL — Vendor Card Print Dashboard
        </div>
        <div className="text-white/70 text-[11px]">Vendor: TCS Print Facility · 2026-08-31</div>
      </header>

      <main className="flex-1 min-h-0 flex flex-col gap-3 p-3 overflow-hidden">
        <FilterBar
          icons={icons}
          filters={filters}
          setFilters={setFilters}
          onReset={handleReset}
          onExport={() => exportCsv(filteredRows)}
        />

        <MetricRow
          icons={icons}
          data={filteredRows}
          activeMetric={activeMetric}
          onToggleMetric={handleToggleMetric}
        />

        <Toolbar
          icons={icons}
          selectedCount={selected.size}
          onBulkUpdate={handleBulkUpdate}
        />

        <RequestsTable
          icons={icons}
          rows={visibleRows}
          selected={selected}
          onToggleRow={handleToggleRow}
          onToggleAll={handleToggleAll}
          onTrackingIdChange={handleTrackingIdChange}
          onChangeStatus={handleChangeStatus}
          onRowClick={handleRowClick}
          hrColumnFilter={hrColumnFilter}
          onHrColumnFilterChange={setHrColumnFilter}
          allReqIds={allReqIds}
          reqIdColumnFilter={reqIdColumnFilter}
          onReqIdColumnFilterChange={setReqIdColumnFilter}
        />
      </main>

      <SidePanel
        icons={icons}
        row={selectedRow}
        open={panelOpen}
        onClose={handleClosePanel}
        onInitiateReprint={handleInitiateReprint}
        onPostComment={handlePostComment}
      />
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<VendorDashboard icons={ICONS} />);

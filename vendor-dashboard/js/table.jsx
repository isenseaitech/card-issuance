// ---------------------------------------------------------------------------
// Table
// ---------------------------------------------------------------------------
function StatusActions({ icons, row, onChangeStatus }) {
  const { ChevronDown } = icons;
  return (
    <div className="relative inline-block">
      <select
        value={row.status}
        onChange={(e) => onChangeStatus(row.reqId, e.target.value)}
        className="h-7 text-[11px] rounded-md border border-gray-300 bg-white pl-2 pr-6 text-gray-700 focus:outline-none focus:ring-2 focus:ring-navy-600/30 appearance-none"
      >
        {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
      </select>
      <ChevronDown size={11} className="pointer-events-none absolute right-1.5 top-1/2 -translate-y-1/2 text-gray-400" />
    </div>
  );
}

function ReqIdColumnFilter({ icons, allIds, selected, onChange }) {
  const { Filter } = icons;
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const ref = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isFiltered = selected.size < allIds.length;
  const filteredIds = allIds.filter((id) => id.toLowerCase().includes(search.toLowerCase()));

  const toggleValue = (id) => {
    onChange((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const selectAllFiltered = () => {
    onChange((prev) => {
      const next = new Set(prev);
      filteredIds.forEach((id) => next.add(id));
      return next;
    });
  };

  const clearAllFiltered = () => {
    onChange((prev) => {
      const next = new Set(prev);
      filteredIds.forEach((id) => next.delete(id));
      return next;
    });
  };

  return (
    <span className="relative inline-block ml-1 normal-case" ref={ref} onClick={(e) => e.stopPropagation()}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={isFiltered ? 'text-navy-600' : 'text-gray-400 hover:text-gray-600'}
      >
        <Filter size={11} />
      </button>
      {open && (
        <div className="absolute z-20 top-5 left-0 w-44 bg-white border border-gray-200 rounded-md shadow-lg p-2 font-normal text-gray-700 normal-case">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search…"
            className="w-full h-7 text-[11px] rounded border border-gray-300 px-1.5 mb-1.5 focus:outline-none focus:ring-2 focus:ring-navy-600/30"
          />
          <div className="flex items-center gap-2 px-1 pb-1.5">
            <button type="button" onClick={selectAllFiltered} className="text-[11px] text-navy-600 hover:underline">Select All</button>
            <span className="text-gray-300">|</span>
            <button type="button" onClick={clearAllFiltered} className="text-[11px] text-navy-600 hover:underline">Clear All</button>
          </div>
          <div className="border-t border-gray-100 mb-1" />
          <div className="max-h-40 overflow-y-auto">
            {filteredIds.map((id) => (
              <label key={id} className="flex items-center gap-1.5 px-1 py-1 text-[11px] cursor-pointer hover:bg-gray-50 rounded">
                <input type="checkbox" checked={selected.has(id)} onChange={() => toggleValue(id)} />
                {id}
              </label>
            ))}
            {filteredIds.length === 0 && (
              <div className="px-1 py-1 text-[11px] text-gray-400">No matches</div>
            )}
          </div>
        </div>
      )}
    </span>
  );
}

function HrColumnFilter({ icons, selected, onChange }) {
  const { Filter } = icons;
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isFiltered = selected.size < HR_STATUSES.length;

  const toggleValue = (val) => {
    onChange((prev) => {
      const next = new Set(prev);
      next.has(val) ? next.delete(val) : next.add(val);
      return next;
    });
  };

  const selectAll = () => onChange(new Set(HR_STATUSES));
  const clearAll = () => onChange(new Set());

  return (
    <span className="relative inline-block ml-1 normal-case" ref={ref} onClick={(e) => e.stopPropagation()}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={isFiltered ? 'text-navy-600' : 'text-gray-400 hover:text-gray-600'}
      >
        <Filter size={11} />
      </button>
      {open && (
        <div className="absolute z-20 top-5 left-0 w-40 bg-white border border-gray-200 rounded-md shadow-lg p-2 font-normal text-gray-700 normal-case">
          <div className="flex items-center gap-2 px-1 pb-1.5">
            <button type="button" onClick={selectAll} className="text-[11px] text-navy-600 hover:underline">Select All</button>
            <span className="text-gray-300">|</span>
            <button type="button" onClick={clearAll} className="text-[11px] text-navy-600 hover:underline">Clear All</button>
          </div>
          <div className="border-t border-gray-100 mb-1" />
          {HR_STATUSES.map((s) => (
            <label key={s} className="flex items-center gap-1.5 px-1 py-1 text-[11px] cursor-pointer hover:bg-gray-50 rounded">
              <input type="checkbox" checked={selected.has(s)} onChange={() => toggleValue(s)} />
              {s}
            </label>
          ))}
        </div>
      )}
    </span>
  );
}

function RequestsTable({ icons, rows, selected, onToggleRow, onToggleAll, onTrackingIdChange, onChangeStatus, onRowClick, hrColumnFilter, onHrColumnFilterChange, allReqIds, reqIdColumnFilter, onReqIdColumnFilterChange }) {
  const allSelected = rows.length > 0 && rows.every((r) => selected.has(r.reqId));

  return (
    <div className="min-h-0 bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
      <div className="overflow-auto max-h-[calc(100vh-280px)]">
        <table className="w-full text-xs border-collapse">
          <thead className="sticky top-0 z-10">
            <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 text-[11px] uppercase tracking-wide">
              <th className="px-3 py-2 text-left w-8">
                <input type="checkbox" checked={allSelected} onChange={(e) => onToggleAll(e.target.checked)} className="cursor-pointer" />
              </th>
              <th className="px-3 py-2 text-left">
                <span className="inline-flex items-center">
                  Req ID
                  <ReqIdColumnFilter icons={icons} allIds={allReqIds} selected={reqIdColumnFilter} onChange={onReqIdColumnFilterChange} />
                </span>
              </th>
              <th className="px-3 py-2 text-left">Applicant</th>
              <th className="px-3 py-2 text-left">Category</th>
              <th className="px-3 py-2 text-left">Functionality</th>
              <th className="px-3 py-2 text-left">Issuance</th>
              <th className="px-3 py-2 text-left">Received</th>
              <th className="px-3 py-2 text-left">Status</th>
              <th className="px-3 py-2 text-left">
                <span className="inline-flex items-center">
                  HR Verification
                  <HrColumnFilter icons={icons} selected={hrColumnFilter} onChange={onHrColumnFilterChange} />
                </span>
              </th>
              <th className="px-3 py-2 text-left">Tracking ID</th>
              <th className="px-3 py-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, idx) => (
              <tr
                key={row.reqId}
                onClick={() => onRowClick(row)}
                className={`border-b border-gray-100 hover:bg-slate-50 cursor-pointer transition ${idx % 2 === 1 ? 'bg-gray-50/40' : ''}`}
              >
                <td className="px-3 py-1.5" onClick={(e) => e.stopPropagation()}>
                  <input type="checkbox" checked={selected.has(row.reqId)} onChange={() => onToggleRow(row.reqId)} className="cursor-pointer" />
                </td>
                <td className="px-3 py-1.5 font-medium text-navy-700">{row.reqId}</td>
                <td className="px-3 py-1.5 text-gray-700">{row.applicantName}</td>
                <td className="px-3 py-1.5"><Badge label={row.category} className={CATEGORY_STYLES[row.category]} /></td>
                <td className="px-3 py-1.5"><Badge label={row.functionality} className={FUNC_STYLES[row.functionality]} /></td>
                <td className="px-3 py-1.5 text-gray-600">{row.issuance}</td>
                <td className="px-3 py-1.5 text-gray-600">{row.receivedDate}</td>
                <td className="px-3 py-1.5"><Badge label={row.status} className={STATUS_STYLES[row.status]} /></td>
                <td className="px-3 py-1.5"><Badge label={row.hrStatus} className={HR_STATUS_STYLES[row.hrStatus]} /></td>
                <td className="px-3 py-1.5" onClick={(e) => e.stopPropagation()}>
                  <input
                    type="text"
                    value={row.trackingId}
                    placeholder="Enter tracking ID"
                    onChange={(e) => onTrackingIdChange(row.reqId, e.target.value)}
                    className="h-7 w-28 text-[11px] rounded-md border border-gray-300 px-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-navy-600/30"
                  />
                </td>
                <td className="px-3 py-1.5" onClick={(e) => e.stopPropagation()}>
                  <StatusActions icons={icons} row={row} onChangeStatus={onChangeStatus} />
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={11} className="px-3 py-10 text-center text-gray-400">No requests match the selected filters.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

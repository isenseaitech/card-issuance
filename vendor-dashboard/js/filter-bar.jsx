// ---------------------------------------------------------------------------
// Filter bar
// ---------------------------------------------------------------------------
function SelectField({ value, onChange, options, placeholder }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="h-8 text-xs rounded-md border border-gray-300 bg-white px-2 pr-6 text-gray-700 focus:outline-none focus:ring-2 focus:ring-navy-600/30 focus:border-navy-600"
    >
      <option value="All">{placeholder || 'All'}</option>
      {options.map((o) => (
        <option key={o} value={o}>{o}</option>
      ))}
    </select>
  );
}

function FilterBar({ icons, filters, setFilters, onReset, onExport }) {
  const { Download, RotateCcw, Calendar } = icons;
  const set = (key) => (val) => setFilters((f) => ({ ...f, [key]: val }));

  return (
    <div className="flex flex-wrap items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-2 shadow-sm">
      <input
        type="text"
        value={filters.reqId}
        onChange={(e) => set('reqId')(e.target.value)}
        placeholder="Search REQ ID…"
        className="h-8 w-36 text-xs rounded-md border border-gray-300 px-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-navy-600/30 focus:border-navy-600"
      />

      <div className="w-px h-6 bg-gray-200 mx-1" />

      <div className="flex items-center gap-1.5">
        <Calendar size={14} className="text-gray-400" />
        <input
          type="date"
          value={filters.fromDate}
          onChange={(e) => set('fromDate')(e.target.value)}
          className="h-8 text-xs rounded-md border border-gray-300 px-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-navy-600/30 focus:border-navy-600"
        />
        <span className="text-xs text-gray-400">to</span>
        <input
          type="date"
          value={filters.toDate}
          onChange={(e) => set('toDate')(e.target.value)}
          className="h-8 text-xs rounded-md border border-gray-300 px-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-navy-600/30 focus:border-navy-600"
        />
      </div>

      <div className="w-px h-6 bg-gray-200 mx-1" />

      <SelectField value={filters.frequency} onChange={set('frequency')} options={FREQUENCIES} placeholder="Frequency: All" />
      <SelectField value={filters.status} onChange={set('status')} options={STATUSES} placeholder="Status: All" />
      <SelectField value={filters.category} onChange={set('category')} options={CATEGORIES} placeholder="Category: All" />
      <SelectField value={filters.functionality} onChange={set('functionality')} options={FUNCTIONALITIES} placeholder="Functionality: All" />
      <SelectField value={filters.issuance} onChange={set('issuance')} options={ISSUANCE_TYPES} placeholder="Issuance: All" />

      <div className="flex-1" />

      <button
        onClick={onReset}
        className="h-8 inline-flex items-center gap-1.5 px-3 rounded-md border border-gray-300 text-xs font-medium text-gray-600 hover:bg-gray-50 transition"
      >
        <RotateCcw size={13} /> Reset Filters
      </button>
      <button
        onClick={onExport}
        className="h-8 inline-flex items-center gap-1.5 px-3 rounded-md bg-navy-700 text-white text-xs font-medium hover:bg-navy-600 transition shadow-sm"
      >
        <Download size={13} /> Download Print Batch (CSV)
      </button>
    </div>
  );
}

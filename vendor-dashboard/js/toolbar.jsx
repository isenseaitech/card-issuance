// ---------------------------------------------------------------------------
// Toolbar (bulk actions)
// ---------------------------------------------------------------------------
function Toolbar({ icons, selectedCount, onBulkUpdate }) {
  const { ListChecks } = icons;
  const [bulkStatus, setBulkStatus] = useState('In Process');

  return (
    <div className="flex items-center justify-between bg-white border border-gray-200 rounded-lg px-3 py-2 shadow-sm">
      <div className="flex items-center gap-2 text-xs text-gray-600">
        <ListChecks size={14} className="text-gray-400" />
        <span>{selectedCount} selected</span>
        <select
          value={bulkStatus}
          onChange={(e) => setBulkStatus(e.target.value)}
          className="h-7 text-xs rounded-md border border-gray-300 bg-white px-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-navy-600/30"
        >
          <option value="In Process">In Process</option>
          <option value="Delivered">Delivered</option>
        </select>
        <button
          disabled={selectedCount === 0}
          onClick={() => onBulkUpdate(bulkStatus)}
          className="h-7 px-3 rounded-md bg-navy-700 text-white text-xs font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:bg-navy-600 transition"
        >
          Bulk Update Status
        </button>
      </div>
    </div>
  );
}

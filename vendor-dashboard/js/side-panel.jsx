// ---------------------------------------------------------------------------
// Side panel (drawer) — inspection + live comment/audit feed
// ---------------------------------------------------------------------------
function SidePanel({ icons, row, open, onClose, onInitiateReprint, onPostComment }) {
  const { X, AlertOctagon, Printer, Send, MessageSquare } = icons;
  const [draft, setDraft] = useState('');

  if (!row) return null;

  const sortedComments = [...row.comments].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

  const handleSend = () => {
    const text = draft.trim();
    if (!text) return;
    onPostComment(row.reqId, text);
    setDraft('');
  };

  return (
    <>
      <div
        onClick={onClose}
        className={`fixed inset-0 z-40 bg-black/30 transition-opacity duration-300 ${open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
      />
      <div
        className={`fixed top-0 right-0 z-50 h-full w-[420px] max-w-full bg-white shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out ${open ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <div className="flex items-start justify-between px-4 py-3 border-b border-gray-200 shrink-0">
          <div>
            <div className="text-sm font-bold text-navy-700">{row.reqId}</div>
            <div className="text-xs text-gray-500">{row.applicantName}</div>
            <div className="flex items-center gap-1.5 mt-1.5">
              <Badge label={row.status} className={STATUS_STYLES[row.status]} />
              <Badge label={row.hrStatus} className={HR_STATUS_STYLES[row.hrStatus]} />
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4 text-xs">
          <div>
            <div className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-2">Card Details</div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="text-gray-400 mb-0.5">Category</div>
                <Badge label={row.category} className={CATEGORY_STYLES[row.category]} />
              </div>
              <div>
                <div className="text-gray-400 mb-0.5">Functionality</div>
                <Badge label={row.functionality} className={FUNC_STYLES[row.functionality]} />
              </div>
              <div>
                <div className="text-gray-400 mb-0.5">Courier Waybill ID</div>
                <div className="font-medium text-gray-800">{row.trackingId || 'Not assigned'}</div>
              </div>
              <div>
                <div className="text-gray-400 mb-0.5">Dispatch Date</div>
                <div className="font-medium text-gray-800">{row.dispatchDate || '—'}</div>
              </div>
            </div>
          </div>

          <div className="rounded-md border border-gray-200 bg-gray-50 px-3 py-2">
            <div className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-1">HR Verification Status</div>
            <Badge label={row.hrStatus} className={HR_STATUS_STYLES[row.hrStatus]} />
          </div>

          <div>
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-2">
              <MessageSquare size={12} />
              Audit &amp; Comments (Synced from UBL Dashboard)
            </div>
            <div className="space-y-2">
              {sortedComments.map((c) => (
                <div
                  key={c.id}
                  className={`rounded-md border px-3 py-2 ${c.role === 'Vendor Dashboard' ? 'bg-blue-50 border-blue-200' : 'bg-white border-gray-200'}`}
                >
                  <div className="flex items-center justify-between mb-1 gap-2">
                    <span className="font-semibold text-gray-700">{c.author}</span>
                    <span className="text-[10px] text-gray-400 shrink-0">{formatTimestamp(c.timestamp)}</span>
                  </div>
                  <div className="text-gray-600">{c.text}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200 px-4 py-3 space-y-2 shrink-0">
          {row.hrStatus === 'Declined' && (
            <button
              onClick={() => onInitiateReprint(row.reqId)}
              className="w-full h-9 inline-flex items-center justify-center gap-1.5 rounded-md bg-red-600 text-white text-xs font-semibold hover:bg-red-700 transition"
            >
              <Printer size={14} /> Initiate Reprint Request
            </button>
          )}
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleSend(); }}
              placeholder="Reply to UBL dashboard…"
              className="flex-1 h-8 text-xs rounded-md border border-gray-300 px-2 focus:outline-none focus:ring-2 focus:ring-navy-600/30"
            />
            <button
              onClick={handleSend}
              className="h-8 w-8 flex items-center justify-center rounded-md bg-navy-700 text-white hover:bg-navy-600 transition shrink-0"
            >
              <Send size={13} />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

// ---------------------------------------------------------------------------
// Metric cards
// ---------------------------------------------------------------------------
function MetricCard({ icon: Icon, label, value, accent, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex-1 bg-white border rounded-lg px-4 py-3 shadow-sm flex items-center gap-3 text-left transition
        ${active ? `border-transparent ring-2 ${accent.ring} bg-opacity-100` : 'border-gray-200 hover:border-gray-300'}`}
    >
      <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${accent.bg}`}>
        <Icon size={17} className={accent.text} />
      </div>
      <div className="min-w-0">
        <div className="text-[11px] font-medium text-gray-500 truncate">{label}</div>
        <div className="text-xl font-bold text-gray-800 leading-tight">{value}</div>
      </div>
    </button>
  );
}

function MetricRow({ icons, data, activeMetric, onToggleMetric }) {
  const { Inbox, Printer, PackageCheck, AlertTriangle, AlertOctagon } = icons;
  const received = data.length;
  const inProcess = data.filter((d) => d.status === 'In Process' || d.status === 'Ready for Dispatch').length;
  const delivered = data.filter((d) => d.status === 'Delivered').length;
  const pending = data.filter((d) => d.status === 'Pending' || d.status === 'Rejected').length;
  const hrDeclined = data.filter((d) => d.hrStatus === 'Declined').length;

  return (
    <div className="flex gap-3">
      <MetricCard
        icon={Inbox} label="Requests Received" value={received}
        accent={{ bg: 'bg-blue-50', text: 'text-blue-600', ring: 'ring-blue-400' }}
        active={activeMetric === 'received'} onClick={() => onToggleMetric('received')}
      />
      <MetricCard
        icon={AlertTriangle} label="Pending / Overdue" value={pending}
        accent={{ bg: 'bg-amber-50', text: 'text-amber-600', ring: 'ring-amber-400' }}
        active={activeMetric === 'pending'} onClick={() => onToggleMetric('pending')}
      />
      <MetricCard
        icon={Printer} label="In Process / Printing" value={inProcess}
        accent={{ bg: 'bg-indigo-50', text: 'text-indigo-600', ring: 'ring-indigo-400' }}
        active={activeMetric === 'inProcess'} onClick={() => onToggleMetric('inProcess')}
      />
      <MetricCard
        icon={PackageCheck} label="Delivered" value={delivered}
        accent={{ bg: 'bg-green-50', text: 'text-green-600', ring: 'ring-green-400' }}
        active={activeMetric === 'delivered'} onClick={() => onToggleMetric('delivered')}
      />
      <MetricCard
        icon={AlertOctagon} label="UBL Declined" value={hrDeclined}
        accent={{ bg: 'bg-red-50', text: 'text-red-600', ring: 'ring-red-400' }}
        active={activeMetric === 'hrDeclined'} onClick={() => onToggleMetric('hrDeclined')}
      />
    </div>
  );
}

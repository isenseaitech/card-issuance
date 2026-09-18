// ---------------------------------------------------------------------------
// Badge helpers
// ---------------------------------------------------------------------------
const STATUS_STYLES = {
  'Received': 'bg-gray-100 text-gray-700 border-gray-300',
  'In Process': 'bg-blue-50 text-blue-700 border-blue-200',
  'Ready for Dispatch': 'bg-indigo-50 text-indigo-700 border-indigo-200',
  'Delivered': 'bg-green-50 text-green-700 border-green-200',
  'Pending': 'bg-amber-50 text-amber-700 border-amber-200',
  'Rejected': 'bg-red-50 text-red-700 border-red-200',
};

const CATEGORY_STYLES = {
  'Conventional': 'bg-slate-100 text-slate-700 border-slate-300',
  'Islamic': 'bg-emerald-50 text-emerald-700 border-emerald-200',
};

const FUNC_STYLES = {
  'HF': 'bg-cyan-50 text-cyan-700 border-cyan-200',
  'RF': 'bg-purple-50 text-purple-700 border-purple-200',
};

const HR_STATUS_STYLES = {
  'Confirmed': 'bg-green-50 text-green-700 border-green-200',
  'Pending HR': 'bg-gray-100 text-gray-600 border-gray-300',
  'Declined': 'bg-red-50 text-red-700 border-red-300',
};

function Badge({ label, className }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium border ${className}`}>
      {label}
    </span>
  );
}

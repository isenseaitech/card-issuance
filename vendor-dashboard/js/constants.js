// ---------------------------------------------------------------------------
// Business constants - vocabulary shared by the UI (filters, badges, status
// dropdowns) and the mock data generator.
// ---------------------------------------------------------------------------
const STATUSES = ['Received','In Process','Ready for Dispatch','Delivered','Pending','Rejected'];
const CATEGORIES = ['Conventional','Islamic'];
const FUNCTIONALITIES = ['HF','RF'];
const ISSUANCE_TYPES = ['New','Renewal','Replacement'];
const FREQUENCIES = ['Daily','Weekly','Monthly'];
const HR_STATUSES = ['Confirmed','Pending HR','Declined'];
const HR_REASONS = [
  'Chip encoding error during terminal check.',
  'Demographic mismatch with NADRA record.',
  'Damaged card strip detected at QA stage.',
  'Signature mismatch on application form.',
  'Photo verification failed against CNIC.',
];

// Identity this dashboard posts comments as.
const VENDOR_AUTHOR = 'Vendor Ops (TCS Print Facility)';

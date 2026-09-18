// ---------------------------------------------------------------------------
// Mock data (demo fixtures + seeded generators; business vocabulary lives in constants.js)
// ---------------------------------------------------------------------------
const NAMES = ['Ahmed Raza','Sana Malik','Bilal Hussain','Ayesha Khan','Usman Tariq','Hina Farooq',
  'Zeeshan Ali','Mahnoor Iqbal','Fahad Sheikh','Nida Aslam','Kamran Yousuf','Sadia Baig',
  'Waqas Ahmed','Rabia Sultan','Omar Farooqui','Farah Naz','Junaid Akram','Sobia Rehman',
  'Adeel Chaudhry','Maria Siddiqui'];

const UBL_AUTHORS = ['UBL HR Ops (Tariq M.)', 'UBL Ops (Sana K.)', 'UBL Branch Officer (Ali R.)'];

function seededRandom(seed) {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

function isoAt(baseDate, hourOffset) {
  const d = new Date(baseDate);
  d.setHours(d.getHours() + hourOffset);
  return d.toISOString();
}

function generateComments(rnd, received, hrStatus, hrReason) {
  const pickAuthor = () => UBL_AUTHORS[Math.floor(rnd() * UBL_AUTHORS.length)];
  const comments = [
    {
      id: `c-${Math.floor(rnd() * 1e6)}`,
      author: pickAuthor(),
      role: 'UBL Dashboard',
      timestamp: isoAt(received, 2 + Math.floor(rnd() * 6)),
      text: 'Request received and queued for UBL verification.',
    },
  ];

  if (hrStatus === 'Declined') {
    comments.push({
      id: `c-${Math.floor(rnd() * 1e6)}`,
      author: pickAuthor(),
      role: 'UBL Dashboard',
      timestamp: isoAt(received, 24 + Math.floor(rnd() * 24)),
      text: `Declined: ${hrReason}`,
    });
  } else if (hrStatus === 'Confirmed') {
    comments.push({
      id: `c-${Math.floor(rnd() * 1e6)}`,
      author: pickAuthor(),
      role: 'UBL Dashboard',
      timestamp: isoAt(received, 20 + Math.floor(rnd() * 20)),
      text: 'Verification complete. Applicant documents matched NADRA record.',
    });
  } else {
    comments.push({
      id: `c-${Math.floor(rnd() * 1e6)}`,
      author: pickAuthor(),
      role: 'UBL Dashboard',
      timestamp: isoAt(received, 18 + Math.floor(rnd() * 12)),
      text: 'Awaiting demographic cross-check with NADRA before confirmation.',
    });
  }

  return comments;
}

function generateMockData(count = 140) {
  const rnd = seededRandom(42);
  const rows = [];
  const today = new Date('2026-08-31');
  for (let i = 0; i < count; i++) {
    const daysAgo = Math.floor(rnd() * 30);
    const received = new Date(today);
    received.setDate(received.getDate() - daysAgo);
    const status = STATUSES[Math.floor(rnd() * STATUSES.length)];
    const hrRoll = rnd();
    const hrStatus = hrRoll < 0.65 ? 'Confirmed' : hrRoll < 0.85 ? 'Pending HR' : 'Declined';
    const rejectionDate = new Date(received);
    rejectionDate.setDate(rejectionDate.getDate() + 1 + Math.floor(rnd() * 3));
    const dispatchBase = new Date(received);
    dispatchBase.setDate(dispatchBase.getDate() + 2 + Math.floor(rnd() * 3));
    const hrReason = hrStatus === 'Declined' ? HR_REASONS[Math.floor(rnd() * HR_REASONS.length)] : null;

    rows.push({
      reqId: `REQ-${1100 + i}`,
      applicantName: NAMES[Math.floor(rnd() * NAMES.length)],
      category: CATEGORIES[Math.floor(rnd() * CATEGORIES.length)],
      functionality: FUNCTIONALITIES[Math.floor(rnd() * FUNCTIONALITIES.length)],
      issuance: ISSUANCE_TYPES[Math.floor(rnd() * ISSUANCE_TYPES.length)],
      frequency: FREQUENCIES[Math.floor(rnd() * FREQUENCIES.length)],
      receivedDate: received.toISOString().slice(0, 10),
      status,
      trackingId: '',
      hrStatus,
      hrReason,
      rejectionDate: hrStatus === 'Declined' ? rejectionDate.toISOString().slice(0, 10) : null,
      dispatchDate: (status === 'Delivered' || status === 'Ready for Dispatch')
        ? dispatchBase.toISOString().slice(0, 10)
        : null,
      comments: generateComments(rnd, received, hrStatus, hrReason),
    });
  }
  return rows;
}

const MOCK_DATA = generateMockData();

function formatTimestamp(iso) {
  const date = new Date(iso);
  const diffMin = Math.floor((Date.now() - date.getTime()) / 60000);
  if (diffMin >= 0 && diffMin < 60) return diffMin <= 1 ? 'Just now' : `${diffMin} mins ago`;
  if (diffMin >= 60 && diffMin < 1440) return `${Math.floor(diffMin / 60)} hours ago`;
  return date.toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true });
}

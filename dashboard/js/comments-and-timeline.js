// ===================================================================
// History drawer: manual comments, mocked via localStorage as a
// stand-in "shared backend" between this dashboard and the
// companion vendor.html (Vendor Card Print Dashboard). The two are
// independently-run static HTML files with no real server, so true
// live sync isn't possible here - localStorage just lets this
// browser tab's own History drawer persist/reload comments across
// page reloads. The functions below are intentionally isolated and
// API-shaped (fetchComments / addManualComment) so swapping their
// bodies for real fetch()/AJAX calls against a backend is a
// localized change - no call site elsewhere needs to change.
// ===================================================================
const COMMENT_STORE_PREFIX = 'ubl_comments_';
function commentStoreKey(reqId) { return `${COMMENT_STORE_PREFIX}${reqId}`; }

function hashStr(s) {
    let h = 0;
    for (let i = 0; i < s.length; i++) { h = (h * 31 + s.charCodeAt(i)) | 0; }
    return h;
}

// Seeds 1-2 mock historical comments the first time a given REQ ID's
// drawer is opened, mirroring vendor.html's tone/authors: a generic
// "received" comment plus a status-specific follow-up (a decline
// reason when the request was Rejected, a confirmation note when
// Approved).
function seedCommentsForRequest(reqId, r) {
    const authorPool = ['UBL HR Ops (Tariq M.)', 'UBL Ops (Sana K.)', 'UBL Branch Officer (Ali R.)'];
    const author = authorPool[Math.abs(hashStr(reqId)) % authorPool.length];
    const baseTime = new Date(`${r.date || new Date().toISOString().slice(0, 10)}T09:00:00`);
    const seeded = [{
        id: `c-${reqId}-0`,
        author,
        role: 'UBL Dashboard',
        timestamp: baseTime.toISOString(),
        text: 'Request received and queued for UBL verification.'
    }];

    if (r.status === 'Rejected') {
        const t2 = new Date(baseTime.getTime() + (24 + Math.random() * 24) * 3600000);
        seeded.push({
            id: `c-${reqId}-1`,
            author,
            role: 'UBL Dashboard',
            timestamp: t2.toISOString(),
            text: `Declined: ${r.rejectionReason || 'Chip encoding error during terminal check.'}`
        });
    } else if (r.status === 'Approved') {
        const t2 = new Date(baseTime.getTime() + (18 + Math.random() * 20) * 3600000);
        seeded.push({
            id: `c-${reqId}-1`,
            author,
            role: 'UBL Dashboard',
            timestamp: t2.toISOString(),
            text: 'Verification complete. Applicant documents matched NADRA record.'
        });
    }
    return seeded;
}

// --- Mock "API" surface --------------------------------------------
// Real backend integration point: replace the localStorage
// read/write below with e.g. `return fetch('/api/requests/' + reqId
// + '/comments').then(r => r.json())` - keep the same signature.
function fetchComments(reqId) {
    const raw = localStorage.getItem(commentStoreKey(reqId));
    if (raw) {
        try { return JSON.parse(raw); } catch (e) { /* fall through and reseed below */ }
    }
    const r = findRecordById(reqId) || {};
    const seeded = seedCommentsForRequest(reqId, r);
    localStorage.setItem(commentStoreKey(reqId), JSON.stringify(seeded));
    return seeded;
}

// Real backend integration point: replace the localStorage
// read/write below with e.g. a POST to `/api/requests/{reqId}/comments`
// and return the created comment from the response.
function addManualComment(reqId, text) {
    const trimmed = (text || '').trim();
    if (!trimmed) return null;
    const comments = fetchComments(reqId);
    const comment = {
        id: `c-${reqId}-${Date.now()}`,
        author: 'UBL HR Ops',
        role: 'UBL Dashboard',
        timestamp: new Date().toISOString(),
        text: trimmed
    };
    comments.push(comment);
    localStorage.setItem(commentStoreKey(reqId), JSON.stringify(comments));
    return comment;
}
// --- end mock API surface ------------------------------------------

// Same relative/absolute timestamp behavior as the companion
// vendor.html dashboard, so comment timestamps read consistently
// across both tools.
function formatTimestamp(iso) {
    const date = new Date(iso);
    const diffMin = Math.floor((Date.now() - date.getTime()) / 60000);
    if (diffMin >= 0 && diffMin < 60) return diffMin <= 1 ? 'Just now' : `${diffMin} mins ago`;
    if (diffMin >= 60 && diffMin < 1440) return `${Math.floor(diffMin / 60)} hours ago`;
    return date.toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true });
}

const VENDOR_STATUS_BADGE_CLASS = {
    'Received': 'vs-received',
    'In Process': 'vs-inprocess',
    'Ready for Dispatch': 'vs-ready',
    'Delivered': 'vs-delivered',
    'Pending': 'vs-pending',
    'Rejected': 'vs-rejected'
};

function renderCommentFeed(reqId) {
    const feedEl = document.getElementById('historyCommentFeed');
    if (!feedEl) return;
    const comments = fetchComments(reqId).slice().sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    if (comments.length === 0) {
        feedEl.innerHTML = `<div class="hd-comment-empty">No comments yet.</div>`;
        return;
    }
    feedEl.innerHTML = comments.map(c => `
        <div class="hd-comment${c.author === 'UBL HR Ops' ? ' hd-comment-new' : ''}">
            <div class="hd-comment-top">
                <span class="hd-comment-author">${c.author}</span>
                <span class="hd-comment-time">${formatTimestamp(c.timestamp)}</span>
            </div>
            <div class="hd-comment-text">${c.text}</div>
        </div>
    `).join('');
}

let currentHistoryReqId = null;

function submitManualComment() {
    if (!currentHistoryReqId) return;
    const input = document.getElementById('manualCommentInput');
    if (!input || !input.value.trim()) return;
    addManualComment(currentHistoryReqId, input.value);
    input.value = '';
    renderCommentFeed(currentHistoryReqId);
}

// Request Lifecycle Timeline: color is driven purely by the
// request's overall status - Approved-path stages (Approved, Sent
// to Vendor, Received from Vendor) are all "completed" (green);
// Pending shows its own stage as the current/in-progress step
// (blue); Rejected shows its stage in red. Initiated always
// happened, so it's always green.
function buildTimelineStagesHtml(r) {
    const stages = [{ label: 'Initiated', date: r.initiatedDate, time: r.initiatedTime, color: 'green' }];

    if (r.status === 'Pending') {
        stages.push({ label: 'Pending', date: r.pendingDate, time: r.pendingTime, color: 'blue' });
    } else if (r.status === 'Rejected') {
        stages.push({ label: 'Rejected', date: r.rejectedDate, time: r.rejectedTime, color: 'red' });
    } else if (r.status === 'Approved') {
        stages.push({ label: 'Approved', date: r.approvedDate, time: r.approvedTime, color: 'green' });
        if (r.sentToVendorDate) {
            stages.push({ label: 'Sent to Vendor', date: r.sentToVendorDate, time: r.sentToVendorTime, color: 'green' });
        }
        if (r.receivedFromVendorDate) {
            stages.push({ label: 'Received from Vendor', date: r.receivedFromVendorDate, time: r.receivedFromVendorTime, color: 'green' });
        }
    }

    return stages.map(s => `
        <div class="rt-stage ${s.color}">
            <span class="rt-dot"></span>
            <div class="rt-stage-title">${s.label} <span class="rt-status-chip">${s.color === 'green' ? 'Completed' : s.color === 'blue' ? 'In Progress' : 'Rejected'}</span></div>
            <div class="rt-stage-meta">
                <span><i class="fa-regular fa-calendar"></i> ${formatDateForCard(s.date)}</span>
                <span><i class="fa-regular fa-clock"></i> ${s.time}</span>
            </div>
        </div>
    `).join('');
}

function openHistoryDrawer(id) {
    const r = findRecordById(id);
    if (!r) return;
    currentHistoryReqId = id;

    document.getElementById('historyDrawerReqId').textContent = r.id;
    document.getElementById('historyDrawerApplicant').textContent = r.name;

    let statusClass = 'approved';
    if (r.status === 'Pending') statusClass = 'pending';
    if (r.status === 'Rejected') statusClass = 'rejected';
    const vsClass = VENDOR_STATUS_BADGE_CLASS[r.vendorStatus] || 'vs-received';
    document.getElementById('historyDrawerBadges').innerHTML = `
        <span class="status-badge ${statusClass}">${r.status}</span>
        <span class="status-badge ${vsClass}">${r.vendorStatus}</span>
    `;

    document.getElementById('timelineStagesList').innerHTML = buildTimelineStagesHtml(r);
    document.getElementById('manualCommentInput').value = '';
    renderCommentFeed(id);

    document.getElementById('historyDrawerBackdrop').classList.add('open');
    document.body.style.overflow = 'hidden';
}

function closeHistoryDrawer() {
    document.getElementById('historyDrawerBackdrop').classList.remove('open');
    document.body.style.overflow = '';
    currentHistoryReqId = null;
}

// Back-compat aliases: the row action menu now wires exclusively to
// openHistoryDrawer/closeHistoryDrawer (see toggleRowActionMenu),
// these just keep any other stray call sites working.
function timelineRecord(id) { openHistoryDrawer(id); }
function historyRecord(id) { openHistoryDrawer(id); }
function openTimelineModal(id) { openHistoryDrawer(id); }
function closeTimelineModal() { closeHistoryDrawer(); }

function formatDateForCard(isoDate) {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const [y, m, d] = isoDate.split('-');
    return `${d}-${months[parseInt(m, 10) - 1]}-${y}`;
}

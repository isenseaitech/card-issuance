// ---------------------------------------------------------------------------
// CSV export
// ---------------------------------------------------------------------------
function exportCsv(rows) {
  const headers = ['Req ID','Applicant','Category','Functionality','Issuance','Received Date','Status','HR Verification','Tracking ID'];
  const lines = [headers.join(',')];
  rows.forEach((r) => {
    lines.push([r.reqId, r.applicantName, r.category, r.functionality, r.issuance, r.receivedDate, r.status, r.hrStatus, r.trackingId]
      .map((v) => `"${String(v).replace(/"/g, '""')}"`).join(','));
  });
  const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `print-batch-${new Date().toISOString().slice(0,10)}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

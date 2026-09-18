window.addEventListener('error', function (e) {
  var root = document.getElementById('root');
  if (root && !root.hasChildNodes()) {
    root.innerHTML = '<pre style="padding:16px;color:#b91c1c;font-family:monospace;white-space:pre-wrap;">Failed to load dashboard:\n' +
      (e.message || e.error) + '</pre>';
  }
});

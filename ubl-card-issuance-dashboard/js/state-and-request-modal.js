        let isDarkMode = true;
        let currentFilteredApplicants = [];
        let selectedRowIds = new Set();

        // ---------------------------------------------------------------
        // Create Request Modal: Card Issuance Form
        // ---------------------------------------------------------------
        const CR_MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
        const CR_ACCEPTED_EXT = ['jpg', 'jpeg', 'png', 'pdf'];
        let crAttachedFiles = [];

        function openCreateRequestModal() {
            const backdrop = document.getElementById('crModalBackdrop');
            backdrop.classList.add('open');
            document.body.style.overflow = 'hidden';
            document.addEventListener('keydown', crHandleEscKey);
        }

        function closeCreateRequestModal() {
            const backdrop = document.getElementById('crModalBackdrop');
            backdrop.classList.remove('open');
            document.body.style.overflow = '';
            document.removeEventListener('keydown', crHandleEscKey);
            crResetForm();
        }

        function crHandleEscKey(e) {
            if (e.key === 'Escape') closeCreateRequestModal();
        }

        document.addEventListener('keydown', (e) => {
            if (e.key !== 'Escape') return;
            if (document.getElementById('cardPreviewBackdrop').classList.contains('open')) closeCardPreviewModal();
            if (document.getElementById('imageViewBackdrop').classList.contains('open')) closeImageViewModal();
            if (document.getElementById('historyDrawerBackdrop').classList.contains('open')) closeHistoryDrawer();
        });

        function switchCrTab(tab) {
            const isPreview = tab === 'preview';
            document.getElementById('crFormBody').style.display = isPreview ? 'none' : '';
            document.getElementById('crFormFooter').style.display = isPreview ? 'none' : '';
            document.getElementById('cidPreviewPanel').classList.toggle('open', isPreview);
            document.getElementById('crTabFormBtn').classList.toggle('active', !isPreview);
            document.getElementById('crTabPreviewBtn').classList.toggle('active', isPreview);
        }

        function crResetForm() {
            document.getElementById('crEmergencyContact').value = '';
            document.getElementById('crReason').value = '';
            document.getElementById('crJustification').value = '';
            document.getElementById('crBloodGroup').value = '';
            document.getElementById('crDeliveryAddress').value = '';
            crAttachedFiles = [];
            renderCrFileList();
            ['crReasonField', 'crJustificationField', 'crDeliveryAddressField'].forEach(id => {
                document.getElementById(id).classList.remove('cr-invalid');
            });
            switchCrTab('form');
        }

        function crValidateField(fieldId, value) {
            const field = document.getElementById(fieldId);
            const isValid = value && value.trim().length > 0;
            field.classList.toggle('cr-invalid', !isValid);
            return isValid;
        }

        function submitCreateRequest() {
            const reason = document.getElementById('crReason').value;
            const justification = document.getElementById('crJustification').value;
            const deliveryAddress = document.getElementById('crDeliveryAddress').value;

            const reasonValid = crValidateField('crReasonField', reason);
            const justificationValid = crValidateField('crJustificationField', justification);
            const addressValid = crValidateField('crDeliveryAddressField', deliveryAddress);

            if (!reasonValid || !justificationValid || !addressValid) {
                const firstInvalid = document.querySelector('.cr-modal-body .cr-invalid');
                if (firstInvalid) firstInvalid.scrollIntoView({ behavior: 'smooth', block: 'center' });
                return;
            }

            alert('Card Issuance Request submitted successfully.\n\nNote: this dashboard is a front-end prototype and is not yet connected to a backend, so this request has not been sent anywhere.');
            closeCreateRequestModal();
        }

        function crFilesToProcess(fileList) {
            const files = Array.from(fileList);
            const accepted = [];
            files.forEach(file => {
                const ext = file.name.split('.').pop().toLowerCase();
                if (!CR_ACCEPTED_EXT.includes(ext)) {
                    alert(`"${file.name}" was skipped: unsupported file type. Only JPG, JPEG, PNG, and PDF are accepted.`);
                    return;
                }
                if (file.size > CR_MAX_FILE_SIZE) {
                    alert(`"${file.name}" was skipped: file exceeds the 2MB maximum size.`);
                    return;
                }
                accepted.push(file);
            });
            crAttachedFiles = crAttachedFiles.concat(accepted);
            renderCrFileList();
        }

        function handleCrFileSelect(event) {
            crFilesToProcess(event.target.files);
            event.target.value = '';
        }

        function crRemoveFile(index) {
            crAttachedFiles.splice(index, 1);
            renderCrFileList();
        }

        function renderCrFileList() {
            const list = document.getElementById('crFileList');
            if (!crAttachedFiles.length) { list.innerHTML = ''; return; }
            list.innerHTML = crAttachedFiles.map((file, idx) => `
                <div class="cr-file-item">
                    <i class="fa-solid fa-file-lines"></i>
                    <span class="cr-file-name">${file.name}</span>
                    <span class="cr-file-size">${(file.size / 1024).toFixed(0)} KB</span>
                    <button type="button" class="cr-file-remove" onclick="crRemoveFile(${idx})" aria-label="Remove file"><i class="fa-solid fa-xmark"></i></button>
                </div>
            `).join('');
        }

        (function initCrDropzone() {
            document.addEventListener('DOMContentLoaded', () => {
                const dropzone = document.getElementById('crDropzone');
                if (!dropzone) return;
                ['dragenter', 'dragover'].forEach(evt => {
                    dropzone.addEventListener(evt, e => {
                        e.preventDefault();
                        dropzone.classList.add('cr-dragover');
                    });
                });
                ['dragleave', 'drop'].forEach(evt => {
                    dropzone.addEventListener(evt, e => {
                        e.preventDefault();
                        dropzone.classList.remove('cr-dragover');
                    });
                });
                dropzone.addEventListener('drop', e => {
                    if (e.dataTransfer && e.dataTransfer.files.length) {
                        crFilesToProcess(e.dataTransfer.files);
                    }
                });
            });
        })();

        function toggleRowSelect(checkbox, reqId) {
            if (checkbox.checked) selectedRowIds.add(reqId);
            else selectedRowIds.delete(reqId);
            updateSelectAllCheckboxState();
        }

        function toggleSelectAllRows(checkbox) {
            currentFilteredApplicants.forEach(item => {
                if (checkbox.checked) selectedRowIds.add(item.id);
                else selectedRowIds.delete(item.id);
            });
            document.querySelectorAll('.row-select-checkbox').forEach(cb => { cb.checked = checkbox.checked; });
        }

        function updateSelectAllCheckboxState() {
            const selectAll = document.getElementById('selectAllRowsCheckbox');
            if (!selectAll) return;
            const visibleIds = currentFilteredApplicants.map(item => item.id);
            const selectedVisible = visibleIds.filter(id => selectedRowIds.has(id));
            selectAll.checked = visibleIds.length > 0 && selectedVisible.length === visibleIds.length;
            selectAll.indeterminate = selectedVisible.length > 0 && selectedVisible.length < visibleIds.length;
        }

        function toggleBulkSentVendorPanel(evt) {
            evt.stopPropagation();
            const dropdown = document.getElementById('bulkSentVendorDropdown');
            const isOpen = dropdown.classList.contains('open');
            document.querySelectorAll('.ms-dropdown.open').forEach(d => d.classList.remove('open'));
            if (!isOpen) {
                dropdown.classList.add('open');
                const btn = dropdown.querySelector('button');
                const panel = dropdown.querySelector('.ms-panel');
                const rect = btn.getBoundingClientRect();
                panel.style.top = `${rect.bottom + 3}px`;
                panel.style.left = `${rect.left}px`;
                panel.style.minWidth = `${rect.width}px`;
            }
        }

        function bulkAssignVendor(vendorName) {
            document.querySelectorAll('.ms-dropdown.open').forEach(d => d.classList.remove('open'));

            if (selectedRowIds.size === 0) {
                alert('Select at least one record using the checkboxes first.');
                return;
            }

            mockApplicants.forEach(item => {
                if (selectedRowIds.has(item.id)) {
                    // Only an approved request can legitimately be sent to a
                    // vendor - bulk-assigning a Pending (or Rejected) row
                    // also approves it, so the Pending/Approved KPI cards,
                    // charts, and the Status column all stay consistent
                    // with the Sent to Vendor count instead of drifting.
                    if (item.status !== 'Approved') {
                        item.status = 'Approved';
                        item.rejectionReason = null;
                        if (item.approvalHours == null) item.approvalHours = Math.round((2 + Math.random() * 6) * 10) / 10;
                    }
                    item.sentToVendor = true;
                    item.vendor = vendorName;
                    if (!item.vendorHours) item.vendorHours = Math.round((18 + Math.random() * 36) * 10) / 10;
                }
            });

            selectedRowIds.clear();
            applyFilters();
        }

        let sortColumn = null;
        let sortDirection = 1;


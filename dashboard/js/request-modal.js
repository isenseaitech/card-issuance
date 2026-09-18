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

// Wires drag-and-drop on the attachment dropzone. Called once from app.js.
function initCrDropzone() {
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
}

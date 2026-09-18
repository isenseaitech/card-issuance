        const deptMaster = {
            'Retail': { color: '#7dd3fc', baseVal: 5200, bottleneck: "Card Customization Delay (+14h)" },
            'Corporate': { color: '#38bdf8', baseVal: 3400, bottleneck: "AML & KYC Verification (+22h)" },
            'HR': { color: '#0ea5e9', baseVal: 1900, bottleneck: "Employee ID Authorization (+12h)" },
            'Operations': { color: '#0284c7', baseVal: 2600, bottleneck: "Batch Queue Bottleneck (+16h)" },
            'Finance': { color: '#075985', baseVal: 1100, bottleneck: "Credit Limit Audit Stage (+20h)" },
            'IT': { color: '#0369a1', baseVal: 1600, bottleneck: "System Access Provisioning (+10h)" },
            'Risk Management': { color: '#164e63', baseVal: 1300, bottleneck: "Risk Scoring Review (+19h)" },
            'Compliance': { color: '#155e75', baseVal: 1050, bottleneck: "Regulatory Sign-off Delay (+24h)" },
            'Marketing': { color: '#0e7490', baseVal: 950, bottleneck: "Campaign Approval Queue (+8h)" },
            'Legal': { color: '#0f766e', baseVal: 800, bottleneck: "Contract Review Stage (+26h)" },
            'Treasury': { color: '#0d9488', baseVal: 750, bottleneck: "Funds Reconciliation Delay (+15h)" },
            'Audit': { color: '#059669', baseVal: 600, bottleneck: "Internal Audit Sign-off (+21h)" },
            'Digital Banking': { color: '#2563eb', baseVal: 1050, bottleneck: "App Onboarding Verification (+9h)" },
            'Procurement': { color: '#4f46e5', baseVal: 450, bottleneck: "Vendor PO Approval Delay (+13h)" },
            'Customer Service': { color: '#6366f1', baseVal: 450, bottleneck: "Ticket Escalation Backlog (+11h)" }
        };

        const genderMaster = {
            'male': { color: '#0284c7', baseVal: 7384 },
            'female': { color: '#ec4899', baseVal: 6816 }
        };

        const filterMultipliers = {
            issuance: { all: 1.0, first_time: 0.62, reissuance: 0.24, replacement: 0.11, emergency: 0.03 },
            dept: { all: 1.0, Retail: 0.18, Corporate: 0.14, HR: 0.08, Operations: 0.11, Finance: 0.06, IT: 0.07, "Risk Management": 0.06, Compliance: 0.05, Marketing: 0.05, Legal: 0.04, Treasury: 0.04, Audit: 0.03, "Digital Banking": 0.05, Procurement: 0.02, "Customer Service": 0.02 },
            department: { all: 1.0, "Card Operations": 0.32, "Customer Service": 0.20, "HR Operations": 0.16, "Risk & Compliance": 0.20, "Finance & Accounts": 0.12 },
            vendor: { all: 1.0, TPS: 0.35, "NADRA Tech": 0.25, "PakData Cards": 0.22, "SecurePrint Solutions": 0.18 },
            region: { all: 1.0, North: 0.40, South: 0.35, Central: 0.25 },
            cluster: { all: 1.0, metro: 0.55, suburban: 0.30, regional_hub: 0.15 },
            branch: { all: 1.0, alpha: 0.40, beta: 0.35, gamma: 0.25 },
            category: { all: 1.0, standard: 0.75, priority: 0.25 },
            gender: { all: 1.0, male: 0.52, female: 0.48 },
            status: { all: 1.0, Approved: 0.788, Pending: 0.161, Rejected: 0.051 },
            cardType: { all: 1.0, RF: 0.68, HF: 0.32 },
            cardCategory: { all: 1.0, Conventional: 0.7, Islamic: 0.3 },
            // Vendor Status vocabulary shared with the companion vendor.html
            // (Vendor Card Print Dashboard) dashboard.
            vendorStatus: { all: 1.0, 'Received': 0.16, 'In Process': 0.20, 'Ready for Dispatch': 0.14, 'Delivered': 0.34, 'Pending': 0.11, 'Rejected': 0.05 }
        };

        const REJECTION_REASONS = {
            'Incomplete Documents': 0.32,
            'Failed KYC/AML Check': 0.24,
            'Credit Policy Breach': 0.18,
            'Duplicate Application': 0.14,
            'Other': 0.12
        };

        const FIRST_NAMES = ["Sara", "Tariq", "Amina", "Bilal", "Ahmed", "Ayesha", "Usman", "Fatima", "Hamza", "Zainab", "Kamran", "Noor", "Imran", "Sana", "Faisal", "Mehwish", "Adnan", "Rabia", "Waqas", "Hina"];
        const LAST_NAMES = ["Malik", "Mahmood", "Sheikh", "Farooq", "Khan", "Tariq", "Ali", "Noor", "Riaz", "Raza", "Aziz", "Baig", "Chaudhry", "Dar", "Ejaz"];

        // --- Request lifecycle date/time tracking (appended enhancement) ---
        function addDaysISO(isoStr, days) {
            const d = new Date(isoStr);
            d.setDate(d.getDate() + days);
            return d.toISOString().slice(0, 10);
        }

        function randomTimeStr() {
            const h24 = Math.floor(Math.random() * 24);
            const m = Math.floor(Math.random() * 60);
            const period = h24 < 12 ? 'AM' : 'PM';
            let h12 = h24 % 12;
            if (h12 === 0) h12 = 12;
            return `${String(h12).padStart(2, '0')}:${String(m).padStart(2, '0')} ${period}`;
        }

        function weightedPick(map) {
            const entries = Object.entries(map).filter(([k]) => k !== 'all');
            const total = entries.reduce((s, [, w]) => s + w, 0);
            let r = Math.random() * total;
            for (const [key, weight] of entries) {
                if (r < weight) return key;
                r -= weight;
            }
            return entries[0][0];
        }

        function generateMockApplicants(count = 480) {
            const records = [];
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            for (let i = 0; i < count; i++) {
                const dept = weightedPick(filterMultipliers.dept);
                const department = weightedPick(filterMultipliers.department);
                const vendor = weightedPick(filterMultipliers.vendor);
                const region = weightedPick(filterMultipliers.region);
                const cluster = weightedPick(filterMultipliers.cluster);
                const branch = weightedPick(filterMultipliers.branch);
                const category = weightedPick(filterMultipliers.category);
                const gender = weightedPick(filterMultipliers.gender);
                const type = weightedPick(filterMultipliers.issuance);
                const status = weightedPick(filterMultipliers.status);

                const daysAgo = Math.floor(Math.random() * 120);
                const date = new Date(today);
                date.setDate(date.getDate() - daysAgo);

                const decided = status !== 'Pending';
                let baseHours = 4.2;
                if (category === 'priority') baseHours *= 0.43;
                if (dept === 'Corporate') baseHours *= 1.55;
                const approvalHours = decided ? Math.round((baseHours * (0.6 + Math.random() * 0.9)) * 10) / 10 : null;

                const sentToVendor = status === 'Approved' && Math.random() < 0.789;
                const vendorHours = sentToVendor ? Math.round((18 + Math.random() * 36) * 10) / 10 : null;
                const printed = sentToVendor && Math.random() < 0.936;
                const delivered = printed && Math.random() < 0.943;
                const deliveryHours = delivered ? Math.round((16 + Math.random() * 32) * 10) / 10 : null;
                const activated = delivered && Math.random() < 0.842;

                const pendingAgeHours = !decided ? daysAgo * 24 + Math.random() * 24 : null;
                const overdue = !decided && pendingAgeHours > 48;
                const slaBreach = overdue || (decided && approvalHours > 24);
                const escalated = Math.random() < 0.0114;
                const hasError = Math.random() < 0.0013;
                const rejectionReason = status === 'Rejected' ? weightedPick(REJECTION_REASONS) : null;
                const cardType = weightedPick(filterMultipliers.cardType);
                const cardCategory = weightedPick(filterMultipliers.cardCategory);
                const vendorStatus = weightedPick(filterMultipliers.vendorStatus);
                // Waybill No: assigned once a request has actually gone out
                // to the vendor (mirrors vendor.html's trackingId field).
                const waybillNo = sentToVendor ? `WB-${String(100000 + ((i * 733) % 899999))}` : '';

                const name = `${FIRST_NAMES[i % FIRST_NAMES.length]} ${LAST_NAMES[(i * 7) % LAST_NAMES.length]}`;
                const cnicSuffix = String(10000000 + (i * 137) % 89999999).padStart(8, '0');
                const cnic = `3${(i % 7)}${(i % 5)}0${cnicSuffix.slice(0, 6)}-${(i % 9)}`;
                const phone = `03${(i % 5) + 1}${String(1000000 + (i * 913) % 8999999).padStart(7, '0')}`;

                // Lifecycle date/time tracking - independent Date + Time per
                // stage, populated only for stages the request has actually
                // reached (mirrors the status/sentToVendor/printed flags
                // already computed above), so history reads as realistic:
                // Pending -> Initiated only; Approved -> + Approved;
                // Sent to Vendor -> + Sent to Vendor; Received from Vendor
                // -> + Received from Vendor.
                const initiatedDateISO = date.toISOString().slice(0, 10);
                const initiatedDate = initiatedDateISO;
                const initiatedTime = randomTimeStr();

                const approvedDate = status === 'Approved'
                    ? addDaysISO(initiatedDateISO, approvalHours != null ? Math.round(approvalHours / 24) : 0)
                    : '';
                const approvedTime = approvedDate ? randomTimeStr() : '';

                const pendingDate = status === 'Pending' ? initiatedDateISO : '';
                const pendingTime = pendingDate ? randomTimeStr() : '';

                const rejectedDate = status === 'Rejected'
                    ? addDaysISO(initiatedDateISO, approvalHours != null ? Math.round(approvalHours / 24) : 0)
                    : '';
                const rejectedTime = rejectedDate ? randomTimeStr() : '';

                const sentToVendorDate = sentToVendor ? approvedDate : '';
                const sentToVendorTime = sentToVendorDate ? randomTimeStr() : '';

                const receivedFromVendorDate = (sentToVendor && printed)
                    ? addDaysISO(sentToVendorDate, vendorHours != null ? Math.round(vendorHours / 24) : 0)
                    : '';
                const receivedFromVendorTime = receivedFromVendorDate ? randomTimeStr() : '';

                // HR Action Date: the date HR actually acted on the request
                // (approved or rejected it). Blank while still Pending.
                const hrActionDate = status === 'Approved' ? approvedDate : (status === 'Rejected' ? rejectedDate : '');

                records.push({
                    id: `REQ-${1100 + i}`,
                    name, cnic, phone,
                    type, dept, department, vendor, sentToVendor,
                    region, cluster, branch, category, gender, status,
                    date: date.toISOString().slice(0, 10),
                    approvalHours, vendorHours, deliveryHours,
                    printed, delivered, activated,
                    overdue, slaBreach, escalated, hasError, rejectionReason, cardType, cardCategory,
                    vendorStatus, waybillNo,
                    initiatedDate, initiatedTime,
                    approvedDate, approvedTime,
                    pendingDate, pendingTime,
                    rejectedDate, rejectedTime,
                    sentToVendorDate, sentToVendorTime,
                    receivedFromVendorDate, receivedFromVendorTime,
                    hrActionDate
                });
            }
            return records;
        }

        mockApplicants = generateMockApplicants();
        const TODAY_ISO = mockApplicants.reduce((max, item) => item.date > max ? item.date : max, mockApplicants[0].date);

        // Attach each applicant's request frequency (how many requests share
        // their name) once, so it can be shown as a normal table column.
        (function attachUserFrequency() {
            const counts = {};
            mockApplicants.forEach(item => { counts[item.name] = (counts[item.name] || 0) + 1; });
            mockApplicants.forEach(item => { item.userFreq = counts[item.name]; });
        })();

        // ===================================================================
        // Document Review: image verification feature
        // Dummy data model + generators for the Document Review Gallery (30
        // curated review-queue records) and for the request table's Preview
        // eye icon (synthesized on demand, deterministically, for any of the
        // 480 dashboard rows so every row can be previewed).
        // ===================================================================
        const DOC_REVIEW_LOCATIONS = [
            '5000 - UBL Head Office, Karachi',
            '1200 - UBL Gulberg Branch, Lahore',
            '3100 - UBL I.I. Chundrigar Branch, Karachi',
            '4400 - UBL Blue Area Branch, Islamabad',
            '2200 - UBL Clifton Branch, Karachi',
            '6600 - UBL Cantt Branch, Rawalpindi'
        ];
        const DOC_IMAGE_ISSUES = ['normal', 'normal', 'normal', 'blurry', 'wrong_orientation', 'low_res', 'dark'];
        const DOC_REJECTION_REASONS = ['Image is blurry', 'Image is cropped', 'Wrong card uploaded', 'Unreadable', 'Damaged image'];

        // Tints the placeholder silhouette by review status so gallery/preview
        // images are visually distinguishable at a glance: Approved stays the
        // original lightish grey, Pending is a shade darker, Rejected darker
        // still. Re-called whenever a record's status changes (see
        // galleryApprove/previewApprove/submitRejectReason) so the image
        // always matches the record's current status, not just its status
        // at the moment the record was generated.
        const DOC_STATUS_PLACEHOLDER_COLORS = {
            approved: { bg: 'E3E7ED', fg: 'B0B8C4' },
            pending: { bg: 'C6CBD2', fg: '868F9C' },
            rejected: { bg: 'A2A9B3', fg: '5B6472' }
        };

        function buildPlaceholderPhotoDataUri(status) {
            const c = DOC_STATUS_PLACEHOLDER_COLORS[status] || DOC_STATUS_PLACEHOLDER_COLORS.approved;
            return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 240 240'%3E%3Crect width='240' height='240' fill='%23${c.bg}'/%3E%3Ccircle cx='120' cy='95' r='45' fill='%23${c.fg}'/%3E%3Cpath d='M40 235C40 165 80 150 120 150C160 150 200 165 200 235Z' fill='%23${c.fg}'/%3E%3C/svg%3E`;
        }

        function docStatusLabel(s) {
            return { approved: 'Approved', pending: 'Pending Review', rejected: 'Rejected' }[s] || s;
        }

        function seededTimeStr(seed) {
            const h24 = seed % 24;
            const m = (seed * 13) % 60;
            const period = h24 < 12 ? 'AM' : 'PM';
            let h12 = h24 % 12;
            if (h12 === 0) h12 = 12;
            return `${String(h12).padStart(2, '0')}:${String(m).padStart(2, '0')} ${period}`;
        }

        // The gallery mirrors the main dashboard 1:1 - every one of the 480
        // requests gets a doc-review record (via getDocRecordForRequest,
        // defined below), so the Total/Pending/Approved/Rejected counts here
        // always match the main KPI cards exactly instead of an independent
        // small sample.
        let documentReviewRecords = mockApplicants.map(getDocRecordForRequest);
        let currentDocReviewFiltered = documentReviewRecords.slice();

        // Lazily synthesizes a doc-review-shaped record for ANY request row
        // in the main table (not just the 30 curated gallery documents), so
        // every row's Preview eye icon works. Deterministic per request id
        // so the same row always shows the same simulated image/state.
        function getDocRecordForRequest(mockItem) {
            const seed = parseInt((mockItem.id.match(/\d+/) || ['0'])[0], 10);
            const issue = DOC_IMAGE_ISSUES[seed % DOC_IMAGE_ISSUES.length];
            const status = mockItem.status === 'Approved' ? 'approved'
                : mockItem.status === 'Rejected' ? 'rejected'
                : 'pending';
            return {
                id: mockItem.id,
                employeeName: mockItem.name,
                employeeNumber: `92${String(3000 + seed).padStart(4, '0')}`,
                department: mockItem.department,
                cnic: mockItem.cnic,
                cardType: mockItem.cardType,
                cardCategory: mockItem.cardCategory,
                location: DOC_REVIEW_LOCATIONS[seed % DOC_REVIEW_LOCATIONS.length],
                status,
                uploadDate: mockItem.date,
                uploadTime: seededTimeStr(seed),
                imageIssue: issue,
                imageUrl: buildPlaceholderPhotoDataUri(status),
                fileName: `${mockItem.id}_photo.jpg`,
                fileSize: `${120 + (seed * 7) % 800} KB`,
                dimensions: issue === 'low_res' ? '90 x 120 px' : '600 x 800 px',
                fileType: 'JPEG',
                rejectionReason: status === 'rejected' ? DOC_REJECTION_REASONS[seed % DOC_REJECTION_REASONS.length] : null
            };
        }

        function parseCustomDate(str) {
            if (!str) return null;
            const m = str.trim().match(/^(\d{1,2})-(\d{1,2})-(\d{4})$/);
            if (!m) return null;
            const d = new Date(Number(m[3]), Number(m[1]) - 1, Number(m[2]));
            return isNaN(d.getTime()) ? null : d;
        }

        function matchesDateRange(item, timeVal, selectedMonth, startD, endD) {
            if (!timeVal || timeVal === 'all') return true;
            const todayD = new Date(TODAY_ISO);
            const itemD = new Date(item.date);
            const diffDays = Math.round((todayD - itemD) / 86400000);

            if (timeVal === 'daily') return diffDays === 0;
            if (timeVal === 'weekly') return diffDays >= 0 && diffDays <= 6;
            if (timeVal === 'monthly') {
                if (selectedMonth && selectedMonth !== 'all') {
                    return itemD.toLocaleString('en-US', { month: 'short' }) === selectedMonth;
                }
                return diffDays >= 0 && diffDays <= 29;
            }
            if (timeVal === 'quarterly') return diffDays >= 0 && diffDays <= 89;
            if (timeVal === 'custom') {
                const start = parseCustomDate(startD);
                const end = parseCustomDate(endD);
                if (start && itemD < start) return false;
                if (end && itemD > end) return false;
                return true;
            }
            return true;
        }

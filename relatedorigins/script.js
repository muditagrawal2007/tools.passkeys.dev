
document.addEventListener('DOMContentLoaded', () => {
    const validateBtn = document.getElementById('validateBtn');
    const resultsDiv = document.getElementById('results');
    const logOutput = document.getElementById('logOutput');
    const validLabelCountEl = document.getElementById('validLabelCount');
    const isValidEl = document.getElementById('isValid');
    const statusIndicator = document.getElementById('statusIndicator');

    validateBtn.addEventListener('click', async () => {
        // Clear previous results
        logOutput.innerHTML = '';
        resultsDiv.classList.remove('hidden');
        statusIndicator.className = 'status-indicator';
        statusIndicator.innerText = 'Validating...';

        // RP ID might be optional now if we don't use it for fetch, but user kept the field.
        const rpId = document.getElementById('rpId').value.trim();
        const callingOrigin = document.getElementById('callingOrigin').value.trim();
        const jsonInput = document.getElementById('jsonInput').value.trim();

        if (!callingOrigin || !jsonInput) {
            log("Error: Calling Origin and JSON Source are required.", "error");
            updateStatus(false, "Missing inputs");
            return;
        }

        let wellKnownData = null;

        log("Using provided JSON input.");
        try {
            wellKnownData = JSON.parse(jsonInput);
        } catch (e) {
            log("Error parsing JSON input: " + e.message, "error");
            updateStatus(false, "Invalid JSON");
            return;
        }

        if (!wellKnownData || !Array.isArray(wellKnownData.origins)) {
            log("Invalid well-known format: 'origins' array missing or invalid", "error");
            updateStatus(false, "Invalid Format");
            return;
        }

        validate(wellKnownData.origins, callingOrigin);
    });

    function log(message, type = "info") {
        const line = document.createElement('div');
        line.className = `log-line ${type}`;
        line.innerText = message;
        logOutput.appendChild(line);
        console.log(`[${type}] ${message}`);
    }

    function updateStatus(valid, text) {
        if (valid) {
            statusIndicator.classList.add('status-success');
            statusIndicator.innerText = "VALID";
            isValidEl.innerText = "Yes";
            isValidEl.style.color = "var(--success)";
        } else {
            statusIndicator.classList.add('status-error');
            statusIndicator.innerText = "INVALID: " + text;
            isValidEl.innerText = "No";
            isValidEl.style.color = "var(--error)";
        }
    }

    function validate(origins, callingOriginInput) {
        const labelsSeen = new Set();
        const skippedLabels = new Set();
        let matchFound = false;
        let foundButSkipped = false;
        let foundInOrigins = false;

        // Normalize calling origin
        let callingUrl;
        try {
            callingUrl = new URL(callingOriginInput);
        } catch (e) {
            log(`Invalid calling origin URL: ${callingOriginInput}`, "error");
            updateStatus(false, "Invalid Origin URL");
            return;
        }

        const targetOrigin = callingUrl.origin;
        log(`Target Object Origin: ${targetOrigin}`);

        for (const originStr of origins) {
            let originUrl;
            try {
                originUrl = new URL(originStr);
            } catch (e) {
                log(`Skipping invalid origin URL in list: ${originStr}`, "warn");
                continue;
            }

            const hostname = originUrl.hostname;

            // "Let label be the eTLD+1 of host."
            // Use browser global psl
            const parsed = psl.parse(hostname);
            const label = parsed.domain; // eTLD+1

            if (!label) {
                // If eTLD+1 cannot be determined, skip.
                continue;
            }

            if (originUrl.origin === targetOrigin) {
                foundInOrigins = true;
            }

            if (!labelsSeen.has(label)) {
                if (labelsSeen.size >= 5) {
                    skippedLabels.add(label);
                    if (originUrl.origin === targetOrigin) {
                        foundButSkipped = true;
                    }
                    continue;
                }
                labelsSeen.add(label);
            }

            if (originUrl.origin === targetOrigin && !matchFound) {
                matchFound = true;
            }
        }

        log("--- Analysis ---");
        log(`Number of valid labels found: ${labelsSeen.size}`);
        log(`Valid Labels: ${Array.from(labelsSeen).join(', ')}`);

        if (skippedLabels.size > 0) {
            log(`Skipped Labels (limit exceeded): ${Array.from(skippedLabels).join(', ')}`, "warn");
        }

        validLabelCountEl.innerText = labelsSeen.size;

        if (matchFound) {
            updateStatus(true, "Success");
            log("Conclusion: Valid combination.", "success");
        } else {
            let reason = "";
            if (foundButSkipped) {
                reason = "Label Limit Exceeded";
                log("Reason: Calling origin found, but its label was excluded because the limit of 5 labels was exceeded.", "error");
            } else if (foundInOrigins) {
                reason = "Validation Logic Error";
                log("Reason: Calling origin found in list but validation failed (unexpected state).", "error");
            } else {
                reason = "Origin Not Found";
                log("Reason: Calling origin not found in the well-known origins list.", "error");
            }
            updateStatus(false, reason);
        }
    }
});

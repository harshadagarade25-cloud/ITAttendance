// 1. SET YOUR CLASSROOM CENTER (YOUR LOCATION)
const TARGET_LAT = 18.729350;
const TARGET_LON = 73.665344;
const RADIUS = 0.0005; // ~50 meters

const statusText = document.getElementById('status-text');
const locationData = document.getElementById('location-data');

let html5QrcodeScanner;

// 2. QR SCAN SUCCESS CALLBACK
function onScanSuccess(decodedText) {
    statusText.innerText = "Verifying QR...";
    statusText.style.color = "orange";

    if (decodedText === "ROOM_302_IT") {
        // Stop camera
        if (html5QrcodeScanner) {
            html5QrcodeScanner.clear().catch(() => {});
        }

        statusText.innerText = "QR Verified! Checking Geofence...";
        statusText.style.color = "orange";
        verifyLocation();
    } else {
        statusText.innerText = "Invalid QR Code!";
        statusText.style.color = "red";
    }
}

// 3. GEOFENCE LOGIC
function verifyLocation() {
    if (!navigator.geolocation) {
        statusText.innerText = "Location Error: Browser does not support geolocation.";
        statusText.style.color = "red";
        return;
    }

    navigator.geolocation.getCurrentPosition(
        (position) => {
            const userLat = position.coords.latitude;
            const userLon = position.coords.longitude;

            const latDist = Math.abs(userLat - TARGET_LAT);
            const lonDist = Math.abs(userLon - TARGET_LON);

            if (latDist < RADIUS && lonDist < RADIUS) {
                // SUCCESS: inside classroom
                statusText.innerText = "✅ Attendance Marked Successfully!";
                statusText.style.color = "green";
                locationData.innerHTML = `
                    <p>Verified at: ${userLat.toFixed(6)}, ${userLon.toFixed(6)}</p>
                `;
            } else {
                // OUTSIDE RANGE
                statusText.innerText = "❌ Verification Failed: Outside Room 302";
                statusText.style.color = "red";
                locationData.innerHTML = `
                    <p>You are too far from the classroom.</p>
                    <p>Required: ${TARGET_LAT.toFixed(6)}, ${TARGET_LON.toFixed(6)}</p>
                `;
            }
        },
        (error) => {
            switch (error.code) {
                case error.PERMISSION_DENIED:
                    statusText.innerText = "Location Error: Please allow GPS permission.";
                    break;
                case error.POSITION_UNAVAILABLE:
                    statusText.innerText = "Location Error: Position unavailable.";
                    break;
                case error.TIMEOUT:
                    statusText.innerText = "Location Error: Location request timed out.";
                    break;
                default:
                    statusText.innerText = "Location Error: Please enable GPS.";
                    break;
            }
            statusText.style.color = "red";
        }
    );
}

// 4. INITIALIZE QR SCANNER
function initScanner() {
    if (!document.getElementById("reader")) {
        statusText.innerText = "Scanner Error: No reader element found.";
        statusText.style.color = "red";
        return;
    }

    try {
        html5QrcodeScanner = new Html5QrcodeScanner(
            "reader",
            {
                fps: 10,
                qrbox: 250,
                rememberLastUsedCamera: true,
                supportedScanTypesMessage: "Only QR code scanning is supported."
            },
            /* verbose= */ false
        );

        html5QrcodeScanner.render(
            onScanSuccess,
            (errorMessage) => {
                statusText.innerText = "Scanner Error: " + errorMessage;
                statusText.style.color = "red";
            }
        );
    } catch (err) {
        statusText.innerText = "Scanner Error: " + err.message;
        statusText.style.color = "red";
    }
}

// 5. LOAD SCRIPT AFTER PAGE IS READY
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initScanner);
} else {
    initScanner();
}

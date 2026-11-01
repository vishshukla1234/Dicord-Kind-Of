export function timeAgo(date) {
    if (!date) return "";
    const now = new Date();
    const past = new Date(date);
    if (isNaN(past.getTime())) return "";

    const secondsAgo = Math.floor((now - past) / 1000);

    if (secondsAgo < 10) return "just now";
    if (secondsAgo < 60) return `${secondsAgo}s ago`;
    const minutesAgo = Math.floor(secondsAgo / 60);
    if (minutesAgo < 60) return `${minutesAgo}m ago`;
    const hoursAgo = Math.floor(minutesAgo / 60);
    if (hoursAgo < 24) return `${hoursAgo}h ago`;
    const daysAgo = Math.floor(hoursAgo / 24);
    if (daysAgo < 7) return `${daysAgo}d ago`;
    return past.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export function formatTime(date) {
    if (!date) return "";
    const d = new Date(date);
    if (isNaN(d.getTime())) return "";
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

// Gentle notification sound using HTML5 Web Audio API
let audioCtx = null;
export function playNotificationSound() {
    try {
        if (!audioCtx) {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (audioCtx.state === "suspended") {
            audioCtx.resume();
        }
        const now = audioCtx.currentTime;

        const osc1 = audioCtx.createOscillator();
        const osc2 = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();

        osc1.type = "sine";
        osc1.frequency.setValueAtTime(587.33, now); // D5
        osc1.frequency.exponentialRampToValueAtTime(880, now + 0.12); // A5

        osc2.type = "triangle";
        osc2.frequency.setValueAtTime(880, now + 0.08);

        gainNode.gain.setValueAtTime(0.08, now);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

        osc1.connect(gainNode);
        osc2.connect(gainNode);
        gainNode.connect(audioCtx.destination);

        osc1.start(now);
        osc2.start(now + 0.08);
        osc1.stop(now + 0.25);
        osc2.stop(now + 0.28);
    } catch {
        // Fallback for audio errors
    }
}

// Client-side image compression: downscales to max 800px and 0.70 quality for instant transmission
export function compressImage(file, maxWidth = 800, quality = 0.7) {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (event) => {
            const rawDataUrl = event.target.result;
            const img = new Image();
            img.onload = () => {
                try {
                    const canvas = document.createElement("canvas");
                    let width = img.width;
                    let height = img.height;

                    if (width > height) {
                        if (width > maxWidth) {
                            height = Math.round((height * maxWidth) / width);
                            width = maxWidth;
                        }
                    } else {
                        if (height > maxWidth) {
                            width = Math.round((width * maxWidth) / height);
                            height = maxWidth;
                        }
                    }

                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext("2d");
                    ctx.drawImage(img, 0, 0, width, height);
                    const compressed = canvas.toDataURL("image/jpeg", quality);
                    resolve(compressed);
                } catch {
                    resolve(rawDataUrl);
                }
            };
            img.onerror = () => resolve(rawDataUrl);
            img.src = rawDataUrl;
        };
        reader.onerror = () => resolve("");
        reader.readAsDataURL(file);
    });
}

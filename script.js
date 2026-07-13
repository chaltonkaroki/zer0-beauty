// ==========================================
// zer0 Beauty - App Logic
// ==========================================

// CONFIGURATION - Replace with your actual Google Apps Script URL
const scriptURL = 'https://script.google.com/macros/s/AKfycbxsGFeNu7j3znv_IhmkvCDb5NPTBriVAeHVbXBxkSv3MqCzlqaVqKwJtEPcXnUlwxjDaA/exec';

// --- TAB NAVIGATION ---
function switchTab(tabName) {
    // Hide all tabs
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    // Deactivate all nav buttons
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    
    // Show selected tab
    const targetTab = document.getElementById(`tab-${tabName}`);
    if (targetTab) targetTab.classList.add('active');
    
    // Activate corresponding nav button
    const navIndex = ['home', 'queue', 'book'].indexOf(tabName);
    if (navIndex !== -1) {
        const navButtons = document.querySelectorAll('.nav-item');
        if (navButtons[navIndex]) navButtons[navIndex].classList.add('active');
    }
    
    // Refresh queue data when switching to queue tab
    if (tabName === 'queue') loadQueue();
}

// --- FORM SUBMISSION ---
document.addEventListener('DOMContentLoaded', () => {
    const form = document.forms['submit-to-google-sheet'];
    const msg = document.getElementById("msg");
    
    if (form) {
        form.addEventListener('submit', e => {
            e.preventDefault();
            const btn = form.querySelector('.submit-btn');
            const originalText = btn.innerHTML;
            
            // Show loading state
            btn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Processing...';
            btn.disabled = true;
            
            fetch(scriptURL, { 
                method: 'POST', 
                body: new FormData(form),
                mode: 'no-cors' // Helps with some browser restrictions
            })
            .then(() => {
                msg.innerHTML = "✨ Booking Confirmed! We'll contact you soon.";
                msg.style.color = "#4caf50";
                form.reset();
                
                setTimeout(() => { 
                    msg.innerHTML = ""; 
                    btn.innerHTML = originalText;
                    btn.disabled = false;
                }, 4000);
                
                loadQueue(); // Refresh queue immediately
            })
            .catch(err => {
                console.error('Submission error:', err);
                msg.innerHTML = "⚠️ Error. Please try again or WhatsApp us.";
                msg.style.color = "#e74c3c";
                btn.innerHTML = originalText;
                btn.disabled = false;
            });
        });
    }
});

// --- QUEUE LOGIC ---
function loadQueue() {
    fetch(scriptURL)
        .then(res => res.json())
        .then(data => {
            const list = document.getElementById('waiting-list');
            const count = data ? data.length : 0;
            
            // Update Home Stats
            const homeCount = document.getElementById('home-queue-count');
            const admTotal = document.getElementById('adm-total');
            const admQueue = document.getElementById('adm-queue');

            if (homeCount) homeCount.textContent = `${count} in queue`;
            if (admTotal) admTotal.textContent = count;
            if (admQueue) admQueue.textContent = count;

            // Render List
            if (!list) return;
            
            if (count === 0) {
                list.innerHTML = '<li class="empty">No one waiting. Walk-ins welcome!</li>';
            } else {
                list.innerHTML = data.map((p, i) => `
                    <li style="animation-delay: ${i * 0.05}s">
                        <div class="person-info">
                            <span class="num">#${i + 1}</span>
                            <span class="name">${p.name}</span>
                        </div>
                        <span class="svc">${p.service}</span>
                    </li>`).join('');
            }
        })
        .catch((err) => {
            console.error("Queue fetch failed:", err);
            const list = document.getElementById('waiting-list');
            if (list) list.innerHTML = '<li class="error">Connection lost. Pull down to refresh.</li>';
        });
}

// --- OWNER FUNCTIONS ---
function promptAdminPassword() {
    const pass = prompt("Owner Access Password:");
    // Simple client-side check (Change 'zer0beauty2026' to your own password)
    if (pass === 'zer0beauty2026') {
        const modal = document.getElementById('owner-modal');
        if (modal) {
            modal.classList.add('open');
            loadQueue(); // Refresh stats for admin view
        }
    } else if (pass !== null) {
        alert("Incorrect password!");
    }
}

function closeModal() {
    const modal = document.getElementById('owner-modal');
    if (modal) modal.classList.remove('open');
}

function updateLiveStatus() {
    const c = document.getElementById('adm-cur').value;
    const n = document.getElementById('adm-nxt').value;
    const w = document.getElementById('adm-wait').value;
    
    // Update UI elements directly
    const qCurrent = document.getElementById('q-current');
    const qNext = document.getElementById('q-next');
    const hWait = document.getElementById('home-wait-time');
    
    if (c && qCurrent) qCurrent.textContent = c;
    if (n && qNext) qNext.textContent = n;
    if (w && hWait) hWait.textContent = w;
    
    alert("✅ Board Updated Successfully!");
    closeModal();
}

// --- INITIALIZATION ---
// Load queue on startup
loadQueue();

// Auto-refresh queue every 30 seconds
setInterval(loadQueue, 30000);

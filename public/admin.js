document.getElementById('uploadForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const input = document.getElementById('fileInput');
    if (!input.files.length) return;
    const text = await input.files[0].text();
    const items = text.split(/\r?\n/).filter(Boolean).map(line => {
        const parts = line.split(':');
        if (parts.length < 4) return null;
        const [category, description, unit, cost] = parts.map(p => p.trim());
        return { category, description, unit, cost };
    }).filter(Boolean);
    const res = await fetch('/api/items/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items })
    });
    const result = document.getElementById('uploadResult');
    if (res.ok) {
        result.textContent = 'تمت الإضافة بنجاح';
        input.value = '';
    } else {
        result.textContent = 'فشل رفع الملف';
    }
});

async function loadAccuracy() {
    try {
        const res = await fetch('/api/settings/accuracyThreshold');
        if (res.ok) {
            const data = await res.json();
            if (data.value !== null) {
                document.getElementById('accuracyInput').value = parseFloat(data.value);
            }
        }
    } catch (e) {
        console.warn('failed to load accuracy setting');
    }
}

async function saveAccuracy() {
    const val = parseFloat(document.getElementById('accuracyInput').value);
    const result = document.getElementById('accuracyResult');
    if (isNaN(val) || val <= 0) {
        result.textContent = 'قيمة غير صالحة';
        return;
    }
    const res = await fetch('/api/settings/accuracyThreshold', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ value: val })
    });
    if (res.ok) {
        result.textContent = 'تم الحفظ';
    } else {
        result.textContent = 'فشل الحفظ';
    }
}

window.addEventListener('DOMContentLoaded', () => {
    loadAccuracy();
    const btn = document.getElementById('saveAccuracyBtn');
    if (btn) btn.addEventListener('click', saveAccuracy);
});

let editingId = null;

async function loadCategories() {
    const res = await fetch('/api/items/categories');
    const categories = await res.json();
    const select = document.getElementById('categoryFilter');
    if (!select) return;
    select.innerHTML = '';
    const allOpt = document.createElement('option');
    allOpt.value = '';
    allOpt.textContent = 'كل الأنواع';
    select.appendChild(allOpt);
    categories.forEach(cat => {
        const opt = document.createElement('option');
        opt.value = cat;
        opt.textContent = cat;
        select.appendChild(opt);
    });
}

async function fetchItems(category = '') {
    const url = category ? `/api/items/all?category=${encodeURIComponent(category)}` : '/api/items/all';
    const res = await fetch(url);
    const items = await res.json();
    const tbody = document.querySelector('#itemsTable tbody');
    tbody.innerHTML = '';
    items.forEach(item => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${item.category}</td>
            <td>${item.description}</td>
            <td>${item.unit}</td>
            <td>${item.cost}</td>
            <td>${new Date(item.created_at).toLocaleString()}</td>
            <td>
                <button class="btn btn-sm btn-link text-primary edit-btn"><i class="bi bi-pencil"></i></button>
                <button class="btn btn-sm btn-link text-danger delete-btn"><i class="bi bi-x-lg"></i></button>
            </td>
        `;
        tr.querySelector('.delete-btn').addEventListener('click', () => deleteItem(item.id));
        tr.querySelector('.edit-btn').addEventListener('click', () => startEdit(item));
        tbody.appendChild(tr);
    });
}

function startEdit(item) {
    editingId = item.id;
    const form = document.getElementById('itemForm');
    form.category.value = item.category;
    form.description.value = item.description;
    form.unit.value = item.unit;
    form.cost.value = item.cost;
    document.getElementById('submitBtn').textContent = 'تعديل';
    form.scrollIntoView({ behavior: 'smooth' });
}

async function deleteItem(id) {
    if (!confirm('هل أنت متأكد من الحذف؟')) return;
    const res = await fetch(`/api/items/${id}`, { method: 'DELETE' });
    if (res.ok) {
        const select = document.getElementById('categoryFilter');
        const cat = select ? select.value : '';
        fetchItems(cat);
    } else {
        alert('فشل حذف العنصر');
    }
}

async function handleSubmit(e) {
    e.preventDefault();
    const form = e.target;
    const data = {
        category: form.category.value,
        description: form.description.value,
        unit: form.unit.value,
        cost: form.cost.value
    };
    const url = editingId ? `/api/items/${editingId}` : '/api/items';
    const method = editingId ? 'PUT' : 'POST';
    const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    if (res.ok) {
        form.reset();
        editingId = null;
        document.getElementById('submitBtn').textContent = 'إضافة';
        const select = document.getElementById('categoryFilter');
        const cat = select ? select.value : '';
        fetchItems(cat);
    } else {
        alert(method === 'POST' ? 'فشل إضافة العنصر' : 'فشل تعديل العنصر');
    }
}

window.addEventListener('DOMContentLoaded', () => {
    document.getElementById('itemForm').addEventListener('submit', handleSubmit);
    loadCategories().then(() => {
        const select = document.getElementById('categoryFilter');
        if (select) {
            select.addEventListener('change', () => fetchItems(select.value));
            fetchItems(select.value);
        } else {
            fetchItems();
        }
    });
});

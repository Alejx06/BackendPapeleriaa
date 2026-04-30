// API Base URL - ruta relativa, funciona en localhost Y en producción
const API_BASE = '/api';
let productosAdmin = [];

document.addEventListener('DOMContentLoaded', cargarInventario);

const tableBody = document.getElementById('admin-table-body');
const modal = document.getElementById('productModal');
const form = document.getElementById('productForm');
const modalTitle = document.getElementById('modalTitle');
const toast = document.getElementById('toast');

async function cargarInventario() {
    try {
        const response = await fetch(`${API_BASE}/productos`);
        productosAdmin = await response.json();
        renderTable();
    } catch (error) {
        showToast('Error al cargar inventario', 'error');
    }
}

function renderTable() {
    tableBody.innerHTML = '';
    if (productosAdmin.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="7" style="text-align:center;">No hay productos registrados</td></tr>';
        return;
    }

    productosAdmin.forEach(prod => {
        const tr = document.createElement('tr');
        const statusClass = prod.activo ? 'status-active' : 'status-inactive';
        const statusText = prod.activo ? 'Activo' : 'Inactivo';

        tr.innerHTML = `
            <td>#${prod.id}</td>
            <td><strong>${prod.nombre}</strong></td>
            <td>${prod.categoria || 'N/A'}</td>
            <td>$${prod.precio.toLocaleString('es-CO')}</td>
            <td>${prod.stock}</td>
            <td><span class="status-badge ${statusClass}">${statusText}</span></td>
            <td class="action-btns">
                <button class="btn-edit" onclick="editarProducto(${prod.id})" title="Editar"><i class="fas fa-edit"></i></button>
                <button class="btn-delete" onclick="eliminarProducto(${prod.id})" title="Eliminar"><i class="fas fa-trash-alt"></i></button>
            </td>
        `;
        tableBody.appendChild(tr);
    });
}

function abrirModal() {
    form.reset();
    document.getElementById('prodId').value = '';
    document.getElementById('prodImagenUrl').value = '';
    modalTitle.innerText = 'Nuevo Producto';
    modal.classList.add('open');
}

function cerrarModal() {
    modal.classList.remove('open');
}

function editarProducto(id) {
    const prod = productosAdmin.find(p => p.id === id);
    if (!prod) return;

    document.getElementById('prodId').value = prod.id;
    document.getElementById('prodNombre').value = prod.nombre;
    document.getElementById('prodCategoria').value = prod.categoria || '';
    document.getElementById('prodPrecio').value = prod.precio;
    document.getElementById('prodStock').value = prod.stock;
    document.getElementById('prodDesc').value = prod.descripcion || '';
    document.getElementById('prodImagenUrl').value = prod.imagenUrl || '';
    document.getElementById('prodActivo').value = prod.activo ? 'true' : 'false';

    modalTitle.innerText = 'Editar Producto';
    modal.classList.add('open');
}

async function guardarProducto(e) {
    e.preventDefault();
    
    const id = document.getElementById('prodId').value;
    const payload = {
        nombre: document.getElementById('prodNombre').value,
        categoria: document.getElementById('prodCategoria').value,
        precio: parseFloat(document.getElementById('prodPrecio').value),
        stock: parseInt(document.getElementById('prodStock').value),
        descripcion: document.getElementById('prodDesc').value,
        imagenUrl: document.getElementById('prodImagenUrl').value,
        activo: document.getElementById('prodActivo').value === 'true'
    };

    const isEditing = id !== '';
    const method = isEditing ? 'PUT' : 'POST';
    const url = isEditing ? `${API_BASE}/productos/${id}` : `${API_BASE}/productos`;

    try {
        const btn = document.getElementById('btnGuardar');
        btn.disabled = true;
        btn.innerText = 'Guardando...';

        const response = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (response.ok) {
            showToast(isEditing ? 'Producto actualizado' : 'Producto creado exitosamente');
            cerrarModal();
            cargarInventario();
        } else {
            showToast('Error al guardar el producto', 'error');
        }
    } catch (error) {
        showToast('Error de red', 'error');
    } finally {
        const btn = document.getElementById('btnGuardar');
        btn.disabled = false;
        btn.innerText = 'Guardar Producto';
    }
}

async function eliminarProducto(id) {
    if (!confirm('¿Estás seguro de que deseas eliminar este producto permanentemente?')) return;

    try {
        const response = await fetch(`${API_BASE}/productos/${id}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            showToast('Producto eliminado');
            cargarInventario();
        } else {
            showToast('Error al eliminar', 'error');
        }
    } catch (error) {
        showToast('Error de red', 'error');
    }
}

function showToast(message, type = 'success') {
    toast.innerText = message;
    toast.className = 'toast';
    void toast.offsetWidth; 
    toast.className = `toast show ${type}`;
    
    const icon = type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle';
    toast.innerHTML = `<i class="fas ${icon}" style="margin-right: 8px;"></i> ${message}`;

    setTimeout(() => {
        toast.className = 'toast';
    }, 4000);
}

function cerrarSesion() {
    sessionStorage.removeItem('adminAuth');
    window.location.href = 'index.html';
}

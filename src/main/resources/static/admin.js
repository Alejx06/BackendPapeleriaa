const API_BASE = 'http://localhost:8080/api';
let productosAdmin = [];
let pedidosAdmin = [];

document.addEventListener('DOMContentLoaded', cargarInventario);

// ─── DOM References ───────────────────────────────────────────────────────────
const tableBody = document.getElementById('admin-table-body');
const modal = document.getElementById('productModal');
const form = document.getElementById('productForm');
const modalTitle = document.getElementById('modalTitle');
const toast = document.getElementById('toast');

// ─── Inventario ───────────────────────────────────────────────────────────────
async function cargarInventario() {
    try {
        const response = await fetch(`${API_BASE}/productos`);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();
        productosAdmin = Array.isArray(data) ? data : [];
        renderTable();
        cargarResumen();
    } catch (error) {
        console.error('Error al cargar inventario:', error);
        showToast('Error al cargar inventario. Verifica la conexión con el servidor.', 'error');
        if (tableBody) tableBody.innerHTML = '<tr><td colspan="7" style="text-align:center;color:red;">Error al conectar con el servidor</td></tr>';
    }
}

async function cargarResumen() {
    try {
        const response = await fetch(`${API_BASE}/pedidos/hoy`);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const pedidosHoy = await response.json();

        const totalVentas = Array.isArray(pedidosHoy)
            ? pedidosHoy.reduce((sum, p) => sum + Number(p.total || 0), 0)
            : 0;
        const totalProductos = productosAdmin.reduce((sum, p) => sum + (p.stock || 0), 0);

        const elVentas = document.getElementById('summary-ventas-hoy');
        const elPedidos = document.getElementById('summary-pedidos-hoy');
        const elStock = document.getElementById('summary-stock-total');

        if (elVentas) elVentas.innerText = `$${totalVentas.toLocaleString('es-CO')}`;
        if (elPedidos) elPedidos.innerText = `${Array.isArray(pedidosHoy) ? pedidosHoy.length : 0} pedidos realizados`;
        if (elStock) elStock.innerText = totalProductos.toLocaleString();
    } catch (error) {
        console.error('Error al cargar resumen:', error);
        // No mostramos toast para el resumen, solo log silencioso
    }
}

function renderTable() {
    if (!tableBody) return;
    tableBody.innerHTML = '';
    if (productosAdmin.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="7" style="text-align:center;">No hay productos registrados</td></tr>';
        return;
    }

    productosAdmin.forEach(prod => {
        const tr = document.createElement('tr');
        const statusClass = prod.activo ? 'status-active' : 'status-inactive';
        const statusText = prod.activo ? 'Activo' : 'Inactivo';
        const precio = prod.precio != null ? Number(prod.precio).toLocaleString('es-CO') : '0';

        tr.innerHTML = `
            <td>#${prod.id}</td>
            <td><strong>${prod.nombre || '-'}</strong></td>
            <td>${prod.categoria ? prod.categoria.trim() : 'N/A'}</td>
            <td>$${precio}</td>
            <td>${prod.stock != null ? prod.stock : 0}</td>
            <td><span class="status-badge ${statusClass}">${statusText}</span></td>
            <td class="action-btns">
                <button class="btn-edit"   onclick="editarProducto(${prod.id})" title="Editar"><i class="fas fa-edit"></i></button>
                <button class="btn-delete" onclick="eliminarProducto(${prod.id})" title="Eliminar"><i class="fas fa-trash-alt"></i></button>
            </td>
        `;
        tableBody.appendChild(tr);
    });
}

// ─── Modal Producto ───────────────────────────────────────────────────────────
function abrirModal() {
    if (form) form.reset();
    const prodId = document.getElementById('prodId');
    const prodImagenUrl = document.getElementById('prodImagenUrl');
    if (prodId) prodId.value = '';
    if (prodImagenUrl) prodImagenUrl.value = '';
    if (modalTitle) modalTitle.innerText = 'Nuevo Producto';
    if (modal) modal.classList.add('open');
}

function cerrarModal() {
    if (modal) modal.classList.remove('open');
}

function editarProducto(id) {
    const prod = productosAdmin.find(p => p.id === id);
    if (!prod) return;

    const set = (elId, val) => { const el = document.getElementById(elId); if (el) el.value = val != null ? val : ''; };
    set('prodId', prod.id);
    set('prodNombre', prod.nombre);
    set('prodCategoria', prod.categoria ? prod.categoria.trim() : '');
    set('prodPrecio', prod.precio != null ? Number(prod.precio) : '');
    set('prodStock', prod.stock != null ? prod.stock : '');
    set('prodDesc', prod.descripcion);
    set('prodImagenUrl', prod.imagenUrl);
    set('prodActivo', prod.activo ? 'true' : 'false');

    if (modalTitle) modalTitle.innerText = 'Editar Producto';
    if (modal) modal.classList.add('open');
}

async function guardarProducto(e) {
    e.preventDefault();

    const idEl = document.getElementById('prodId');
    const id = idEl ? idEl.value : '';

    const nombreEl = document.getElementById('prodNombre');
    const catEl = document.getElementById('prodCategoria');
    const precioEl = document.getElementById('prodPrecio');
    const stockEl = document.getElementById('prodStock');
    const descEl = document.getElementById('prodDesc');
    const imgEl = document.getElementById('prodImagenUrl');
    const activoEl = document.getElementById('prodActivo');

    if (!nombreEl || !precioEl || !stockEl) { showToast('Error: Formulario incompleto', 'error'); return; }

    const payload = {
        nombre: nombreEl.value.trim(),
        categoria: catEl ? catEl.value.trim() : '',
        precio: parseFloat(precioEl.value),
        stock: parseInt(stockEl.value),
        descripcion: descEl ? descEl.value.trim() : '',
        imagenUrl: imgEl ? imgEl.value.trim() : '',
        activo: activoEl ? activoEl.value === 'true' : true
    };

    if (!payload.nombre) { showToast('El nombre del producto es requerido', 'error'); return; }
    if (isNaN(payload.precio) || payload.precio < 0) { showToast('El precio debe ser un número válido', 'error'); return; }
    if (isNaN(payload.stock) || payload.stock < 0) { showToast('El stock debe ser un número válido', 'error'); return; }

    const isEditing = id !== '';
    const method = isEditing ? 'PUT' : 'POST';
    const url = isEditing ? `${API_BASE}/productos/${id}` : `${API_BASE}/productos`;

    const btn = document.getElementById('btnGuardar');
    if (btn) { btn.disabled = true; btn.innerText = 'Guardando...'; }

    try {
        const response = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (response.ok) {
            showToast(isEditing ? 'Producto actualizado exitosamente' : 'Producto creado exitosamente');
            cerrarModal();
            cargarInventario();
        } else {
            const errText = await response.text();
            showToast(errText || 'Error al guardar el producto', 'error');
        }
    } catch (error) {
        console.error('Error de red:', error);
        showToast('Error de conexión con el servidor', 'error');
    } finally {
        if (btn) { btn.disabled = false; btn.innerText = 'Guardar Producto'; }
    }
}

async function eliminarProducto(id) {
    if (!confirm('¿Estás seguro de que deseas eliminar este producto permanentemente?')) return;

    try {
        const response = await fetch(`${API_BASE}/productos/${id}`, { method: 'DELETE' });
        if (response.ok) {
            showToast('Producto eliminado correctamente');
            cargarInventario();
        } else {
            let errorMsg = 'Error al eliminar el producto';
            try {
                const errData = await response.json();
                if (errData.error) errorMsg = errData.error;
            } catch (e) {}
            showToast(errorMsg, 'error');
        }
    } catch (error) {
        console.error('Error de red:', error);
        showToast('Error de conexión con el servidor', 'error');
    }
}

// ─── Tabs ─────────────────────────────────────────────────────────────────────
function switchTab(tab) {
    const secInv = document.getElementById('section-inventario');
    const secPed = document.getElementById('section-pedidos');
    const tabInv = document.getElementById('tab-inventario');
    const tabPed = document.getElementById('tab-pedidos');

    if (secInv) secInv.style.display = tab === 'inventario' ? 'block' : 'none';
    if (secPed) secPed.style.display = tab === 'pedidos' ? 'block' : 'none';
    if (tabInv) tabInv.classList.toggle('active', tab === 'inventario');
    if (tabPed) tabPed.classList.toggle('active', tab === 'pedidos');

    if (tab === 'pedidos') cargarPedidos();
    else cargarInventario();
}

// ─── Pedidos ──────────────────────────────────────────────────────────────────
async function cargarPedidos() {
    const pedidosTableBody = document.getElementById('pedidos-table-body');
    if (pedidosTableBody) pedidosTableBody.innerHTML = '<tr><td colspan="6" style="text-align:center;">Cargando pedidos...</td></tr>';

    try {
        const response = await fetch(`${API_BASE}/pedidos`);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();
        pedidosAdmin = Array.isArray(data) ? data : [];
        renderPedidos();
    } catch (error) {
        console.error('Error al cargar pedidos:', error);
        showToast('Error al cargar pedidos', 'error');
        if (pedidosTableBody) pedidosTableBody.innerHTML = '<tr><td colspan="6" style="text-align:center;color:red;">Error al cargar pedidos</td></tr>';
    }
}

function renderPedidos() {
    const pedidosTableBody = document.getElementById('pedidos-table-body');
    if (!pedidosTableBody) return;
    pedidosTableBody.innerHTML = '';

    if (pedidosAdmin.length === 0) {
        pedidosTableBody.innerHTML = '<tr><td colspan="6" style="text-align:center;">No hay pedidos registrados aún</td></tr>';
        return;
    }

    const sorted = [...pedidosAdmin].sort((a, b) =>
        new Date(b.fechaPedido) - new Date(a.fechaPedido)
    );

    sorted.forEach(pedido => {
        const tr = document.createElement('tr');
        const fecha = pedido.fechaPedido ? new Date(pedido.fechaPedido).toLocaleString('es-CO') : 'N/A';
        const total = pedido.total != null ? Number(pedido.total).toLocaleString('es-CO') : '0';

        tr.innerHTML = `
            <td>#${pedido.id}</td>
            <td>${fecha}</td>
            <td><strong>${pedido.clienteNombre || 'Invitado'}</strong></td>
            <td>${pedido.clienteEmail || 'Sin correo'}</td>
            <td>$${total}</td>
            <td class="action-btns">
                <button class="btn-edit" onclick="verDetallesPedido(${pedido.id})" title="Ver Detalles"><i class="fas fa-eye"></i> Ver Pedido</button>
            </td>
        `;
        pedidosTableBody.appendChild(tr);
    });
}

function verDetallesPedido(id) {
    const pedido = pedidosAdmin.find(p => p.id === id);
    if (!pedido) return;

    const content = document.getElementById('pedido-detalles-content');
    if (!content) return;

    let itemsHtml = '';
    if (pedido.items && pedido.items.length > 0) {
        itemsHtml = pedido.items.map(item => {
            const nombre = item.producto ? item.producto.nombre : 'Producto';
            const subtotal = item.subtotal != null ? Number(item.subtotal).toLocaleString('es-CO') : '0';
            return `
                <div style="display:flex;justify-content:space-between;padding:0.5rem 0;border-bottom:1px solid #eee;">
                    <span>${nombre} (x${item.cantidad})</span>
                    <span>$${subtotal}</span>
                </div>
            `;
        }).join('');
    } else {
        itemsHtml = '<p style="color:#757575;">No hay detalles disponibles</p>';
    }

    const total = pedido.total != null ? Number(pedido.total).toLocaleString('es-CO') : '0';
    const fecha = pedido.fechaPedido ? new Date(pedido.fechaPedido).toLocaleString('es-CO') : 'N/A';

    content.innerHTML = `
        <div style="margin-bottom:1rem;">
            <p><strong>Cliente:</strong> ${pedido.clienteNombre || 'Invitado'}</p>
            <p><strong>Correo:</strong> ${pedido.clienteEmail || 'Sin correo'}</p>
            <p><strong>Fecha:</strong> ${fecha}</p>
            <p><strong>Método Pago:</strong> ${pedido.metodoPago || 'No especificado'}</p>
            <p><strong>Dirección:</strong> ${pedido.direccionEnvio || 'No especificada'}</p>
            <p><strong>Estado:</strong> <span class="status-badge status-active">${pedido.estado || 'COMPLETADO'}</span></p>
        </div>
        <h4 style="margin-bottom:0.5rem;border-top:1px solid #ccc;padding-top:1rem;">Productos:</h4>
        <div style="max-height:200px;overflow-y:auto;margin-bottom:1rem;">${itemsHtml}</div>
        <div style="text-align:right;font-size:1.2rem;font-weight:bold;border-top:2px solid var(--primary);padding-top:0.5rem;">
            Total: $${total}
        </div>
    `;

    const pedidoModal = document.getElementById('pedidoModal');
    if (pedidoModal) pedidoModal.classList.add('open');
}

function cerrarPedidoModal() {
    const pedidoModal = document.getElementById('pedidoModal');
    if (pedidoModal) pedidoModal.classList.remove('open');
}

// ─── Sesión ───────────────────────────────────────────────────────────────────
function cerrarSesion() {
    sessionStorage.removeItem('adminAuth');
    window.location.href = 'login.html';
}

// ─── Toast ────────────────────────────────────────────────────────────────────
function showToast(message, type = 'success') {
    if (!toast) return;
    toast.className = 'toast';
    void toast.offsetWidth;
    toast.className = `toast show ${type}`;
    const icon = type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle';
    toast.innerHTML = `<i class="fas ${icon}" style="margin-right:8px;"></i>${message}`;
    setTimeout(() => { toast.className = 'toast'; }, 4000);
}

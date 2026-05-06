// API Base URL - ruta absoluta para que funcione al abrir el archivo directamente o con Live Server
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
        cargarResumen();
    } catch (error) {
        showToast('Error al cargar inventario', 'error');
    }
}

async function cargarResumen() {
    try {
        const response = await fetch(`${API_BASE}/pedidos/hoy`);
        const pedidosHoy = await response.json();
        
        const totalVentas = pedidosHoy.reduce((sum, p) => sum + p.total, 0);
        const totalProductos = productosAdmin.reduce((sum, p) => sum + p.stock, 0);
        
        document.getElementById('summary-ventas-hoy').innerText = `$${totalVentas.toLocaleString('es-CO')}`;
        document.getElementById('summary-pedidos-hoy').innerText = `${pedidosHoy.length} pedidos realizados`;
        document.getElementById('summary-stock-total').innerText = totalProductos.toLocaleString();
    } catch (error) {
        console.error('Error al cargar resumen:', error);
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

let pedidosAdmin = [];

function switchTab(tab) {
    document.getElementById('section-inventario').style.display = tab === 'inventario' ? 'block' : 'none';
    document.getElementById('section-pedidos').style.display = tab === 'pedidos' ? 'block' : 'none';
    
    document.getElementById('tab-inventario').classList.toggle('active', tab === 'inventario');
    document.getElementById('tab-pedidos').classList.toggle('active', tab === 'pedidos');

    if (tab === 'pedidos') cargarPedidos();
    else cargarInventario();
}

async function cargarPedidos() {
    const pedidosTableBody = document.getElementById('pedidos-table-body');
    pedidosTableBody.innerHTML = '<tr><td colspan="6" style="text-align:center;">Cargando pedidos...</td></tr>';
    
    try {
        const response = await fetch(`${API_BASE}/pedidos`);
        pedidosAdmin = await response.json();
        renderPedidos();
    } catch (error) {
        showToast('Error al cargar pedidos', 'error');
    }
}

function renderPedidos() {
    const pedidosTableBody = document.getElementById('pedidos-table-body');
    pedidosTableBody.innerHTML = '';
    
    if (pedidosAdmin.length === 0) {
        pedidosTableBody.innerHTML = '<tr><td colspan="6" style="text-align:center;">No hay pedidos registrados</td></tr>';
        return;
    }

    // Ordenar por fecha (más recientes primero)
    pedidosAdmin.sort((a, b) => new Date(b.fechaPedido) - new Date(a.fechaPedido));

    pedidosAdmin.forEach(pedido => {
        const tr = document.createElement('tr');
        const fecha = new Date(pedido.fechaPedido).toLocaleString('es-CO');
        
        tr.innerHTML = `
            <td>#${pedido.id}</td>
            <td>${fecha}</td>
            <td><strong>${pedido.clienteNombre || 'Invitado'}</strong></td>
            <td>${pedido.clienteEmail || 'Sin correo'}</td>
            <td>$${pedido.total.toLocaleString('es-CO')}</td>
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
    let itemsHtml = pedido.items.map(item => `
        <div style="display: flex; justify-content: space-between; padding: 0.5rem 0; border-bottom: 1px solid #eee;">
            <span>${item.producto.nombre} (x${item.cantidad})</span>
            <span>$${item.subtotal.toLocaleString('es-CO')}</span>
        </div>
    `).join('');

    content.innerHTML = `
        <div style="margin-bottom: 1rem;">
            <p><strong>Cliente:</strong> ${pedido.clienteNombre || 'Invitado'}</p>
            <p><strong>Correo:</strong> ${pedido.clienteEmail || 'Sin correo'}</p>
            <p><strong>Fecha:</strong> ${new Date(pedido.fechaPedido).toLocaleString('es-CO')}</p>
            <p><strong>Método Pago:</strong> ${pedido.metodoPago || 'No especificado'}</p>
            <p><strong>Dirección:</strong> ${pedido.direccionEnvio || 'No especificada'}</p>
            <p><strong>Estado:</strong> <span class="status-badge status-active">${pedido.estado}</span></p>
        </div>
        <h4 style="margin-bottom: 0.5rem; border-top: 1px solid #ccc; pt: 1rem;">Productos:</h4>
        <div style="max-height: 200px; overflow-y: auto; margin-bottom: 1rem;">
            ${itemsHtml}
        </div>
        <div style="text-align: right; font-size: 1.2rem; font-weight: bold; border-top: 2px solid var(--primary); padding-top: 0.5rem;">
            Total: $${pedido.total.toLocaleString('es-CO')}
        </div>
    `;

    document.getElementById('pedidoModal').classList.add('open');
}

function cerrarPedidoModal() {
    document.getElementById('pedidoModal').classList.remove('open');
}

function cerrarSesion() {
    sessionStorage.removeItem('adminAuth');
    window.location.href = 'index.html';
}

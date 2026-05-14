let productosOriginales = [];
let productos = [];
let carrito = [];
let categorias = []; // Array of {normalized, display, original}
let categoriaActual = null;
const API_BASE = 'http://localhost:8080/api';


document.addEventListener('DOMContentLoaded', () => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
        updateThemeUI(true);
    }
});

function toggleTheme() {
    const isDark = document.body.classList.toggle('dark-mode');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    updateThemeUI(isDark);
}

function updateThemeUI(isDark) {
    const icon = document.getElementById('theme-icon');
    const text = document.getElementById('theme-text');
    if (!icon || !text) return;
    if (isDark) {
        icon.className = 'fas fa-sun';
        text.innerText = 'Modo Claro';
    } else {
        icon.className = 'fas fa-moon';
        text.innerText = 'Modo Oscuro';
    }
}

// ─── DOM Elements ─────────────────────────────────────────────────────────────
const productsGrid = document.getElementById('products-grid');
const cartCount = document.getElementById('cart-count');
const cartSidebar = document.getElementById('cart-sidebar');
const overlay = document.getElementById('overlay');
const cartItemsContainer = document.getElementById('cart-items');
const cartTotalElement = document.getElementById('cart-total');
const cartTotalHeaderElement = document.getElementById('cart-total-header');
const toast = document.getElementById('toast');
const sidebarCategories = document.getElementById('sidebar-categories');
const categoryNav = document.getElementById('category-nav');
const sectionTitle = document.getElementById('section-title');
const searchInput = document.getElementById('search-input');
const sortSelect = document.getElementById('sort-select');
const loadingSpinner = document.getElementById('loading-spinner');

// ─── Initialize ───────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    cargarProductos();
    actualizarCarrito();
    verificarSesion();
});

function verificarSesion() {
    const userAuth = sessionStorage.getItem('userAuth');
    const userName = sessionStorage.getItem('userName');
    const adminAuth = sessionStorage.getItem('adminAuth');

    const userStatus = document.getElementById('user-status');
    const userAction = document.getElementById('user-action');
    const userInfoSection = document.getElementById('user-info-section');
    const adminLoginSection = document.getElementById('admin-login-section');

    if (adminAuth === 'true') {
        if (userStatus) userStatus.innerText = 'Hola, Admin';
        if (userAction) userAction.innerText = 'Panel Control';
        if (userInfoSection) userInfoSection.onclick = () => window.location.href = 'admin.html';
        if (adminLoginSection) adminLoginSection.style.display = 'none';
    } else if (userAuth === 'true') {
        const nombre = userName ? userName.split(' ')[0] : 'Usuario';
        if (userStatus) userStatus.innerText = `Hola, ${nombre}`;
        if (userAction) userAction.innerText = 'Cerrar Sesión';
        if (userInfoSection) {
            userInfoSection.onclick = (e) => {
                e.preventDefault();
                sessionStorage.clear();
                window.location.reload();
            };
        }
        if (adminLoginSection) adminLoginSection.style.display = 'none';
    } else {
        if (userStatus) userStatus.innerText = 'Soy Cliente';
        if (userAction) userAction.innerText = 'Iniciar Sesión';
        if (userInfoSection) userInfoSection.onclick = () => window.location.href = 'login.html';
        if (adminLoginSection) adminLoginSection.style.display = 'flex';
    }
}

// ─── Search ───────────────────────────────────────────────────────────────────
if (searchInput) {
    searchInput.addEventListener('keypress', function (e) {
        if (e.key === 'Enter') buscarProductos();
    });
}

// ─── Loading ──────────────────────────────────────────────────────────────────
function showLoading(show) {
    if (!productsGrid || !loadingSpinner) return;
    if (show) {
        productsGrid.style.display = 'none';
        loadingSpinner.style.display = 'block';
    } else {
        productsGrid.style.display = 'grid';
        loadingSpinner.style.display = 'none';
    }
}

// ─── Cargar Productos desde Backend ──────────────────────────────────────────
async function cargarProductos() {
    showLoading(true);
    try {
        const response = await fetch(`${API_BASE}/productos/activos`);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();
        if (!Array.isArray(data)) throw new Error('Respuesta inválida del servidor');
        productosOriginales = data;
        productos = [...productosOriginales];
        extraerCategorias();
        renderProductos();
    } catch (error) {
        console.error('Error al cargar productos:', error);
        showToast('Error al cargar el catálogo de productos. Verifica que el servidor esté activo.', 'error');
        if (productsGrid) {
            productsGrid.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:3rem;color:#757575;"><i class="fas fa-exclamation-triangle" style="font-size:2rem;margin-bottom:1rem;display:block;"></i>No se pudo conectar con el servidor.<br>Asegúrate de que el backend esté corriendo en el puerto 8080.</div>';
            productsGrid.style.display = 'grid';
            if (loadingSpinner) loadingSpinner.style.display = 'none';
        }
    } finally {
        showLoading(false);
    }
}

// ─── Cargar Todos ─────────────────────────────────────────────────────────────
function cargarTodosLosProductos() {
    categoriaActual = null;
    if (sectionTitle) sectionTitle.innerText = 'Todos los Productos';
    productos = [...productosOriginales];
    if (searchInput) searchInput.value = '';
    renderCategorias();
    ordenarProductos(); // esto llama renderProductos internamente
}

// ─── Buscar Productos ─────────────────────────────────────────────────────────
async function buscarProductos() {
    if (!searchInput) return;
    const query = searchInput.value.trim();
    if (!query) {
        cargarTodosLosProductos();
        return;
    }

    showLoading(true);
    try {
        const response = await fetch(`${API_BASE}/productos/buscar?nombre=${encodeURIComponent(query)}`);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();
        productos = Array.isArray(data) ? data : [];
        if (sectionTitle) sectionTitle.innerText = `Resultados para: "${query}"`;
        renderProductos();
    } catch (error) {
        console.error('Error al buscar:', error);
        showToast('Error al buscar productos', 'error');
    } finally {
        showLoading(false);
    }
}

// ─── Extraer Categorías ───────────────────────────────────────────────────────
// Agrupa categorías ignorando mayúsculas y espacios al final
function extraerCategorias() {
    const catsMap = new Map(); // key: normalized → value: { display, originals[] }
    productosOriginales.forEach(p => {
        if (p.categoria && p.categoria.trim() !== '') {
            const normalized = p.categoria.trim().toLowerCase();
            if (!catsMap.has(normalized)) {
                const display = p.categoria.trim().charAt(0).toUpperCase() +
                    p.categoria.trim().slice(1).toLowerCase();
                catsMap.set(normalized, { display, originals: [p.categoria] });
            } else {
                catsMap.get(normalized).originals.push(p.categoria);
            }
        }
    });
    // Convert to array sorted by display name
    categorias = Array.from(catsMap.entries())
        .map(([normalized, val]) => ({ normalized, display: val.display }))
        .sort((a, b) => a.display.localeCompare(b.display));
    renderCategorias();
}

// ─── Renderizar Categorías ────────────────────────────────────────────────────
function renderCategorias() {
    if (!sidebarCategories) return;
    sidebarCategories.innerHTML = '';

    const liTodos = document.createElement('li');
    liTodos.innerHTML = `<a href="#" onclick="cargarTodosLosProductos(); return false;" class="${categoriaActual === null ? 'active' : ''}">Todas las Categorías</a>`;
    sidebarCategories.appendChild(liTodos);

    categorias.forEach(cat => {
        const li = document.createElement('li');
        const isActive = categoriaActual === cat.normalized ? 'active' : '';
        li.innerHTML = `<a href="#" onclick="filtrarPorCategoria('${cat.normalized}', '${cat.display}'); return false;" class="${isActive}">${cat.display}</a>`;
        sidebarCategories.appendChild(li);
    });
}

// ─── Filtrar por Categoría ────────────────────────────────────────────────────
// Filtra localmente sin llamar al backend, soporta categorías con variaciones de mayúsculas/espacios
function filtrarPorCategoria(normalizedKey, displayName) {
    categoriaActual = normalizedKey;
    if (sectionTitle) sectionTitle.innerText = `Categoría: ${displayName}`;
    if (searchInput) searchInput.value = '';

    // Filtrar localmente por categoría normalizada
    productos = productosOriginales.filter(p =>
        p.categoria && p.categoria.trim().toLowerCase() === normalizedKey
    );

    renderCategorias(); // actualiza clase 'active'
    ordenarProductos(); // renderiza productos
}

// ─── Ordenar Productos ────────────────────────────────────────────────────────
function ordenarProductos() {
    if (!sortSelect) {
        renderProductos();
        return;
    }
    const sortVal = sortSelect.value;
    const sorted = [...productos];
    if (sortVal === 'price-asc') {
        sorted.sort((a, b) => Number(a.precio) - Number(b.precio));
    } else if (sortVal === 'price-desc') {
        sorted.sort((a, b) => Number(b.precio) - Number(a.precio));
    } else {
        sorted.sort((a, b) => (a.nombre || '').localeCompare(b.nombre || ''));
    }
    productos = sorted;
    renderProductos();
}

// ─── Renderizar Productos ─────────────────────────────────────────────────────
function renderProductos() {
    if (!productsGrid) return;
    productsGrid.innerHTML = '';

    if (!productos || productos.length === 0) {
        productsGrid.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:3rem;color:#757575;"><i class="fas fa-search" style="font-size:2rem;margin-bottom:1rem;display:block;opacity:0.4;"></i>No se encontraron productos.</div>';
        return;
    }

    productos.forEach(prod => {
        // Imagen con null-safety
        let imageHtml = '';
        const imgUrl = prod.imagenUrl ? prod.imagenUrl.trim() : '';
        if (imgUrl !== '') {
            imageHtml = `<img src="${imgUrl}" alt="${prod.nombre || 'Producto'}" style="width:100%;height:100%;object-fit:cover;" onerror="this.onerror=null; this.parentElement.innerHTML='<div style=\\'width:100%; height:100%; display:flex; align-items:center; justify-content:center; background: linear-gradient(135deg, #f8fafc, #e2e8f0); color: #94a3b8; font-size: 4rem;\\'><i class=\\'fas fa-box\\'></i></div>'">`;
        } else {
            let icon = 'fa-box';
            const cat = (prod.categoria || '').toLowerCase();
            
            if (cat.includes('cuaderno') || cat.includes('libreta')) icon = 'fa-book';
            else if (cat.includes('escritura') || cat.includes('bolígrafo') || cat.includes('boligrafo') || cat.includes('lápiz') || cat.includes('lapiz') || cat.includes('marcador') || cat.includes('resaltador')) icon = 'fa-pen';
            else if (cat.includes('accesorio') || cat.includes('goma') || cat.includes('regla') || cat.includes('geometr')) icon = 'fa-ruler';
            else if (cat.includes('pegante') || cat.includes('cinta') || cat.includes('colb') || cat.includes('faz')) icon = 'fa-tape';
            else if (cat.includes('papel') || cat.includes('resma')) icon = 'fa-copy';
            
            imageHtml = `<div style="width:100%; height:100%; display:flex; align-items:center; justify-content:center; background: linear-gradient(135deg, #f8fafc, #e2e8f0); color: #94a3b8; font-size: 4rem;"><i class="fas ${icon}"></i></div>`;
        }

        // Stock con null-safety
        const stock = prod.stock != null ? prod.stock : 0;
        let stockClass = '';
        let stockText = `Disponible: ${stock}`;
        if (stock === 0) {
            stockClass = 'out';
            stockText = 'Agotado Temporalmente';
        } else if (stock <= 10) {
            stockClass = 'low';
            stockText = `¡Solo quedan ${stock}!`;
        }

        // Precio con null-safety
        const precio = prod.precio != null ? Number(prod.precio) : 0;
        const precioFormateado = precio.toLocaleString('es-CO');

        const div = document.createElement('div');
        div.className = 'product-card';
        div.innerHTML = `
            <div class="product-image">
                ${imageHtml}
            </div>
            <div class="product-details">
                <div class="product-category">${prod.categoria ? prod.categoria.trim() : 'Papelería'}</div>
                <h3 class="product-name">${prod.nombre || 'Producto sin nombre'}</h3>
                <p class="product-desc">${prod.descripcion || ''}</p>
                <div class="product-price">$${precioFormateado}</div>
                <div class="product-stock ${stockClass}">${stockText}</div>
                <button class="btn-add" onclick="agregarAlCarrito(${prod.id})" ${stock <= 0 ? 'disabled' : ''}>
                    <i class="fas fa-cart-plus"></i> ${stock > 0 ? 'Agregar al Carrito' : 'Sin Stock'}
                </button>
            </div>
        `;
        productsGrid.appendChild(div);
    });
}

// ─── Carrito ──────────────────────────────────────────────────────────────────
function agregarAlCarrito(id) {
    const producto = productosOriginales.find(p => p.id === id);
    if (!producto) {
        showToast('Producto no encontrado', 'error');
        return;
    }

    const itemEnCarrito = carrito.find(item => item.productoId === id);
    const stock = producto.stock != null ? producto.stock : 0;

    if (itemEnCarrito) {
        if (itemEnCarrito.cantidad < stock) {
            itemEnCarrito.cantidad++;
            showToast('Cantidad actualizada');
        } else {
            showToast('No hay suficiente stock disponible', 'error');
            return;
        }
    } else {
        carrito.push({
            productoId: producto.id,
            nombre: producto.nombre,
            precio: Number(producto.precio) || 0,
            cantidad: 1,
            maxStock: stock
        });
        showToast(`"${producto.nombre}" agregado al carrito`);
    }

    actualizarCarrito();

    const cartIcon = document.querySelector('.cart-icon');
    if (cartIcon) {
        cartIcon.style.transform = 'scale(1.2)';
        setTimeout(() => cartIcon.style.transform = 'scale(1)', 200);
    }
}

function cambiarCantidad(id, delta) {
    const item = carrito.find(i => i.productoId === id);
    if (!item) return;

    const nuevaCantidad = item.cantidad + delta;
    if (nuevaCantidad > 0 && nuevaCantidad <= item.maxStock) {
        item.cantidad = nuevaCantidad;
    } else if (nuevaCantidad === 0) {
        carrito = carrito.filter(i => i.productoId !== id);
    } else if (nuevaCantidad > item.maxStock) {
        showToast('Límite de stock alcanzado', 'error');
        return;
    }
    actualizarCarrito();
}

function actualizarCarrito() {
    if (!cartCount || !cartItemsContainer || !cartTotalElement || !cartTotalHeaderElement) return;

    const totalItems = carrito.reduce((sum, item) => sum + item.cantidad, 0);
    cartCount.innerText = totalItems;

    cartItemsContainer.innerHTML = '';
    let total = 0;

    if (carrito.length === 0) {
        cartItemsContainer.innerHTML = `
            <div style="text-align:center;margin-top:3rem;color:#757575;">
                <i class="fas fa-shopping-basket" style="font-size:3rem;margin-bottom:1rem;opacity:0.5;display:block;"></i>
                <p>Tu carrito está vacío</p>
                <button onclick="toggleCart()" class="btn-add" style="margin-top:1rem;width:auto;background:var(--primary);color:white;">Ir a comprar</button>
            </div>
        `;
    }

    carrito.forEach(item => {
        const subtotal = item.precio * item.cantidad;
        total += subtotal;

        const div = document.createElement('div');
        div.className = 'cart-item';
        div.innerHTML = `
            <div class="cart-item-info">
                <h4>${item.nombre}</h4>
                <div class="cart-item-price">$${item.precio.toLocaleString('es-CO')} x ${item.cantidad} = $${subtotal.toLocaleString('es-CO')}</div>
            </div>
            <div class="cart-item-controls">
                <button class="qty-btn" onclick="cambiarCantidad(${item.productoId}, -1)"><i class="fas fa-minus" style="font-size:0.7rem;"></i></button>
                <span style="width:20px;text-align:center;font-weight:bold;">${item.cantidad}</span>
                <button class="qty-btn" onclick="cambiarCantidad(${item.productoId}, 1)"><i class="fas fa-plus" style="font-size:0.7rem;"></i></button>
            </div>
        `;
        cartItemsContainer.appendChild(div);
    });

    const totalFormateado = `$${total.toLocaleString('es-CO')}`;
    cartTotalElement.innerText = totalFormateado;
    cartTotalHeaderElement.innerText = totalFormateado;
}

// ─── UI Helpers ───────────────────────────────────────────────────────────────
function toggleCart() {
    if (!cartSidebar || !overlay) return;
    cartSidebar.classList.toggle('open');
    overlay.classList.toggle('open');
}

function abrirCheckout() {
    if (carrito.length === 0) {
        showToast('El carrito está vacío', 'error');
        return;
    }

    const total = carrito.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
    const checkoutTotalEl = document.getElementById('checkout-total-val');
    if (checkoutTotalEl) checkoutTotalEl.innerText = `$${total.toLocaleString('es-CO')}`;

    const optionContra = document.getElementById('option-contraentrega');
    const msgContra = document.getElementById('msg-contraentrega');
    const radioContra = document.querySelector('input[name="metodo-pago"][value="CONTRAENTREGA"]');

    if (optionContra && msgContra && radioContra) {
        if (total < 25000) {
            optionContra.style.opacity = '0.5';
            optionContra.style.pointerEvents = 'none';
            msgContra.style.display = 'block';
            if (radioContra.checked) {
                const radioTarjeta = document.querySelector('input[name="metodo-pago"][value="TARJETA"]');
                if (radioTarjeta) radioTarjeta.checked = true;
                togglePaymentDetails();
            }
        } else {
            optionContra.style.opacity = '1';
            optionContra.style.pointerEvents = 'auto';
            msgContra.style.display = 'none';
        }
    }

    toggleCart();
    const checkoutModal = document.getElementById('checkout-modal');
    if (checkoutModal) checkoutModal.classList.add('open');
    setupPaymentListeners();
}

function setupPaymentListeners() {
    const radios = document.querySelectorAll('input[name="metodo-pago"]');
    radios.forEach(radio => { radio.onchange = togglePaymentDetails; });
    togglePaymentDetails(); // inicializar el estado visual
}

function togglePaymentDetails() {
    const checked = document.querySelector('input[name="metodo-pago"]:checked');
    if (!checked) return;
    const metodo = checked.value;
    const cardDetails = document.getElementById('card-details');
    const pseDetails = document.getElementById('pse-details');
    if (!cardDetails || !pseDetails) return;
    cardDetails.style.display = (metodo === 'TARJETA') ? 'block' : 'none';
    pseDetails.style.display = (metodo === 'PSE') ? 'block' : 'none';
}

function cerrarCheckout() {
    const checkoutModal = document.getElementById('checkout-modal');
    if (checkoutModal) checkoutModal.classList.remove('open');
}

function cancelarCompra() {
    if (confirm('¿Estás seguro de que deseas cancelar la compra? Se vaciará tu carrito.')) {
        carrito = [];
        actualizarCarrito();
        cerrarCheckout();
        showToast('Compra cancelada y carrito vaciado', 'error');
    }
}

// ─── Checkout ─────────────────────────────────────────────────────────────────
async function realizarCompra(event) {
    if (event) event.preventDefault();

    const checkoutBtn = document.getElementById('btn-confirmar-pago');
    if (checkoutBtn) {
        checkoutBtn.innerHTML = '<i class="fas fa-circle-notch fa-spin"></i> Procesando...';
        checkoutBtn.disabled = true;
    }

    const checkedRadio = document.querySelector('input[name="metodo-pago"]:checked');
    if (!checkedRadio) {
        showToast('Selecciona un método de pago', 'error');
        if (checkoutBtn) { checkoutBtn.disabled = false; checkoutBtn.innerHTML = 'Confirmar y Pagar'; }
        return;
    }

    let metodoPago = checkedRadio.value;
    const direccionEl = document.getElementById('envio-direccion');
    const direccion = direccionEl ? direccionEl.value.trim() : '';

    if (!direccion) {
        showToast('Ingresa una dirección de envío', 'error');
        if (checkoutBtn) { checkoutBtn.disabled = false; checkoutBtn.innerHTML = 'Confirmar y Pagar'; }
        return;
    }

    if (metodoPago === 'PSE') {
        const bancoSelect = document.getElementById('banco-select');
        const banco = bancoSelect ? bancoSelect.value : '';
        if (!banco) {
            showToast('Por favor selecciona un banco', 'error');
            if (checkoutBtn) { checkoutBtn.disabled = false; checkoutBtn.innerHTML = 'Confirmar y Pagar'; }
            return;
        }
        metodoPago = `PSE - ${banco.toUpperCase()}`;
    }

    const payload = {
        items: carrito.map(i => ({ productoId: i.productoId, cantidad: i.cantidad })),
        clienteNombre: sessionStorage.getItem('userName') || 'Invitado',
        clienteEmail: sessionStorage.getItem('userEmail') || 'sin-correo@invitado.com',
        metodoPago: metodoPago,
        direccionEnvio: direccion
    };

    try {
        const response = await fetch(`${API_BASE}/pedidos`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (response.ok) {
            showToast('¡Compra realizada con éxito! 🎉', 'success');
            carrito = [];
            actualizarCarrito();
            cerrarCheckout();
            cargarProductos(); // Refrescar stock
        } else {
            const err = await response.text();
            showToast(err || 'Error al procesar el pago', 'error');
        }
    } catch (error) {
        console.error('Error de red:', error);
        showToast('Error de conexión con el servidor', 'error');
    } finally {
        if (checkoutBtn) {
            checkoutBtn.innerHTML = 'Confirmar y Pagar';
            checkoutBtn.disabled = false;
        }
    }
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

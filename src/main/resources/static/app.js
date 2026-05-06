let productosOriginales = [];
let productos = [];
let carrito = [];
let categorias = [];
let categoriaActual = null;
const API_BASE = '/api';

// Theme Management
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

// DOM Elements
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

// API Base URL - ruta absoluta para que funcione al abrir el archivo directamente o con Live Server
// Initialize
document.addEventListener('DOMContentLoaded', () => {
    cargarProductos();
    actualizarCarrito(); // Ensure carrito is initialized if empty
    verificarSesion();
});

function verificarSesion() {
    const userAuth = sessionStorage.getItem('userAuth');
    const userName = sessionStorage.getItem('userName');
    const adminAuth = sessionStorage.getItem('adminAuth');

    const userStatus = document.getElementById('user-status');
    const userAction = document.getElementById('user-action');
    const userInfoSection = document.getElementById('user-info-section');
    const registerSection = document.getElementById('register-section');

    if (adminAuth === 'true') {
        if (userStatus) userStatus.innerText = 'Hola, Admin';
        if (userAction) userAction.innerText = 'Panel Control';
        if (userInfoSection) userInfoSection.onclick = () => window.location.href = 'admin.html';
        if (registerSection) registerSection.style.display = 'none';
    } else if (userAuth === 'true') {
        if (userStatus) userStatus.innerText = `Hola, ${userName.split(' ')[0]}`;
        if (userAction) userAction.innerText = 'Cerrar Sesión';
        if (userInfoSection) {
            userInfoSection.onclick = (e) => {
                e.preventDefault();
                sessionStorage.clear();
                window.location.reload();
            };
        }
        if (registerSection) registerSection.style.display = 'none';
    }
}

// Add Enter key event for search
if (searchInput) {
    searchInput.addEventListener('keypress', function (e) {
        if (e.key === 'Enter') {
            buscarProductos();
        }
    });
}

function showLoading(show) {
    if (show) {
        productsGrid.style.display = 'none';
        loadingSpinner.style.display = 'block';
    } else {
        productsGrid.style.display = 'grid';
        loadingSpinner.style.display = 'none';
    }
}

// Fetch products from backend
async function cargarProductos() {
    showLoading(true);
    try {
        const response = await fetch(`${API_BASE}/productos/activos`);
        productosOriginales = await response.json();
        productos = [...productosOriginales];
        renderProductos();
        extraerCategorias();
    } catch (error) {
        showToast('Error al cargar el catálogo de productos', 'error');
    } finally {
        showLoading(false);
    }
}

async function cargarTodosLosProductos() {
    categoriaActual = null;
    sectionTitle.innerText = "Todos los Productos";
    productos = [...productosOriginales];
    searchInput.value = '';
    renderCategorias();
    ordenarProductos();
}

async function buscarProductos() {
    const query = searchInput.value.trim();
    if (!query) {
        cargarTodosLosProductos();
        return;
    }

    showLoading(true);
    try {
        const response = await fetch(`${API_BASE}/productos/buscar?nombre=${encodeURIComponent(query)}`);
        productos = await response.json();
        sectionTitle.innerText = `Resultados para: "${query}"`;
        renderProductos();
    } catch (error) {
        showToast('Error al buscar productos', 'error');
    } finally {
        showLoading(false);
    }
}

function extraerCategorias() {
    const catsMap = new Map(); // Map to store {normalizedName: originalDisplay}
    productosOriginales.forEach(p => {
        if (p.categoria && p.categoria.trim() !== '') {
            const normalized = p.categoria.trim().toLowerCase();
            // Store the first version we find as the display version (Title Case preferred)
            if (!catsMap.has(normalized)) {
                const display = p.categoria.charAt(0).toUpperCase() + p.categoria.slice(1).toLowerCase();
                catsMap.set(normalized, display);
            }
        }
    });
    categorias = Array.from(catsMap.values()).sort();
    renderCategorias();
}

function renderCategorias() {
    sidebarCategories.innerHTML = '';
    // Optional: remove dynamic nav links and rely only on sidebar to keep header clean
    
    // Add "All" option
    const liTodos = document.createElement('li');
    liTodos.innerHTML = `<a onclick="cargarTodosLosProductos()" class="${categoriaActual === null ? 'active' : ''}">Todas las Categorías</a>`;
    sidebarCategories.appendChild(liTodos);

    categorias.forEach(cat => {
        const li = document.createElement('li');
        const isActive = categoriaActual === cat ? 'active' : '';
        li.innerHTML = `<a onclick="filtrarPorCategoria('${cat}')" class="${isActive}">${cat}</a>`;
        sidebarCategories.appendChild(li);
    });
}

async function filtrarPorCategoria(categoria) {
    categoriaActual = categoria;
    sectionTitle.innerText = `Categoría: ${categoria}`;
    searchInput.value = '';
    showLoading(true);
    try {
        const response = await fetch(`${API_BASE}/productos/categoria/${encodeURIComponent(categoria)}`);
        productos = await response.json();
        renderCategorias(); // update active state
        ordenarProductos();
    } catch (error) {
        showToast('Error al filtrar categoría', 'error');
    } finally {
        showLoading(false);
    }
}

function ordenarProductos() {
    const sortVal = sortSelect.value;
    if (sortVal === 'price-asc') {
        productos.sort((a, b) => a.precio - b.precio);
    } else if (sortVal === 'price-desc') {
        productos.sort((a, b) => b.precio - a.precio);
    } else {
        // Relevance = default ID order or name
        productos.sort((a, b) => a.nombre.localeCompare(b.nombre));
    }
    renderProductos();
}

// Render products to grid
function renderProductos() {
    productsGrid.innerHTML = '';
    
    if (productos.length === 0) {
        productsGrid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 3rem; color: #757575;">No se encontraron productos que coincidan con tu búsqueda.</div>';
        return;
    }

    productos.forEach(prod => {
        let imageHtml = '';
        if (prod.imagenUrl && prod.imagenUrl.trim() !== '') {
            imageHtml = `<img src="${prod.imagenUrl}" alt="${prod.nombre}" style="width: 100%; height: 100%; object-fit: cover;">`;
        } else {
            // Placeholder icon based on category
            let icon = 'fa-box';
            const cat = (prod.categoria || '').toLowerCase();
            if (cat.includes('cuaderno') || cat.includes('libreta')) icon = 'fa-book';
            else if (cat.includes('escritura') || cat.includes('bolígrafo') || cat.includes('lápiz')) icon = 'fa-pen';
            else if (cat.includes('accesorio') || cat.includes('goma') || cat.includes('regla')) icon = 'fa-ruler';
            else if (cat.includes('marcador') || cat.includes('resaltador')) icon = 'fa-highlighter';
            
            imageHtml = `<i class="fas ${icon}"></i>`;
        }

        let stockClass = '';
        let stockText = `Disponible: ${prod.stock}`;
        if (prod.stock === 0) {
            stockClass = 'out';
            stockText = 'Agotado Temporalmente';
        } else if (prod.stock <= 10) {
            stockClass = 'low';
            stockText = `¡Solo quedan ${prod.stock}!`;
        }

        const div = document.createElement('div');
        div.className = 'product-card';
        div.innerHTML = `
            <div class="product-image">
                ${imageHtml}
            </div>
            <div class="product-details">
                <div class="product-category">${prod.categoria || 'Papelería'}</div>
                <h3 class="product-name">${prod.nombre}</h3>
                <p class="product-desc">${prod.descripcion || ''}</p>
                
                <div class="product-price">$${prod.precio.toLocaleString('es-CO')}</div>
                <div class="product-stock ${stockClass}">${stockText}</div>
                
                <button class="btn-add" onclick="agregarAlCarrito(${prod.id})" ${prod.stock <= 0 ? 'disabled' : ''}>
                    <i class="fas fa-cart-plus"></i> ${prod.stock > 0 ? 'Agregar al Carrito' : 'Sin Stock'}
                </button>
            </div>
        `;
        productsGrid.appendChild(div);
    });
}

// Add to Cart
function agregarAlCarrito(id) {
    const producto = productos.find(p => p.id === id);
    const itemEnCarrito = carrito.find(item => item.productoId === id);

    if (itemEnCarrito) {
        if (itemEnCarrito.cantidad < producto.stock) {
            itemEnCarrito.cantidad++;
            showToast('Cantidad actualizada');
        } else {
            showToast('No hay suficiente stock disponible', 'error');
        }
    } else {
        carrito.push({
            productoId: producto.id,
            nombre: producto.nombre,
            precio: producto.precio,
            cantidad: 1,
            maxStock: producto.stock
        });
        showToast('Producto agregado al carrito');
    }
    
    actualizarCarrito();
    
    // Animate cart icon
    const cartIcon = document.querySelector('.cart-icon');
    cartIcon.style.transform = 'scale(1.2)';
    setTimeout(() => cartIcon.style.transform = 'scale(1)', 200);
}

function cambiarCantidad(id, delta) {
    const item = carrito.find(i => i.productoId === id);
    if (!item) return;

    const nuevaCantidad = item.cantidad + delta;
    if (nuevaCantidad > 0 && nuevaCantidad <= item.maxStock) {
        item.cantidad = nuevaCantidad;
    } else if (nuevaCantidad === 0) {
        carrito = carrito.filter(i => i.productoId !== id);
    } else {
        showToast('Límite de stock alcanzado', 'error');
        return;
    }
    actualizarCarrito();
}

// Update UI cart
function actualizarCarrito() {
    // Update count
    const totalItems = carrito.reduce((sum, item) => sum + item.cantidad, 0);
    cartCount.innerText = totalItems;

    // Update items HTML
    cartItemsContainer.innerHTML = '';
    let total = 0;

    if(carrito.length === 0) {
        cartItemsContainer.innerHTML = `
            <div style="text-align:center; margin-top:3rem; color: #757575;">
                <i class="fas fa-shopping-basket" style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.5;"></i>
                <p>Tu carrito está vacío</p>
                <button onclick="toggleCart()" class="btn-add" style="margin-top: 1rem; width: auto; background: var(--primary); color: white;">Ir a comprar</button>
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
                <span style="width: 20px; text-align:center; font-weight:bold;">${item.cantidad}</span>
                <button class="qty-btn" onclick="cambiarCantidad(${item.productoId}, 1)"><i class="fas fa-plus" style="font-size:0.7rem;"></i></button>
            </div>
        `;
        cartItemsContainer.appendChild(div);
    });

    const totalFormatted = `$${total.toLocaleString('es-CO')}`;
    cartTotalElement.innerText = totalFormatted;
    cartTotalHeaderElement.innerText = totalFormatted;
}

// UI Helpers
function toggleCart() {
    cartSidebar.classList.toggle('open');
    overlay.classList.toggle('open');
}

function abrirCheckout() {
    if (carrito.length === 0) {
        showToast('El carrito está vacío', 'error');
        return;
    }
    
    // Calcular total actual
    const total = carrito.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
    document.getElementById('checkout-total-val').innerText = `$${total.toLocaleString('es-CO')}`;
    
    // Lógica de Contraentrega (Min $25.000)
    const optionContra = document.getElementById('option-contraentrega');
    const msgContra = document.getElementById('msg-contraentrega');
    const radioContra = document.querySelector('input[name="metodo-pago"][value="CONTRAENTREGA"]');
    
    if (total < 25000) {
        optionContra.style.opacity = '0.5';
        optionContra.style.pointerEvents = 'none';
        msgContra.style.display = 'block';
        if (radioContra.checked) {
            document.querySelector('input[name="metodo-pago"][value="TARJETA"]').checked = true;
            togglePaymentDetails(); // Asegurar que se vean los detalles de tarjeta
        }
    } else {
        optionContra.style.opacity = '1';
        optionContra.style.pointerEvents = 'auto';
        msgContra.style.display = 'none';
    }
    
    toggleCart(); // Cerrar carrito
    document.getElementById('checkout-modal').classList.add('open');
    
    // Añadir listeners a los radios si no los tienen
    setupPaymentListeners();
}

function setupPaymentListeners() {
    const radios = document.querySelectorAll('input[name="metodo-pago"]');
    radios.forEach(radio => {
        radio.onchange = togglePaymentDetails;
    });
}

function togglePaymentDetails() {
    const metodo = document.querySelector('input[name="metodo-pago"]:checked').value;
    const cardDetails = document.getElementById('card-details');
    const pseDetails = document.getElementById('pse-details');
    
    if (metodo === 'TARJETA') {
        cardDetails.style.display = 'block';
        pseDetails.style.display = 'none';
    } else if (metodo === 'PSE') {
        cardDetails.style.display = 'none';
        pseDetails.style.display = 'block';
    } else {
        cardDetails.style.display = 'none';
        pseDetails.style.display = 'none';
    }
}

function cerrarCheckout() {
    document.getElementById('checkout-modal').classList.remove('open');
}

function cancelarCompra() {
    if (confirm('¿Estás seguro de que deseas cancelar la compra? Se vaciará tu carrito.')) {
        carrito = [];
        actualizarCarrito();
        cerrarCheckout();
        showToast('Compra cancelada y carrito vaciado', 'error');
    }
}

// Checkout
async function realizarCompra(event) {
    if (event) event.preventDefault();

    const checkoutBtn = document.getElementById('btn-confirmar-pago');
    checkoutBtn.innerHTML = '<i class="fas fa-circle-notch fa-spin"></i> Procesando...';
    checkoutBtn.disabled = true;

    let metodoPago = document.querySelector('input[name="metodo-pago"]:checked').value;
    const direccion = document.getElementById('envio-direccion').value;

    if (metodoPago === 'PSE') {
        const banco = document.getElementById('banco-select').value;
        if (!banco) {
            showToast('Por favor selecciona un banco', 'error');
            checkoutBtn.disabled = false;
            checkoutBtn.innerHTML = 'Confirmar y Pagar';
            return;
        }
        metodoPago = `PSE - ${banco.toUpperCase()}`;
    }

    const payload = {
        items: carrito.map(i => ({ productoId: i.productoId, cantidad: i.cantidad })),
        clienteNombre: sessionStorage.getItem('userName') || 'Invitado',
        clienteEmail: sessionStorage.getItem('userEmail') || 'Sin correo',
        metodoPago: metodoPago,
        direccionEnvio: direccion
    };

    try {
        const response = await fetch(`${API_BASE}/pedidos`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (response.ok) {
            showToast('¡Compra realizada con éxito!', 'success');
            carrito = [];
            actualizarCarrito();
            cerrarCheckout();
            cargarProductos(); // Reload stock
        } else {
            const err = await response.text();
            showToast(err || 'Error al procesar el pago', 'error');
        }
    } catch (error) {
        showToast('Error de conexión con el servidor', 'error');
    } finally {
        checkoutBtn.innerHTML = 'Confirmar y Pagar';
        checkoutBtn.disabled = false;
    }
}

function showToast(message, type = 'success') {
    toast.innerText = message;
    
    // Clear previous classes and force reflow
    toast.className = 'toast';
    void toast.offsetWidth; 
    
    toast.className = `toast show ${type}`;
    
    // Add icon
    const icon = type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle';
    toast.innerHTML = `<i class="fas ${icon}" style="margin-right: 8px;"></i> ${message}`;

    setTimeout(() => {
        toast.className = 'toast';
    }, 4000);
}

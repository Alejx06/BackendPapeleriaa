let productosOriginales = [];
let productos = [];
let carrito = [];
let categorias = [];
let categoriaActual = null;

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

// API Base URL - ruta relativa, funciona en localhost Y en producción
const API_BASE = '/api';

// Initialize
document.addEventListener('DOMContentLoaded', init);

async function init() {
    await cargarProductos();
    extraerCategorias();
    
    // Add Enter key event for search
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
    const cats = new Set();
    productosOriginales.forEach(p => {
        if (p.categoria) cats.add(p.categoria);
    });
    categorias = Array.from(cats).sort();
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

// Checkout
async function realizarCompra() {
    if (carrito.length === 0) {
        showToast('El carrito está vacío', 'error');
        return;
    }

    const checkoutBtn = document.querySelector('.checkout-btn');
    checkoutBtn.innerHTML = '<i class="fas fa-circle-notch fa-spin"></i> Procesando...';
    checkoutBtn.disabled = true;

    const payload = {
        items: carrito.map(i => ({ productoId: i.productoId, cantidad: i.cantidad }))
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
            showToast('¡Compra procesada exitosamente!', 'success');
            carrito = [];
            actualizarCarrito();
            toggleCart();
            cargarProductos(); // Reload stock
        } else {
            const err = await response.text();
            showToast(err || 'Error al procesar el pago', 'error');
        }
    } catch (error) {
        showToast('Error de conexión con el servidor', 'error');
    } finally {
        checkoutBtn.innerHTML = 'Procesar Pago <i class="fas fa-arrow-right"></i>';
        checkoutBtn.disabled = false;
    }
}

// UI Helpers
function toggleCart() {
    cartSidebar.classList.toggle('open');
    overlay.classList.toggle('open');
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

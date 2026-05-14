document.getElementById('loginForm').addEventListener('submit', async function(e) {
    e.preventDefault();

    const user = document.getElementById('username').value.trim();
    const pass = document.getElementById('password').value.trim();

    if (!user || !pass) {
        showToast('Por favor ingresa usuario y contraseña', 'error');
        return;
    }

    // 1. Verificar si es Administrador
    if (user === 'SHALOM' && pass === 'Familia123') {
        sessionStorage.setItem('adminAuth', 'true');
        showToast('Acceso concedido como Administrador', 'success');
        setTimeout(() => { window.location.href = 'admin.html'; }, 800);
        return;
    }

    // 2. Login como usuario cliente
    const btn = document.querySelector('.btn-login');
    if (btn) { btn.disabled = true; btn.innerText = 'Verificando...'; }

    try {
        const response = await fetch('http://localhost:8080/api/usuarios/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: user, password: pass })
        });

        if (response.ok) {
            const userData = await response.json();
            sessionStorage.setItem('userAuth',  'true');
            sessionStorage.setItem('userName',  userData.nombre || 'Usuario');
            sessionStorage.setItem('userEmail', userData.email  || '');

            showToast(`Bienvenido de nuevo, ${userData.nombre || 'Usuario'}`, 'success');
            setTimeout(() => { window.location.href = 'index.html'; }, 1000);
        } else {
            const errorMsg = await response.text();
            showToast(errorMsg || 'Credenciales inválidas. Verifica tu correo y contraseña.', 'error');
        }
    } catch (error) {
        console.error('Error de conexión:', error);
        showToast('Error de conexión. Verifica que el servidor esté activo.', 'error');
    } finally {
        if (btn) { btn.disabled = false; btn.innerText = 'Ingresar al Panel'; }
    }
});

function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    if (!toast) return;
    toast.className = 'toast';
    void toast.offsetWidth;
    toast.className = `toast show ${type}`;
    const icon = type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle';
    toast.innerHTML = `<i class="fas ${icon}" style="margin-right:8px;"></i>${message}`;
    setTimeout(() => { toast.className = 'toast'; }, 4000);
}

document.getElementById('registerForm').addEventListener('submit', async function(e) {
    e.preventDefault();

    const nombre   = document.getElementById('nombre').value.trim();
    const email    = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();

    // Validaciones
    if (!nombre || !email || !password) {
        showToast('Por favor completa todos los campos', 'error');
        return;
    }
    if (password.length < 6) {
        showToast('La contraseña debe tener al menos 6 caracteres', 'error');
        return;
    }
    if (!email.includes('@') || !email.includes('.')) {
        showToast('Ingresa un correo electrónico válido', 'error');
        return;
    }

    const btn = document.querySelector('button[type="submit"]');
    if (btn) { btn.disabled = true; btn.innerText = 'Registrando...'; }

    try {
        const response = await fetch('http://localhost:8080/api/usuarios/registrar', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nombre, email, password })
        });

        if (response.ok) {
            showToast('¡Registro exitoso! Ahora puedes iniciar sesión.', 'success');
            setTimeout(() => { window.location.href = 'login.html'; }, 2000);
        } else {
            const errorMsg = await response.text();
            showToast(errorMsg || 'Error al registrar usuario', 'error');
        }
    } catch (error) {
        console.error('Error de conexión:', error);
        showToast('Error de conexión con el servidor', 'error');
    } finally {
        if (btn) { btn.disabled = false; btn.innerText = 'Crear Cuenta'; }
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

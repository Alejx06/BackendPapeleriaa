document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const user = document.getElementById('username').value.trim();
    const pass = document.getElementById('password').value.trim();
    
    // Credenciales dadas por el usuario
    if (user === 'SHALOM' && pass === 'Familia123') {
        // Guardar llave de sesión
        sessionStorage.setItem('adminAuth', 'true');
        showToast('Acceso concedido', 'success');
        setTimeout(() => {
            window.location.href = 'admin.html';
        }, 800);
    } else {
        showToast('Usuario o contraseña incorrectos', 'error');
    }
});

function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
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

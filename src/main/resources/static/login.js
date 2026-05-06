document.getElementById('loginForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const user = document.getElementById('username').value.trim();
    const pass = document.getElementById('password').value.trim();
    
    // 1. Verificar si es Administrador (Hardcoded como estaba antes)
    if (user === 'SHALOM' && pass === 'Familia123') {
        sessionStorage.setItem('adminAuth', 'true');
        showToast('Acceso concedido como Administrador', 'success');
        setTimeout(() => {
            window.location.href = 'admin.html';
        }, 800);
        return;
    }

    // 2. Intentar Login como Usuario (Cliente) en la DB
    try {
        const response = await fetch('http://localhost:8080/api/usuarios/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: user, // El input 'username' se usa como email para usuarios
                password: pass
            })
        });

        if (response.ok) {
            const usuarioData = await response.json();
            // Guardar sesión de usuario
            sessionStorage.setItem('userAuth', 'true');
            sessionStorage.setItem('userName', usuarioData.nombre);
            sessionStorage.setItem('userEmail', usuarioData.email);
            
            showToast(`Bienvenido de nuevo, ${usuarioData.nombre}`, 'success');
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1000);
        } else {
            const errorMsg = await response.text();
            showToast(errorMsg || 'Credenciales inválidas', 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        showToast('Error de conexión o usuario no encontrado', 'error');
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

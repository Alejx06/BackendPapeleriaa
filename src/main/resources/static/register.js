document.getElementById('registerForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const nombre = document.getElementById('nombre').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();
    
    const usuario = {
        nombre: nombre,
        email: email,
        password: password
    };
    
    try {
        const response = await fetch('http://localhost:8080/api/usuarios/registrar', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(usuario)
        });
        
        if (response.ok) {
            showToast('Registro exitoso. ¡Bienvenido!', 'success');
            setTimeout(() => {
                window.location.href = 'index.html'; // O redirigir a login
            }, 2000);
        } else {
            const errorMsg = await response.text();
            showToast(errorMsg || 'Error al registrar usuario', 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        showToast('Error de conexión con el servidor', 'error');
    }
});

function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    if (!toast) return;
    
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

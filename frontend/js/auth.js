document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.getElementById("loginForm");
    const registerForm = document.getElementById("registerForm");

    if (loginForm) loginForm.addEventListener("submit", handleLogin);
    if (registerForm) registerForm.addEventListener("submit", handleRegister);
});

// LOGIN REAL
async function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById("loginEmail").value;
    const password = document.getElementById("loginPassword").value;
    const btn = e.target.querySelector("button");
    const errorDiv = document.getElementById("loginError");

    // UI Carga
    btn.disabled = true;
    btn.textContent = "Verificando...";
    if(errorDiv) errorDiv.style.display = "none";

    try {
        const response = await fetch(`${API_URL}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (response.ok) {
            // Guardar token y usuario
            localStorage.setItem("token", data.access_token || data.token);
            localStorage.setItem("user", JSON.stringify(data.user || { email }));
            
            // Redirigir
            window.location.href = "catalogo.html";
        } else {
            throw new Error(data.detail || "Credenciales incorrectas");
        }
    } catch (error) {
        console.error(error);
        if(errorDiv) {
            errorDiv.style.display = "block";
            errorDiv.textContent = error.message;
        } else {
            alert(error.message);
        }
    } finally {
        btn.disabled = false;
        btn.textContent = "Entrar";
    }
}

// REGISTRO REAL (Guarda en MongoDB)
async function handleRegister(e) {
    e.preventDefault();
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    // Nombre por defecto si el formulario no lo tiene
    const nombre = "Cliente Nuevo"; 
    
    const btn = e.target.querySelector("button");
    btn.disabled = true;
    btn.textContent = "Registrando...";

    try {
        const response = await fetch(`${API_URL}/api/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password, nombre })
        });

        if (response.ok) {
            // Éxito: Ocultar form registro y mostrar mensaje
            document.getElementById("registerForm").classList.add("d-none");
            document.getElementById("successState").classList.remove("d-none");
        } else {
            const data = await response.json();
            throw new Error(data.detail || "Error al registrar usuario");
        }
    } catch (error) {
        console.error(error);
        alert("Error: " + error.message);
    } finally {
        btn.disabled = false;
        btn.textContent = "Registrar";
    }
}
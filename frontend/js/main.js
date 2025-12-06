// frontend/js/main.js

// DEFINICIÓN GLOBAL DE LA URL DEL BACKEND
const API_URL = 'http://127.0.0.1:8000'; 

document.addEventListener("DOMContentLoaded", () => {
    actualizarContadorCarrito();
    verificarSesion();
    initializeNavigation();
});

// --- GESTIÓN DE SESIÓN ---
function verificarSesion() {
    const token = localStorage.getItem("token");
    const navLogin = document.querySelector("a[href*='login.html']");
    const navRegistro = document.querySelector("a[href*='registro.html']");
    
    // Si hay token (usuario logueado)
    if (token) {
        if(navLogin) {
            navLogin.textContent = "Cerrar Sesión";
            navLogin.href = "#"; // Evitamos que navegue
            navLogin.onclick = (e) => {
                e.preventDefault();
                cerrarSesion();
            };
        }
        // Ocultar botón de registro si ya está logueado
        if(navRegistro) navRegistro.style.display = "none";
    }
}

// FUNCIÓN CORREGIDA: Redirección inteligente
function cerrarSesion() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    
    // Detectamos en qué ruta estamos
    const rutaActual = window.location.pathname;
    
    // Si estamos dentro de carpetas 'paginas' o 'admin', tenemos que subir un nivel
    if (rutaActual.includes("/paginas/") || rutaActual.includes("/admin/")) {
        window.location.href = "../index.html";
    } else {
        // Si ya estamos en la raíz (index.html), recargamos la página o vamos a index
        window.location.href = "index.html";
    }
}

// --- UTILIDADES GLOBALES ---
function actualizarContadorCarrito() {
    const countBadge = document.getElementById("cart-count");
    if (countBadge) {
        const carrito = JSON.parse(localStorage.getItem("carrito")) || [];
        countBadge.textContent = carrito.length;
    }
}

function initializeNavigation() {
    // Marca el link activo en el menú
    const links = document.querySelectorAll(".nav-link");
    const current = window.location.pathname.split("/").pop();
    
    links.forEach(l => {
        // Evitamos marcar "Inicio" si estamos en otra página
        if(l.getAttribute("href").includes(current) && current !== "") {
            l.classList.add("active");
        }
    });
}

// Formateador de dinero (CLP)
const formatearDinero = (monto) => {
    return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(monto);
};
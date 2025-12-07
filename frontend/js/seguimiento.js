// frontend/js/seguimiento.js
// SIN la línea API_URL (ya está en main.js)

document.addEventListener("DOMContentLoaded", () => {
    cargarSeguimiento();
});

async function cargarSeguimiento() {
    const params = new URLSearchParams(window.location.search);
    const idUrl = params.get('id');
    const token = localStorage.getItem("token"); // Lo leemos por si acaso, pero no es obligatorio
    const cardBody = document.querySelector(".card-body");

    // --- 1. Lógica para buscar ID si no viene en URL ---
    let idParaBuscar = idUrl;
    if (!idParaBuscar) {
        // Intenta buscar el último pedido local (video demo)
        const historial = JSON.parse(localStorage.getItem("pedidos_db")) || [];
        if (historial.length > 0) {
            const ultimo = historial[historial.length - 1];
            renderizarDatos(ultimo);
            return;
        } else {
            // Si no hay local, mostramos mensaje de vacío
             cardBody.innerHTML = `<div class="text-center py-5"><h4>No hay pedidos recientes para rastrear</h4><a href="catalogo.html" class="btn btn-primary mt-3">Ir a comprar</a></div>`;
            return;
        }
    }

    // --- 2. Buscar en Backend (AHORA SIN IF TOKEN) ---
    try {
        const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
        
        const response = await fetch(`${API_URL}/api/orders/${idParaBuscar}`, { headers });

        if (response.ok) {
            const pedidoReal = await response.json();
            pedidoReal.id = pedidoReal._id || pedidoReal.id;
            renderizarDatos(pedidoReal);
            return; // ¡Encontrado! Salimos.
        }
    } catch (error) {
        console.warn("No se encontró en backend o error de conexión:", error);
    }

    // --- 3. Buscar en Local (Fallback) ---
    const pedidosLocales = JSON.parse(localStorage.getItem("pedidos_db")) || [];
    const pedidoLocal = pedidosLocales.find(p => String(p.id) === String(idParaBuscar));

    if (pedidoLocal) {
        renderizarDatos(pedidoLocal);
    } else {
        // Si no está ni en backend ni en local
        cardBody.innerHTML = `
            <div class="alert alert-danger text-center">
                <h4>Pedido #${idParaBuscar.slice(-5)} no encontrado</h4>
                <p>No pudimos localizar la información.</p>
                <a href="catalogo.html" class="btn btn-outline-primary">Volver al inicio</a>
            </div>`;
    }
}

function renderizarDatos(datos) {
    const cardBody = document.querySelector(".card-body");
    
    // Lógica visual
    let badgeColor = "info";
    let mensajeEstado = "Hemos recibido tu pedido.";
    let progreso = 25;
    const estado = datos.estado || "Recibido";

    if (estado === "Preparación") {
        badgeColor = "warning";
        mensajeEstado = "Tu pizza está en el horno 🔥";
        progreso = 50;
    } else if (estado === "Reparto") {
        badgeColor = "primary";
        mensajeEstado = "El repartidor va en camino 🛵";
        progreso = 75;
    } else if (estado === "Entregado") {
        badgeColor = "success";
        mensajeEstado = "¡A disfrutar! 🍕";
        progreso = 100;
    }

    // ID Limpio (mostramos solo los últimos caracteres si es muy largo)
    const idDisplay = String(datos.id).length > 10 ? '...' + String(datos.id).slice(-6) : datos.id;

    cardBody.innerHTML = `
        <div class="text-center mb-4">
            <div class="display-1 mb-2">🍕</div>
            <h4 class="text-success">Estado de tu Pedido</h4>
        </div>

        <div class="border rounded p-3 mb-4 bg-light shadow-sm">
            <div class="row mb-2">
                <div class="col-sm-4 fw-bold">Pedido N°:</div>
                <div class="col-sm-8 font-monospace fs-5">#${idDisplay}</div>
            </div>
            <div class="row mb-2">
                <div class="col-sm-4 fw-bold">Estado:</div>
                <div class="col-sm-8">
                    <span class="badge bg-${badgeColor} text-dark fs-6">${estado}</span>
                </div>
            </div>
            <div class="row mb-2">
                <div class="col-sm-4 fw-bold">Dirección:</div>
                <div class="col-sm-8">${datos.direccion}</div>
            </div>
            <div class="row">
                <div class="col-sm-4 fw-bold">Total:</div>
                <div class="col-sm-8 fw-bold text-primary fs-5">$${datos.total}</div>
            </div>
        </div>
        
        <div class="progress mb-3" style="height: 20px;">
            <div class="progress-bar bg-${badgeColor} progress-bar-striped progress-bar-animated" style="width: ${progreso}%"></div>
        </div>

        <div class="alert alert-info d-flex align-items-center">
            <span class="fs-4 me-3">ℹ️</span>
            <div>${mensajeEstado}</div>
        </div>

        <div class="d-grid gap-2 mt-4">
            <a href="catalogo.html" class="btn btn-primary">Volver al Catálogo</a>
        </div>
    `;
}
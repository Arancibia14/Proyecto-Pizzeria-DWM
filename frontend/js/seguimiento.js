// frontend/js/seguimiento.js
// SIN la línea API_URL (ya está en main.js)

document.addEventListener("DOMContentLoaded", () => {
    cargarSeguimiento();
});

async function cargarSeguimiento() {
    const params = new URLSearchParams(window.location.search);
    const idUrl = params.get('id');
    const token = localStorage.getItem("token");
    const cardBody = document.querySelector(".card-body");

    // --- NUEVA LÓGICA: BUSCAR EL ÚLTIMO PEDIDO SI NO HAY ID EN URL ---
    let idParaBuscar = idUrl;

    if (!idParaBuscar) {
        // Buscamos en el historial local (donde guardamos los pedidos del video)
        const historial = JSON.parse(localStorage.getItem("pedidos_db")) || [];
        
        if (historial.length > 0) {
            // Tomamos el último pedido registrado (el más reciente)
            const ultimoPedido = historial[historial.length - 1];
            
            // Renderizamos directamente y terminamos
            renderizarDatos(ultimoPedido);
            return;
        } else {
            // Si de verdad no hay nada en el historial
            cardBody.innerHTML = `
                <div class="text-center py-5">
                    <div class="display-1 text-muted mb-3">📭</div>
                    <h4>No tienes pedidos recientes</h4>
                    <p class="text-muted">Aún no has realizado ninguna compra en esta sesión.</p>
                    <a href="catalogo.html" class="btn btn-primary mt-3">Ir al Catálogo</a>
                </div>`;
            return;
        }
    }

    // --- SI HAY ID EN URL, FLUJO NORMAL (Híbrido) ---

    // 1. Intentar buscar en LocalStorage (Prioridad Video/Demo)
    const pedidosLocales = JSON.parse(localStorage.getItem("pedidos_db")) || [];
    const pedidoLocal = pedidosLocales.find(p => String(p.id) === String(idParaBuscar));

    if (pedidoLocal) {
        renderizarDatos(pedidoLocal);
        return; 
    }

    // 2. Intentar buscar en Backend Real (Si no está local)
    try {
        const response = await fetch(`${API_URL}/api/orders/${idParaBuscar}`, {
             headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
            const pedidoReal = await response.json();
            pedidoReal.id = pedidoReal._id || pedidoReal.id;
            renderizarDatos(pedidoReal);
        } else {
            throw new Error("Pedido no encontrado.");
        }

    } catch (error) {
        console.error(error);
        cardBody.innerHTML = `
            <div class="alert alert-danger text-center">
                <h4>Pedido #${idParaBuscar} no encontrado</h4>
                <p>Verifica el número de orden.</p>
                <a href="catalogo.html" class="btn btn-outline-primary mt-2">Volver al inicio</a>
            </div>
        `;
    }
}

function renderizarDatos(datos) {
    const cardBody = document.querySelector(".card-body");
    
    // Lógica visual de estados
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
    } else if (estado === "Entregado" || estado === "Listo") {
        badgeColor = "success";
        mensajeEstado = "¡A disfrutar! 🍕";
        progreso = 100;
    } else if (estado === "Cancelado" || estado === "Anulado") {
        badgeColor = "danger";
        mensajeEstado = "El pedido fue cancelado.";
        progreso = 0;
    }

    cardBody.innerHTML = `
        <div class="text-center mb-4">
            <div class="display-1 mb-2">🍕</div>
            <h4 class="text-success">Estado de tu Pedido</h4>
        </div>

        <div class="border rounded p-3 mb-4 bg-light shadow-sm">
            <div class="row mb-2">
                <div class="col-sm-4 fw-bold">Pedido N°:</div>
                <div class="col-sm-8 font-monospace fs-5">#${datos.id}</div>
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
                <div class="col-sm-4 fw-bold">Total Pagado:</div>
                <div class="col-sm-8 fw-bold text-primary fs-5">$${datos.total}</div>
            </div>
        </div>
        
        <div class="progress mb-3" style="height: 20px;">
            <div class="progress-bar bg-${badgeColor} progress-bar-striped progress-bar-animated" 
                 role="progressbar" style="width: ${progreso}%"></div>
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
document.addEventListener("DOMContentLoaded", () => {
    cargarSeguimiento();
});

async function cargarSeguimiento() {
    const params = new URLSearchParams(window.location.search);
    const idUrl = params.get('id');
    const token = localStorage.getItem("token");
    const cardBody = document.querySelector(".card-body");

    let idParaBuscar = idUrl;

    // CASO 1: No hay ID en la URL (Entraste desde el menú)
    if (!idParaBuscar) {
        
        // A. Intentamos buscar en el historial Local (Memoria navegador)
        const historial = JSON.parse(localStorage.getItem("pedidos_db")) || [];
        
        if (historial.length > 0) {
            // Si hay historial local, usamos el último
            const ultimoLocal = historial[historial.length - 1];
            renderizarDatos(ultimoLocal);
            return;
        } 
        
        // B. PLAN DE RESPALDO (NUEVO): Si borraste caché, buscamos el último en el Backend
        try {
            const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
            const res = await fetch(`${API_URL}/api/orders`, { headers });
            
            if (res.ok) {
                const todosLosPedidos = await res.json();
                if (todosLosPedidos.length > 0) {
                    // Tomamos el último pedido registrado en la base de datos
                    const ultimoRemoto = todosLosPedidos[todosLosPedidos.length - 1];
                    // Normalizamos el ID 
                    ultimoRemoto.id = ultimoRemoto.id || ultimoRemoto._id;
                    renderizarDatos(ultimoRemoto);
                    return;
                }
            }
        } catch (e) {
            console.log("No se pudo recuperar del backend automático");
        }

        // C. Si falló todo (Local y Backend vacío)
        cardBody.innerHTML = `
            <div class="text-center py-5">
                <div class="display-1 text-muted mb-3">📭</div>
                <h4>No tienes pedidos recientes</h4>
                <p class="text-muted">Aún no has realizado ninguna compra en esta sesión.</p>
                <a href="catalogo.html" class="btn btn-primary mt-3">Ir al Catálogo</a>
            </div>`;
        return;
    }

    // CASO 2: Hay ID en la URL
    try {
        const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
        const response = await fetch(`${API_URL}/api/orders/${idParaBuscar}`, { headers });

        if (response.ok) {
            const pedidoReal = await response.json();
            pedidoReal.id = pedidoReal._id || pedidoReal.id;
            renderizarDatos(pedidoReal);
            return;
        } else {
            throw new Error("No encontrado en backend");
        }

    } catch (error) {
        // Si falla backend, intentamos local como último recurso
        const pedidosLocales = JSON.parse(localStorage.getItem("pedidos_db")) || [];
        const pedidoLocal = pedidosLocales.find(p => String(p.id) === String(idParaBuscar));

        if (pedidoLocal) {
            renderizarDatos(pedidoLocal);
        } else {
            cardBody.innerHTML = `
                <div class="alert alert-danger text-center">
                    <h4>Pedido no encontrado</h4>
                    <p>No pudimos localizar la información del pedido #${idParaBuscar.slice(-5)}.</p>
                    <a href="catalogo.html" class="btn btn-outline-primary">Volver al inicio</a>
                </div>`;
        }
    }
}

function renderizarDatos(datos) {
    const cardBody = document.querySelector(".card-body");
    
    let badgeColor = "info";
    let mensajeEstado = "Hemos recibido tu pedido.";
    let progreso = 25;
    const estado = datos.estado || "Recibido";

    // Lógica visual de estados
    if (estado === "Preparación" || estado === "En Horno") {
        badgeColor = "warning";
        mensajeEstado = "Tu pizza está en el horno 🔥";
        progreso = 50;
    } else if (estado === "Reparto" || estado === "En Reparto") {
        badgeColor = "primary";
        mensajeEstado = "El repartidor va en camino 🛵";
        progreso = 75;
    } else if (estado === "Entregado") {
        badgeColor = "success";
        mensajeEstado = "¡A disfrutar! 🍕";
        progreso = 100;
    } else if (estado === "Anulado" || estado === "Cancelado") {
        badgeColor = "danger";
        mensajeEstado = "El pedido ha sido cancelado.";
        progreso = 0;
    }

    const idDisplay = String(datos.id).slice(-6); // Mostrar solo últimos 6 dígitos

    cardBody.innerHTML = `
        <div class="text-center mb-4">
            <div class="display-1 mb-2">🍕</div>
            <h4 class="text-success">Estado de tu Pedido</h4>
        </div>

        <div class="border rounded p-3 mb-4 bg-light shadow-sm">
            <div class="row mb-2">
                <div class="col-sm-4 fw-bold">Pedido N°:</div>
                <div class="col-sm-8 font-monospace fs-5">#...${idDisplay}</div>
            </div>
            <div class="row mb-2">
                <div class="col-sm-4 fw-bold">Estado:</div>
                <div class="col-sm-8">
                    <span class="badge bg-${badgeColor} text-dark fs-6">${estado}</span>
                </div>
            </div>
            <div class="row mb-2">
                <div class="col-sm-4 fw-bold">Dirección:</div>
                <div class="col-sm-8">${datos.direccion || 'Retiro en local'}</div>
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
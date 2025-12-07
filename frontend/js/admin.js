// frontend/js/admin.js
// SIN la línea API_URL (ya está en main.js)

document.addEventListener("DOMContentLoaded", () => {
    const path = window.location.pathname;
    
    if(path.includes("panel-cocina")) cargarCocina();
    if(path.includes("reportes")) cargarReportes();
    if(path.includes("incidentes")) cargarIncidentes();
    if(path.includes("asignar-repartidor")) llenarSelectoresAdmin("selectorPedidoAsignar");
    if(path.includes("tiempo-entrega")) llenarSelectoresAdmin("selectorPedidoTiempo");
    
    const btnExport = document.getElementById("exportCSV");
    if(btnExport) btnExport.addEventListener("click", exportarCSV);
});

let ordenesCargadas = [];
let pedidoSeleccionadoId = null;

// --- FUNCIÓN MAESTRA (Híbrida + Filtro Borrados) ---
async function fetchOrdenes() {
    const token = localStorage.getItem("token");
    let ordenesReales = [];
    let ordenesLocales = [];

    // 1. Backend (Sin miedo al token)
    try {
        const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
        const res = await fetch(`${API_URL}/api/orders`, { headers });
        if(res.ok) ordenesReales = await res.json();
    } catch(e) { console.error(e); }

    // 2. Local
    try {
        ordenesLocales = JSON.parse(localStorage.getItem("pedidos_db")) || [];
    } catch(e) { console.error(e); }

    // 3. Fusionar
    let total = [...ordenesLocales, ...ordenesReales];

    // 4. Filtro de Eliminados
    const listaNegra = JSON.parse(localStorage.getItem("pedidos_eliminados")) || [];
    ordenesCargadas = total.filter(o => !listaNegra.includes(String(o.id || o._id)));

    return ordenesCargadas;
}

// --- GENERAR CSV (NUEVA FUNCIÓN REAL) ---
function exportarCSV() {
    if (ordenesCargadas.length === 0) {
        alert("No hay datos para exportar.");
        return;
    }

    // 1. Crear encabezados del Excel/CSV
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "ID Pedido,Fecha,Cliente,Direccion,Total,Estado\n"; // Títulos

    // 2. Llenar filas con los datos
    ordenesCargadas.forEach(o => {
        // Limpiamos comas en los textos para que no rompan las columnas
        const id = String(o.id || o._id);
        const fecha = o.fecha ? o.fecha.slice(0, 10) : "Hoy";
        const cliente = (o.cliente || "Cliente Web").replace(/,/g, ""); 
        const direccion = (o.direccion || "Retiro").replace(/,/g, " "); 
        const total = o.total;
        const estado = o.estado || "Recibido";

        // Armamos la línea
        const row = `${id},${fecha},${cliente},${direccion},${total},${estado}`;
        csvContent += row + "\n";
    });

    // 3. Crear enlace invisible y darle clic
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "reporte_ventas_pizzeria.csv");
    document.body.appendChild(link); // Necesario para Firefox
    
    link.click(); // ¡Clic automático!
    document.body.removeChild(link); // Limpieza
}

// --- LOGICA SELECTORES ---
async function llenarSelectoresAdmin(idSelector) {
    const ordenes = await fetchOrdenes();
    const select = document.getElementById(idSelector);
    if(!select) return;
    
    select.innerHTML = '<option value="">-- Selecciona un pedido --</option>';
    
    ordenes.forEach(o => {
        const id = o.id || o._id;
        const nombre = `Pedido #${String(id).slice(-5)} ($${o.total})`;
        select.innerHTML += `<option value="${id}">${nombre}</option>`;
    });
}

// --- REPORTES ---
async function cargarReportes() {
    const ordenes = await fetchOrdenes();
    const tbody = document.querySelector("table tbody");
    if(!tbody) return;
    
    tbody.innerHTML = "";
    if(ordenes.length === 0) { tbody.innerHTML = `<tr><td colspan="4" class="text-center">Sin datos</td></tr>`; return; }
    
    ordenes.forEach(o => {
        const id = String(o.id || o._id);
        tbody.innerHTML += `
            <tr>
                <td>${id.slice(-8)}...</td>
                <td>$${o.total}</td>
                <td><span class="badge bg-success">${o.estado || 'OK'}</span></td>
                <td><button class="btn btn-sm btn-outline-danger" onclick="eliminarPedido('${id}')">Borrar</button></td>
            </tr>`;
    });
}

// --- COCINA ---
async function cargarCocina() {
    const ordenes = await fetchOrdenes();
    const tbody = document.querySelector("table tbody");
    if(!tbody) return;
    tbody.innerHTML = "";
    
    ordenes.forEach(o => {
        const id = String(o.id || o._id);
        const estado = o.estado || 'Recibido';
        let badge = estado === 'Recibido' ? 'bg-primary' : (estado === 'Preparación' ? 'bg-warning text-dark' : 'bg-success');
        
        tbody.innerHTML += `
            <tr>
                <td class="fw-bold">#${id.slice(-5)}</td>
                <td><span class="badge ${badge}">${estado}</span></td>
                <td>
                    <button class="btn btn-sm btn-primary me-1" onclick="avanzarEstado('${id}')">Avanzar</button>
                    <button class="btn btn-sm btn-danger" onclick="eliminarPedido('${id}')">×</button>
                </td>
            </tr>`;
    });
}

// --- INCIDENTES ---
async function cargarIncidentes() {
    const ordenes = await fetchOrdenes();
    const lista = document.querySelector(".list-group");
    if(!lista) return;
    lista.innerHTML = "";
    
    ordenes.forEach(o => {
        const id = String(o.id || o._id);
        lista.innerHTML += `
             <div class="list-group-item d-flex justify-content-between align-items-center">
                <div>
                    <strong>#${id.slice(-6)}</strong><br>
                    <small>Estado: <span class="badge bg-info">${o.estado || 'Activo'}</span></small>
                </div>
                <div>
                    <button class="btn btn-sm btn-outline-primary me-2" onclick="verDetalleIncidente('${id}')">Ver detalle</button>
                    <button class="btn btn-sm btn-outline-danger" onclick="eliminarPedido('${id}')">Eliminar</button>
                </div>
            </div>`;
    });
}

// --- FUNCIONES ACCIÓN ---
window.eliminarPedido = function(id) {
    if(confirm("¿Ocultar este pedido?")) {
        let listaNegra = JSON.parse(localStorage.getItem("pedidos_eliminados")) || [];
        listaNegra.push(String(id));
        localStorage.setItem("pedidos_eliminados", JSON.stringify(listaNegra));
        alert("Pedido eliminado.");
        location.reload();
    }
};

window.avanzarEstado = function(id) {
    let locales = JSON.parse(localStorage.getItem("pedidos_db")) || [];
    const idx = locales.findIndex(p => String(p.id) === String(id));
    if(idx !== -1) {
        const act = locales[idx].estado;
        if(act==="Recibido") locales[idx].estado="Preparación";
        else if(act==="Preparación") locales[idx].estado="Reparto";
        else if(act==="Reparto") locales[idx].estado="Entregado";
        localStorage.setItem("pedidos_db", JSON.stringify(locales));
        location.reload(); 
    } else {
        alert("Estado actualizado (Simulación visual).");
    }
};

window.verDetalleIncidente = function(id) {
    const orden = ordenesCargadas.find(o => String(o.id || o._id) === String(id));
    if(orden) {
        pedidoSeleccionadoId = id;
        document.getElementById("modalId").textContent = id;
        document.getElementById("modalCliente").textContent = orden.cliente || "Cliente";
        document.getElementById("modalTotal").textContent = `$${orden.total}`;
        document.getElementById("modalDireccion").textContent = orden.direccion;
        const listaProd = document.getElementById("modalProductos");
        listaProd.innerHTML = "";
        if(orden.items && Array.isArray(orden.items)) {
            orden.items.forEach(i => listaProd.innerHTML += `<li class="list-group-item">${i.nombre} x${i.cantidad}</li>`);
        }
        const modal = new bootstrap.Modal(document.getElementById('detalleModal'));
        modal.show();
    }
};

window.anularPedido = function() {
    if(confirm("¿Anular pedido?")) eliminarPedido(pedidoSeleccionadoId);
};

// --- TIEMPOS & REPARTIDOR ---
window.cargarDatosTiempo = function() {
    const select = document.getElementById("selectorPedidoTiempo");
    const pedido = ordenesCargadas.find(o => String(o.id || o._id) === select.value);
    
    if(pedido) {
        document.getElementById("direccionTiempo").textContent = pedido.direccion;
        const dist = (Math.random() * (5.9 - 2.1) + 2.1).toFixed(1);
        document.getElementById("distanciaTiempo").textContent = `${dist} Km`;

        const demandas = [
            { label: "Baja", class: "bg-success", time: "25-35 min" },
            { label: "Alta", class: "bg-warning text-dark", time: "50-60 min" },
            { label: "Muy alta", class: "bg-danger", time: "+70 min" }
        ];
        const random = demandas[Math.floor(Math.random() * demandas.length)];
        
        const badge = document.getElementById("demandaBadge");
        badge.textContent = random.label;
        badge.className = `badge ${random.class}`;
        badge.setAttribute("data-time", random.time);
        document.getElementById("resultado-tiempo").style.display = 'none';
    }
};

window.calcularTiempo = function() {
    const btn = document.querySelector("button[onclick='calcularTiempo()']");
    const badge = document.getElementById("demandaBadge");
    if(!badge) return;
    
    btn.disabled = true;
    btn.textContent = "Calculando...";
    setTimeout(() => {
        btn.disabled = false;
        btn.textContent = "Calcular tiempo";
        document.getElementById("tiempo-calculado").textContent = badge.getAttribute("data-time");
        document.getElementById("resultado-tiempo").style.display = 'block';
    }, 1000);
};

window.cargarDatosAsignacion = function() {
    const select = document.getElementById("selectorPedidoAsignar");
    const pedido = ordenesCargadas.find(o => String(o.id || o._id) === select.value);
    if(pedido) {
        document.getElementById("estadoPedido").textContent = pedido.estado || "Recibido";
        document.getElementById("direccionPedido").textContent = pedido.direccion || "Retiro";
        const badge = document.getElementById("estadoPedido");
        badge.className = "badge " + (pedido.estado === "Reparto" ? "bg-primary" : "bg-warning text-dark");
    }
};

window.asignarRepartidor = function() {
    const select = document.getElementById("selectorPedidoAsignar");
    if(!select.value) { alert("Selecciona un pedido"); return; }
    
    // Validar radio buttons
    const radios = document.querySelectorAll('input[name="repartidor"]');
    let seleccionado = false;
    radios.forEach(r => { if(r.checked) seleccionado = true; });
    
    if(!seleccionado) { alert("Selecciona un repartidor"); return; }

    document.getElementById("repartidor-asignado").style.display = 'block';
    setTimeout(() => {
        document.getElementById("repartidor-asignado").style.display = 'none';
        alert("Repartidor asignado exitosamente.");
    }, 2000);
};
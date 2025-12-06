// frontend/js/admin.js
// SIN la línea API_URL (ya está en main.js)

document.addEventListener("DOMContentLoaded", () => {
    if(window.location.pathname.includes("panel-cocina")) cargarCocina();
    if(window.location.pathname.includes("reportes")) cargarReportes();
    if(window.location.pathname.includes("incidentes")) cargarIncidentes();
    
    const btnExport = document.getElementById("exportCSV");
    if(btnExport) btnExport.addEventListener("click", exportarCSV);
});

let ordenesCargadas = [];
let pedidoSeleccionadoId = null; // Para saber cuál anular

async function fetchOrdenes() {
    const token = localStorage.getItem("token");
    let ordenesReales = [];
    let ordenesLocales = [];

    try {
        if(token) {
            const res = await fetch(`${API_URL}/api/orders`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if(res.ok) ordenesReales = await res.json();
        }
    } catch(e) { /* Silencioso */ }

    try {
        ordenesLocales = JSON.parse(localStorage.getItem("pedidos_db")) || [];
    } catch(e) { console.error(e); }

    ordenesCargadas = [...ordenesLocales, ...ordenesReales];
    return ordenesCargadas;
}

// --- REPORTES ---
async function cargarReportes() {
    const ordenes = await fetchOrdenes();
    const tbody = document.querySelector("table tbody");
    if(!tbody) return;
    
    tbody.innerHTML = "";
    if(ordenes.length === 0) {
        tbody.innerHTML = `<tr><td colspan="3" class="text-center">No hay ventas registradas</td></tr>`;
        return;
    }

    ordenes.forEach(o => {
        const idMostrar = String(o.id || o._id);
        const estado = o.estado || "Confirmado";
        tbody.innerHTML += `
            <tr>
                <td>${idMostrar}</td>
                <td>$${o.total}</td>
                <td><span class="badge bg-${estado === 'Anulado' ? 'danger' : 'success'}">${estado}</span></td>
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
        const idMostrar = String(o.id || o._id);
        const estado = o.estado || 'Recibido';
        let badgeClass = "secondary";
        if(estado === "Recibido") badgeClass = "primary";
        if(estado === "Preparación") badgeClass = "warning text-dark";
        if(estado === "Listo") badgeClass = "success";

        tbody.innerHTML += `
            <tr>
                <td class="fw-bold"># ${idMostrar}</td>
                <td><span class="badge bg-${badgeClass}">${estado}</span></td>
                <td><button class="btn btn-sm btn-primary" onclick="avanzarEstado('${idMostrar}')">Avanzar Etapa</button></td>
            </tr>`;
    });
}

window.avanzarEstado = function(id) {
    let pedidosLocales = JSON.parse(localStorage.getItem("pedidos_db")) || [];
    const index = pedidosLocales.findIndex(p => String(p.id) === String(id));
    
    if(index !== -1) {
        const actual = pedidosLocales[index].estado;
        if(actual === "Recibido") pedidosLocales[index].estado = "Preparación";
        else if(actual === "Preparación") pedidosLocales[index].estado = "Listo";
        else if(actual === "Listo") pedidosLocales[index].estado = "Entregado";
        
        localStorage.setItem("pedidos_db", JSON.stringify(pedidosLocales));
        cargarCocina(); 
    } else {
        alert("Esta acción requiere backend real conectado.");
    }
};

// --- INCIDENTES (Aquí está la magia del botón "Ver Detalle") ---
async function cargarIncidentes() {
    const ordenes = await fetchOrdenes();
    const lista = document.querySelector(".list-group");
    if(!lista) return;
    lista.innerHTML = "";
    
    ordenes.forEach(o => {
        const idMostrar = String(o.id || o._id);
        const estado = o.estado || 'Activo';
        
        // Convertimos el objeto orden a string para pasarlo (truco rápido)
        // Pero mejor usamos el ID para buscarlo
        lista.innerHTML += `
             <div class="list-group-item d-flex justify-content-between align-items-center">
                <div>
                    <strong>#${idMostrar}</strong><br>
                    <small>Estado: <span class="badge bg-info">${estado}</span></small>
                </div>
                <button class="btn btn-sm btn-outline-primary" onclick="verDetalleIncidente('${idMostrar}')">Ver detalle</button>
            </div>`;
    });
}

// Función que abre el Modal
window.verDetalleIncidente = function(id) {
    const orden = ordenesCargadas.find(o => String(o.id || o._id) === String(id));
    
    if(orden) {
        pedidoSeleccionadoId = id; // Guardamos ID por si queremos anular
        
        // Llenar Modal
        document.getElementById("modalId").textContent = id;
        document.getElementById("modalCliente").textContent = orden.cliente || "Cliente Web";
        document.getElementById("modalTotal").textContent = `$${orden.total}`;
        document.getElementById("modalDireccion").textContent = orden.direccion;
        
        // Listar productos
        const listaProd = document.getElementById("modalProductos");
        listaProd.innerHTML = "";
        if(orden.items) {
            orden.items.forEach(item => {
                listaProd.innerHTML += `<li class="list-group-item px-0 py-1">${item.nombre} x${item.cantidad}</li>`;
            });
        }

        // Mostrar Modal (Usando Bootstrap)
        const modal = new bootstrap.Modal(document.getElementById('detalleModal'));
        modal.show();
    }
};

// Función para anular (Efecto visual)
window.anularPedido = function() {
    if(confirm("¿Seguro que deseas anular este pedido?")) {
        // Buscar y actualizar en local storage
        let pedidosLocales = JSON.parse(localStorage.getItem("pedidos_db")) || [];
        const index = pedidosLocales.findIndex(p => String(p.id) === String(pedidoSeleccionadoId));
        
        if(index !== -1) {
            pedidosLocales[index].estado = "Anulado";
            localStorage.setItem("pedidos_db", JSON.stringify(pedidosLocales));
            
            // Cerrar modal y recargar lista
            const modalEl = document.getElementById('detalleModal');
            const modalInstance = bootstrap.Modal.getInstance(modalEl);
            modalInstance.hide();
            
            cargarIncidentes(); // Recargar la lista de atrás
            alert("Pedido anulado correctamente");
        } else {
            alert("No se puede anular un pedido del backend sin conexión.");
        }
    }
};

// Funciones estáticas de UI
function calcularTiempo() {
    const btn = document.querySelector("button[onclick='calcularTiempo()']");
    if(!btn) return;
    const resultadoDiv = document.getElementById("resultado-tiempo");
    btn.disabled = true;
    btn.textContent = "Calculando...";
    setTimeout(() => {
        btn.disabled = false;
        btn.textContent = "Calcular tiempo";
        document.getElementById("tiempo-calculado").textContent = "30-45 minutos";
        resultadoDiv.style.display = 'block';
    }, 1000);
}

function asignarRepartidor() {
    const radios = document.querySelectorAll('input[name="repartidor"]');
    let seleccionado = false;
    radios.forEach(r => { if(r.checked) seleccionado = true; });
    if(!seleccionado) { alert("Selecciona un repartidor"); return; }
    document.getElementById("repartidor-asignado").style.display = 'block';
    setTimeout(() => {
        document.getElementById("repartidor-asignado").style.display = 'none';
        document.getElementById("entrega-confirmada").style.display = 'block';
    }, 2000);
}

function exportarCSV() {
    if(ordenesCargadas.length === 0) { alert("No hay datos"); return; }
    let csv = "data:text/csv;charset=utf-8,ID,Monto,Estado\n";
    ordenesCargadas.forEach(r => csv += `${r.id},${r.total},${r.estado}\n`);
    const encoded = encodeURI(csv);
    const link = document.createElement("a");
    link.href = encoded;
    link.download = "ventas_pizzeria.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}
// JavaScript para funcionalidades administrativas

// Variables globales para admin
const pedidos = [
  { id: "001", estado: "Recibido", cliente: "Alex Arancibia", monto: 12000 },
  { id: "002", estado: "Preparación", cliente: "María González", monto: 8500 },
  { id: "003", estado: "Al horno", cliente: "Carlos López", monto: 15000 },
]

const repartidores = [
  { id: "carlos", nombre: "Carlos", telefono: "+56984673210", disponible: true },
  { id: "juana", nombre: "Juana", telefono: "+56912345678", disponible: true },
]

// Funciones para panel de cocina
function cambiarEstadoPedido(pedidoId, nuevoEstado) {
  console.log("[v0] Cambiando estado del pedido", pedidoId, "a", nuevoEstado)

  const pedido = pedidos.find((p) => p.id === pedidoId)
  if (pedido) {
    pedido.estado = nuevoEstado
    actualizarPanelCocina()
    showNotification(`Pedido ${pedidoId} actualizado a ${nuevoEstado}`, "success")
  }
}

function actualizarPanelCocina() {
  // Actualizar la tabla del panel de cocina
  const tabla = document.querySelector("#panel-cocina tbody")
  if (tabla) {
    // Aquí se re-renderizaría la tabla con los nuevos estados
    console.log("[v0] Panel de cocina actualizado")
  }
}

// Funciones para asignación de repartidores
function asignarRepartidor() {
  const repartidorSeleccionado = document.querySelector('input[name="repartidor"]:checked')

  if (!repartidorSeleccionado) {
    alert("Por favor selecciona un repartidor")
    return
  }

  const repartidorId = repartidorSeleccionado.value
  const repartidor = repartidores.find((r) => r.id === repartidorId)

  console.log("[v0] Asignando repartidor:", repartidor.nombre)

  // Mostrar estado de asignación
  document.getElementById("repartidor-asignado").style.display = "block"

  // Simular proceso de entrega
  setTimeout(() => {
    document.getElementById("repartidor-asignado").style.display = "none"
    document.getElementById("entrega-confirmada").style.display = "block"
  }, 5000)
}

// Funciones para cálculo de tiempo de entrega
function calcularTiempo() {
  console.log("[v0] Calculando tiempo de entrega...")

  // Obtener datos de entrada
  const direccion = "Evergreen 742"
  const distancia = 3.2
  const demandaActual = "baja" // Simular demanda actual

  // Tabla de tiempos según demanda
  const tiemposPorDemanda = {
    baja: "20-30 minutos",
    alta: "60-70 minutos",
    muy_alta: "+70 minutos",
  }

  const tiempoEstimado = tiemposPorDemanda[demandaActual]

  // Mostrar resultado
  document.getElementById("tiempo-calculado").textContent = tiempoEstimado
  document.getElementById("resultado-tiempo").style.display = "block"

  console.log("[v0] Tiempo calculado:", tiempoEstimado)
}

// Funciones para reportes
function aplicarFiltros() {
  console.log("[v0] Aplicando filtros de reporte...")

  const fechaDesde = document.getElementById("fecha-desde")?.value
  const fechaHasta = document.getElementById("fecha-hasta")?.value
  const metodoPago = document.getElementById("metodo-pago")?.value
  const estado = document.getElementById("estado")?.value

  // Validar rango de fechas
  if (fechaDesde && fechaHasta && new Date(fechaDesde) > new Date(fechaHasta)) {
    mostrarErrorFechas()
    return
  }

  // Aplicar filtros y actualizar tabla
  actualizarTablaReportes()
}

function mostrarErrorFechas() {
  const errorDiv = document.getElementById("error-fechas")
  if (errorDiv) {
    errorDiv.style.display = "block"
  }
}

function actualizarTablaReportes() {
  // Simular actualización de tabla de reportes
  console.log("[v0] Tabla de reportes actualizada")
}

function exportarCSV() {
  console.log("[v0] Exportando reporte a CSV...")

  // Simular exportación
  const csvContent = "data:text/csv;charset=utf-8,N° orden,Ingreso,Estado\n001,12000,Confirmado\n002,40000,Anulado"
  const encodedUri = encodeURI(csvContent)
  const link = document.createElement("a")
  link.setAttribute("href", encodedUri)
  link.setAttribute("download", "reporte_ventas.csv")
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)

  showNotification("Reporte exportado exitosamente", "success")
}

// Funciones para gestión de incidentes
function anularPedido() {
  const motivo = document.getElementById("motivo-anulacion")?.value

  if (!motivo || motivo.trim() === "") {
    alert("Por favor ingresa el motivo de anulación")
    return
  }

  console.log("[v0] Anulando pedido con motivo:", motivo)

  // Simular anulación
  showNotification("Pedido anulado exitosamente", "success")

  // Actualizar estado del pedido
  setTimeout(() => {
    window.location.reload()
  }, 2000)
}

// Función de notificaciones para admin
function showNotification(message, type = "info") {
  const notification = document.createElement("div")
  notification.className = `alert alert-${type} alert-dismissible fade show position-fixed`
  notification.style.cssText = "top: 20px; right: 20px; z-index: 9999; min-width: 300px;"
  notification.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `

  document.body.appendChild(notification)

  setTimeout(() => {
    if (notification.parentNode) {
      notification.remove()
    }
  }, 3000)
}

// Inicializar funcionalidades admin
document.addEventListener("DOMContentLoaded", () => {
  console.log("[v0] Sistema administrativo inicializado")
})

// JavaScript para el proceso de checkout (dirección, pago, seguimiento)

// Variables globales para el proceso de checkout
let deliveryAddress = null
const paymentMethod = null
let orderStatus = "pending"

// Funciones para dirección de entrega
function validarCobertura() {
  const direccion = "Evergreen 742"
  console.log("[v0] Validando cobertura para:", direccion)

  // Simular validación de cobertura
  const random = Math.random()

  setTimeout(() => {
    if (random > 0.3) {
      mostrarCoberturaDisponible()
    } else {
      mostrarErrorCobertura()
    }
  }, 1000)
}

function mostrarCoberturaDisponible() {
  document.getElementById("cobertura-info").style.display = "block"
  document.getElementById("error-cobertura").style.display = "none"
}

function mostrarErrorCobertura() {
  document.getElementById("cobertura-info").style.display = "none"
  document.getElementById("error-cobertura").style.display = "block"
}

function seleccionarDireccion() {
  const direccionSeleccionada = document.querySelector('input[name="direccion"]:checked')
  if (direccionSeleccionada) {
    deliveryAddress = direccionSeleccionada.nextElementSibling.textContent
    window.location.href = "pago.html"
  }
}

// Funciones para pago
function pagarWebpay() {
  console.log("[v0] Iniciando pago con Webpay")

  // Mostrar loading
  const botonPago = event.target
  botonPago.disabled = true
  botonPago.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Procesando...'

  // Simular proceso de pago
  setTimeout(() => {
    const random = Math.random()

    botonPago.disabled = false
    botonPago.innerHTML = "Pagar con Webpay"

    if (random > 0.2) {
      mostrarPagoExitoso()
    } else {
      mostrarPagoRechazado()
    }
  }, 3000)
}

function mostrarPagoExitoso() {
  document.getElementById("pago-exitoso").style.display = "block"
  document.getElementById("pago-rechazado").style.display = "none"
  orderStatus = "confirmed"
}

function mostrarPagoRechazado() {
  document.getElementById("pago-exitoso").style.display = "none"
  document.getElementById("pago-rechazado").style.display = "block"
}

function cancelar() {
  if (confirm("¿Estás seguro de que quieres cancelar el pago?")) {
    window.location.href = "carrito.html"
  }
}

function irSeguimiento() {
  window.location.href = "seguimiento.html"
}

function reintentar() {
  document.getElementById("pago-rechazado").style.display = "none"
}

// Funciones para seguimiento
function inicializarSeguimiento() {
  if (window.location.pathname.includes("seguimiento.html")) {
    actualizarEstadoPedido()
    // Actualizar cada 30 segundos
    setInterval(actualizarEstadoPedido, 30000)
  }
}

function actualizarEstadoPedido() {
  console.log("[v0] Actualizando estado del pedido...")

  // Simular cambios de estado
  const estados = ["Recibido", "En preparación", "Listo para reparto", "En camino", "Entregado"]
  const estadoActual = Math.floor(Math.random() * estados.length)

  // Aquí se actualizaría la UI con el nuevo estado
}

// Inicializar cuando el DOM esté listo
document.addEventListener("DOMContentLoaded", () => {
  inicializarSeguimiento()
})

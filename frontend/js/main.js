// JavaScript principal para la aplicación de pizzería

// Variables globales
let cart = JSON.parse(localStorage.getItem("cart")) || []

// Inicialización cuando el DOM está listo
document.addEventListener("DOMContentLoaded", () => {
  updateCartCount()
  initializeNavigation()
})

// Actualizar contador del carrito
function updateCartCount() {
  const cartCountElement = document.getElementById("cart-count")
  if (cartCountElement) {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0)
    cartCountElement.textContent = totalItems

    // Animar el contador si hay cambios
    if (totalItems > 0) {
      cartCountElement.classList.add("animate__animated", "animate__pulse")
      setTimeout(() => {
        cartCountElement.classList.remove("animate__animated", "animate__pulse")
      }, 1000)
    }
  }
}

// Inicializar navegación
function initializeNavigation() {
  // Marcar página activa en navbar
  const currentPage = window.location.pathname.split("/").pop() || "index.html"
  const navLinks = document.querySelectorAll(".navbar-nav .nav-link")

  navLinks.forEach((link) => {
    const href = link.getAttribute("href")
    if (href === currentPage || (currentPage === "" && href === "index.html")) {
      link.classList.add("active")
    } else {
      link.classList.remove("active")
    }
  })
}

// Funciones para el carrito
function addToCart(product) {
  const existingItem = cart.find((item) => item.id === product.id)

  if (existingItem) {
    existingItem.quantity += 1
  } else {
    cart.push({
      ...product,
      quantity: 1,
      addedAt: new Date().toISOString(),
    })
  }

  saveCart()
  updateCartCount()
  showNotification("Producto agregado al carrito", "success")
}

function removeFromCart(productId) {
  cart = cart.filter((item) => item.id !== productId)
  saveCart()
  updateCartCount()
  showNotification("Producto eliminado del carrito", "info")
}

function updateCartQuantity(productId, quantity) {
  const item = cart.find((item) => item.id === productId)
  if (item) {
    if (quantity <= 0) {
      removeFromCart(productId)
    } else {
      item.quantity = quantity
      saveCart()
      updateCartCount()
    }
  }
}

function clearCart() {
  cart = []
  saveCart()
  updateCartCount()
  showNotification("Carrito vaciado", "info")
}

function saveCart() {
  localStorage.setItem("cart", JSON.stringify(cart))
}

function getCartTotal() {
  return cart.reduce((total, item) => total + item.price * item.quantity, 0)
}

// Sistema de notificaciones
function showNotification(message, type = "info") {
  // Crear elemento de notificación
  const notification = document.createElement("div")
  notification.className = `alert alert-${type} alert-dismissible fade show position-fixed`
  notification.style.cssText = "top: 20px; right: 20px; z-index: 9999; min-width: 300px;"
  notification.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `

  document.body.appendChild(notification)

  // Auto-remover después de 3 segundos
  setTimeout(() => {
    if (notification.parentNode) {
      notification.remove()
    }
  }, 3000)
}

// Validación de formularios
function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

function validatePassword(password) {
  return password.length >= 6
}

function showFieldError(fieldId, message) {
  const field = document.getElementById(fieldId)
  const errorDiv = field.nextElementSibling

  field.classList.add("is-invalid")
  if (errorDiv && errorDiv.classList.contains("invalid-feedback")) {
    errorDiv.textContent = message
  }
}

function clearFieldError(fieldId) {
  const field = document.getElementById(fieldId)
  const errorDiv = field.nextElementSibling

  field.classList.remove("is-invalid")
  if (errorDiv && errorDiv.classList.contains("invalid-feedback")) {
    errorDiv.textContent = ""
  }
}

// Utilidades generales
function formatPrice(price) {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
  }).format(price)
}

function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString("es-CL")
}

function debounce(func, wait) {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

// Manejo de estados de carga
function showLoading(element) {
  element.classList.add("loading")
  element.disabled = true
}

function hideLoading(element) {
  element.classList.remove("loading")
  element.disabled = false
}

// Exportar funciones para uso global
window.pizzeriaApp = {
  addToCart,
  removeFromCart,
  updateCartQuantity,
  clearCart,
  getCartTotal,
  showNotification,
  validateEmail,
  validatePassword,
  formatPrice,
  formatDate,
}

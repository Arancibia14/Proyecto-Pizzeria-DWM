// JavaScript específico para la página del carrito

document.addEventListener("DOMContentLoaded", () => {
  loadCartItems()
  updateCartDisplay()
})

function loadCartItems() {
  // Simular items del carrito (en una app real vendría del localStorage o API)
  const cartItems = [
    {
      id: 1,
      name: "Pizza Margarita (L)",
      description: "Masa piedra, queso extra",
      price: 8000,
    },
    {
      id: 2,
      name: "Coca-cola 3L",
      description: "Bebida",
      price: 3000,
    },
  ]

  // Aquí se renderizarían los items dinámicamente
  console.log("[v0] Items del carrito cargados:", cartItems)
}

function removeItem(itemId) {
  const itemElement = event.target.closest(".d-flex")
  if (itemElement) {
    itemElement.remove()
    updateTotal()
    showNotification("Producto eliminado del carrito", "info")
  }
}

function updateTotal() {
  const items = document.querySelectorAll(".cart-items .d-flex")
  if (items.length === 0) {
    showEmptyCart()
  }
}

function showEmptyCart() {
  document.querySelector(".cart-items").style.display = "none"
  document.getElementById("emptyCartState").classList.remove("d-none")
}

function showNotification(message, type) {
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

function updateCartDisplay() {
  // Actualizar contador del carrito en navbar si existe
  const cartCount = document.getElementById("cart-count")
  if (cartCount) {
    cartCount.textContent = "2" // Simular 2 items
  }
}

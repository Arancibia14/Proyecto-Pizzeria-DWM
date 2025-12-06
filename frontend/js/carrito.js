document.addEventListener("DOMContentLoaded", () => {
    renderizarCarrito();
});

function renderizarCarrito() {
    const carrito = JSON.parse(localStorage.getItem("carrito")) || [];
    const container = document.querySelector(".cart-items");
    const totalEl = document.getElementById("cartTotal");
    const emptyState = document.getElementById("emptyCartState");
    const btnContinuar = document.querySelector("button[onclick*='direccion']");
    
    container.innerHTML = "";
    let total = 0;

    if (carrito.length === 0) {
        if(emptyState) emptyState.classList.remove("d-none");
        if(btnContinuar) btnContinuar.style.display = "none";
        if(totalEl) totalEl.textContent = "$0";
        return;
    }

    if(emptyState) emptyState.classList.add("d-none");
    if(btnContinuar) btnContinuar.style.display = "block";

    carrito.forEach((item, index) => {
        total += item.precio;
        container.innerHTML += `
            <div class="d-flex justify-content-between align-items-center border-bottom pb-3 mb-3">
                <div>
                    <h5 class="mb-1">${item.nombre}</h5>
                    <small class="text-muted">${item.descripcion || ''}</small>
                </div>
                <div class="text-end">
                    <span class="fw-bold">$${item.precio}</span>
                    <button class="btn btn-sm btn-outline-danger ms-2" onclick="eliminarDelCarrito(${index})">×</button>
                </div>
            </div>`;
    });

    if(totalEl) totalEl.textContent = `$${total}`;
}

function eliminarDelCarrito(index) {
    let carrito = JSON.parse(localStorage.getItem("carrito")) || [];
    carrito.splice(index, 1);
    localStorage.setItem("carrito", JSON.stringify(carrito));
    renderizarCarrito();
    actualizarContadorCarrito();
}
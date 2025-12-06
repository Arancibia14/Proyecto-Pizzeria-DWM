// frontend/js/producto.js
// SIN la línea API_URL

document.addEventListener("DOMContentLoaded", () => {
    cargarDetalle();
});

let pizzaActual = null;

function obtenerNombreImagen(nombre) {
    return nombre.toLowerCase()
        .replace("pizza", "")
        .replace(/\s+/g, '')
        .replace(/[^a-z0-9]/g, '');
}

async function cargarDetalle() {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');

    if (!id) return;

    try {
        const response = await fetch(`${API_URL}/api/products/${id}`);
        if(!response.ok) throw new Error("Producto no encontrado");
        
        pizzaActual = await response.json();
        
        // Textos
        document.getElementById("productName").textContent = pizzaActual.nombre;
        document.getElementById("productDescription").textContent = pizzaActual.descripcion;
        document.getElementById("productPrice").textContent = `Valor: $${pizzaActual.precio}`;
        
        // Imagen (.webp)
        const nombreImg = obtenerNombreImagen(pizzaActual.nombre);
        const imgContainer = document.querySelector(".product-image-placeholder");
        
        if(imgContainer) {
             imgContainer.innerHTML = `
                <img src="../imagenes/${nombreImg}.webp" class="img-fluid rounded shadow" 
                style="width: 100%; max-height: 400px; object-fit: cover;" 
                onerror="this.src='../imagenes/pizzapiedra2.jpg'">
             `;
        }

        // Botones
        const btnAgregar = document.getElementById("addToCartBtn");
        if(btnAgregar) {
            btnAgregar.onclick = () => agregarAlCarrito(pizzaActual);
        }
        
        const btnPersonalizar = document.querySelector("a[href*='personalizar-pizza.html']");
        if(btnPersonalizar) {
            btnPersonalizar.href = `personalizar-pizza.html?id=${id}`;
        }

    } catch (error) {
        console.error(error);
        document.querySelector(".card-body").innerHTML = `<div class="alert alert-warning">No se pudo cargar el producto.</div>`;
    }
}

function agregarAlCarrito(producto) {
    let carrito = JSON.parse(localStorage.getItem("carrito")) || [];
    carrito.push({
        id: producto.id || producto._id,
        nombre: producto.nombre,
        precio: producto.precio,
        descripcion: producto.descripcion,
        cantidad: 1
    });
    localStorage.setItem("carrito", JSON.stringify(carrito));
    
    if (typeof actualizarContadorCarrito === "function") {
        actualizarContadorCarrito();
    }
    alert("¡Producto agregado!");
}
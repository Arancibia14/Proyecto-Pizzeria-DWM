let precioBasePizza = 0; // Aquí guardaremos el valor de la pizza
let pizzaInfo = null;

document.addEventListener("DOMContentLoaded", () => {
    inicializar();
});

async function inicializar() {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    
    // Elementos del DOM
    const titulo = document.querySelector("h1");
    const basePriceEl = document.getElementById("basePrice");

    if (id) {
        try {
            // Intentar obtener la pizza real
            const res = await fetch(`${API_URL}/api/products/${id}`);
            if(res.ok) {
                pizzaInfo = await res.json();
                precioBasePizza = pizzaInfo.precio;
                titulo.textContent = `Personalizar: ${pizzaInfo.nombre}`;
            } else {
                console.warn("No se encontró la pizza, usando valores por defecto.");
                precioBasePizza = 8000; // Fallback si no encuentra ID
                titulo.textContent = "Personalizar Pizza";
            }
        } catch(e) { 
            console.error(e);
            precioBasePizza = 8000; // Fallback si falla conexión
            titulo.textContent = "Personalizar Pizza (Modo Local)";
        }
    } else {
        // Si entra directo sin seleccionar pizza
        precioBasePizza = 8000;
        titulo.textContent = "Personalizar Pizza";
    }

    // Actualizar el visual del precio base
    if(basePriceEl) {
        basePriceEl.textContent = `$${precioBasePizza}`;
    }

    // Configurar Listeners
    const inputs = document.querySelectorAll('#customPizzaForm input');
    inputs.forEach(input => {
        input.addEventListener('change', calcularTotal);
    });

    const form = document.getElementById("customPizzaForm");
    if(form) {
        form.addEventListener("submit", (e) => {
            e.preventDefault();
            agregarPersonalizada();
        });
    }

    // Calcular totales iniciales
    calcularTotal();
}

function calcularTotal() {
    let total = precioBasePizza; 
    let extrasTotal = 0;

    // 1. Sumar Tamaño
    const size = document.querySelector('input[name="size"]:checked');
    if (size) {
        const precioSize = parseInt(size.getAttribute('data-price') || 0);
        total += precioSize;
    }

    // 2. Sumar Extras
    const extras = document.querySelectorAll('input[type="checkbox"]:checked');
    extras.forEach(ex => {
        const precioEx = parseInt(ex.getAttribute('data-price') || 0);
        extrasTotal += precioEx;
        total += precioEx;
    });

    // 3. Actualizar HTML
    document.getElementById("extrasPrice").textContent = `+ $${extrasTotal}`;
    document.getElementById("totalPrice").textContent = `$${total}`;
}

function agregarPersonalizada() {
    // Recopilar datos para el carrito
    const sizeInput = document.querySelector('input[name="size"]:checked');
    const size = sizeInput ? sizeInput.nextElementSibling.textContent : "M"; 
    
    const doughInput = document.querySelector('input[name="dough"]:checked');
    const dough = doughInput ? doughInput.nextElementSibling.textContent : "Tradicional";

    // Precio Final calculado
    const precioTexto = document.getElementById("totalPrice").textContent;
    const precioFinal = parseInt(precioTexto.replace(/[^0-9]/g, ''));
    
    // Nombres de los extras
    const extrasNombres = [];
    document.querySelectorAll('input[type="checkbox"]:checked').forEach(e => {
        extrasNombres.push(e.nextElementSibling.textContent);
    });

    // Nombre del producto
    const nombrePizza = pizzaInfo ? `${pizzaInfo.nombre} (${size})` : `Pizza Personalizada (${size})`;

    const producto = {
        id: Date.now(), // ID único temporal
        nombre: nombrePizza,
        precio: precioFinal,
        descripcion: `Masa: ${dough}. Extras: ${extrasNombres.join(", ") || "Ninguno"}`,
        cantidad: 1
    };

    // Guardar en LocalStorage
    let carrito = JSON.parse(localStorage.getItem("carrito")) || [];
    carrito.push(producto);
    localStorage.setItem("carrito", JSON.stringify(carrito));
    
    // UI Éxito
    document.getElementById("normalState").classList.add("d-none");
    document.getElementById("cartUpdatedState").classList.remove("d-none");
    
    // Actualizar navbar
    if(typeof actualizarContadorCarrito === 'function') actualizarContadorCarrito();
}
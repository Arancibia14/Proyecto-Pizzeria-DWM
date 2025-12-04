document.addEventListener("DOMContentLoaded", () => {
    cargarCatalogo();
});

async function cargarCatalogo() {
    const contenedor = document.getElementById("pizzaGrid");
    
    // Mostramos un mensaje mientras carga
    contenedor.innerHTML = '<div class="text-center w-100 mt-5">Cargando nuestro menú... 🍕</div>';

    try {
        // --- AQUÍ CONECTAMOS CON TU PYTHON ---
        // Pide la lista de pizzas al backend
        const response = await fetch('http://127.0.0.1:8000/api/products');
        
        if (!response.ok) {
            throw new Error("No se pudo conectar con el servidor");
        }

        const pizzas = await response.json();

        // Limpiamos el mensaje de carga
        contenedor.innerHTML = '';

        // Si no hay pizzas, mostramos aviso
        if (pizzas.length === 0) {
            contenedor.innerHTML = '<div class="alert alert-info">No hay pizzas disponibles por ahora.</div>';
            return;
        }

        // --- DIBUJAR LAS PIZZAS ---
        pizzas.forEach(pizza => {
            if (pizza.disponible) {
                // Creamos la tarjeta HTML con los datos reales de Python
                const htmlPizza = `
                <div class="col-md-4 fade-in-animation">
                    <div class="card h-100 pizza-card shadow-sm border-0">
                        <img src="../imagenes/${normalizarNombreImg(pizza.nombre)}" class="card-img-top" alt="${pizza.nombre}" 
                             style="height: 200px; object-fit: cover;"
                             onerror="this.src='../imagenes/pizzapiedra2.jpg'"> 
                        
                        <div class="card-body d-flex flex-column">
                            <div class="d-flex justify-content-between align-items-start mb-2">
                                <h5 class="card-title fw-bold mb-0">${pizza.nombre}</h5>
                                <span class="badge bg-warning text-dark">${pizza.categoria}</span>
                            </div>
                            
                            <p class="card-text text-muted small flex-grow-1">${pizza.descripcion}</p>
                            
                            <div class="d-flex justify-content-between align-items-center mt-3 pt-3 border-top">
                                <span class="text-primary fs-4 fw-bold">$${pizza.precio}</span>
                                <button class="btn btn-primary" onclick="verDetalle(${pizza.id})">
                                    Ver Detalle
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
                `;
                contenedor.innerHTML += htmlPizza;
            }
        });

    } catch (error) {
        console.error("Error:", error);
        contenedor.innerHTML = `
            <div class="alert alert-danger w-100 text-center">
                <strong>Error de conexión:</strong> No se pudo cargar el menú. <br>
                <small>Asegúrate de que el backend (uvicorn) esté encendido.</small>
            </div>`;
    }
}

// Ayuda a encontrar la imagen correcta (ej: "Chicken BBQ" -> "chickenbbq.webp")
function normalizarNombreImg(nombre) {
    return nombre.toLowerCase().replace(/\s+/g, '') + '.webp';
}

function verDetalle(id) {
    window.location.href = `detalle-producto.html?id=${id}`;
}
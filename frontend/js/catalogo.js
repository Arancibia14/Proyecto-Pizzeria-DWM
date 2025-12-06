// frontend/js/catalogo.js
// SIN la línea API_URL (ya está en main.js)

let todasLasPizzas = [];
let categoriaActual = 'todas';

document.addEventListener("DOMContentLoaded", () => {
    cargarCatalogo();
    configurarBuscador();
});

async function cargarCatalogo() {
    const grid = document.getElementById("pizzaGrid");
    grid.innerHTML = '<div class="text-center w-100 mt-5"><div class="spinner-border text-primary"></div><p>Cargando menú...</p></div>';

    try {
        const response = await fetch(`${API_URL}/api/products`);
        if (!response.ok) throw new Error("Error fetching products");
        
        todasLasPizzas = await response.json();
        renderizarPizzas(todasLasPizzas);

    } catch (error) {
        console.error(error);
        grid.innerHTML = `<div class="alert alert-danger w-100">No se pudo conectar al servidor.</div>`;
    }
}

// NUEVA FUNCIÓN: Filtrar por botón de categoría
function filtrarCategoria(categoria) {
    categoriaActual = categoria;
    
    // Actualizar estilo visual de los botones (Pintar el activo)
    const botones = document.querySelectorAll('#filtrosCategoria .btn');
    botones.forEach(btn => {
        // Quitamos clases activas a todos
        btn.classList.remove('btn-primary', 'active');
        btn.classList.add('btn-outline-primary');
        
        // Si es el botón que tocamos, lo activamos
        if(btn.textContent.includes(categoria) || (categoria === 'todas' && btn.textContent === 'Todas')) {
            btn.classList.remove('btn-outline-primary');
            btn.classList.add('btn-primary', 'active');
        }
    });

    aplicarFiltrosCombinados();
}

function configurarBuscador() {
    const input = document.getElementById("searchInput");
    const btn = document.getElementById("searchBtn");
    const btnClear = document.getElementById("clearBtn");
    
    if(btn) btn.addEventListener("click", aplicarFiltrosCombinados);
    if(input) input.addEventListener("keyup", () => aplicarFiltrosCombinados());
    
    if(btnClear) btnClear.addEventListener("click", () => {
        if(input) input.value = "";
        filtrarCategoria('todas'); // Resetea todo
    });
}

// FUNCIÓN MAESTRA: Combina el buscador de texto Y la categoría seleccionada
function aplicarFiltrosCombinados() {
    const input = document.getElementById("searchInput");
    const termino = input.value.toLowerCase();
    
    const filtradas = todasLasPizzas.filter(pizza => {
        // 1. ¿Coincide el nombre?
        const coincideTexto = pizza.nombre.toLowerCase().includes(termino);
        
        // 2. ¿Coincide la categoría? (Si es 'todas', pasa siempre)
        // Nota: Aseguramos que pizza.categoria exista para no dar error
        const catPizza = pizza.categoria || ""; 
        const coincideCategoria = categoriaActual === 'todas' || catPizza.includes(categoriaActual);
        
        return coincideTexto && coincideCategoria;
    });

    renderizarPizzas(filtradas);
}

function obtenerNombreImagen(nombre) {
    return nombre.toLowerCase().replace("pizza", "").replace(/\s+/g, '').replace(/[^a-z0-9]/g, '');
}

function renderizarPizzas(lista) {
    const grid = document.getElementById("pizzaGrid");
    grid.innerHTML = "";

    if (lista.length === 0) {
        grid.innerHTML = '<div class="alert alert-info w-100 text-center">No se encontraron pizzas con esos filtros.</div>';
        return;
    }

    lista.forEach(pizza => {
        const id = pizza.id || pizza._id;
        const nombreImg = obtenerNombreImagen(pizza.nombre);
        // Usamos .webp como pediste
        const rutaImagen = `../imagenes/${nombreImg}.webp`; 
        
        const card = `
        <div class="col-md-4 mb-4 fade-in">
            <div class="card h-100 shadow-sm border-0">
                <div style="height: 200px; overflow: hidden;" class="bg-light d-flex align-items-center justify-content-center">
                    <img src="${rutaImagen}" class="card-img-top" 
                         style="height: 100%; object-fit: cover;"
                         alt="${pizza.nombre}"
                         onerror="this.src='../imagenes/pizzapiedra2.jpg'">
                </div>
                
                <div class="card-body d-flex flex-column">
                    <div class="d-flex justify-content-between align-items-start mb-2">
                         <h5 class="card-title fw-bold">${pizza.nombre}</h5>
                         <span class="badge bg-warning text-dark">${pizza.categoria || 'Clásica'}</span>
                    </div>
                    <p class="card-text text-muted small flex-grow-1">${pizza.descripcion}</p>
                    <div class="d-flex justify-content-between align-items-center mt-3 pt-3 border-top">
                        <span class="text-primary fs-4 fw-bold">$${pizza.precio}</span>
                        <button class="btn btn-primary" onclick="irADetalle('${id}')">
                            Ver Detalle
                        </button>
                    </div>
                </div>
            </div>
        </div>`;
        grid.innerHTML += card;
    });
}

function irADetalle(id) {
    window.location.href = `detalle-producto.html?id=${id}`;
}
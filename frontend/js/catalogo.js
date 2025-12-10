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

// Función de filtrado por botones
function filtrarCategoria(categoria) {
    categoriaActual = categoria;
    
    // Estilos visuales botones
    const botones = document.querySelectorAll('#filtrosCategoria .btn');
    botones.forEach(btn => {
        btn.classList.remove('btn-primary', 'active');
        btn.classList.add('btn-outline-primary');
        
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
        filtrarCategoria('todas');
    });
}

function aplicarFiltrosCombinados() {
    const input = document.getElementById("searchInput");
    const termino = input.value.toLowerCase();
    
    const filtradas = todasLasPizzas.filter(pizza => {
        const coincideTexto = pizza.nombre.toLowerCase().includes(termino);
        const catPizza = pizza.categoria || ""; 
        const coincideCategoria = categoriaActual === 'todas' || catPizza.includes(categoriaActual);
        return coincideTexto && coincideCategoria;
    });

    renderizarPizzas(filtradas);
}

// Función para obtener la imagen correcta
function obtenerRutaImagen(pizza) {
    // 1. Si la base de datos tiene el nombre exacto del archivo usarlo
    if (pizza.imagen && pizza.imagen.trim() !== "") {
        return `../imagenes/${pizza.imagen}`;
    }
    
    // 2. Si no tiene campo imagen, intentamos generarlo (Plan B)
    const nombreGenerado = pizza.nombre.toLowerCase().replace("pizza", "").replace(/\s+/g, '').replace(/[^a-z0-9]/g, '');
    return `../imagenes/${nombreGenerado}.webp`;
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
        
        // USAMOS LA NUEVA LÓGICA DE IMAGEN
        const rutaImagen = obtenerRutaImagen(pizza);
        
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
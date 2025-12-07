from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import pizza_collection 
from routes import router as products_router 
from orders import router as orders_router # <--- IMPORTAMOS EL NUEVO ARCHIVO

app = FastAPI()

# --- CONFIGURACIÓN CORS ---
origins = ["*"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- CONECTAR LOS ROUTERS ---
app.include_router(products_router) # Tus rutas de productos/auth
app.include_router(orders_router)   # <--- ACTIVAMOS LA RUTA DE PEDIDOS

@app.get("/")
def home():
    return {"mensaje": "API Pizzería La Fornacce - Backend Funcionando 🍕"}

# --- EVENTO DE INICIO (Base de Datos) ---
@app.on_event("startup")
async def startup_db_client():
    # Verificamos si hay pizzas, si no, creamos las base
    count = await pizza_collection.count_documents({})
    if count == 0:
        pizzas_iniciales = [
            {"_id": 1, "nombre": "Margarita", "categoria": "Clásica", "precio": 8000, "descripcion": "Masa piedra, queso", "disponible": True},
            {"_id": 2, "nombre": "Pepperoni", "categoria": "Clásica", "precio": 8000, "descripcion": "Doble pepperoni", "disponible": True},
            {"_id": 3, "nombre": "Chicken BBQ", "categoria": "Gourmet", "precio": 9000, "descripcion": "Pollo y salsa BBQ", "disponible": True}
        ]
        await pizza_collection.insert_many(pizzas_iniciales)
        print("☁️ Pizzas iniciales creadas.")
    
    print("✅ Conexión a MongoDB Atlas exitosa.")
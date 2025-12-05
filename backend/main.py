from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import pizza_collection # Solo importamos lo necesario para el startup
from routes import router # <--- Importamos tus nuevas rutas

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

# --- CONECTAR EL ROUTER ---
# Aquí le decimos al servidor: "Usa las rutas que definimos en el otro archivo"
app.include_router(router)

@app.get("/")
def home():
    return {"mensaje": "API Pizzería La Fornacce - Backend Estructurado 🏗️"}

# --- EVENTO DE INICIO (Base de Datos) ---
@app.on_event("startup")
async def startup_db_client():
    count = await pizza_collection.count_documents({})
    if count == 0:
        pizzas_iniciales = [
            {"_id": 1, "nombre": "Margarita", "categoria": "Clásica", "precio": 8000, "descripcion": "Masa piedra, queso", "disponible": True},
            {"_id": 2, "nombre": "Pepperoni", "categoria": "Clásica", "precio": 8000, "descripcion": "Doble pepperoni", "disponible": True},
            {"_id": 3, "nombre": "Chicken BBQ", "categoria": "Gourmet", "precio": 9000, "descripcion": "Pollo y salsa BBQ", "disponible": True}
        ]
        await pizza_collection.insert_many(pizzas_iniciales)
        print("☁️ Conexión a Atlas exitosa. Datos iniciales verificados.")
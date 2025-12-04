from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from typing import List
from models import *
from database import * # Importamos la conexión a Mongo
import datetime

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

# --- EVENTO DE INICIO: CARGAR PIZZAS SI ESTÁ VACÍO ---
@app.on_event("startup")
async def startup_db_client():
    # Contamos cuántas pizzas hay
    count = await pizza_collection.count_documents({})
    if count == 0:
        # Si no hay, insertamos las iniciales
        pizzas_iniciales = [
            {"_id": 1, "nombre": "Margarita", "categoria": "Clásica", "precio": 8000, "descripcion": "Masa piedra, queso", "disponible": True},
            {"_id": 2, "nombre": "Pepperoni", "categoria": "Clásica", "precio": 8000, "descripcion": "Doble pepperoni", "disponible": True},
            {"_id": 3, "nombre": "Chicken BBQ", "categoria": "Gourmet", "precio": 9000, "descripcion": "Pollo y salsa BBQ", "disponible": True}
        ]
        await pizza_collection.insert_many(pizzas_iniciales)
        print("🍕 Base de datos inicializada con 3 pizzas")

# --- RUTAS DE LA API (Endpoints) ---

@app.get("/")
def home():
    return {"mensaje": "API Pizzería La Fornacce con MongoDB 🍃"}

# 1. Auth: Registro Real
@app.post("/api/auth/register", status_code=201)
async def register(user: UsuarioRegister):
    existente = await usuario_collection.find_one({"email": user.email})
    if existente:
        raise HTTPException(status_code=400, detail="El email ya está registrado")
    
    nuevo_usuario = {"email": user.email, "password": user.password, "rol": Rol.CLIENTE}
    await usuario_collection.insert_one(nuevo_usuario)
    return {"mensaje": "Usuario creado correctamente", "email": user.email}

# 2. Auth: Login Real
@app.post("/api/auth/login")
async def login(user: UsuarioLogin):
    usuario_db = await usuario_collection.find_one({"email": user.email, "password": user.password})
    if usuario_db:
        return {"mensaje": "Login exitoso", "token": "fake-jwt-token-mongo", "rol": usuario_db["rol"]}
    raise HTTPException(status_code=401, detail="Credenciales inválidas")

# 3. Catálogo: Leer de Mongo
@app.get("/api/products", response_model=List[Pizza])
async def get_catalogo():
    pizzas = []
    async for pizza in pizza_collection.find():
        pizzas.append(pizza_helper(pizza))
    return pizzas

@app.get("/api/products/{pizza_id}", response_model=Pizza)
async def get_producto_detalle(pizza_id: int):
    pizza = await pizza_collection.find_one({"_id": pizza_id})
    if pizza:
        return pizza_helper(pizza)
    raise HTTPException(status_code=404, detail="Pizza no encontrada")

# 4. Pedidos: Guardar en Mongo
@app.post("/api/orders/create", status_code=201)
async def crear_pedido(pedido: PedidoCreate):
    count = await pedido_collection.count_documents({})
    nuevo_id = count + 1
    
    nuevo_pedido = {
        "_id": nuevo_id,
        "cliente_email": "usuario_web@example.com", 
        "estado": EstadoPedido.RECIBIDO,
        "total": pedido.total,
        "fecha": str(datetime.date.today()),
        "items": [item.dict() for item in pedido.items]
    }
    
    await pedido_collection.insert_one(nuevo_pedido)
    return {"mensaje": "Pedido creado en MongoDB", "order_id": nuevo_id}

# 5. Admin: Listar Pedidos
@app.get("/api/admin/orders")
async def get_all_orders():
    pedidos = []
    async for pedido in pedido_collection.find():
        pedido["id"] = pedido["_id"]
        pedidos.append(pedido)
    return pedidos
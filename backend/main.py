from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from typing import List
from models import * # Importamos los modelos que creamos arriba
import datetime

app = FastAPI()

# --- CONFIGURACIÓN CORS ---
# Esto permite que tu Frontend (puerto 5500 o 3000) hable con Python (puerto 8000)
origins = ["*"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- BASE DE DATOS SIMULADA (Listas en memoria) ---
usuarios_db = []
pedidos_db = [
    {"id": 1, "cliente_email": "alex@example.com", "estado": EstadoPedido.RECIBIDO, "total": 12000, "fecha": "2025-11-20"}
]
pizzas_db = [
    {"id": 1, "nombre": "Margarita", "categoria": CategoriaPizza.CLASICA, "precio": 8000, "descripcion": "Masa piedra, queso", "disponible": True},
    {"id": 2, "nombre": "Pepperoni", "categoria": CategoriaPizza.CLASICA, "precio": 8000, "descripcion": "Doble pepperoni", "disponible": True},
    {"id": 3, "nombre": "Chicken BBQ", "categoria": CategoriaPizza.GOURMET, "precio": 9000, "descripcion": "Pollo y salsa BBQ", "disponible": True}
]

# --- RUTAS DE LA API (Endpoints) ---

@app.get("/")
def home():
    return {"mensaje": "API Pizzería La Fornacce funcionando correctamente"}

# 1. Auth (B-01, B-02)
@app.post("/api/auth/register", status_code=201)
def register(user: UsuarioRegister):
    for u in usuarios_db:
        if u["email"] == user.email:
            raise HTTPException(status_code=400, detail="El email ya está registrado")
    
    nuevo_usuario = {"email": user.email, "password": user.password, "rol": Rol.CLIENTE}
    usuarios_db.append(nuevo_usuario)
    return {"mensaje": "Usuario creado correctamente", "email": user.email}

@app.post("/api/auth/login")
def login(user: UsuarioLogin):
    for u in usuarios_db:
        if u["email"] == user.email and u["password"] == user.password:
            return {"mensaje": "Login exitoso", "token": "fake-jwt-token-123", "rol": u["rol"]}
    raise HTTPException(status_code=401, detail="Credenciales inválidas")

# 2. Catálogo (B-10, B-12)
@app.get("/api/products", response_model=List[Pizza])
def get_catalogo():
    return pizzas_db

@app.get("/api/products/{pizza_id}", response_model=Pizza)
def get_producto_detalle(pizza_id: int):
    for p in pizzas_db:
        if p["id"] == pizza_id:
            return p
    raise HTTPException(status_code=404, detail="Pizza no encontrada")

# 3. Pedidos y Checkout (B-32, B-40)
@app.post("/api/orders/create", status_code=201)
def crear_pedido(pedido: PedidoCreate):
    nuevo_id = len(pedidos_db) + 1
    nuevo_pedido = {
        "id": nuevo_id,
        "cliente_email": "usuario_web@example.com", # En real se saca del token
        "estado": EstadoPedido.RECIBIDO,
        "total": pedido.total,
        "fecha": str(datetime.date.today())
    }
    pedidos_db.append(nuevo_pedido)
    return {"mensaje": "Pedido creado", "order_id": nuevo_id}

@app.get("/api/orders/{order_id}/tracking")
def track_order(order_id: int):
    for p in pedidos_db:
        if p["id"] == order_id:
            return p
    raise HTTPException(status_code=404, detail="Pedido no encontrado")

# 4. Admin (B-20, B-21)
@app.get("/api/admin/orders")
def get_all_orders():
    return pedidos_db

@app.put("/api/admin/orders/{order_id}/status")
def update_status(order_id: int, nuevo_estado: EstadoPedido):
    for p in pedidos_db:
        if p["id"] == order_id:
            p["estado"] = nuevo_estado
            return {"mensaje": "Estado actualizado", "pedido": p}
    raise HTTPException(status_code=404, detail="Pedido no encontrado")
from fastapi import APIRouter, HTTPException, status
from typing import List
from models import *
from database import *
import datetime

# Creamos el "router" para las rutas
router = APIRouter()

# 1. Auth
@router.post("/api/auth/register", status_code=201)
async def register(user: UsuarioRegister):
    existente = await usuario_collection.find_one({"email": user.email})
    if existente:
        raise HTTPException(status_code=400, detail="El email ya está registrado")
    
    nuevo_usuario = {"email": user.email, "password": user.password, "rol": Rol.CLIENTE}
    await usuario_collection.insert_one(nuevo_usuario)
    return {"mensaje": "Usuario creado en Atlas ☁️", "email": user.email}

@router.post("/api/auth/login")
async def login(user: UsuarioLogin):
    usuario_db = await usuario_collection.find_one({"email": user.email, "password": user.password})
    if usuario_db:
        return {"mensaje": "Login exitoso", "token": "fake-jwt-token-atlas", "rol": usuario_db["rol"]}
    raise HTTPException(status_code=401, detail="Credenciales inválidas")

# 2. Catálogo
@router.get("/api/products", response_model=List[Pizza])
async def get_catalogo():
    pizzas = []
    async for pizza in pizza_collection.find():
        pizzas.append(pizza_helper(pizza))
    return pizzas

@router.get("/api/products/{pizza_id}", response_model=Pizza)
async def get_producto_detalle(pizza_id: int):
    pizza = await pizza_collection.find_one({"_id": pizza_id})
    if pizza:
        return pizza_helper(pizza)
    raise HTTPException(status_code=404, detail="Pizza no encontrada")

# 3. Pedidos
@router.post("/api/orders/create", status_code=201)
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
    return {"mensaje": "Pedido creado en Atlas ☁️", "order_id": nuevo_id}

# 4. Admin
@router.get("/api/admin/orders")
async def get_all_orders():
    pedidos = []
    async for pedido in pedido_collection.find():
        pedido["id"] = pedido["_id"]
        pedidos.append(pedido)
    return pedidos
from fastapi import APIRouter, HTTPException, Body
from pydantic import BaseModel
from typing import List, Optional
from bson import ObjectId
from database import pizza_collection

router = APIRouter()

orders_collection = pizza_collection.database["pedidos"]

# MODELOS
class PizzaItem(BaseModel):
    id: int | str
    nombre: str
    precio: int
    cantidad: int
    descripcion: Optional[str] = None

class OrderModel(BaseModel):
    items: List[PizzaItem]
    total: int
    metodo_pago: str
    direccion: str
    fecha: str
    cliente: str
    estado: str = "Recibido"

# Modelo solo para actualizar el estado
class EstadoUpdate(BaseModel):
    estado: str

# RUTAS

# 1. Crear
@router.post("/api/orders", tags=["Orders"])
async def create_order(order: OrderModel):
    new_order = order.dict()
    result = await orders_collection.insert_one(new_order)
    return {"id": str(result.inserted_id), "status": "created"}

# 2. Obtener uno
@router.get("/api/orders/{id}", tags=["Orders"])
async def get_order(id: str):
    try:
        if ObjectId.is_valid(id):
            order = await orders_collection.find_one({"_id": ObjectId(id)})
        else:
            order = await orders_collection.find_one({"id": id}) 
            
        if order:
            order["_id"] = str(order["_id"])
            return order
        raise HTTPException(status_code=404, detail="Pedido no encontrado")
    except:
        raise HTTPException(status_code=404, detail="Error buscando pedido")

# 3. Obtener todos
@router.get("/api/orders", tags=["Orders"])
async def get_all_orders():
    orders = []
    cursor = orders_collection.find({})
    async for document in cursor:
        document["_id"] = str(document["_id"])
        orders.append(document)
    return orders

# 4. ACTUALIZAR ESTADO (NUEVO)
@router.put("/api/orders/{id}", tags=["Orders"])
async def update_order_status(id: str, estado_update: EstadoUpdate):
    try:
        # Buscamos por ObjectId
        oid = ObjectId(id) if ObjectId.is_valid(id) else id
        
        result = await orders_collection.update_one(
            {"_id": oid},
            {"$set": {"estado": estado_update.estado}}
        )
        
        if result.modified_count == 1:
            return {"message": "Estado actualizado"}
        else:
            # Si no se modificó nada (quizás el ID es texto antiguo)
            return {"message": "Sin cambios o ID no encontrado"}
            
    except Exception as e:
        print(f"Error update: {e}")
        raise HTTPException(status_code=500, detail=str(e))
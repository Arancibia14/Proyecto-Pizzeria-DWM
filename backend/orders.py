from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from bson import ObjectId
from database import pizza_collection # Usamos esto para obtener la conexión a la BD

router = APIRouter()

# Obtenemos la referencia a la colección de pedidos usando la conexión existente
orders_collection = pizza_collection.database["pedidos"]

# --- MODELOS DE DATOS (Lo que envía el Frontend) ---
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

# --- RUTAS ---

# 1. Crear Pedido (POST)
@router.post("/api/orders", tags=["Orders"])
async def create_order(order: OrderModel):
    new_order = order.dict()
    
    # Insertar en MongoDB
    result = await orders_collection.insert_one(new_order)
    
    # Devolver el ID generado y estado
    return {"id": str(result.inserted_id), "status": "created"}

# 2. Obtener un Pedido por ID (GET)
@router.get("/api/orders/{id}", tags=["Orders"])
async def get_order(id: str):
    try:
        # Intentamos buscar por ObjectId (si viene de Mongo)
        if ObjectId.is_valid(id):
            order = await orders_collection.find_one({"_id": ObjectId(id)})
        else:
            # Si guardaste un ID manual o numérico
            order = await orders_collection.find_one({"id": id}) # Intenta buscar por campo 'id' manual
            if not order:
                 order = await orders_collection.find_one({"_id": id}) # Intenta por _id string

        if order:
            order["_id"] = str(order["_id"])
            return order
            
        raise HTTPException(status_code=404, detail="Pedido no encontrado")
        
    except Exception as e:
        print(f"Error buscando pedido: {e}")
        raise HTTPException(status_code=404, detail="Error buscando pedido")

# 3. Obtener TODOS los pedidos (GET - Para el Admin)
@router.get("/api/orders", tags=["Orders"])
async def get_all_orders():
    orders = []
    cursor = orders_collection.find({})
    
    async for document in cursor:
        document["_id"] = str(document["_id"])
        orders.append(document)
        
    return orders
from pydantic import BaseModel
from typing import List, Optional
from enum import Enum
from datetime import datetime

# --- ENUMS (Igual a tu diagrama) ---
class Rol(str, Enum):
    CLIENTE = "cliente"
    ADMINISTRADOR = "admin"
    COCINERO = "cocinero"
    REPARTIDOR = "repartidor"

class EstadoPedido(str, Enum):
    RECIBIDO = "Recibido"
    PREPARACION = "Preparación"
    AL_HORNO = "Al horno"
    LISTO = "Listo"
    EN_REPARTO = "En reparto"
    ENTREGADO = "Entregado"
    ANULADO = "Anulado"

class CategoriaPizza(str, Enum):
    CLASICA = "Clásica"
    VEGGIE = "Veggie"
    GOURMET = "Gourmet"
    PROMOCION = "Promoción"

# --- SCHEMAS (Tus cajitas) ---

class UsuarioLogin(BaseModel):
    email: str
    password: str

class UsuarioRegister(BaseModel):
    email: str
    password: str

class Pizza(BaseModel):
    id: int
    nombre: str
    categoria: CategoriaPizza
    precio: int
    descripcion: str
    disponible: bool = True

class ItemCarrito(BaseModel):
    pizza_id: int
    cantidad: int
    extras: List[str] = []

class PedidoCreate(BaseModel):
    items: List[ItemCarrito]
    total: int
    direccion: str
    metodo_pago: str

class PedidoResponse(BaseModel):
    id: int
    cliente_email: str
    estado: EstadoPedido
    total: int
    fecha: str
import motor.motor_asyncio

# 1. Cadena de conexión (Localhost por defecto)
MONGO_DETAILS = "mongodb://localhost:27017"

client = motor.motor_asyncio.AsyncIOMotorClient(MONGO_DETAILS)

# 2. Base de datos llamada "pizzeria_db"
database = client.pizzeria_db

# 3. Colecciones (equivalente a Tablas)
usuario_collection = database.get_collection("usuarios")
pizza_collection = database.get_collection("pizzas")
pedido_collection = database.get_collection("pedidos")

# --- AYUDANTES (Para convertir los datos de Mongo a Python) ---

def pizza_helper(pizza) -> dict:
    return {
        "id": pizza["_id"],
        "nombre": pizza["nombre"],
        "categoria": pizza["categoria"],
        "precio": pizza["precio"],
        "descripcion": pizza["descripcion"],
        "disponible": pizza["disponible"],
    }
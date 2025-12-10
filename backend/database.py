import motor.motor_asyncio

# Cadena de conexión a MongoDB
MONGO_DETAILS = "mongodb+srv://admin:m1a4r0t8@cluster0.gi2q9ja.mongodb.net/?appName=Cluster0"

client = motor.motor_asyncio.AsyncIOMotorClient(MONGO_DETAILS)

# Base de datos "pizzeria_db"
database = client.pizzeria_db

# Colecciones de MongoDB
usuario_collection = database.get_collection("usuarios")
pizza_collection = database.get_collection("pizzas")
pedido_collection = database.get_collection("pedidos")

# Conversos de datos de MongoDB a Python

def pizza_helper(pizza) -> dict:
    return {
        "id": pizza["_id"],
        "nombre": pizza["nombre"],
        "categoria": pizza["categoria"],
        "precio": pizza["precio"],
        "descripcion": pizza["descripcion"],
        "disponible": pizza["disponible"],
    }
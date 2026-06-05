# Hardblock Generator

## Acceso a la aplicación

### Ambiente Productivo (Render)

https://hardblock-generator.onrender.com/

La aplicación se encuentra desplegada en Render y puede ser utilizada desde cualquier navegador web sin necesidad de instalación local.

> Nota: Al utilizar el plan gratuito de Render, la aplicación puede tardar entre 30 y 60 segundos en responder la primera vez después de un período de inactividad. Una vez activada, funciona normalmente.

---

# Descripción

Hardblock Generator es una aplicación web interna diseñada para agilizar la gestión de solicitudes operativas mediante la generación automática de textos estandarizados.

Actualmente soporta dos tipos de workflow:

### Hotel Hardblock

Genera automáticamente:

- Hardblock en curso
- Hardblock Completed

Utilizando información de hotel, prioridad, habitaciones, pasajeros y demás datos operativos.

### Ground Transportation (GT)

Genera automáticamente:

- Hard Block GT en curso
- Hard Block GT completed

Utilizando información de transporte terrestre como origen, destino, ruta, tipo de vehículo, prioridad, tarifa y forma de pago.

---

# Funcionalidades

## Gestión de Hoteles

- Creación de solicitudes Hardblock.
- Generación automática de Hardblock en curso.
- Generación automática de Hardblock Completed.
- Copia rápida al portapapeles.
- Historial de solicitudes.
- Base de datos SQLite integrada.
- Administración de prioridades de hoteles.
- Autocompletado de prioridad al escribir un hotel registrado.

## Gestión de Ground Transportation (GT)

- Creación de solicitudes de transporte terrestre.
- Generación automática de GT en curso.
- Generación automática de GT completed.
- Copia rápida al portapapeles.
- Soporte para:
  - Origen
  - Destino
  - Route
  - GT
  - Priority
  - Rate
  - Payment
  - Vehicle Type

## Administración de Prioridades

La prioridad de los hoteles no se maneja como:

- Alta
- Media
- Baja

La prioridad representa el orden oficial de la compañía dentro del listado de hoteles aprobados.

Ejemplo:

| Hotel | Prioridad |
|---------|---------|
| Marriott | 1 |
| Holiday Inn | 2 |
| Hilton | 3 |
| Hyatt | 4 |

Cuando un usuario escribe un hotel registrado:

- El sistema busca automáticamente el hotel.
- Recupera la prioridad almacenada.
- Completa el campo de prioridad de forma automática.

---

# Tecnologías Utilizadas

## Backend

- Python 3
- FastAPI
- SQLite
- Uvicorn
- Pydantic

## Frontend

- HTML5
- CSS3
- JavaScript Vanilla

## Hosting

- Render

## Control de Versiones

- Git
- GitHub

---

# Arquitectura del Proyecto

```text
hardblock-generator/
│
├── backend/
│   ├── main.py
│   ├── database.py
│   ├── models.py
│   └── templates_service.py
│
├── frontend/
│   ├── index.html
│   ├── styles.css
│   └── app.js
│
├── data/
│
├── requirements.txt
│
└── README.md
```

---

# Base de Datos

La aplicación utiliza SQLite.

Archivo:

```text
data/hardblock.db
```

Tablas principales:

## requests

Almacena todas las solicitudes creadas.

Contiene información como:

- Airline
- ATO
- Rooms
- PAX
- Nights
- Motivo
- Hotel
- Status
- Fecha de creación

## hotel_priorities

Almacena:

- Nombre del hotel
- Prioridad numérica
- Fecha de creación
- Fecha de actualización

Permite autocompletar automáticamente la prioridad cuando el hotel existe.

---

# Ejecución Local

## Requisitos

- Python 3.10 o superior
- pip
- Git

---

## 1. Clonar repositorio

```bash
git clone https://github.com/SebastianMarinM/hardblock-generator.git

cd hardblock-generator
```

---

## 2. Crear entorno virtual

```bash
python -m venv .venv
```

---

## 3. Activar entorno virtual

### Windows PowerShell

```powershell
.venv\Scripts\Activate.ps1
```

### Linux / macOS

```bash
source .venv/bin/activate
```

---

## 4. Instalar dependencias

```bash
pip install -r requirements.txt
```

---

## 5. Ejecutar aplicación

```bash
uvicorn backend.main:app --reload
```

---

## 6. Abrir navegador

```text
http://127.0.0.1:8000
```

---

# API Disponible

## Estado

```http
GET /health
```

Verifica que la API esté funcionando.

---

## Generar Hardblock

```http
POST /api/generate
```

Genera los bloques de texto automáticamente.

---

## Guardar Solicitud

```http
POST /api/requests
```

Guarda una solicitud en SQLite.

---

## Consultar Historial

```http
GET /api/requests
```

Obtiene todas las solicitudes guardadas.

---

## Prioridades de Hotel

### Consultar

```http
GET /api/hotel-priorities
```

### Buscar Hotel

```http
GET /api/hotel-priorities/search
```

Ejemplo:

```http
GET /api/hotel-priorities/search?hotel_name=Marriott
```

### Crear o Actualizar

```http
POST /api/hotel-priorities
```

### Modificar

```http
PUT /api/hotel-priorities/{id}
```

### Eliminar

```http
DELETE /api/hotel-priorities/{id}
```

---

# Ejemplo de Hardblock Hotel

## Hardblock en curso

```text
Hardblock en curso

Airline: LATAM
ATO: JFK
Rooms: 2
PAX: 4
Nights: 1
Motivo: Misconnect
Hotel: En curso
Prioridad: En curso
Status: En curso
Booking source: En curso
Meals: En curso
Payment: En curso
```

---

## Hardblock Completed

```text
Hardblock Completed

Airline: LATAM
ATO: JFK
Rooms: 2
PAX: 4
Nights: 1
Motivo: Misconnect
Hotel: Marriott JFK
Prioridad: 1
Status: Completed
Booking source: Direct
Meals: Included
Payment: Airline Guarantee
```

---

# Ejemplo de Ground Transportation

## Hard Block GT en curso

```text
Hard Block GT en curso

Airline: LATAM GT
ATO: JFK
Pax: 1
Motivo: Conexión Perdida
Status: En curso
Origen: ATO JFK
Destino: HOTEL
Route: round-trip
GT: En curso
Priority: En curso
Rate: En curso
Payment: En curso
```

---

## Hard Block GT completed

```text
Hard Block GT completed

Airline: LATAM GT
ATO: JFK
Pax: 1
Motivo: Conexión Perdida
Status: Booked
Origen: ATO JFK
Destino: Doubletree JFK
Route: round-trip
GT: Shuttle
Priority: 1
Rate: N/A
Payment: CVV
Vehicle Type: VAN
```

---

# Despliegue en Producción

Proveedor:

- Render

URL:

https://hardblock-generator.onrender.com/

Configuración actual:

- Python 3
- FastAPI
- Uvicorn
- GitHub Auto Deploy
- Free Tier

---

# Limitaciones del Plan Gratuito

Render Free Tier:

- Puede entrar en modo inactivo tras períodos sin uso.
- Primer acceso puede tardar entre 30 y 60 segundos.
- Recursos limitados de CPU y memoria.
- No garantiza persistencia permanente del almacenamiento local.

Para pruebas internas y validación funcional es suficiente.

---

# Futuras Mejoras

- Autenticación de usuarios.
- Roles y permisos.
- Exportación a Excel.
- Dashboard de métricas.
- Búsqueda avanzada de historial.
- Base de datos PostgreSQL.
- Despliegue corporativo.
- Integración con Microsoft Teams.
- Integración con WhatsApp Business.
- Catálogo corporativo de hoteles.
- Catálogo corporativo de proveedores de transporte.

---

# Autor

Sebastian Marin

Data Engineer | Operations Analyst

Proyecto desarrollado para optimizar la gestión operativa de solicitudes de Hotel Hardblock y Ground Transportation.

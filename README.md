# Hardblock Generator

Hardblock Generator es una aplicación web interna para generar textos automáticos de solicitudes operativas de **Hotel Hardblock** y **Ground Transportation (GT)**.

La aplicación permite completar formularios, generar bloques listos para copiar, guardar historial de solicitudes y administrar prioridades numéricas de hoteles según el orden definido por la compañía.

---

## URL de acceso

Aplicación publicada en Render:

```text
https://hardblock-generator.onrender.com
```

> Nota: esta aplicación está desplegada en el plan gratuito de Render. Si no se usa durante un tiempo, puede tardar algunos segundos en cargar nuevamente.

---

## Funcionalidades principales

* Generación automática de textos para Hotel.
* Generación automática de textos para Ground Transportation (GT).
* Copia rápida de bloques generados.
* Limpieza de formulario.
* Historial de solicitudes guardadas.
* Administración de prioridades numéricas de hoteles.
* Autocompletado de prioridad al escribir un hotel registrado.
* Persistencia local en SQLite.

---

## Módulo Hotel

Formulario con los campos:

* Airline
* ATO
* Rooms
* PAX
* Nights
* Motivo
* Hotel
* Prioridad
* Status
* Booking source
* Meals
* Payment

### Hardblock en curso

```text
Hardblock en curso

Airline:
ATO:
Rooms:
PAX:
Nights:
Motivo:
Hotel: En curso
Prioridad: En curso
Status: En curso
Booking source: En curso
Meals: En curso
Payment: En curso
```

### Hardblock Completed

```text
Hardblock Completed

Airline:
ATO:
Rooms:
PAX:
Nights:
Motivo:
Hotel:
Prioridad:
Status:
Booking source:
Meals:
Payment:
```

---

## Módulo Ground Transportation (GT)

Formulario con los campos:

* Airline
* ATO
* Pax
* Motivo
* Origen
* Destino
* Route
* GT
* Priority
* Rate
* Payment
* Vehicle Type

### Hard Block GT en curso

```text
Hard Block GT en curso

Airline:
ATO:
Pax:
Motivo:
Status: En curso
Origen:
Destino:
Route:
GT: En curso
Priority: En curso
Rate: En curso
Payment: En curso
```

### Hard Block GT completed

```text
Hard Block GT completed

Airline:
ATO:
Pax:
Motivo:
Status: Booked
Origen:
Destino:
Route:
GT:
Priority:
Rate:
Payment:
Vehicle Type:
```

---

## Prioridad de hoteles

La prioridad de hoteles no significa Alta, Media o Baja.

En esta herramienta, la prioridad representa el **orden numérico del hotel dentro de la lista oficial de hoteles de la compañía**.

Ejemplo:

| Hotel       | Prioridad |
| ----------- | --------: |
| Marriott    |         1 |
| Holiday Inn |         2 |
| Hilton      |         3 |

Si un hotel ya está registrado, al escribirlo en el formulario la prioridad se completa automáticamente.

Los campos de prioridad aceptan únicamente enteros positivos:

```text
1, 2, 3, 4, 5...
```

---

## Historial

La aplicación permite guardar solicitudes y consultar historial desde la interfaz.

Se manejan historiales para:

* Solicitudes de Hotel.
* Solicitudes de Ground Transportation (GT).
* Prioridades de hoteles.

---

## Tecnologías utilizadas

### Backend

* Python
* FastAPI
* SQLite
* Uvicorn

### Frontend

* HTML
* CSS
* JavaScript

### Hosting

* Render Free Tier

---

## Estructura del proyecto

```text
hardblock-generator/
├── backend/
│   ├── main.py
│   ├── database.py
│   ├── models.py
│   └── templates_service.py
├── frontend/
│   ├── index.html
│   ├── styles.css
│   └── app.js
├── data/
│   └── .gitkeep
├── requirements.txt
└── README.md
```

---

## Ejecución local

### 1. Clonar repositorio

```bash
git clone https://github.com/SebastianMarinM/hardblock-generator.git
cd hardblock-generator
```

### 2. Crear entorno virtual

```bash
python -m venv .venv
```

### 3. Activar entorno virtual

Windows PowerShell:

```powershell
.venv\Scripts\Activate.ps1
```

macOS/Linux:

```bash
source .venv/bin/activate
```

### 4. Instalar dependencias

```bash
pip install -r requirements.txt
```

### 5. Ejecutar aplicación

```bash
uvicorn backend.main:app --reload
```

### 6. Abrir en navegador

```text
http://127.0.0.1:8000
```

---

## Despliegue en Render

La aplicación está desplegada como Web Service en Render.

### Build Command

```bash
pip install -r requirements.txt
```

### Start Command

```bash
uvicorn backend.main:app --host 0.0.0.0 --port $PORT
```

---

## API disponible

### General

```text
GET /
GET /health
```

### Hotel

```text
POST /api/generate
POST /api/requests
GET /api/requests
```

### Prioridades de hoteles

```text
GET /api/hotel-priorities
GET /api/hotel-priorities/search?hotel_name=...
POST /api/hotel-priorities
PUT /api/hotel-priorities/{id}
DELETE /api/hotel-priorities/{id}
```

### Ground Transportation

```text
POST /api/gt/generate
POST /api/gt/requests
GET /api/gt/requests
```

---

## Limitaciones actuales

* La aplicación está en Render Free Tier.
* La primera carga puede tardar si la app estuvo inactiva.
* SQLite funciona para pruebas, pero no es ideal para producción.
* Para uso definitivo se recomienda migrar la base de datos a PostgreSQL.

---

## Estado del proyecto

Versión de prueba interna para validación operativa de los procesos:

* Hotel Hardblock
* Ground Transportation (GT)
* Prioridades numéricas de hoteles
* Historial de solicitudes

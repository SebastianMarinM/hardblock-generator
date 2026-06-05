# Hardblock Generator

Hardblock Generator es una aplicación web interna para generar textos automáticos de solicitudes Hardblock desde un formulario, copiar los bloques generados y guardar cada solicitud en SQLite con fecha de creación.

## Funcionalidades

- Formulario con los campos: `airline`, `ato`, `rooms`, `pax`, `nights`, `motivo`, `hotel`, `prioridad`, `status`, `booking_source`, `meals` y `payment`. La `prioridad` es un número entero positivo que representa el orden/ranking del hotel en la lista de hoteles de la compañía.
- Generación automática de dos bloques:
  - **Hardblock en curso**: usa `En curso` como valor fijo para `Status`, `Booking source`, `Meals`, `Payment`, `Hotel` y `Prioridad`.
  - **Hardblock Completed**: usa los valores reales ingresados en el formulario.
- Botones para copiar cada bloque, limpiar el formulario, guardar la solicitud, guardar prioridades numéricas de hotel y actualizar el historial.
- Persistencia en SQLite en `data/hardblock.db`.
- Base de prioridades de hoteles en la tabla `hotel_priorities`; al escribir un hotel guardado, la prioridad numérica se completa automáticamente.
- Pantalla simple de administración para listar, editar y eliminar prioridades numéricas de hoteles.
- Pantalla simple de historial de solicitudes guardadas.

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
├── requirements.txt
└── README.md
```

## Requisitos

- Python 3.10 o superior
- pip

## Ejecución local paso a paso

1. Clona o abre el proyecto:

   ```bash
   cd hardblock-generator
   ```

2. Crea un entorno virtual:

   ```bash
   python -m venv .venv
   ```

3. Activa el entorno virtual:

   En macOS/Linux:

   ```bash
   source .venv/bin/activate
   ```

   En Windows PowerShell:

   ```powershell
   .venv\Scripts\Activate.ps1
   ```

4. Instala dependencias:

   ```bash
   pip install -r requirements.txt
   ```

5. Ejecuta la aplicación:

   ```bash
   uvicorn backend.main:app --reload
   ```

6. Abre la aplicación en el navegador:

   ```text
   http://127.0.0.1:8000
   ```

## API disponible

- `GET /`: interfaz web.
- `GET /health`: estado de la API.
- `POST /api/generate`: genera los dos bloques de texto desde un JSON de solicitud.
- `POST /api/requests`: guarda una solicitud en SQLite y devuelve el registro creado.
- `GET /api/requests`: lista el historial de solicitudes guardadas.
- `GET /api/hotel-priorities`: lista las prioridades numéricas de hoteles guardadas.
- `GET /api/hotel-priorities/search?hotel_name=...`: busca un hotel y devuelve su prioridad numérica si existe.
- `POST /api/hotel-priorities`: crea o actualiza la prioridad numérica de un hotel.
- `PUT /api/hotel-priorities/{id}`: edita hotel y prioridad numérica desde administración.
- `DELETE /api/hotel-priorities/{id}`: elimina una prioridad de hotel.

## Prioridad de hoteles

La prioridad de un hotel no es `Alta`, `Media` ni `Baja`. Es el orden numérico del hotel dentro de la lista de hoteles de la compañía:

- Si Marriott está primero en la lista, su prioridad es `1`.
- Si Holiday Inn está segundo, su prioridad es `2`.
- Si Hilton está tercero, su prioridad es `3`.

Los campos de prioridad aceptan únicamente enteros positivos (`1`, `2`, `3`, `4`, etc.). La tabla `hotel_priorities` guarda el nombre del hotel y su prioridad numérica; si una base existente tenía prioridades de texto, al inicializar la app se migra la tabla para guardar números y se asigna el orden según los registros existentes cuando no hay un valor numérico válido.

## Notas

- La base de datos se crea automáticamente en `data/hardblock.db` al iniciar la aplicación.
- El archivo de base de datos local no debe versionarse; solo se mantiene `data/.gitkeep` para conservar la carpeta en el repositorio.
